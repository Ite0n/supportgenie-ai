'use client';

import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, Zap, Share2, Play, Pause, RotateCcw, ExternalLink, TrendingUp, Users } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  delay?: number;
}

export default function ViralDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const demoConversation = [
    { text: "Hi! I need help with my order", sender: 'user' as const, delay: 1000 },
    { text: "Hello! I'd be happy to help with your order. Could you please provide your order number or the email address you used when placing the order?", sender: 'bot' as const, delay: 800 },
    { text: "My email is john@example.com", sender: 'user' as const, delay: 1200 },
    { text: "Perfect! I found your order #12345. It's currently being processed and will ship tomorrow. You'll receive a tracking number via email once it ships. Is there anything specific about your order you'd like me to help with?", sender: 'bot' as const, delay: 600 },
    { text: "Can you change the shipping address?", sender: 'user' as const, delay: 1000 },
    { text: "Absolutely! I can help you update the shipping address. However, since your order is already being processed, I'll need to contact our warehouse team to make this change. I've submitted the request and you'll receive a confirmation email within the next 2 hours. Would you like me to proceed with this change?", sender: 'bot' as const, delay: 700 },
    { text: "Yes, please. The new address is 456 Oak St, City, State 12345", sender: 'user' as const, delay: 1100 },
    { text: "Perfect! I've updated your shipping address to 456 Oak St, City, State 12345. The change has been submitted and you'll receive a confirmation email shortly. Your order will now ship to the new address. Is there anything else I can help you with today?", sender: 'bot' as const, delay: 500 }
  ];

  const stats = {
    responseTime: '0.8s',
    satisfaction: '98%',
    customers: '500+',
    languages: '25+',
    uptime: '99.9%'
  };

  useEffect(() => {
    if (isPlaying && currentStep < demoConversation.length) {
      const message = demoConversation[currentStep];
      const timer = setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: message.text,
          sender: message.sender,
          timestamp: new Date()
        }]);
        setCurrentStep(prev => prev + 1);
      }, message.delay);

      return () => clearTimeout(timer);
    } else if (currentStep >= demoConversation.length) {
      setIsPlaying(false);
      setShowStats(true);
    }
  }, [isPlaying, currentStep, demoConversation]);

  const startDemo = () => {
    setMessages([]);
    setCurrentStep(0);
    setShowStats(false);
    setIsPlaying(true);
  };

  const pauseDemo = () => {
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setMessages([]);
    setCurrentStep(0);
    setShowStats(false);
    setIsPlaying(false);
  };

  const shareDemo = () => {
    const text = "🤖 Just saw this amazing AI customer support bot that responds in under 1 second! Check it out: supportgenie.ai #AISupport #CustomerService #Innovation";
    const url = "https://supportgenie.ai";
    
    if (navigator.share) {
      navigator.share({
        title: 'SupportGenie AI - Revolutionary Customer Support',
        text: text,
        url: url
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Demo link copied to clipboard! Share it with your network.');
    }
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            See the Magic in Action 🚀
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Watch our AI respond to customer inquiries in real-time. 
            This is exactly what your business could have - 24/7 instant support.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Demo Chat Interface */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">SupportGenie AI</h3>
                  <p className="text-sm opacity-90">Online • Responds in under 1 second</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Click "Start Demo" to see the magic happen!</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isPlaying && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Demo Controls */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-center gap-3">
                {!isPlaying ? (
                  <button
                    onClick={startDemo}
                    className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    Start Demo
                  </button>
                ) : (
                  <button
                    onClick={pauseDemo}
                    className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}
                
                <button
                  onClick={resetDemo}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-xl hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Demo Info & Stats */}
          <div className="space-y-8">
            {/* Key Benefits */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Lightning Fast Responses</h3>
                  <p className="text-gray-300">Our AI responds in under 1 second, keeping customers engaged and satisfied.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">24/7 Availability</h3>
                  <p className="text-gray-300">Never miss a customer inquiry again. AI support works around the clock.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 p-3 rounded-xl">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Intelligent Problem Solving</h3>
                  <p className="text-gray-300">Advanced AI that understands context and provides helpful, accurate solutions.</p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            {showStats && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-semibold text-white mb-4 text-center">🚀 Demo Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{stats.responseTime}</div>
                    <div className="text-sm text-gray-300">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.satisfaction}</div>
                    <div className="text-sm text-gray-300">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.customers}</div>
                    <div className="text-sm text-gray-300">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.uptime}</div>
                    <div className="text-sm text-gray-300">Uptime</div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white text-center">
              <h3 className="text-xl font-bold mb-3">Ready to Transform Your Customer Support?</h3>
              <p className="text-purple-100 mb-4">Join 500+ businesses already using SupportGenie AI</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#pricing"
                  className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={shareDemo}
                  className="bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share Demo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-6">Trusted by innovative businesses worldwide</p>
          <div className="flex items-center justify-center gap-8 text-gray-500">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>500+ Active Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>25+ Countries</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
