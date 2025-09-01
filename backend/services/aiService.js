const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class AIService {
  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }

  /**
   * Generate AI response for customer inquiries
   */
  async generateResponse(message, context = '', platform = 'website', userId = null) {
    try {
      // Get business context if available
      let businessContext = '';
      if (userId) {
        businessContext = await this.getBusinessContext(userId);
      }

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(platform, businessContext);
      
      // Build user message
      const userMessage = this.buildUserMessage(message, context);

      // Generate response using OpenAI
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      });

      const response = completion.choices[0].message.content;

      // Parse response for suggested actions
      const suggestedActions = this.parseSuggestedActions(response);

      // Calculate confidence score
      const confidence = this.calculateConfidence(response, message);

      // Log the interaction
      await this.logInteraction(message, response, platform, userId, confidence);

      return {
        text: response,
        confidence,
        suggestedActions,
        model: this.model,
        tokens: completion.usage.total_tokens
      };

    } catch (error) {
      console.error('AI response generation error:', error);
      
      // Return fallback response
      return {
        text: this.getFallbackResponse(platform),
        confidence: 0.1,
        suggestedActions: ['contact_support'],
        model: 'fallback',
        tokens: 0
      };
    }
  }

  /**
   * Build system prompt based on platform and business context
   */
  buildSystemPrompt(platform, businessContext) {
    let basePrompt = `You are SupportGenie AI, a professional customer support assistant. 
    Your role is to help customers with their inquiries in a helpful, accurate, and friendly manner.
    
    Guidelines:
    - Always be polite and professional
    - Provide accurate and helpful information
    - If you're unsure about something, suggest contacting human support
    - Keep responses concise but informative
    - Use appropriate tone for the platform (${platform})
    - Suggest next steps when appropriate`;

    if (businessContext) {
      basePrompt += `\n\nBusiness Context:\n${businessContext}`;
    }

    // Platform-specific instructions
    switch (platform) {
      case 'whatsapp':
        basePrompt += '\n\nWhatsApp Guidelines:\n- Keep messages concise\n- Use emojis appropriately\n- Be conversational and friendly';
        break;
      case 'telegram':
        basePrompt += '\n\nTelegram Guidelines:\n- Support markdown formatting\n- Be informative and helpful\n- Use appropriate emojis';
        break;
      case 'website':
        basePrompt += '\n\nWebsite Guidelines:\n- Be professional and helpful\n- Provide detailed information\n- Suggest relevant resources';
        break;
    }

    return basePrompt;
  }

  /**
   * Build user message with context
   */
  buildUserMessage(message, context) {
    let userMessage = `Customer Message: ${message}`;
    
    if (context) {
      userMessage += `\n\nContext: ${context}`;
    }

    userMessage += '\n\nPlease provide a helpful response to this customer inquiry.';
    
    return userMessage;
  }

  /**
   * Get business context for personalized responses
   */
  async getBusinessContext(userId) {
    try {
      // Get user's business information
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('business_id')
        .eq('id', userId)
        .single();

      if (userError || !user?.business_id) return '';

      // Get business details
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('name, industry, description, support_policies')
        .eq('id', user.business_id)
        .single();

      if (businessError || !business) return '';

      return `Business: ${business.name}
Industry: ${business.industry}
Description: ${business.description}
Support Policies: ${business.support_policies}`;

    } catch (error) {
      console.error('Error getting business context:', error);
      return '';
    }
  }

  /**
   * Parse suggested actions from AI response
   */
  parseSuggestedActions(response) {
    const actions = [];
    
    // Look for common action indicators
    if (response.toLowerCase().includes('contact support') || response.toLowerCase().includes('speak to someone')) {
      actions.push('contact_support');
    }
    
    if (response.toLowerCase().includes('check our website') || response.toLowerCase().includes('visit our site')) {
      actions.push('visit_website');
    }
    
    if (response.toLowerCase().includes('schedule a call') || response.toLowerCase().includes('book appointment')) {
      actions.push('schedule_call');
    }
    
    if (response.toLowerCase().includes('check status') || response.toLowerCase().includes('track order')) {
      actions.push('check_status');
    }

    // Default action if none found
    if (actions.length === 0) {
      actions.push('continue_conversation');
    }

    return actions;
  }

  /**
   * Calculate confidence score for the response
   */
  calculateConfidence(response, originalMessage) {
    let confidence = 0.7; // Base confidence

    // Increase confidence for longer, detailed responses
    if (response.length > 100) confidence += 0.1;
    
    // Increase confidence if response addresses the question directly
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'can', 'could', 'would', 'should'];
    const hasQuestionWord = questionWords.some(word => 
      originalMessage.toLowerCase().includes(word)
    );
    
    if (hasQuestionWord && response.toLowerCase().includes('answer')) {
      confidence += 0.1;
    }

    // Decrease confidence for uncertain language
    const uncertainWords = ['maybe', 'possibly', 'i think', 'not sure', 'uncertain'];
    const hasUncertainWords = uncertainWords.some(word => 
      response.toLowerCase().includes(word)
    );
    
    if (hasUncertainWords) confidence -= 0.2;

    // Ensure confidence is between 0 and 1
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Get fallback response when AI fails
   */
  getFallbackResponse(platform) {
    const fallbacks = {
      whatsapp: "Hi! I'm having trouble processing your request right now. Please try again in a moment, or contact our human support team for immediate assistance.",
      telegram: "I apologize, but I'm experiencing technical difficulties. Please try again shortly, or reach out to our support team for help.",
      website: "I'm sorry, but I'm unable to process your request at the moment. Please try again, or contact our support team for assistance."
    };

    return fallbacks[platform] || fallbacks.website;
  }

  /**
   * Log AI interaction for analytics
   */
  async logInteraction(message, response, platform, userId, confidence) {
    try {
      const { error } = await supabase
        .from('ai_interactions')
        .insert({
          user_id: userId,
          platform,
          message,
          response,
          confidence,
          model: this.model,
          timestamp: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging AI interaction:', error);
      }
    } catch (error) {
      console.error('Error logging AI interaction:', error);
    }
  }

  /**
   * Get AI model status
   */
  async getModelStatus(businessId) {
    try {
      // Get recent interactions for this business
      const { data: interactions, error } = await supabase
        .from('ai_interactions')
        .select('confidence, created_at')
        .eq('business_id', businessId)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate average confidence
      const avgConfidence = interactions.length > 0 
        ? interactions.reduce((sum, int) => sum + int.confidence, 0) / interactions.length 
        : 0;

      // Get response time stats
      const responseTimes = interactions.map(int => 
        new Date(int.created_at).getTime()
      );

      return {
        model: this.model,
        averageConfidence: avgConfidence,
        totalInteractions: interactions.length,
        lastInteraction: interactions[0]?.created_at || null,
        status: avgConfidence > 0.7 ? 'optimal' : avgConfidence > 0.5 ? 'good' : 'needs_improvement'
      };

    } catch (error) {
      console.error('Error getting model status:', error);
      return {
        model: this.model,
        status: 'unknown',
        error: error.message
      };
    }
  }
}

module.exports = new AIService();
