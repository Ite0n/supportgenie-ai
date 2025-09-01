'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle, Zap, Users, TrendingUp, ArrowRight } from 'lucide-react';

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: any) => void;
  }
}

interface LeadCaptureProps {
  variant?: 'hero' | 'pricing' | 'footer';
  title?: string;
  subtitle?: string;
  ctaText?: string;
  placeholder?: string;
  successMessage?: string;
  className?: string;
}

export default function LeadCapture({ 
  variant = 'hero',
  title = "Get Early Access to AI Support",
  subtitle = "Join 500+ businesses already using SupportGenie AI",
  ctaText = "Get Free Access",
  placeholder = "Enter your business email",
  successMessage = "Welcome aboard! Check your email for next steps."
}: LeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send to backend lead capture endpoint
      const response = await fetch('/api/leads/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: variant,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct'
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setEmail('');
        
        // Track conversion for analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'lead_captured', {
            event_category: 'engagement',
            event_label: variant,
            value: 1
          });
        }
      } else {
        throw new Error('Failed to capture lead');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
      console.error('Lead capture error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
          input: 'bg-white/20 border-white/30 text-white placeholder-white/70',
          button: 'bg-white text-purple-600 hover:bg-gray-100'
        };
      case 'pricing':
        return {
          container: 'bg-gray-50 border border-gray-200 text-gray-900',
          input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
          button: 'bg-purple-600 text-white hover:bg-purple-700'
        };
      case 'footer':
        return {
          container: 'bg-gray-900 text-white',
          input: 'bg-gray-800 border-gray-700 text-white placeholder-gray-400',
          button: 'bg-purple-600 text-white hover:bg-purple-700'
        };
      default:
        return {
          container: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white',
          input: 'bg-white/20 border-white/30 text-white placeholder-white/70',
          button: 'bg-white text-purple-600 hover:bg-gray-100'
        };
    }
  };

  const styles = getVariantStyles();

  if (success) {
    return (
      <div className={`rounded-2xl p-8 text-center ${styles.container}`}>
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
        <h3 className="text-2xl font-bold mb-2">🎉 Welcome aboard!</h3>
        <p className="text-lg mb-6 opacity-90">{successMessage}</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <CheckCircle className="w-4 h-4" />
            <span>Free 14-day trial included</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <CheckCircle className="w-4 h-4" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <CheckCircle className="w-4 h-4" />
            <span>Setup in under 5 minutes</span>
          </div>
        </div>

        <button
          onClick={() => setSuccess(false)}
          className="mt-6 text-sm underline opacity-80 hover:opacity-100 transition-opacity"
        >
          Add another email
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-8 ${styles.container}`}>
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="opacity-90">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${styles.input} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${styles.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Social proof */}
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-4 text-sm opacity-80">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>500+ businesses</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>24/7 support</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>1s response</span>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-4 text-center text-xs opacity-60">
        <p>🔒 We respect your privacy. Unsubscribe anytime.</p>
        <p>✨ Join our exclusive early access program</p>
      </div>
    </div>
  );
}
