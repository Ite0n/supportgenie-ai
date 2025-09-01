const axios = require('axios');
const crypto = require('crypto');

class WhatsAppService {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    this.apiVersion = 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
  }

  /**
   * Verify webhook for WhatsApp
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('✅ WhatsApp webhook verified successfully');
      return challenge;
    }
    
    console.log('❌ WhatsApp webhook verification failed');
    return null;
  }

  /**
   * Send text message
   */
  async sendTextMessage(to, text, previewUrl = false) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: previewUrl,
          body: text
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp message sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send media message (image, document, audio, video)
   */
  async sendMediaMessage(to, mediaType, mediaUrl, caption = null) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          ...(caption && { caption: caption })
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp ${mediaType} sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error(`❌ Error sending WhatsApp ${mediaType}:`, error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send interactive message (buttons, lists)
   */
  async sendInteractiveMessage(to, type, header, body, footer, action) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'interactive',
        interactive: {
          type: type,
          ...(header && { header: header }),
          body: {
            text: body
          },
          ...(footer && { footer: { text: footer } }),
          action: action
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp interactive message sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ Error sending WhatsApp interactive message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send button message
   */
  async sendButtonMessage(to, body, buttons) {
    const action = {
      buttons: buttons.map(button => ({
        type: 'reply',
        reply: {
          id: button.id,
          title: button.title
        }
      }))
    };

    return this.sendInteractiveMessage(to, 'button', null, body, null, action);
  }

  /**
   * Send list message
   */
  async sendListMessage(to, header, body, footer, sections) {
    const action = {
      button: 'View Options',
      sections: sections
    };

    return this.sendInteractiveMessage(to, 'list', { type: 'text', text: header }, body, footer, action);
  }

  /**
   * Send template message
   */
  async sendTemplateMessage(to, templateName, languageCode = 'en_US', components = []) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: languageCode
          },
          ...(components.length > 0 && { components: components })
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp template message sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ Error sending WhatsApp template message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send location message
   */
  async sendLocationMessage(to, latitude, longitude, name = null, address = null) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'location',
        location: {
          latitude: latitude,
          longitude: longitude,
          ...(name && { name: name }),
          ...(address && { address: address })
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp location message sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ Error sending WhatsApp location message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send contact message
   */
  async sendContactMessage(to, contactData) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'contacts',
        contacts: [{
          name: {
            formatted_name: contactData.name,
            ...(contactData.firstName && { first_name: contactData.firstName }),
            ...(contactData.lastName && { last_name: contactData.lastName })
          },
          ...(contactData.phones && { phones: contactData.phones }),
          ...(contactData.emails && { emails: contactData.emails }),
          ...(contactData.addresses && { addresses: contactData.addresses }),
          ...(contactData.org && { org: contactData.org })
        }]
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp contact message sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ Error sending WhatsApp contact message:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send sticker message
   */
  async sendStickerMessage(to, stickerUrl) {
    return this.sendMediaMessage(to, 'sticker', stickerUrl);
  }

  /**
   * Send reaction to a message
   */
  async sendReaction(to, messageId, emoji) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'reaction',
        reaction: {
          message_id: messageId,
          emoji: emoji
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp reaction sent to ${to}: ${response.data.messages[0].id}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error('❌ Error sending WhatsApp reaction:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId) {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        throw new Error('WhatsApp credentials not configured');
      }

      const messageData = {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ WhatsApp message marked as read: ${messageId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error marking WhatsApp message as read:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Get message status
   */
  async getMessageStatus(messageId) {
    try {
      if (!this.accessToken) {
        throw new Error('WhatsApp access token not configured');
      }

      const response = await axios.get(
        `${this.baseUrl}/${messageId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return { success: true, status: response.data };
    } catch (error) {
      console.error('❌ Error getting WhatsApp message status:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Get media URL
   */
  async getMediaUrl(mediaId) {
    try {
      if (!this.accessToken) {
        throw new Error('WhatsApp access token not configured');
      }

      const response = await axios.get(
        `${this.baseUrl}/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return { success: true, mediaUrl: response.data.url };
    } catch (error) {
      console.error('❌ Error getting WhatsApp media URL:', error.response?.data || error.message);
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Download media
   */
  async downloadMedia(mediaId, outputPath) {
    try {
      const mediaUrlResult = await this.getMediaUrl(mediaId);
      if (!mediaUrlResult.success) {
        throw new Error(mediaUrlResult.error);
      }

      const response = await axios({
        method: 'GET',
        url: mediaUrlResult.mediaUrl,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        responseType: 'stream'
      });

      const writer = require('fs').createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          console.log(`✅ WhatsApp media downloaded to: ${outputPath}`);
          resolve({ success: true, path: outputPath });
        });
        writer.on('error', reject);
      });
    } catch (error) {
      console.error('❌ Error downloading WhatsApp media:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(body) {
    try {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      if (value.messages && value.messages.length > 0) {
        const message = value.messages[0];
        
        // Mark message as read
        await this.markMessageAsRead(message.id);
        
        // Process the message
        return await this.processIncomingMessage(message);
      }
      
      return { success: true, message: 'Webhook processed' };
    } catch (error) {
      console.error('❌ Error handling WhatsApp webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process incoming message
   */
  async processIncomingMessage(message) {
    try {
      const messageData = {
        id: message.id,
        from: message.from,
        timestamp: message.timestamp,
        type: message.type,
        content: this.extractMessageContent(message),
        metadata: {
          platform: 'whatsapp',
          businessId: message.from.split('@')[0]
        }
      };

      console.log(`📨 WhatsApp message received from ${message.from}: ${messageData.content}`);
      
      // Here you would integrate with your AI service and send a response
      // For now, just return the processed message
      return { success: true, message: messageData };
    } catch (error) {
      console.error('❌ Error processing WhatsApp message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Extract message content based on type
   */
  extractMessageContent(message) {
    switch (message.type) {
      case 'text':
        return message.text.body;
      case 'image':
        return `[Image: ${message.image.caption || 'No caption'}]`;
      case 'document':
        return `[Document: ${message.document.filename}]`;
      case 'audio':
        return '[Audio message]';
      case 'video':
        return `[Video: ${message.video.caption || 'No caption'}]`;
      case 'location':
        return `[Location: ${message.location.latitude}, ${message.location.longitude}]`;
      case 'contact':
        return `[Contact: ${message.contacts[0].name.formatted_name}]`;
      case 'sticker':
        return '[Sticker]';
      case 'reaction':
        return `[Reaction: ${message.reaction.emoji}]`;
      default:
        return '[Unsupported message type]';
    }
  }

  /**
   * Check service health
   */
  async checkHealth() {
    try {
      if (!this.accessToken || !this.phoneNumberId) {
        return { success: false, error: 'WhatsApp credentials not configured' };
      }

      // Try to get phone number info
      const response = await axios.get(
        `${this.baseUrl}/${this.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return { 
        success: true, 
        status: 'healthy',
        phoneNumber: response.data.verified_name,
        businessAccountId: response.data.business_account_id
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message,
        status: 'unhealthy'
      };
    }
  }
}

module.exports = WhatsAppService;
