const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

class PaymentService {
  constructor() {
    this.stripe = stripe;
  }

  /**
   * Create a new customer in Stripe
   */
  async createCustomer(userData) {
    try {
      const customer = await this.stripe.customers.create({
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
        metadata: {
          userId: userData.id,
          businessName: userData.businessName || '',
        },
      });

      return { success: true, customer };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(customerId, priceId, trialDays = 14) {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: trialDays,
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Error creating subscription:', error);
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
      console.error('Error retrieving subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      let subscription;
      
      if (cancelAtPeriodEnd) {
        subscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      } else {
        subscription = await this.stripe.subscriptions.cancel(subscriptionId);
      }

      return { success: true, subscription };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reactivate a subscription
   */
  async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return { success: true, subscription };
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update subscription (change plan)
   */
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      // Update the subscription with new price
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId,
        }],
        proration_behavior: 'create_prorations',
      });

      return { success: true, subscription: updatedSubscription };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a payment intent for one-time payments
   */
  async createPaymentIntent(amount, currency = 'usd', customerId = null) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return { success: true, paymentIntent };
    } catch (error) {
      console.error('Error creating payment intent:', error);
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
        type: 'card',
      });

      return { success: true, paymentMethods: paymentMethods.data };
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Attach payment method to customer
   */
  async attachPaymentMethod(paymentMethodId, customerId) {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      return { success: true, paymentMethod };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a refund
   */
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason,
      });

      return { success: true, refund };
    } catch (error) {
      console.error('Error creating refund:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId) {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);
      return { success: true, invoice };
    } catch (error) {
      console.error('Error retrieving invoice:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get customer's invoices
   */
  async getCustomerInvoices(customerId, limit = 10) {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });

      return { success: true, invoices: invoices.data };
    } catch (error) {
      console.error('Error retrieving customer invoices:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create usage record for metered billing
   */
  async createUsageRecord(subscriptionItemId, quantity, timestamp = Math.floor(Date.now() / 1000)) {
    try {
      const usageRecord = await this.stripe.subscriptionItems.createUsageRecord(
        subscriptionItemId,
        {
          quantity,
          timestamp,
          action: 'increment',
        }
      );

      return { success: true, usageRecord };
    } catch (error) {
      console.error('Error creating usage record:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get subscription usage
   */
  async getSubscriptionUsage(subscriptionItemId) {
    try {
      const usageRecords = await this.stripe.subscriptionItems.listUsageRecordSummaries(
        subscriptionItemId
      );

      return { success: true, usageRecords: usageRecords.data };
    } catch (error) {
      console.error('Error retrieving subscription usage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(event.data.object);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error handling webhook:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle subscription created event
   */
  async handleSubscriptionCreated(subscription) {
    try {
      // Update user subscription status in database
      const { error } = await supabase
        .from('users')
        .update({
          subscription_id: subscription.id,
          subscription_status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        })
        .eq('stripe_customer_id', subscription.customer);

      if (error) {
        console.error('Error updating user subscription:', error);
      }

      console.log(`Subscription created for customer: ${subscription.customer}`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
    }
  }

  /**
   * Handle subscription updated event
   */
  async handleSubscriptionUpdated(subscription) {
    try {
      // Update user subscription status in database
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        })
        .eq('subscription_id', subscription.id);

      if (error) {
        console.error('Error updating user subscription:', error);
      }

      console.log(`Subscription updated for: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
    }
  }

  /**
   * Handle subscription deleted event
   */
  async handleSubscriptionDeleted(subscription) {
    try {
      // Update user subscription status in database
      const { error } = await supabase
        .from('users')
        .update({
          subscription_status: 'canceled',
          subscription_id: null,
        })
        .eq('subscription_id', subscription.id);

      if (error) {
        console.error('Error updating user subscription:', error);
      }

      console.log(`Subscription canceled for: ${subscription.id}`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
    }
  }

  /**
   * Handle payment succeeded event
   */
  async handlePaymentSucceeded(invoice) {
    try {
      console.log(`Payment succeeded for invoice: ${invoice.id}`);
      // Add any additional logic for successful payments
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
    }
  }

  /**
   * Handle payment failed event
   */
  async handlePaymentFailed(invoice) {
    try {
      console.log(`Payment failed for invoice: ${invoice.id}`);
      // Add logic for failed payments (send emails, update status, etc.)
    } catch (error) {
      console.error('Error handling payment failed:', error);
    }
  }

  /**
   * Handle trial will end event
   */
  async handleTrialWillEnd(subscription) {
    try {
      console.log(`Trial ending soon for subscription: ${subscription.id}`);
      // Send notification to user about trial ending
    } catch (error) {
      console.error('Error handling trial will end:', error);
    }
  }

  /**
   * Get pricing plans
   */
  async getPricingPlans() {
    try {
      const prices = await this.stripe.prices.list({
        active: true,
        expand: ['data.product'],
      });

      return { success: true, prices: prices.data };
    } catch (error) {
      console.error('Error retrieving pricing plans:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        subscription_data: {
          trial_period_days: 14,
        },
      });

      return { success: true, session };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create portal session for customer
   */
  async createPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { success: true, session };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new PaymentService();
