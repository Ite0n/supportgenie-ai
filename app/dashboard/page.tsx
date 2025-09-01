'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  MessageCircle, 
  Settings, 
  BarChart3, 
  Users, 
  Zap,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { telegram, conversations, health } from '../lib/api';

interface DashboardStats {
  totalConversations: number;
  platforms: Record<string, number>;
  botStatus: 'online' | 'offline' | 'error';
}

export default function Dashboard() {
  const { user, business, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    platforms: {},
    botStatus: 'offline'
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoadingStats(true);
      
      // Load conversation analytics
      const analyticsResponse = await conversations.getAnalytics();
      if (analyticsResponse.success && analyticsResponse.data) {
        setStats(prev => ({
          ...prev,
          totalConversations: analyticsResponse.data?.totalConversations || 0,
          platforms: analyticsResponse.data?.platforms || {}
        }));
      }

      // Check bot status
      const botStatusResponse = await telegram.getStatus();
      if (botStatusResponse.success && botStatusResponse.data) {
        const isOnline = botStatusResponse.data.polling || 
                        (botStatusResponse.data.webhook && botStatusResponse.data.webhook.url);
        setStats(prev => ({
          ...prev,
          botStatus: isOnline ? 'online' : 'offline'
        }));
      }

      // Health check
      const healthResponse = await health.check();
      if (!healthResponse.success) {
        setStats(prev => ({ ...prev, botStatus: 'error' }));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setStats(prev => ({ ...prev, botStatus: 'error' }));
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.first_name}! 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your AI support team and monitor performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats.botStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : stats.botStatus === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stats.botStatus === 'online' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                {stats.botStatus === 'error' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                {stats.botStatus === 'offline' && <AlertCircle className="w-4 h-4 inline mr-1" />}
                Bot {stats.botStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Conversations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loadingStats ? <Loader2 className="w-6 h-6 animate-spin" /> : stats.totalConversations}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Bot Status</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {stats.botStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Business</p>
                <p className="text-2xl font-bold text-gray-900">
                  {business?.name || 'Not Set'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Platforms</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats.platforms).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bot Management */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Bot Management</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <Bot className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Telegram Bot</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  stats.botStatus === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stats.botStatus === 'online' ? 'Active' : 'Inactive'}
                </span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-genie-600" />
                  <span className="font-medium">WhatsApp Integration</span>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Coming Soon
                </span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Today's Conversations</span>
                <span className="font-medium text-gray-900">
                  {loadingStats ? '...' : Math.floor(stats.totalConversations * 0.1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="font-medium text-gray-900">99.9%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">AI Confidence</span>
                <span className="font-medium text-gray-900">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Breakdown */}
        {Object.keys(stats.platforms).length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversations by Platform</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(stats.platforms).map(([platform, count]) => (
                <div key={platform} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      platform === 'telegram' ? 'bg-blue-500' :
                      platform === 'whatsapp' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="font-medium capitalize">{platform}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Getting Started */}
        <div className="mt-8 bg-gradient-to-r from-primary-50 to-genie-50 rounded-xl border border-primary-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            Set up your AI support team and start providing 24/7 customer service
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              Configure Bot
            </button>
            <button className="px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              View Documentation
            </button>
            <button className="px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
