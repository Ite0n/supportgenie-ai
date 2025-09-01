'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Star, Zap, Shield, Users, Globe, Bot, Crown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  currency: string;
  interval: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  popular?: boolean;
  description: string;
}

const plans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'usd',
    interval: 'month',
    description: 'Perfect for small businesses getting started with AI support',
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
  {
    id: 'pro',
    name: 'Pro',
    price: 79,
    currency: 'usd',
    interval: 'month',
    description: 'Advanced features for growing businesses',
    popular: true,
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
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    currency: 'usd',
    interval: 'month',
    description: 'Custom solutions for large organizations',
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
      maxConversations: -1,
      maxTeamMembers: -1,
      maxIntegrations: -1,
    }
  }
];

export default function PricingSection() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const getYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% discount
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleStartTrial = async (planId: string) => {
    if (!user) {
      // Redirect to login/register
      return;
    }

    setLoading(true);
    try {
      // Create checkout session
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to Stripe checkout
        window.location.href = data.data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
      }
    } catch (error) {
      console.error('Error starting trial:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSales = () => {
    // Open contact form or redirect to sales page
    window.location.href = '#contact';
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'conversations':
        return <MessageCircle className="w-4 h-4" />;
      case 'platforms':
        return <Globe className="w-4 h-4" />;
      case 'aiTraining':
        return <Bot className="w-4 h-4" />;
      case 'support':
        return <Shield className="w-4 h-4" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4" />;
      case 'teamMembers':
        return <Users className="w-4 h-4" />;
      case 'customBranding':
        return <Star className="w-4 h-4" />;
      case 'apiAccess':
        return <Zap className="w-4 h-4" />;
      case 'prioritySupport':
        return <Crown className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getFeatureValue = (feature: any) => {
    if (typeof feature === 'boolean') {
      return feature ? 'Yes' : 'No';
    }
    if (Array.isArray(feature)) {
      return feature.join(', ');
    }
    if (feature === 'unlimited') {
      return 'Unlimited';
    }
    return feature;
  };

  return (
    <section id="pricing" className="py-20 px-6 bg-gray-800/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isYearly ? 'bg-primary-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isYearly ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm ${isYearly ? 'text-white' : 'text-gray-400'}`}>
              Yearly <span className="text-green-400">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular ? 'ring-2 ring-primary-500 scale-105' : ''
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-primary-600 to-genie-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                
                {/* Price */}
                <div className="mb-6">
                  {plan.price ? (
                    <div className="text-4xl font-bold text-gray-900">
                      <span className="text-2xl">$</span>
                      {isYearly ? getYearlyPrice(plan.price) : plan.price}
                      <span className="text-lg text-gray-500 font-normal">
                        /{isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold text-gray-900">
                      Custom Pricing
                    </div>
                  )}
                  
                  {isYearly && plan.price && (
                    <p className="text-sm text-green-600 mt-2">
                      Save ${plan.price * 12 - getYearlyPrice(plan.price)} per year
                    </p>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    {getFeatureIcon('conversations')}
                  </div>
                  <span className="text-gray-700">
                    {plan.features.conversations === 'unlimited' ? 'Unlimited' : plan.features.conversations} conversations/month
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    {getFeatureIcon('platforms')}
                  </div>
                  <span className="text-gray-700">
                    {plan.features.platforms.join(', ')} integration
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    {getFeatureIcon('aiTraining')}
                  </div>
                  <span className="text-gray-700">
                    {plan.features.aiTraining} AI training
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    {getFeatureIcon('teamMembers')}
                  </div>
                  <span className="text-gray-700">
                    {plan.features.teamMembers === 'unlimited' ? 'Unlimited' : plan.features.teamMembers} team members
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    {getFeatureIcon('analytics')}
                  </div>
                  <span className="text-gray-700">
                    {plan.features.analytics} analytics
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                    {getFeatureIcon('support')}
                  </div>
                  <span className="text-gray-700">
                    {plan.features.support} support
                  </span>
                </div>
                
                {plan.features.customBranding && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                      {getFeatureIcon('customBranding')}
                    </div>
                    <span className="text-gray-700">Custom branding</span>
                  </div>
                )}
                
                {plan.features.apiAccess && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                      {getFeatureIcon('apiAccess')}
                    </div>
                    <span className="text-gray-700">API access</span>
                  </div>
                )}
                
                {plan.features.prioritySupport && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                      {getFeatureIcon('prioritySupport')}
                    </div>
                    <span className="text-gray-700">Priority support</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                {plan.id === 'enterprise' ? (
                  <button
                    onClick={handleContactSales}
                    className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Contact Sales
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartTrial(plan.id)}
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-primary-600 to-genie-600 text-white hover:from-primary-700 hover:to-genie-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? 'Processing...' : 'Start Free Trial'}
                  </button>
                )}
                
                <p className="text-xs text-gray-500 mt-3">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <div className="bg-white/5 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">24/7 AI customer support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Easy setup & integration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Mobile-responsive dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Data security & privacy</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Multi-language support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Regular updates & improvements</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Comprehensive documentation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">Community support</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Can I change plans anytime?</h4>
              <p className="text-gray-300 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="font-semibold mb-3">What happens after my trial ends?</h4>
              <p className="text-gray-300 text-sm">
                After your 14-day trial, your subscription automatically starts. You can cancel anytime before the trial ends to avoid charges.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Do you offer refunds?</h4>
              <p className="text-gray-300 text-sm">
                We offer a 30-day money-back guarantee. If you're not satisfied, contact us for a full refund.
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="font-semibold mb-3">Is there a setup fee?</h4>
              <p className="text-gray-300 text-sm">
                No setup fees! All plans include free setup assistance and integration support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Import missing icons
import { MessageCircle, BarChart3 } from 'lucide-react';
