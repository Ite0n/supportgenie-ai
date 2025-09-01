const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentService = require('../services/paymentService');
const subscriptionService = require('../services/subscriptionService');
const { body, validationResult } = require('express-validator');

/**
 * @route   GET /api/payments/plans
 * @desc    Get all available pricing plans
 * @access  Public
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = subscriptionService.getPlans();
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing plans'
    });
  }
});

/**
 * @route   GET /api/payments/plans/:planId
 * @desc    Get specific pricing plan
 * @access  Public
 */
router.get('/plans/:planId', async (req, res) => {
  try {
    const plan = subscriptionService.getPlan(req.params.planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch plan'
    });
  }
});

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create Stripe checkout session for subscription
 * @access  Private
 */
router.post('/create-checkout-session', [
  auth,
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('successUrl').isURL().withMessage('Valid success URL is required'),
  body('cancelUrl').isURL().withMessage('Valid cancel URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { planId, successUrl, cancelUrl } = req.body;
    const userId = req.user.id;

    // Get user's Stripe customer ID
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'User not set up for payments'
      });
    }

    // Get plan details
    const plan = subscriptionService.getPlan(planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan'
      });
    }

    // Create checkout session
    const result = await paymentService.createCheckoutSession(
      user.stripe_customer_id,
      plan.id,
      successUrl,
      cancelUrl
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        sessionId: result.session.id,
        url: result.session.url
      }
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session'
    });
  }
});

/**
 * @route   POST /api/payments/create-portal-session
 * @desc    Create Stripe billing portal session
 * @access  Private
 */
router.post('/create-portal-session', [
  auth,
  body('returnUrl').isURL().withMessage('Valid return URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { returnUrl } = req.body;
    const userId = req.user.id;

    // Get user's Stripe customer ID
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'User not set up for payments'
      });
    }

    // Create portal session
    const result = await paymentService.createPortalSession(
      user.stripe_customer_id,
      returnUrl
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: {
        url: result.session.url
      }
    });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create portal session'
    });
  }
});

/**
 * @route   GET /api/payments/subscription
 * @desc    Get user's current subscription details
 * @access  Private
 */
router.get('/subscription', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's subscription details
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('subscription_id, subscription_plan, subscription_status, trial_end, current_period_start, current_period_end')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.subscription_id) {
      return res.json({
        success: true,
        data: {
          hasSubscription: false,
          message: 'No active subscription'
        }
      });
    }

    // Get subscription details from Stripe
    const subscriptionResult = await paymentService.getSubscription(user.subscription_id);
    if (!subscriptionResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch subscription details'
      });
    }

    const subscription = subscriptionResult.subscription;
    const plan = subscriptionService.getPlan(user.subscription_plan);

    res.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          plan: user.subscription_plan,
          planDetails: plan,
          trialEnd: user.trial_end,
          currentPeriodStart: user.current_period_start,
          currentPeriodEnd: user.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          nextBillingDate: subscription.current_period_end
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscription details'
    });
  }
});

/**
 * @route   GET /api/payments/usage
 * @desc    Get user's current usage statistics
 * @access  Private
 */
router.get('/usage', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const usageResult = await subscriptionService.getUserUsage(userId);

    if (!usageResult.success) {
      return res.status(500).json({
        success: false,
        error: usageResult.error
      });
    }

    res.json({
      success: true,
      data: usageResult
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics'
    });
  }
});

/**
 * @route   POST /api/payments/upgrade-plan
 * @desc    Upgrade user's subscription plan
 * @access  Private
 */
router.post('/upgrade-plan', [
  auth,
  body('newPlanId').notEmpty().withMessage('New plan ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { newPlanId } = req.body;
    const userId = req.user.id;

    const result = await subscriptionService.upgradePlan(userId, newPlanId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error upgrading plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upgrade plan'
    });
  }
});

/**
 * @route   POST /api/payments/downgrade-plan
 * @desc    Downgrade user's subscription plan
 * @access  Private
 */
router.post('/downgrade-plan', [
  auth,
  body('newPlanId').notEmpty().withMessage('New plan ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { newPlanId } = req.body;
    const userId = req.user.id;

    const result = await subscriptionService.downgradePlan(userId, newPlanId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error downgrading plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to downgrade plan'
    });
  }
});

/**
 * @route   GET /api/payments/recommendations
 * @desc    Get plan recommendations based on usage
 * @access  Private
 */
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await subscriptionService.getPlanRecommendations(userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.recommendations
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
});

/**
 * @route   GET /api/payments/invoices
 * @desc    Get user's invoice history
 * @access  Private
 */
router.get('/invoices', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's Stripe customer ID
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !user || !user.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'User not set up for payments'
      });
    }

    const result = await paymentService.getCustomerInvoices(user.stripe_customer_id, limit);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch invoices'
    });
  }
});

/**
 * @route   GET /api/payments/payment-methods
 * @desc    Get user's saved payment methods
 * @access  Private
 */
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's Stripe customer ID
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !user || !user.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: 'User not set up for payments'
      });
    }

    const result = await paymentService.getPaymentMethods(user.stripe_customer_id);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.paymentMethods
    });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
});

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe signature verification)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = require('stripe')(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    const result = await paymentService.handleWebhook(event);
    
    if (!result.success) {
      console.error('Webhook handling failed:', result.error);
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

/**
 * @route   POST /api/payments/cancel-subscription
 * @desc    Cancel user's subscription
 * @access  Private
 */
router.post('/cancel-subscription', [
  auth,
  body('cancelAtPeriodEnd').isBoolean().withMessage('cancelAtPeriodEnd must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { cancelAtPeriodEnd = true } = req.body;
    const userId = req.user.id;

    // Get user's subscription ID
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('subscription_id')
      .eq('id', userId)
      .single();

    if (error || !user || !user.subscription_id) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const result = await paymentService.cancelSubscription(user.subscription_id, cancelAtPeriodEnd);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be canceled at the end of the current period'
        : 'Subscription canceled immediately'
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

/**
 * @route   POST /api/payments/reactivate-subscription
 * @desc    Reactivate user's subscription
 * @access  Private
 */
router.post('/reactivate-subscription', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's subscription ID
    const { data: user, error } = await require('@supabase/supabase-js')
      .createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      .from('users')
      .select('subscription_id')
      .eq('id', userId)
      .single();

    if (error || !user || !user.subscription_id) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription found'
      });
    }

    const result = await paymentService.reactivateSubscription(user.subscription_id);
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reactivate subscription'
    });
  }
});

module.exports = router;
