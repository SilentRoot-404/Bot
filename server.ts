import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';

dotenv.config();

const STATS_FILE = 'stats.json';
const LEAGUES_FILE = 'leagues_config.json';
const LOG_FILE = 'app.log';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/stats', (req, res) => {
    try {
      if (fs.existsSync(STATS_FILE)) {
        const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
        res.json(stats);
      } else {
        res.json({ wins: 0, losses: 0, history: [] });
      }
    } catch (e) {
      res.status(500).json({ error: 'Error reading stats' });
    }
  });

  app.get('/api/leagues', (req, res) => {
    try {
      if (fs.existsSync(LEAGUES_FILE)) {
        const leagues = JSON.parse(fs.readFileSync(LEAGUES_FILE, 'utf8'));
        res.json(leagues);
      } else {
        res.json([]);
      }
    } catch (e) {
      res.status(500).json({ error: 'Error reading leagues' });
    }
  });

  app.post('/api/leagues/toggle', (req, res) => {
    const { id } = req.body;
    try {
      if (fs.existsSync(LEAGUES_FILE)) {
        let leagues = JSON.parse(fs.readFileSync(LEAGUES_FILE, 'utf8'));
        leagues = leagues.map((l: any) => l.id === id ? { ...l, active: !l.active } : l);
        fs.writeFileSync(LEAGUES_FILE, JSON.stringify(leagues, null, 2));
        res.json({ success: true, leagues });
      } else {
        res.status(404).json({ error: 'Leagues file not found' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Error updating league' });
    }
  });

  app.post('/api/trigger', (req, res) => {
    // Start the python script if not already running, or just run one cycle
    exec('python3 analyzer.py &', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({ success: false, error: error.message });
      }
      res.json({ success: true, message: 'Analysis cycle triggered in background' });
    });
  });

  app.get('/api/logs', (req, res) => {
    try {
      if (fs.existsSync(LOG_FILE)) {
        const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').slice(-50);
        res.json(logs);
      } else {
        res.json(["No logs available yet."]);
      }
    } catch (e) {
      res.json(["Error reading logs."]);
    }
  });

  app.post('/api/send-test', async (req, res) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN' || chatId === 'YOUR_CHAT_ID') {
      return res.status(400).json({ 
        success: false, 
        message: 'من فضلك قم بضبط TELEGRAM_BOT_TOKEN و TELEGRAM_CHAT_ID في الإعدادات أولاً.' 
      });
    }

    const message = "🚀 *Betting AI System Control*\n\nTest message successful. System is online.";

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

      const data: any = await response.json();
      if (data.ok) {
        res.json({ success: true, message: 'Test message sent successfully!' });
      } else {
        res.status(500).json({ success: false, message: data.description || 'Failed to send message.' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Connection error with Telegram.' });
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
