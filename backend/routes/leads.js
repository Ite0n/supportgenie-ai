const express = require('express');
const { body, validationResult } = require('express-validator');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Rate limiting for lead capture
const leadCaptureLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 lead captures per window
  message: {
    success: false,
    error: 'Too many lead capture attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const validateLeadCapture = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('source')
    .optional()
    .isIn(['hero', 'pricing', 'footer', 'demo', 'social'])
    .withMessage('Invalid source'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('Invalid timestamp'),
  body('userAgent')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Invalid user agent'),
  body('referrer')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Invalid referrer')
];

/**
 * POST /api/leads/capture
 * Capture a new lead from the landing page
 */
router.post('/capture', leadCaptureLimiter, validateLeadCapture, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, source = 'landing', timestamp, userAgent, referrer } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Check if email already exists
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, created_at, source')
      .eq('email', email)
      .single();

    if (existingLead) {
      // Update existing lead with new interaction
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          last_interaction: new Date().toISOString(),
          interaction_count: supabase.sql`interaction_count + 1`,
          sources: supabase.sql`array_append(sources, ${source})`,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingLead.id);

      if (updateError) {
        console.error('Error updating existing lead:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Failed to update lead'
        });
      }

      // Log the interaction
      await logLeadInteraction(existingLead.id, {
        action: 'revisit',
        source,
        ipAddress,
        userAgent,
        referrer,
        timestamp
      });

      return res.json({
        success: true,
        message: 'Lead updated successfully',
        data: {
          id: existingLead.id,
          email,
          isNew: false,
          message: 'Welcome back! We\'re glad you\'re still interested.'
        }
      });
    }

    // Create new lead
    const leadData = {
      email,
      source,
      ip_address: ipAddress,
      user_agent: userAgent || null,
      referrer: referrer || null,
      created_at: timestamp || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'new',
      lead_score: calculateLeadScore(source, referrer),
      metadata: {
        first_source: source,
        first_visit: timestamp || new Date().toISOString(),
        sources: [source],
        interaction_count: 1
      }
    };

    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating new lead:', insertError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create lead'
      });
    }

    // Log the initial interaction
    await logLeadInteraction(newLead.id, {
      action: 'created',
      source,
      ipAddress,
      userAgent,
      referrer,
      timestamp
    });

    // Send welcome email (if email service is configured)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      try {
        await sendWelcomeEmail(email, source);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Track analytics
    trackLeadAnalytics({
      action: 'lead_captured',
      email,
      source,
      isNew: true,
      timestamp
    });

    res.json({
      success: true,
      message: 'Lead captured successfully',
      data: {
        id: newLead.id,
        email,
        isNew: true,
        message: 'Welcome aboard! Check your email for next steps.'
      }
    });

  } catch (error) {
    console.error('Lead capture error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/leads/stats
 * Get lead capture statistics (for admin dashboard)
 */
router.get('/stats', async (req, res) => {
  try {
    // Get total leads count
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Get leads by source
    const { data: leadsBySource } = await supabase
      .from('leads')
      .select('source, count')
      .select('source')
      .group('source');

    // Get leads by date (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentLeads } = await supabase
      .from('leads')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Get conversion rate (leads that became customers)
    const { count: convertedLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'converted');

    const stats = {
      totalLeads: totalLeads || 0,
      convertedLeads: convertedLeads || 0,
      conversionRate: totalLeads ? ((convertedLeads || 0) / totalLeads * 100).toFixed(2) : 0,
      leadsBySource: leadsBySource || [],
      recentLeads: recentLeads?.length || 0,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch lead statistics'
    });
  }
});

/**
 * Helper function to calculate lead score
 */
function calculateLeadScore(source, referrer) {
  let score = 50; // Base score

  // Source-based scoring
  switch (source) {
    case 'pricing':
      score += 20; // High intent
      break;
    case 'demo':
      score += 15; // Engaged
      break;
    case 'hero':
      score += 10; // General interest
      break;
    case 'social':
      score += 25; // Social proof
      break;
  }

  // Referrer-based scoring
  if (referrer) {
    if (referrer.includes('google.com')) score += 10;
    if (referrer.includes('linkedin.com')) score += 15;
    if (referrer.includes('twitter.com')) score += 10;
    if (referrer.includes('facebook.com')) score += 5;
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Helper function to log lead interactions
 */
async function logLeadInteraction(leadId, interactionData) {
  try {
    const { error } = await supabase
      .from('lead_interactions')
      .insert([{
        lead_id: leadId,
        action: interactionData.action,
        source: interactionData.source,
        ip_address: interactionData.ipAddress,
        user_agent: interactionData.userAgent,
        referrer: interactionData.referrer,
        timestamp: interactionData.timestamp || new Date().toISOString(),
        metadata: interactionData
      }]);

    if (error) {
      console.error('Error logging lead interaction:', error);
    }
  } catch (error) {
    console.error('Error in logLeadInteraction:', error);
  }
}

/**
 * Helper function to send welcome email
 */
async function sendWelcomeEmail(email, source) {
  // This would integrate with your email service (SendGrid, Mailgun, etc.)
  // For now, just log the intention
  console.log(`📧 Welcome email would be sent to ${email} from source: ${source}`);
  
  // TODO: Implement actual email sending
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: email,
  //   from: 'noreply@supportgenie.ai',
  //   subject: 'Welcome to SupportGenie AI!',
  //   templateId: 'd-welcome-template-id',
  //   dynamicTemplateData: { source }
  // });
}

/**
 * Helper function to track analytics
 */
function trackLeadAnalytics(data) {
  // This would integrate with your analytics service (Google Analytics, Mixpanel, etc.)
  console.log('📊 Lead Analytics:', data);
  
  // TODO: Implement actual analytics tracking
  // Example with Google Analytics:
  // if (typeof window !== 'undefined' && window.gtag) {
  //   window.gtag('event', 'lead_captured', {
  //     event_category: 'engagement',
  //     event_label: data.source,
  //     value: 1
  //   });
  // }
}

module.exports = router;
