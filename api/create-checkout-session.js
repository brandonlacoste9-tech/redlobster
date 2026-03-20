// api/create-checkout-session.js
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { plan, price, workspace, email } = req.body;

  // Map plans to prices (these should be real Stripe Price IDs in production)
  const priceMapping = {
    'Starter': 2900, // $29.00
    'Pro': 7900,
    'Agency': 19900
  };

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `OpenClaw ${plan} Subscription`,
              description: `Hosted agentic workspace for ${workspace}.openclawcloud.ca`,
            },
            unit_amount: priceMapping[plan] || 2900,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: email,
      success_url: `${req.headers.origin}/wizard.html?session_id={CHECKOUT_SESSION_ID}&workspace=${workspace}&success=true`,
      cancel_url: `${req.headers.origin}/wizard.html?error=cancelled`,
      metadata: {
        workspace,
        email,
        plan
      }
    });

    res.status(200).json({ id: session.id, url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
