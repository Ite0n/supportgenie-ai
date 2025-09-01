const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ server });
    this.clients = new Map(); // Map to store client connections
    this.rooms = new Map(); // Map to store room subscriptions
    this.initialize();
  }

  /**
   * Initialize WebSocket server
   */
  initialize() {
    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log('✅ WebSocket server initialized');
  }

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    
    // Store client connection
    this.clients.set(clientId, {
      ws,
      id: clientId,
      connectedAt: new Date(),
      authenticated: false,
      userId: null,
      businessId: null,
      subscriptions: new Set(),
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.socket.remoteAddress,
        path: req.url
      }
    });

    console.log(`🔌 WebSocket client connected: ${clientId}`);

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
        this.sendError(clientId, 'Invalid message format');
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      this.handleDisconnect(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error(`❌ WebSocket error for client ${clientId}:`, error);
      this.handleDisconnect(clientId);
    });

    // Send welcome message
    this.sendMessage(clientId, {
      type: 'connection',
      status: 'connected',
      clientId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle incoming WebSocket message
   */
  handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      switch (message.type) {
        case 'authenticate':
          this.handleAuthentication(clientId, message);
          break;
        case 'subscribe':
          this.handleSubscription(clientId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message);
          break;
        case 'ping':
          this.sendMessage(clientId, { type: 'pong', timestamp: new Date().toISOString() });
          break;
        case 'chat_message':
          this.handleChatMessage(clientId, message);
          break;
        case 'typing_indicator':
          this.handleTypingIndicator(clientId, message);
          break;
        case 'read_receipt':
          this.handleReadReceipt(clientId, message);
          break;
        default:
          console.log(`⚠️ Unknown message type from client ${clientId}:`, message.type);
          this.sendError(clientId, 'Unknown message type');
      }
    } catch (error) {
      console.error(`❌ Error handling message from client ${clientId}:`, error);
      this.sendError(clientId, 'Internal server error');
    }
  }

  /**
   * Handle client authentication
   */
  async handleAuthentication(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const { token } = message;
      
      if (!token) {
        this.sendError(clientId, 'Authentication token required');
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Update client info
      client.authenticated = true;
      client.userId = decoded.id;
      client.businessId = decoded.businessId;
      client.role = decoded.role;

      console.log(`🔐 Client ${clientId} authenticated as user ${decoded.id}`);

      // Send authentication success
      this.sendMessage(clientId, {
        type: 'authentication',
        status: 'success',
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
          businessId: decoded.businessId
        },
        timestamp: new Date().toISOString()
      });

      // Notify other clients about new user
      this.broadcastToBusiness(decoded.businessId, {
        type: 'user_online',
        userId: decoded.id,
        timestamp: new Date().toISOString()
      }, [clientId]);

    } catch (error) {
      console.error(`❌ Authentication failed for client ${clientId}:`, error.message);
      this.sendError(clientId, 'Authentication failed');
    }
  }

  /**
   * Handle subscription to rooms/channels
   */
  handleSubscription(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { room, type = 'general' } = message;

    if (!room) {
      this.sendError(clientId, 'Room name required for subscription');
      return;
    }

    // Add client to room
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }
    
    this.rooms.get(room).add(clientId);
    client.subscriptions.add(room);

    console.log(`📡 Client ${clientId} subscribed to room: ${room}`);

    // Send subscription confirmation
    this.sendMessage(clientId, {
      type: 'subscription',
      status: 'subscribed',
      room,
      type,
      timestamp: new Date().toISOString()
    });

    // Send room info
    this.sendRoomInfo(clientId, room);
  }

  /**
   * Handle unsubscription from rooms
   */
  handleUnsubscription(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { room } = message;

    if (!room) {
      this.sendError(clientId, 'Room name required for unsubscription');
      return;
    }

    // Remove client from room
    if (this.rooms.has(room)) {
      this.rooms.get(room).delete(clientId);
      
      // Remove empty rooms
      if (this.rooms.get(room).size === 0) {
        this.rooms.delete(room);
      }
    }

    client.subscriptions.delete(room);

    console.log(`📡 Client ${clientId} unsubscribed from room: ${room}`);

    // Send unsubscription confirmation
    this.sendMessage(clientId, {
      type: 'subscription',
      status: 'unsubscribed',
      room,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle chat message
   */
  handleChatMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { room, content, messageType = 'text', metadata = {} } = message;

    if (!room || !content) {
      this.sendError(clientId, 'Room and content required for chat message');
      return;
    }

    const chatMessage = {
      type: 'chat_message',
      room,
      content,
      messageType,
      sender: {
        id: client.userId,
        businessId: client.businessId
      },
      timestamp: new Date().toISOString(),
      metadata
    };

    // Broadcast to room
    this.broadcastToRoom(room, chatMessage, [clientId]);

    // Store message in database (if needed)
    this.storeChatMessage(chatMessage);

    console.log(`💬 Chat message in room ${room} from client ${clientId}`);
  }

  /**
   * Handle typing indicator
   */
  handleTypingIndicator(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { room, isTyping } = message;

    if (!room) return;

    const typingMessage = {
      type: 'typing_indicator',
      room,
      userId: client.userId,
      businessId: client.businessId,
      isTyping,
      timestamp: new Date().toISOString()
    };

    // Broadcast to room (excluding sender)
    this.broadcastToRoom(room, typingMessage, [clientId]);
  }

  /**
   * Handle read receipt
   */
  handleReadReceipt(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { room, messageId } = message;

    if (!room || !messageId) return;

    const receiptMessage = {
      type: 'read_receipt',
      room,
      userId: client.userId,
      businessId: client.businessId,
      messageId,
      timestamp: new Date().toISOString()
    };

    // Broadcast to room (excluding sender)
    this.broadcastToRoom(room, receiptMessage, [clientId]);
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Remove from all rooms
    client.subscriptions.forEach(room => {
      if (this.rooms.has(room)) {
        this.rooms.get(room).delete(clientId);
        
        // Remove empty rooms
        if (this.rooms.get(room).size === 0) {
          this.rooms.delete(room);
        }
      }
    });

    // Notify business about user going offline
    if (client.authenticated && client.businessId) {
      this.broadcastToBusiness(client.businessId, {
        type: 'user_offline',
        userId: client.userId,
        timestamp: new Date().toISOString()
      }, [clientId]);
    }

    // Remove client
    this.clients.delete(clientId);

    console.log(`🔌 WebSocket client disconnected: ${clientId}`);
  }

  /**
   * Send message to specific client
   */
  sendMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) return;

    try {
      client.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error(`❌ Error sending message to client ${clientId}:`, error);
      this.handleDisconnect(clientId);
    }
  }

  /**
   * Send error message to client
   */
  sendError(clientId, error, code = 'error') {
    this.sendMessage(clientId, {
      type: 'error',
      code,
      message: error,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Broadcast message to all clients in a room
   */
  broadcastToRoom(room, message, excludeClientIds = []) {
    if (!this.rooms.has(room)) return;

    const clients = this.rooms.get(room);
    clients.forEach(clientId => {
      if (!excludeClientIds.includes(clientId)) {
        this.sendMessage(clientId, message);
      }
    });
  }

  /**
   * Broadcast message to all clients in a business
   */
  broadcastToBusiness(businessId, message, excludeClientIds = []) {
    this.clients.forEach((client, clientId) => {
      if (client.businessId === businessId && !excludeClientIds.includes(clientId)) {
        this.sendMessage(clientId, message);
      }
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcastToAll(message, excludeClientIds = []) {
    this.clients.forEach((client, clientId) => {
      if (!excludeClientIds.includes(clientId)) {
        this.sendMessage(clientId, message);
      }
    });
  }

  /**
   * Send room information to client
   */
  sendRoomInfo(clientId, room) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const roomClients = this.rooms.get(room) || new Set();
    const onlineUsers = Array.from(roomClients)
      .map(id => this.clients.get(id))
      .filter(c => c && c.authenticated)
      .map(c => ({
        id: c.userId,
        businessId: c.businessId,
        role: c.role,
        connectedAt: c.connectedAt
      }));

    this.sendMessage(clientId, {
      type: 'room_info',
      room,
      onlineUsers,
      totalUsers: onlineUsers.length,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send notification to specific user
   */
  sendNotification(userId, notification) {
    this.clients.forEach((client, clientId) => {
      if (client.userId === userId && client.authenticated) {
        this.sendMessage(clientId, {
          type: 'notification',
          ...notification,
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  /**
   * Send notification to all users in a business
   */
  sendBusinessNotification(businessId, notification) {
    this.broadcastToBusiness(businessId, {
      type: 'notification',
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send system message to room
   */
  sendSystemMessage(room, message, level = 'info') {
    const systemMessage = {
      type: 'system_message',
      room,
      message,
      level,
      timestamp: new Date().toISOString()
    };

    this.broadcastToRoom(room, systemMessage);
  }

  /**
   * Store chat message (placeholder for database integration)
   */
  async storeChatMessage(message) {
    // This would integrate with your database to store messages
    // For now, just log it
    console.log(`💾 Storing chat message: ${message.content.substring(0, 50)}...`);
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const totalClients = this.clients.size;
    const authenticatedClients = Array.from(this.clients.values())
      .filter(client => client.authenticated).length;
    
    const totalRooms = this.rooms.size;
    const roomStats = {};
    
    this.rooms.forEach((clients, room) => {
      roomStats[room] = clients.size;
    });

    return {
      totalClients,
      authenticatedClients,
      totalRooms,
      roomStats,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get client information
   */
  getClientInfo(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return null;

    return {
      id: client.id,
      authenticated: client.authenticated,
      userId: client.userId,
      businessId: client.businessId,
      role: client.role,
      connectedAt: client.connectedAt,
      subscriptions: Array.from(client.subscriptions),
      metadata: client.metadata
    };
  }

  /**
   * Get all connected clients
   */
  getAllClients() {
    const clients = [];
    this.clients.forEach((client, clientId) => {
      clients.push(this.getClientInfo(clientId));
    });
    return clients;
  }

  /**
   * Force disconnect client
   */
  forceDisconnect(clientId) {
    const client = this.clients.get(clientId);
    if (!client) return false;

    try {
      client.ws.close(1000, 'Force disconnect');
      this.handleDisconnect(clientId);
      return true;
    } catch (error) {
      console.error(`❌ Error force disconnecting client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Clean up inactive connections
   */
  cleanupInactiveConnections() {
    const now = new Date();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    this.clients.forEach((client, clientId) => {
      const inactiveTime = now - client.connectedAt;
      if (inactiveTime > inactiveThreshold) {
        console.log(`🧹 Cleaning up inactive client: ${clientId}`);
        this.forceDisconnect(clientId);
      }
    });
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval(intervalMs = 5 * 60 * 1000) { // 5 minutes
    setInterval(() => {
      this.cleanupInactiveConnections();
    }, intervalMs);
  }
}

module.exports = WebSocketService;
