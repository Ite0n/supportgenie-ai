const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();
    
    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Authentication error.',
      message: error.message
    });
  }
};

// Optional authentication middleware (for public routes that can optionally use auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();
      
      if (!error && user && user.is_active) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions.'
      });
    }
    
    next();
  };
};

// Business owner middleware
const requireBusinessOwner = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    
    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'Business ID is required.'
      });
    }
    
    // Check if user owns the business
    const { data: business, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .eq('owner_id', req.userId)
      .single();
    
    if (error || !business) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You do not own this business.'
      });
    }
    
    req.business = business;
    next();
  } catch (error) {
    console.error('Business owner middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization error.',
      message: error.message
    });
  }
};

// Subscription check middleware
const requireActiveSubscription = async (req, res, next) => {
  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();
    
    if (error || !subscription) {
      return res.status(402).json({
        success: false,
        error: 'Active subscription required.',
        message: 'Please upgrade your plan to access this feature.'
      });
    }
    
    // Check if subscription is not expired
    if (new Date(subscription.current_period_end) < new Date()) {
      return res.status(402).json({
        success: false,
        error: 'Subscription expired.',
        message: 'Please renew your subscription to continue.'
      });
    }
    
    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Subscription verification error.',
      message: error.message
    });
  }
};

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requireBusinessOwner,
  requireActiveSubscription
};
