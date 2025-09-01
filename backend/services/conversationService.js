const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class ConversationService {
  /**
   * Log a conversation for analytics
   */
  async logConversation(conversationData) {
    try {
      const { platform, userId, chatId, message, response, timestamp } = conversationData;
      
      // Log to database if Supabase is configured
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { error } = await supabase
          .from('conversations')
          .insert({
            platform,
            user_id: userId,
            chat_id: chatId,
            message,
            response,
            timestamp: timestamp || new Date().toISOString(),
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error logging conversation to database:', error);
        }
      }
      
      // Also log to console for development
      console.log('Conversation logged:', {
        platform,
        userId,
        chatId,
        message: message?.substring(0, 100) + (message?.length > 100 ? '...' : ''),
        response: response?.substring(0, 100) + (response?.length > 100 ? '...' : ''),
        timestamp: timestamp || new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error in conversation logging:', error);
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId, platform = null, limit = 50) {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return [];
      }

      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversation history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getConversationHistory:', error);
      return [];
    }
  }

  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(businessId = null, startDate = null, endDate = null) {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return {
          totalConversations: 0,
          platforms: {},
          averageResponseTime: 0
        };
      }

      let query = supabase
        .from('conversations')
        .select('*');

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }
      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching conversation analytics:', error);
        return {
          totalConversations: 0,
          platforms: {},
          averageResponseTime: 0
        };
      }

      const conversations = data || [];
      
      // Calculate analytics
      const platforms = {};
      conversations.forEach(conv => {
        platforms[conv.platform] = (platforms[conv.platform] || 0) + 1;
      });

      return {
        totalConversations: conversations.length,
        platforms,
        averageResponseTime: 0, // Would need to calculate based on message timestamps
        dateRange: {
          start: startDate,
          end: endDate
        }
      };
    } catch (error) {
      console.error('Error in getConversationAnalytics:', error);
      return {
        totalConversations: 0,
        platforms: {},
        averageResponseTime: 0
      };
    }
  }

  /**
   * Clean up old conversations (for data retention)
   */
  async cleanupOldConversations(daysToKeep = 90) {
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { deleted: 0 };
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('conversations')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());

      if (error) {
        console.error('Error cleaning up old conversations:', error);
        return { deleted: 0, error: error.message };
      }

      return { deleted: 'success' };
    } catch (error) {
      console.error('Error in cleanupOldConversations:', error);
      return { deleted: 0, error: error.message };
    }
  }
}

module.exports = new ConversationService();
