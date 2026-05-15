import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; // need to install this or use global fetch if node18+

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/send-test', async (req, res) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN' || chatId === 'YOUR_CHAT_ID') {
      return res.status(400).json({ 
        success: false, 
        message: 'من فضلك قم بضبط TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID في الإعدادات أولاً.' 
      });
    }

    const message = "🚀 *رسالة تجريبية من محلل المراهنات*\n\nإذا كنت ترى هذه الرسالة، فهذا يعني أن الربط مع تليجرام يعمل بنجاح! ✅";

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();
      if (data.ok) {
        res.json({ success: true, message: 'تم إرسال الرسالة التجريبية بنجاح!' });
      } else {
        res.status(500).json({ success: false, message: data.description || 'فشل إرسال الرسالة.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'حدث خطأ أثناء الاتصال بتليجرام.' });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
