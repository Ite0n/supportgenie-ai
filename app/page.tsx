import { 
  MessageCircle, 
  Zap, 
  Shield, 
  Globe, 
  Smartphone, 
  BarChart3,
  CheckCircle,
  Star,
  Play,
  ArrowRight,
  Mail,
  Phone,
  Building
} from 'lucide-react'
import DemoChat from './components/DemoChat'
import ContactForm from './components/ContactForm'
import Header from './components/Header'
import LeadCapture from './components/LeadCapture'
import ViralDemo from './components/ViralDemo'
import { useAuth } from './contexts/AuthContext'

export default function Home() {
  let user = null;
  
  try {
    const auth = useAuth();
    user = auth.user;
  } catch (error) {
    // Handle case where useAuth is not available (e.g., during SSR)
    console.log('Auth context not available, proceeding without user data');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <Header />
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-genie-500/10"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-shadow">
            Never Miss a Customer Again{' '}
            <span className="gradient-text">🚀</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mb-8 leading-relaxed">
            24/7 AI Support on WhatsApp, Telegram & your website. 
            Save time, boost sales, and keep your clients happy with SupportGenie AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {user ? (
              <a href="/dashboard" className="btn-primary">
                Go to Dashboard
              </a>
            ) : (
              <a href="#pricing" className="btn-primary">
                Start Free Trial
              </a>
            )}
            <a href="#demo" className="btn-secondary flex items-center gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </a>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 animate-float">
          <MessageCircle className="w-8 h-8 text-primary-400" />
        </div>
        <div className="absolute bottom-20 right-10 animate-float" style={{ animationDelay: '2s' }}>
          <Zap className="w-8 h-8 text-genie-400" />
        </div>
      </section>

      {/* Lead Capture Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <LeadCapture 
            variant="hero"
            title="🚀 Get Early Access to AI Support"
            subtitle="Join 500+ businesses already using SupportGenie AI. Be among the first to experience the future of customer support."
            ctaText="Get Free Access Now"
            placeholder="Enter your business email"
            successMessage="🎉 Welcome aboard! You're now on our exclusive early access list. Check your email for next steps."
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Why Choose <span className="gradient-text">SupportGenie AI</span>?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600/40 transition-all duration-300">
                <MessageCircle className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 Availability</h3>
              <p className="text-gray-400">Never miss a customer inquiry, even at 3 AM. Your AI support is always ready to help.</p>
            </div>
            
            <div className="card text-center group">
              <div className="w-16 h-16 bg-genie-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-genie-600/40 transition-all duration-300">
                <Zap className="w-8 h-8 text-genie-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Responses</h3>
              <p className="text-gray-400">Customers get immediate answers to their questions, improving satisfaction and conversion rates.</p>
            </div>
            
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600/40 transition-all duration-300">
                <Shield className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart & Secure</h3>
              <p className="text-gray-400">Advanced AI that learns from your business and keeps customer data secure and private.</p>
            </div>
            
            <div className="card text-center group">
              <div className="w-16 h-16 bg-genie-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-genie-600/40 transition-all duration-300">
                <Globe className="w-8 h-8 text-genie-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Platform</h3>
              <p className="text-gray-400">Seamlessly integrate with WhatsApp, Telegram, and your website from one dashboard.</p>
            </div>
            
            <div className="card text-center group">
              <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600/40 transition-all duration-300">
                <Smartphone className="w-8 h-8 text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mobile First</h3>
              <p className="text-gray-400">Manage your AI support team from anywhere with our mobile-optimized dashboard.</p>
            </div>
            
            <div className="card text-center group">
              <div className="w-16 h-16 bg-genie-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-genie-600/40 transition-all duration-300">
                <BarChart3 className="w-8 h-8 text-genie-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
              <p className="text-gray-400">Track performance, customer satisfaction, and identify areas for improvement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Viral Demo Section */}
      <ViralDemo />

      {/* Lead Capture Section 2 */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto">
          <LeadCapture 
            variant="pricing"
            title="💡 Ready to Transform Your Customer Support?"
            subtitle="Join the AI revolution. Start your free trial today and see the difference SupportGenie AI can make for your business."
            ctaText="Start Free Trial"
            placeholder="Enter your business email"
            successMessage="🎉 Excellent choice! Your free trial is being set up. Check your email for login credentials and setup instructions."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="card text-center">
              <h3 className="text-2xl font-bold mb-4">Starter</h3>
              <div className="text-4xl font-bold mb-6">
                <span className="gradient-text">$29</span>
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Up to 500 conversations/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>WhatsApp integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Basic AI training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Email support</span>
                </li>
              </ul>
              <button className="btn-primary w-full">
                Start Free Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="card text-center border-2 border-primary-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Pro</h3>
              <div className="text-4xl font-bold mb-6">
                <span className="gradient-text">$79</span>
                <span className="text-lg text-gray-400">/month</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Up to 2,000 conversations/month</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>WhatsApp + Telegram</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Advanced AI training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Website chatbot</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="btn-primary w-full">
                Start Free Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="card text-center">
              <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">
                <span className="gradient-text">Custom</span>
              </div>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Unlimited conversations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>All platforms + API access</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Custom AI training</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>White-label options</span>
                </li>
              </ul>
              <button className="btn-secondary w-full">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-gray-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What Our <span className="gradient-text">Customers</span> Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "SupportGenie AI transformed our customer service. We're handling 3x more inquiries with 95% customer satisfaction."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full"></div>
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-gray-400">CEO, TechFlow</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "The WhatsApp integration is seamless. Our customers love the instant responses, and our team can focus on complex issues."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-genie-600 rounded-full"></div>
                <div>
                  <p className="font-semibold">Marcus Rodriguez</p>
                  <p className="text-sm text-gray-400">Operations Manager, RetailPlus</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Setup was incredibly easy. Within 24 hours, we had AI support running on our website and social media channels."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-full"></div>
                <div>
                  <p className="font-semibold">Emma Thompson</p>
                  <p className="text-sm text-gray-400">Marketing Director, StartupXYZ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Customer Support</span>?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that never miss a customer inquiry. 
            Start your free trial today and see the difference AI can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-primary text-xl px-8 py-4">
              Start Free Trial
            </button>
            <button className="btn-secondary text-xl px-8 py-4 flex items-center gap-2">
              Schedule Demo
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-gray-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Get in <span className="gradient-text">Touch</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Have questions about SupportGenie AI? Want to see a personalized demo? 
              Our team is here to help you get started.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-2xl font-bold mb-6">Let's Talk Business</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Email Us</h4>
                    <p className="text-gray-400">hello@supportgenie.ai</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-genie-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-genie-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Call Us</h4>
                    <p className="text-gray-400">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Visit Us</h4>
                    <p className="text-gray-400">123 AI Street, Tech City</p>
                    <p className="text-sm text-gray-500">Innovation District, TC 12345</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">
            <span className="gradient-text">SupportGenie AI</span>
          </h3>
          <p className="text-gray-400 mb-6">
            Empowering businesses with intelligent, 24/7 customer support
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-gray-500 mt-6">
            © 2024 SupportGenie AI. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
