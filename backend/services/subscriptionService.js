const { createClient } = require('@supabase/supabase-js');
const paymentService = require('./paymentService');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class SubscriptionService {
  constructor() {
    this.plans = {
      starter: {
        id: 'price_starter',
        name: 'Starter',
        price: 29,
        currency: 'usd',
        interval: 'month',
        features: {
          conversations: 500,
          platforms: ['whatsapp'],
          aiTraining: 'basic',
          support: 'email',
          analytics: 'basic',
          teamMembers: 1,
          customBranding: false,
          apiAccess: false,
          prioritySupport: false,
        },
        limits: {
          maxConversations: 500,
          maxTeamMembers: 1,
          maxIntegrations: 1,
        }
      },
      pro: {
        id: 'price_pro',
        name: 'Pro',
        price: 79,
        currency: 'usd',
        interval: 'month',
        features: {
          conversations: 2000,
          platforms: ['whatsapp', 'telegram'],
          aiTraining: 'advanced',
          support: 'priority',
          analytics: 'advanced',
          teamMembers: 5,
          customBranding: true,
          apiAccess: true,
          prioritySupport: true,
        },
        limits: {
          maxConversations: 2000,
          maxTeamMembers: 5,
          maxIntegrations: 3,
        }
      },
      enterprise: {
        id: 'price_enterprise',
        name: 'Enterprise',
        price: null, // Custom pricing
        currency: 'usd',
        interval: 'month',
        features: {
          conversations: 'unlimited',
          platforms: ['whatsapp', 'telegram', 'website', 'api'],
          aiTraining: 'custom',
          support: 'dedicated',
          analytics: 'enterprise',
          teamMembers: 'unlimited',
          customBranding: true,
          apiAccess: true,
          prioritySupport: true,
          whiteLabel: true,
          dedicatedManager: true,
        },
        limits: {
          maxConversations: -1, // Unlimited
          maxTeamMembers: -1, // Unlimited
          maxIntegrations: -1, // Unlimited
        }
      }
    };
  }

  /**
   * Get all available plans
   */
  getPlans() {
    return this.plans;
  }

  /**
   * Get plan by ID
   */
  getPlan(planId) {
    return this.plans[planId] || null;
  }

  /**
   * Check if user has access to a specific feature
   */
  async hasFeatureAccess(userId, feature) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_plan, subscription_status, trial_end')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return false;
      }

      // Check if user is on trial
      if (user.trial_end && new Date(user.trial_end) > new Date()) {
        return true; // Trial users get access to all features
      }

      // Check subscription status
      if (user.subscription_status !== 'active') {
        return false;
      }

      const plan = this.getPlan(user.subscription_plan);
      if (!plan) {
        return false;
      }

      return plan.features[feature] || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Check if user is within conversation limits
   */
  async checkConversationLimit(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_plan, subscription_status')
        .eq('id', userId)
        .single();

      if (error || !user || user.subscription_status !== 'active') {
        return { allowed: false, reason: 'No active subscription' };
      }

      const plan = this.getPlan(user.subscription_plan);
      if (!plan) {
        return { allowed: false, reason: 'Invalid plan' };
      }

      // Get current month's conversation count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error: countError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (countError) {
        console.error('Error counting conversations:', countError);
        return { allowed: true, reason: 'Could not verify limit' };
      }

      const limit = plan.limits.maxConversations;
      if (limit === -1) {
        return { allowed: true, reason: 'Unlimited plan' };
      }

      const allowed = count < limit;
      return {
        allowed,
        reason: allowed ? 'Within limit' : 'Limit exceeded',
        current: count,
        limit: limit,
        remaining: Math.max(0, limit - count)
      };
    } catch (error) {
      console.error('Error checking conversation limit:', error);
      return { allowed: true, reason: 'Error checking limit' };
    }
  }

  /**
   * Check if user can add team members
   */
  async checkTeamMemberLimit(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_plan, subscription_status')
        .eq('id', userId)
        .single();

      if (error || !user || user.subscription_status !== 'active') {
        return { allowed: false, reason: 'No active subscription' };
      }

      const plan = this.getPlan(user.subscription_plan);
      if (!plan) {
        return { allowed: false, reason: 'Invalid plan' };
      }

      // Count current team members
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.business_id);

      if (countError) {
        console.error('Error counting team members:', countError);
        return { allowed: true, reason: 'Could not verify limit' };
      }

      const limit = plan.limits.maxTeamMembers;
      if (limit === -1) {
        return { allowed: true, reason: 'Unlimited plan' };
      }

      const allowed = count < limit;
      return {
        allowed,
        reason: allowed ? 'Within limit' : 'Limit exceeded',
        current: count,
        limit: limit,
        remaining: Math.max(0, limit - count)
      };
    } catch (error) {
      console.error('Error checking team member limit:', error);
      return { allowed: true, reason: 'Error checking limit' };
    }
  }

  /**
   * Upgrade user's subscription plan
   */
  async upgradePlan(userId, newPlanId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_id, stripe_customer_id')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.subscription_id) {
        return { success: false, error: 'No active subscription' };
      }

      const newPlan = this.getPlan(newPlanId);
      if (!newPlan) {
        return { success: false, error: 'Invalid plan' };
      }

      // Update subscription in Stripe
      const result = await paymentService.updateSubscription(user.subscription_id, newPlan.id);
      if (!result.success) {
        return result;
      }

      // Update user plan in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_plan: newPlanId })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user plan:', updateError);
        return { success: false, error: 'Failed to update plan in database' };
      }

      return { success: true, message: 'Plan upgraded successfully' };
    } catch (error) {
      console.error('Error upgrading plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Downgrade user's subscription plan
   */
  async downgradePlan(userId, newPlanId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_id, subscription_plan')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { success: false, error: 'User not found' };
      }

      if (!user.subscription_id) {
        return { success: false, error: 'No active subscription' };
      }

      const currentPlan = this.getPlan(user.subscription_plan);
      const newPlan = this.getPlan(newPlanId);

      if (!currentPlan || !newPlan) {
        return { success: false, error: 'Invalid plan' };
      }

      // Check if downgrade is allowed
      if (currentPlan.price < newPlan.price) {
        return { success: false, error: 'Cannot downgrade to a more expensive plan' };
      }

      // Check if user is within limits of new plan
      const conversationCheck = await this.checkConversationLimit(userId);
      const teamCheck = await this.checkTeamMemberLimit(userId);

      if (!conversationCheck.allowed) {
        return { 
          success: false, 
          error: `Cannot downgrade: ${conversationCheck.current} conversations exceed new plan limit of ${conversationCheck.limit}` 
        };
      }

      if (!teamCheck.allowed) {
        return { 
          success: false, 
          error: `Cannot downgrade: ${teamCheck.current} team members exceed new plan limit of ${teamCheck.limit}` 
        };
      }

      // Update subscription in Stripe
      const result = await paymentService.updateSubscription(user.subscription_id, newPlan.id);
      if (!result.success) {
        return result;
      }

      // Update user plan in database
      const { error: updateError } = await supabase
        .from('users')
        .update({ subscription_plan: newPlanId })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user plan:', updateError);
        return { success: false, error: 'Failed to update plan in database' };
      }

      return { success: true, message: 'Plan downgraded successfully' };
    } catch (error) {
      console.error('Error downgrading plan:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsage(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_plan, subscription_status, trial_end')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return { success: false, error: 'User not found' };
      }

      const plan = this.getPlan(user.subscription_plan);
      if (!plan) {
        return { success: false, error: 'Invalid plan' };
      }

      // Get current month's conversation count
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: conversations, error: convError } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (convError) {
        console.error('Error counting conversations:', convError);
      }

      // Count team members
      const { count: teamMembers, error: teamError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', user.business_id);

      if (teamError) {
        console.error('Error counting team members:', teamError);
      }

      // Count active integrations
      const { count: integrations, error: intError } = await supabase
        .from('integrations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (intError) {
        console.error('Error counting integrations:', intError);
      }

      const usage = {
        conversations: {
          current: conversations || 0,
          limit: plan.limits.maxConversations,
          percentage: plan.limits.maxConversations === -1 ? 0 : 
            Math.round(((conversations || 0) / plan.limits.maxConversations) * 100)
        },
        teamMembers: {
          current: teamMembers || 0,
          limit: plan.limits.maxTeamMembers,
          percentage: plan.limits.maxTeamMembers === -1 ? 0 : 
            Math.round(((teamMembers || 0) / plan.limits.maxTeamMembers) * 100)
        },
        integrations: {
          current: integrations || 0,
          limit: plan.limits.maxIntegrations,
          percentage: plan.limits.maxIntegrations === -1 ? 0 : 
            Math.round(((integrations || 0) / plan.limits.maxIntegrations) * 100)
        }
      };

      return { success: true, usage, plan };
    } catch (error) {
      console.error('Error getting user usage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if user is on trial
   */
  async isOnTrial(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('trial_end, subscription_status')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return false;
      }

      if (user.subscription_status === 'trialing' && user.trial_end) {
        return new Date(user.trial_end) > new Date();
      }

      return false;
    } catch (error) {
      console.error('Error checking trial status:', error);
      return false;
    }
  }

  /**
   * Get trial days remaining
   */
  async getTrialDaysRemaining(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('trial_end')
        .eq('id', userId)
        .single();

      if (error || !user || !user.trial_end) {
        return 0;
      }

      const trialEnd = new Date(user.trial_end);
      const now = new Date();
      const diffTime = trialEnd - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return Math.max(0, diffDays);
    } catch (error) {
      console.error('Error getting trial days remaining:', error);
      return 0;
    }
  }

  /**
   * Get plan recommendations based on usage
   */
  async getPlanRecommendations(userId) {
    try {
      const usageResult = await this.getUserUsage(userId);
      if (!usageResult.success) {
        return { success: false, error: usageResult.error };
      }

      const { usage, plan } = usageResult;
      const recommendations = [];

      // Check if user is approaching limits
      if (plan.limits.maxConversations !== -1) {
        const convPercentage = usage.conversations.percentage;
        if (convPercentage > 80) {
          recommendations.push({
            type: 'upgrade',
            reason: 'High conversation usage',
            message: `You're using ${convPercentage}% of your conversation limit. Consider upgrading to handle more volume.`,
            suggestedPlan: this.getNextPlan(plan.name)
          });
        }
      }

      if (plan.limits.maxTeamMembers !== -1) {
        const teamPercentage = usage.teamMembers.percentage;
        if (teamPercentage > 80) {
          recommendations.push({
            type: 'upgrade',
            reason: 'Team size limit',
            message: `You're approaching your team member limit. Upgrade to add more team members.`,
            suggestedPlan: this.getNextPlan(plan.name)
          });
        }
      }

      // Check if user could downgrade
      if (usage.conversations.percentage < 50 && usage.teamMembers.percentage < 50) {
        const cheaperPlan = this.getCheaperPlan(plan.name);
        if (cheaperPlan) {
          recommendations.push({
            type: 'downgrade',
            reason: 'Low usage',
            message: `You're using less than 50% of your current plan limits. Consider downgrading to save money.`,
            suggestedPlan: cheaperPlan
          });
        }
      }

      return { success: true, recommendations };
    } catch (error) {
      console.error('Error getting plan recommendations:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get next plan in hierarchy
   */
  getNextPlan(currentPlanName) {
    const planOrder = ['starter', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlanName.toLowerCase());
    
    if (currentIndex === -1 || currentIndex === planOrder.length - 1) {
      return null;
    }

    return this.plans[planOrder[currentIndex + 1]];
  }

  /**
   * Get cheaper plan in hierarchy
   */
  getCheaperPlan(currentPlanName) {
    const planOrder = ['starter', 'pro', 'enterprise'];
    const currentIndex = planOrder.indexOf(currentPlanName.toLowerCase());
    
    if (currentIndex <= 0) {
      return null;
    }

    return this.plans[planOrder[currentIndex - 1]];
  }

  /**
   * Calculate potential savings from plan change
   */
  calculateSavings(currentPlanId, newPlanId) {
    const currentPlan = this.getPlan(currentPlanId);
    const newPlan = this.getPlan(newPlanId);

    if (!currentPlan || !newPlan || !currentPlan.price || !newPlan.price) {
      return null;
    }

    const monthlySavings = currentPlan.price - newPlan.price;
    const yearlySavings = monthlySavings * 12;

    return {
      monthly: monthlySavings,
      yearly: yearlySavings,
      percentage: Math.round((monthlySavings / currentPlan.price) * 100)
    };
  }
}

module.exports = new SubscriptionService();
