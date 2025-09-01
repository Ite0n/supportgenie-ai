const { createClient } = require('@supabase/supabase-js');

class AnalyticsService {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * Track conversation metrics
   */
  async trackConversation(conversationData) {
    try {
      const { data, error } = await this.supabase
        .from('conversations')
        .insert([{
          user_id: conversationData.userId,
          business_id: conversationData.businessId,
          platform: conversationData.platform,
          start_time: new Date().toISOString(),
          status: 'active',
          metadata: conversationData.metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`📊 Conversation tracked: ${data.id}`);
      return { success: true, conversationId: data.id };
    } catch (error) {
      console.error('❌ Error tracking conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track message metrics
   */
  async trackMessage(messageData) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert([{
          conversation_id: messageData.conversationId,
          user_id: messageData.userId,
          business_id: messageData.businessId,
          content: messageData.content,
          message_type: messageData.type || 'user',
          platform: messageData.platform,
          timestamp: new Date().toISOString(),
          metadata: messageData.metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`📨 Message tracked: ${data.id}`);
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Error tracking message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Track AI response metrics
   */
  async trackAIResponse(responseData) {
    try {
      const { data, error } = await this.supabase
        .from('ai_interactions')
        .insert([{
          conversation_id: responseData.conversationId,
          user_id: responseData.userId,
          business_id: responseData.businessId,
          model_used: responseData.model || 'gpt-4o-mini',
          response_time_ms: responseData.responseTime,
          tokens_used: responseData.tokensUsed,
          confidence_score: responseData.confidence,
          platform: responseData.platform,
          timestamp: new Date().toISOString(),
          metadata: responseData.metadata || {}
        }])
        .select()
        .single();

      if (error) throw error;

      console.log(`🤖 AI response tracked: ${data.id}`);
      return { success: true, interactionId: data.id };
    } catch (error) {
      console.error('❌ Error tracking AI response:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get business analytics
   */
  async getBusinessAnalytics(businessId, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      // Get conversation count
      const { data: conversations, error: convError } = await this.supabase
        .from('conversations')
        .select('id, start_time, status, platform')
        .eq('business_id', businessId)
        .gte('start_time', startDate);

      if (convError) throw convError;

      // Get message count
      const { data: messages, error: msgError } = await this.supabase
        .from('messages')
        .select('id, timestamp, message_type, platform')
        .eq('business_id', businessId)
        .gte('timestamp', startDate);

      if (msgError) throw msgError;

      // Get AI interaction metrics
      const { data: aiInteractions, error: aiError } = await this.supabase
        .from('ai_interactions')
        .select('id, response_time_ms, tokens_used, confidence_score, platform')
        .eq('business_id', businessId)
        .gte('timestamp', startDate);

      if (aiError) throw aiError;

      // Calculate metrics
      const analytics = {
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'active').length,
        totalMessages: messages.length,
        userMessages: messages.filter(m => m.message_type === 'user').length,
        aiResponses: aiInteractions.length,
        averageResponseTime: this.calculateAverage(aiInteractions.map(ai => ai.response_time_ms)),
        averageTokensUsed: this.calculateAverage(aiInteractions.map(ai => ai.tokens_used)),
        averageConfidence: this.calculateAverage(aiInteractions.map(ai => ai.confidence_score)),
        platformBreakdown: this.getPlatformBreakdown(conversations),
        dailyTrends: this.getDailyTrends(conversations, startDate),
        topIssues: await this.getTopIssues(businessId, startDate)
      };

      console.log(`📊 Analytics generated for business: ${businessId}`);
      return { success: true, analytics };
    } catch (error) {
      console.error('❌ Error getting business analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      // Get user's conversations
      const { data: conversations, error: convError } = await this.supabase
        .from('conversations')
        .select('id, start_time, status, platform')
        .eq('user_id', userId)
        .gte('start_time', startDate);

      if (convError) throw convError;

      // Get user's messages
      const { data: messages, error: msgError } = await this.supabase
        .from('messages')
        .select('id, timestamp, content, message_type')
        .eq('user_id', userId)
        .gte('timestamp', startDate);

      if (msgError) throw msgError;

      const analytics = {
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.status === 'active').length,
        totalMessages: messages.length,
        averageMessagesPerConversation: conversations.length > 0 ? messages.length / conversations.length : 0,
        preferredPlatform: this.getPreferredPlatform(conversations),
        engagementScore: this.calculateEngagementScore(conversations, messages),
        lastActivity: messages.length > 0 ? messages[messages.length - 1].timestamp : null
      };

      console.log(`📊 User analytics generated for: ${userId}`);
      return { success: true, analytics };
    } catch (error) {
      console.error('❌ Error getting user analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get platform-specific analytics
   */
  async getPlatformAnalytics(platform, timeRange = '30d') {
    try {
      const startDate = this.getStartDate(timeRange);
      
      // Get platform conversations
      const { data: conversations, error: convError } = await this.supabase
        .from('conversations')
        .select('id, start_time, status, business_id')
        .eq('platform', platform)
        .gte('start_time', startDate);

      if (convError) throw convError;

      // Get platform messages
      const { data: messages, error: msgError } = await this.supabase
        .from('messages')
        .select('id, timestamp, message_type')
        .eq('platform', platform)
        .gte('timestamp', startDate);

      if (msgError) throw msgError;

      const analytics = {
        platform,
        totalConversations: conversations.length,
        totalMessages: messages.length,
        averageMessagesPerConversation: conversations.length > 0 ? messages.length / conversations.length : 0,
        activeBusinesses: new Set(conversations.map(c => c.business_id)).size,
        dailyVolume: this.getDailyVolume(conversations, startDate),
        responseTime: await this.getPlatformResponseTime(platform, startDate)
      };

      console.log(`📊 Platform analytics generated for: ${platform}`);
      return { success: true, analytics };
    } catch (error) {
      console.error('❌ Error getting platform analytics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(businessId, timeRange = '30d') {
    try {
      const businessAnalytics = await this.getBusinessAnalytics(businessId, timeRange);
      if (!businessAnalytics.success) throw new Error(businessAnalytics.error);

      const report = {
        businessId,
        timeRange,
        generatedAt: new Date().toISOString(),
        summary: {
          totalConversations: businessAnalytics.analytics.totalConversations,
          totalMessages: businessAnalytics.analytics.totalMessages,
          averageResponseTime: businessAnalytics.analytics.averageResponseTime,
          customerSatisfaction: this.calculateCustomerSatisfaction(businessAnalytics.analytics),
          efficiencyScore: this.calculateEfficiencyScore(businessAnalytics.analytics)
        },
        detailedMetrics: businessAnalytics.analytics,
        recommendations: this.generateRecommendations(businessAnalytics.analytics),
        trends: businessAnalytics.analytics.dailyTrends
      };

      console.log(`📋 Performance report generated for business: ${businessId}`);
      return { success: true, report };
    } catch (error) {
      console.error('❌ Error generating performance report:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }
  }

  calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getPlatformBreakdown(conversations) {
    const breakdown = {};
    conversations.forEach(conv => {
      breakdown[conv.platform] = (breakdown[conv.platform] || 0) + 1;
    });
    return breakdown;
  }

  getDailyTrends(conversations, startDate) {
    const trends = {};
    const start = new Date(startDate);
    const end = new Date();
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      trends[dateStr] = conversations.filter(c => 
        c.start_time.startsWith(dateStr)
      ).length;
    }
    
    return trends;
  }

  async getTopIssues(businessId, startDate) {
    // This would analyze message content to identify common issues
    // For now, return a placeholder
    return [
      { issue: 'General inquiries', count: 45, percentage: 30 },
      { issue: 'Technical support', count: 30, percentage: 20 },
      { issue: 'Billing questions', count: 25, percentage: 17 },
      { issue: 'Product information', count: 20, percentage: 13 },
      { issue: 'Account management', count: 15, percentage: 10 }
    ];
  }

  getPreferredPlatform(conversations) {
    const platformCount = {};
    conversations.forEach(conv => {
      platformCount[conv.platform] = (platformCount[conv.platform] || 0) + 1;
    });
    
    return Object.keys(platformCount).reduce((a, b) => 
      platformCount[a] > platformCount[b] ? a : b
    );
  }

  calculateEngagementScore(conversations, messages) {
    if (conversations.length === 0) return 0;
    const avgMessages = messages.length / conversations.length;
    const activeConversations = conversations.filter(c => c.status === 'active').length;
    
    return Math.min(100, (avgMessages * 10) + (activeConversations * 5));
  }

  getDailyVolume(conversations, startDate) {
    const volume = {};
    conversations.forEach(conv => {
      const date = conv.start_time.split('T')[0];
      volume[date] = (volume[date] || 0) + 1;
    });
    return volume;
  }

  async getPlatformResponseTime(platform, startDate) {
    // This would calculate average response time for a specific platform
    return 1500; // Placeholder: 1.5 seconds
  }

  calculateCustomerSatisfaction(analytics) {
    // This would be based on actual customer feedback
    // For now, use a formula based on response time and confidence
    const responseTimeScore = Math.max(0, 100 - (analytics.averageResponseTime / 100));
    const confidenceScore = analytics.averageConfidence * 100;
    
    return Math.round((responseTimeScore + confidenceScore) / 2);
  }

  calculateEfficiencyScore(analytics) {
    // This would measure how efficiently the AI handles conversations
    const responseTimeEfficiency = Math.max(0, 100 - (analytics.averageResponseTime / 50));
    const tokenEfficiency = Math.max(0, 100 - (analytics.averageTokensUsed / 10));
    
    return Math.round((responseTimeEfficiency + tokenEfficiency) / 2);
  }

  generateRecommendations(analytics) {
    const recommendations = [];
    
    if (analytics.averageResponseTime > 3000) {
      recommendations.push('Consider optimizing AI response generation for faster replies');
    }
    
    if (analytics.averageConfidence < 0.7) {
      recommendations.push('Review and improve AI training data for better confidence scores');
    }
    
    if (analytics.totalConversations < 100) {
      recommendations.push('Focus on increasing user engagement and conversation volume');
    }
    
    if (Object.keys(analytics.platformBreakdown).length === 1) {
      recommendations.push('Consider expanding to additional platforms for broader reach');
    }
    
    return recommendations;
  }
}

module.exports = AnalyticsService;
