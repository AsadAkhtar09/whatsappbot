const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.use(express.json());

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Generate QR Code for first-time setup
client.on('qr', (qr) => {
  console.log('Scan this QR code with your phone:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp Bot is ready!');
});

// Handle incoming messages
client.on('message', async (msg) => {
  console.log(`Message from ${msg.from}: ${msg.body}`);
  
  // Auto-reply logic here
  if (msg.body.toLowerCase() === 'ping') {
    msg.reply('pong');
  }
});

// API endpoint to send messages
app.post('/send-message', async (req, res) => {
  const { number, message, imageUrl } = req.body;
  
  try {
    const chatId = number.includes('@c.us') ? number : `${number}@c.us`;
    
    if (imageUrl) {
      const media = await MessageMedia.fromUrl(imageUrl);
      await client.sendMessage(chatId, media, { caption: message });
    } else {
      await client.sendMessage(chatId, message);
    }
    
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the client
client.initialize();

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
