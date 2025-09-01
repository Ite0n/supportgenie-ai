const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create a new customer
   */
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: {
          ...metadata,
          source: 'supportgenie_ai'
        }
      });
      
      console.log(`✅ Customer created: ${customer.id}`);
      return { success: true, customer };
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(customerId, priceId, metadata = {}) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata: {
          ...metadata,
          source: 'supportgenie_ai'
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      });
      
      console.log(`✅ Subscription created: ${subscription.id}`);
      return { success: true, subscription };
    } catch (error) {
      console.error('❌ Error creating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return { success: true, subscription };
    } catch (error) {
      console.error('❌ Error retrieving subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, reason = 'customer_request') {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
        cancellation_reason: reason
      });
      
      console.log(`✅ Subscription cancelled: ${subscriptionId}`);
      return { success: true, subscription };
    } catch (error) {
      console.error('❌ Error cancelling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create payment intent
   */
  async createPaymentIntent(amount, currency = 'usd', customerId = null, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        metadata: {
          ...metadata,
          source: 'supportgenie_ai'
        },
        automatic_payment_methods: {
          enabled: true
        }
      });
      
      console.log(`✅ Payment intent created: ${paymentIntent.id}`);
      return { success: true, paymentIntent };
    } catch (error) {
      console.error('❌ Error creating payment intent:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(customerId) {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });
      
      return { success: true, paymentMethods: paymentMethods.data };
    } catch (error) {
      console.error('❌ Error retrieving payment methods:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(customerId, amount, currency = 'usd', description = 'SupportGenie AI Service', metadata = {}) {
    try {
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        collection_method: 'charge_automatically',
        metadata: {
          ...metadata,
          source: 'supportgenie_ai'
        }
      });

      // Add invoice item
      await this.stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount,
        currency,
        description
      });

      // Finalize and send invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
      const sentInvoice = await this.stripe.invoices.sendInvoice(invoice.id);
      
      console.log(`✅ Invoice created and sent: ${invoice.id}`);
      return { success: true, invoice: sentInvoice };
    } catch (error) {
      console.error('❌ Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        default:
          console.log(`ℹ️ Unhandled event type: ${event.type}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error handling webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle successful payment
   */
  async handlePaymentSucceeded(invoice) {
    console.log(`💰 Payment succeeded for invoice: ${invoice.id}`);
    console.log(`👤 Customer: ${invoice.customer}`);
    console.log(`💵 Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
    
    // Here you would update your database, send confirmation emails, etc.
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(invoice) {
    console.log(`❌ Payment failed for invoice: ${invoice.id}`);
    console.log(`👤 Customer: ${invoice.customer}`);
    console.log(`💵 Amount: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`);
    
    // Here you would send dunning emails, update subscription status, etc.
  }

  /**
   * Handle subscription creation
   */
  async handleSubscriptionCreated(subscription) {
    console.log(`🎉 New subscription created: ${subscription.id}`);
    console.log(`👤 Customer: ${subscription.customer}`);
    console.log(`📅 Current period: ${new Date(subscription.current_period_start * 1000).toISOString()}`);
    
    // Here you would activate services, send welcome emails, etc.
  }

  /**
   * Handle subscription updates
   */
  async handleSubscriptionUpdated(subscription) {
    console.log(`📝 Subscription updated: ${subscription.id}`);
    console.log(`👤 Customer: ${subscription.customer}`);
    console.log(`📊 Status: ${subscription.status}`);
    
    // Here you would update service access, send notifications, etc.
  }

  /**
   * Handle subscription deletion
   */
  async handleSubscriptionDeleted(subscription) {
    console.log(`🗑️ Subscription deleted: ${subscription.id}`);
    console.log(`👤 Customer: ${subscription.customer}`);
    console.log(`📅 Cancelled at: ${new Date(subscription.canceled_at * 1000).toISOString()}`);
    
    // Here you would deactivate services, send cancellation emails, etc.
  }
}

module.exports = PaymentService;
