// api/webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { deployToRailway } = require('./utils/provisioner');

// Vercel config to allow raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper: Read raw body from Node stream
async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  const rawBody = await buffer(req);

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error(`[WEBHOOK] Signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payments
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata;

    console.log(`[WEBHOOK] Payment confirmed for ${metadata.email}.`);
    console.log(`[WEBHOOK] Workspace Name: ${metadata.workspace}`);
    console.log(`[WEBHOOK] Deployment Plan: ${metadata.plan}`);

    try {
      const result = await deployToRailway({
        workspace: metadata.workspace,
        email: metadata.email,
        plan: metadata.plan,
        useCase: metadata.useCase || 'default',
        channels: metadata.channels ? metadata.channels.split(',') : []
      });
      console.log(`[WEBHOOK] ✔ SUCCESS: Workspace ${metadata.workspace} provisioned.`);
    } catch (err) {
      console.error(`[WEBHOOK] ✘ PROVISIONING FAILED: ${err.message}`);
      // Return 200 to Stripe anyway to prevent excessive retries, 
      // but you should check the backend logs or have a notification system.
    }
  }

  res.status(200).json({ received: true });
};
