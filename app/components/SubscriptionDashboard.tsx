'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Users, 
  MessageCircle, 
  Zap, 
  Crown, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UsageStats {
  conversations: {
    current: number;
    limit: number;
    percentage: number;
  };
  teamMembers: {
    current: number;
    limit: number;
    percentage: number;
  };
  integrations: {
    current: number;
    limit: number;
    percentage: number;
  };
}

interface Subscription {
  id: string;
  status: string;
  plan: string;
  planDetails: any;
  trialEnd: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  nextBillingDate: string;
}

interface PlanRecommendation {
  type: 'upgrade' | 'downgrade';
  reason: string;
  message: string;
  suggestedPlan: any;
}

export default function SubscriptionDashboard() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [recommendations, setRecommendations] = useState<PlanRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Load subscription details
      const subResponse = await fetch('/api/payments/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const subData = await subResponse.json();
      
      if (subData.success && subData.data.hasSubscription) {
        setSubscription(subData.data.subscription);
      }

      // Load usage statistics
      const usageResponse = await fetch('/api/payments/usage', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const usageData = await usageResponse.json();
      
      if (usageData.success) {
        setUsage(usageData.data.usage);
      }

      // Load plan recommendations
      const recResponse = await fetch('/api/payments/recommendations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const recData = await recResponse.json();
      
      if (recData.success) {
        setRecommendations(recData.data);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      setLoadingAction(true);
      
      const response = await fetch('/api/payments/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        window.location.href = data.data.url;
      } else {
        console.error('Failed to create portal session:', data.error);
      }
    } catch (error) {
      console.error('Error managing billing:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You can reactivate it anytime.')) {
      return;
    }

    try {
      setLoadingAction(true);
      
      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        await loadSubscriptionData(); // Refresh data
        alert('Subscription will be canceled at the end of the current period.');
      } else {
        alert('Failed to cancel subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      alert('Failed to cancel subscription');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setLoadingAction(true);
      
      const response = await fetch('/api/payments/reactivate-subscription', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        await loadSubscriptionData(); // Refresh data
        alert('Subscription reactivated successfully!');
      } else {
        alert('Failed to reactivate subscription: ' + data.error);
      }
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      alert('Failed to reactivate subscription');
    } finally {
      setLoadingAction(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getUsageBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading subscription data...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-center p-8">
        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Subscription</h3>
        <p className="text-gray-600 mb-6">
          You don't have an active subscription. Choose a plan to get started with SupportGenie AI.
        </p>
        <a
          href="#pricing"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          View Plans
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
            <p className="text-gray-600">Manage your plan and billing</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleManageBilling}
              disabled={loadingAction}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
              Manage Billing
            </button>
            <button
              onClick={loadSubscriptionData}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Plan Info */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900">Current Plan</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 capitalize">
              {subscription.plan}
            </p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
              {subscription.status}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900">Next Billing</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </p>
            {subscription.cancelAtPeriodEnd && (
              <span className="text-sm text-red-600">Will cancel on this date</span>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-primary-600" />
              <span className="font-semibold text-gray-900">Billing Cycle</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">Monthly</p>
            {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
              <span className="text-sm text-blue-600">
                Trial ends {new Date(subscription.trialEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      {usage && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Usage This Month</h3>
          
          <div className="space-y-6">
            {/* Conversations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Conversations</span>
                </div>
                <span className={`font-semibold ${getUsageColor(usage.conversations.percentage)}`}>
                  {usage.conversations.current} / {usage.conversations.limit === -1 ? '∞' : usage.conversations.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usage.conversations.percentage)}`}
                  style={{ width: `${Math.min(usage.conversations.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {usage.conversations.percentage}% of limit used
              </p>
            </div>

            {/* Team Members */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">Team Members</span>
                </div>
                <span className={`font-semibold ${getUsageColor(usage.teamMembers.percentage)}`}>
                  {usage.teamMembers.current} / {usage.teamMembers.limit === -1 ? '∞' : usage.teamMembers.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usage.teamMembers.percentage)}`}
                  style={{ width: `${Math.min(usage.teamMembers.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {usage.teamMembers.percentage}% of limit used
              </p>
            </div>

            {/* Integrations */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-900">Integrations</span>
                </div>
                <span className={`font-semibold ${getUsageColor(usage.integrations.percentage)}`}>
                  {usage.integrations.current} / {usage.integrations.limit === -1 ? '∞' : usage.integrations.limit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getUsageBarColor(usage.integrations.percentage)}`}
                  style={{ width: `${Math.min(usage.integrations.percentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {usage.integrations.percentage}% of limit used
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Plan Recommendations</h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    rec.type === 'upgrade' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {rec.type === 'upgrade' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {rec.type === 'upgrade' ? 'Consider Upgrading' : 'Consider Downgrading'}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">{rec.message}</p>
                    {rec.suggestedPlan && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Suggested plan:</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {rec.suggestedPlan.name}
                        </span>
                        {rec.suggestedPlan.price && (
                          <span className="text-sm text-gray-600">
                            ${rec.suggestedPlan.price}/month
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Subscription Actions</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          {subscription.cancelAtPeriodEnd ? (
            <button
              onClick={handleReactivateSubscription}
              disabled={loadingAction}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Reactivate Subscription
            </button>
          ) : (
            <button
              onClick={handleCancelSubscription}
              disabled={loadingAction}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4" />
              Cancel Subscription
            </button>
          )}
          
          <button
            onClick={handleManageBilling}
            disabled={loadingAction}
            className="flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            Manage Billing
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
              <p className="text-blue-800 text-sm mb-3">
                If you have questions about your subscription or need to make changes, our support team is here to help.
              </p>
              <a
                href="#contact"
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Contact Support →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
