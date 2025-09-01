const rateLimit = require('express-rate-limit');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class SecurityService {
  constructor() {
    this.redis = null;
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        console.log('✅ Redis connected for security service');
      } else {
        console.log('⚠️ Redis not configured, using in-memory storage');
      }
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
    }
  }

  /**
   * Create rate limiter middleware
   */
  createRateLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      max = 100, // limit each IP to 100 requests per windowMs
      message = 'Too many requests from this IP, please try again later.',
      standardHeaders = true,
      legacyHeaders = false,
      store = null
    } = options;

    return rateLimit({
      windowMs,
      max,
      message: {
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      },
      standardHeaders,
      legacyHeaders,
      store: store || this.createRedisStore(),
      keyGenerator: this.customKeyGenerator,
      handler: this.customRateLimitHandler
    });
  }

  /**
   * Create Redis store for rate limiting
   */
  createRedisStore() {
    if (!this.redis) {
      return null; // Fall back to default memory store
    }

    return {
      incr: async (key) => {
        const multi = this.redis.multi();
        multi.incr(key);
        multi.expire(key, 15 * 60); // 15 minutes
        const results = await multi.exec();
        return results[0][1];
      },
      decrement: async (key) => {
        return await this.redis.decr(key);
      },
      resetKey: async (key) => {
        return await this.redis.del(key);
      }
    };
  }

  /**
   * Custom key generator for rate limiting
   */
  customKeyGenerator(req) {
    // Use user ID if authenticated, otherwise IP address
    if (req.user && req.user.id) {
      return `user:${req.user.id}`;
    }
    
    // Use X-Forwarded-For header for proxy support
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      return `ip:${forwardedFor.split(',')[0].trim()}`;
    }
    
    return `ip:${req.ip}`;
  }

  /**
   * Custom rate limit handler
   */
  customRateLimitHandler(req, res) {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(15 * 60), // 15 minutes in seconds
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Create authentication middleware
   */
  createAuthMiddleware(options = {}) {
    const {
      required = true,
      roles = [],
      verifyBusiness = false
    } = options;

    return async (req, res, next) => {
      try {
        const token = this.extractToken(req);
        
        if (!token && required) {
          return res.status(401).json({
            error: 'Authentication required',
            message: 'No valid authentication token provided'
          });
        }

        if (token) {
          const decoded = await this.verifyToken(token);
          if (!decoded) {
            if (required) {
              return res.status(401).json({
                error: 'Invalid token',
                message: 'Authentication token is invalid or expired'
              });
            }
          } else {
            req.user = decoded;
            
            // Check roles if specified
            if (roles.length > 0 && !roles.includes(decoded.role)) {
              return res.status(403).json({
                error: 'Insufficient permissions',
                message: 'You do not have permission to access this resource'
              });
            }

            // Verify business access if required
            if (verifyBusiness && decoded.businessId) {
              const hasAccess = await this.verifyBusinessAccess(decoded.id, decoded.businessId);
              if (!hasAccess) {
                return res.status(403).json({
                  error: 'Business access denied',
                  message: 'You do not have access to this business'
                });
              }
            }
          }
        }

        next();
      } catch (error) {
        console.error('❌ Auth middleware error:', error);
        if (required) {
          return res.status(500).json({
            error: 'Authentication error',
            message: 'An error occurred during authentication'
          });
        }
        next();
      }
    };
  }

  /**
   * Extract token from request
   */
  extractToken(req) {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.substring(7);
    }
    
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }
    
    if (req.query.token) {
      return req.query.token;
    }
    
    return null;
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if token is blacklisted
      if (await this.isTokenBlacklisted(token)) {
        return null;
      }
      
      return decoded;
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
      return null;
    }
  }

  /**
   * Check if token is blacklisted
   */
  async isTokenBlacklisted(token) {
    if (!this.redis) return false;
    
    try {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const isBlacklisted = await this.redis.get(`blacklist:${hash}`);
      return !!isBlacklisted;
    } catch (error) {
      console.error('❌ Error checking token blacklist:', error);
      return false;
    }
  }

  /**
   * Blacklist a token
   */
  async blacklistToken(token, expiresIn = '24h') {
    if (!this.redis) return false;
    
    try {
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      const ttl = this.parseExpiration(expiresIn);
      await this.redis.setex(`blacklist:${hash}`, ttl, '1');
      console.log(`✅ Token blacklisted: ${hash}`);
      return true;
    } catch (error) {
      console.error('❌ Error blacklisting token:', error);
      return false;
    }
  }

  /**
   * Parse expiration time
   */
  parseExpiration(expiresIn) {
    if (typeof expiresIn === 'number') return expiresIn;
    
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 86400; // Default: 24 hours
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 3600;
      case 'd': return value * 86400;
      default: return 86400;
    }
  }

  /**
   * Verify business access
   */
  async verifyBusinessAccess(userId, businessId) {
    // This would check if the user has access to the business
    // For now, return true as a placeholder
    return true;
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate secure random string
   */
  generateSecureString(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate API key
   */
  generateApiKey(prefix = 'sg') {
    const timestamp = Date.now().toString(36);
    const random = this.generateSecureString(16);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Create request logging middleware
   */
  createRequestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      console.log(`📥 ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
      
      // Log response
      res.on('finish', () => {
        const duration = Date.now() - start;
        const status = res.statusCode;
        const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
        
        console.log(`${statusEmoji} ${req.method} ${req.path} - ${status} - ${duration}ms`);
        
        // Log to Redis if available
        if (this.redis) {
          this.logRequest(req, res, duration).catch(console.error);
        }
      });
      
      next();
    };
  }

  /**
   * Log request to Redis
   */
  async logRequest(req, res, duration) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id || null,
        businessId: req.user?.businessId || null
      };
      
      const key = `logs:${new Date().toISOString().split('T')[0]}`;
      await this.redis.lpush(key, JSON.stringify(logEntry));
      await this.redis.expire(key, 7 * 24 * 60 * 60); // Keep logs for 7 days
    } catch (error) {
      console.error('❌ Error logging request:', error);
    }
  }

  /**
   * Create CORS middleware
   */
  createCorsMiddleware() {
    return (req, res, next) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      const origin = req.headers.origin;
      
      if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    };
  }

  /**
   * Create security headers middleware
   */
  createSecurityHeaders() {
    return (req, res, next) => {
      // Security headers
      res.header('X-Content-Type-Options', 'nosniff');
      res.header('X-Frame-Options', 'DENY');
      res.header('X-XSS-Protection', '1; mode=block');
      res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.header('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'");
      res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      next();
    };
  }

  /**
   * Create input validation middleware
   */
  createInputValidator(schema) {
    return (req, res, next) => {
      try {
        const { error } = schema.validate(req.body);
        if (error) {
          return res.status(400).json({
            error: 'Validation failed',
            message: error.details[0].message,
            details: error.details
          });
        }
        next();
      } catch (error) {
        console.error('❌ Input validation error:', error);
        return res.status(500).json({
          error: 'Validation error',
          message: 'An error occurred during input validation'
        });
      }
    };
  }

  /**
   * Create SQL injection protection middleware
   */
  createSqlInjectionProtection() {
    return (req, res, next) => {
      const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR|ONCLICK|ONMOUSEOVER|ONFOCUS|ONBLUR|ONCHANGE|ONSUBMIT|ONRESET|ONSELECT|ONUNLOAD)\b)/i;
      
      const checkValue = (value) => {
        if (typeof value === 'string' && sqlPattern.test(value)) {
          throw new Error('Potential SQL injection detected');
        }
      };
      
      try {
        // Check body
        if (req.body) {
          Object.values(req.body).forEach(checkValue);
        }
        
        // Check query parameters
        if (req.query) {
          Object.values(req.query).forEach(checkValue);
        }
        
        // Check URL parameters
        if (req.params) {
          Object.values(req.params).forEach(checkValue);
        }
        
        next();
      } catch (error) {
        console.warn(`⚠️ Potential SQL injection attempt from ${req.ip}: ${error.message}`);
        return res.status(400).json({
          error: 'Invalid input',
          message: 'The input contains potentially harmful content'
        });
      }
    };
  }

  /**
   * Get security statistics
   */
  async getSecurityStats() {
    try {
      if (!this.redis) {
        return { error: 'Redis not available' };
      }
      
      const today = new Date().toISOString().split('T')[0];
      const logs = await this.redis.lrange(`logs:${today}`, 0, -1);
      
      const stats = {
        totalRequests: logs.length,
        errorRequests: logs.filter(log => {
          const parsed = JSON.parse(log);
          return parsed.statusCode >= 400;
        }).length,
        averageResponseTime: logs.reduce((sum, log) => {
          const parsed = JSON.parse(log);
          return sum + parsed.duration;
        }, 0) / logs.length || 0,
        uniqueIPs: new Set(logs.map(log => {
          const parsed = JSON.parse(log);
          return parsed.ip;
        })).size,
        uniqueUsers: new Set(logs.filter(log => {
          const parsed = JSON.parse(log);
          return parsed.userId;
        }).map(log => {
          const parsed = JSON.parse(log);
          return parsed.userId;
        })).size
      };
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting security stats:', error);
      return { error: error.message };
    }
  }

  /**
   * Clean up old logs
   */
  async cleanupOldLogs() {
    try {
      if (!this.redis) return;
      
      const keys = await this.redis.keys('logs:*');
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7); // Keep logs for 7 days
      
      for (const key of keys) {
        const dateStr = key.split(':')[1];
        const logDate = new Date(dateStr);
        
        if (logDate < cutoff) {
          await this.redis.del(key);
          console.log(`🗑️ Cleaned up old logs: ${key}`);
        }
      }
    } catch (error) {
      console.error('❌ Error cleaning up old logs:', error);
    }
  }
}

module.exports = SecurityService;
