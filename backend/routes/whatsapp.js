const express = require('express');
const router = express.Router();

// WhatsApp webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.status(403).send('Forbidden');
  }
});

// WhatsApp webhook for receiving messages
router.post('/webhook', (req, res) => {
  // TODO: Implement WhatsApp message handling
  res.status(200).send('OK');
});

module.exports = router;
