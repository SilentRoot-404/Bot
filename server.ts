import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import YahooFinance from 'yahoo-finance2';
const yf = new (YahooFinance as any)();
import { EMA, Stochastic } from 'technicalindicators';

dotenv.config();

const LOG_FILE = path.join(process.cwd(), 'app.log');
const RESULTS_FILE = path.join(process.cwd(), 'trading_results.json');
const CURRENCY_PAIRS = ["AUDUSD=X", "EURUSD=X", "GBPUSD=X", "USDJPY=X", "USDCAD=X", "EURJPY=X"];
let analysisInterval: NodeJS.Timeout | null = null;
const signalsCooldown: Record<string, number> = {};

fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - BOT STARTING...\n`);

async function saveResult(data: any) {
  try {
    let results = [];
    if (fs.existsSync(RESULTS_FILE)) {
      results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
    }
    results.unshift(data);
    results = results.slice(0, 50);
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  } catch (e) {
    console.error('Error saving result:', e);
  }
}

async function sendTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId || token === 'YOUR_TELEGRAM_BOT_TOKEN') return;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

async function analyze() {
  fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - [ENGINE] Cycle start\n`);
  for (const pair of CURRENCY_PAIRS) {
    try {
      const chartResult: any = await yf.chart(pair, { period1: Math.floor(Date.now() / 1000) - 86400, interval: '1m' });
      const data = chartResult.quotes;
      if (!data || data.length < 25) continue;

      const closes = data.filter((d: any) => d.close !== null).map((d: any) => d.close as number);
      const highs = data.filter((d: any) => d.high !== null).map((d: any) => d.high as number);
      const lows = data.filter((d: any) => d.low !== null).map((d: any) => d.low as number);

      const ema9 = EMA.calculate({ period: 9, values: closes });
      const ema21 = EMA.calculate({ period: 21, values: closes });
      
      const stoch = Stochastic.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: 14,
        signalPeriod: 3
      });

      const currEma9 = ema9[ema9.length - 1];
      const currEma21 = ema21[ema21.length - 1];
      const prevEma9 = ema9[ema9.length - 2];
      const prevEma21 = ema21[ema21.length - 2];
      
      const currStoch = stoch[stoch.length - 1];
      const prevStoch = stoch[stoch.length - 2];
      
      let signalType: 'CALL' | 'PUT' | null = null;
      let icon = "";

      if (prevEma9 < prevEma21 && currEma9 > currEma21) {
        if (currStoch.k < 20 && currStoch.k > prevStoch.k) {
          signalType = 'CALL';
          icon = "🔼";
        }
      } else if (prevEma9 > prevEma21 && currEma9 < currEma21) {
        if (currStoch.k > 80 && currStoch.k < prevStoch.k) {
          signalType = 'PUT';
          icon = "🔽";
        }
      }

      if (signalType) {
        const now = Date.now();
        if (signalsCooldown[pair] && (now - signalsCooldown[pair]) < 10 * 60 * 1000) continue;
        
        signalsCooldown[pair] = now;
        const cleanSymbol = pair.replace('=X', '');
        const timeStr = new Date().toLocaleTimeString();
        
        await sendTelegram(`💷 ${cleanSymbol}\n💎 M1\n⌚️ ${timeStr}\n${icon} ${signalType.toLowerCase()}`);
        fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - [SIGNAL] ${cleanSymbol} ${signalType}\n`);
        
        const entryPrice = closes[closes.length - 1];
        const resultData = {
          symbol: cleanSymbol,
          signal: signalType,
          entry_price: entryPrice,
          time: new Date().toISOString(),
          result: 'Pending...'
        };
        await saveResult(resultData);

        setTimeout(async () => {
          try {
            const checkResult: any = await yf.chart(pair, { period1: Math.floor(Date.now() / 1000) - 3600, interval: '1m' });
            const updatedData = checkResult.quotes;
            const lastQuote = updatedData[updatedData.length - 1];
            if (!lastQuote || lastQuote.close === undefined) return;
            const closePrice = lastQuote.close as number;
            let tradeStatus: 'WIN' | 'LOSS' | 'REFUND' = 'REFUND';
            
            if (signalType === 'CALL') {
              tradeStatus = closePrice > entryPrice ? 'WIN' : closePrice < entryPrice ? 'LOSS' : 'REFUND';
            } else {
              tradeStatus = closePrice < entryPrice ? 'WIN' : closePrice > entryPrice ? 'LOSS' : 'REFUND';
            }

            const msg = `<b>${cleanSymbol} Result:</b>\n${tradeStatus === 'WIN' ? '✅ ربحت (WIN)' : tradeStatus === 'LOSS' ? '❌ خسرت (LOSS)' : '⚖️ تعادل (REFUND)'}`;
            await sendTelegram(msg);
            fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - [RESULT] ${cleanSymbol} ${tradeStatus}\n`);

            if (fs.existsSync(RESULTS_FILE)) {
              const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
              const idx = results.findIndex((r: any) => r.time === resultData.time && r.symbol === cleanSymbol);
              if (idx !== -1) {
                results[idx].result = tradeStatus;
                results[idx].close_price = closePrice;
                fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
              }
            }
          } catch (e: any) {
             fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - [ERROR] Tracking result for ${pair}: ${e.message}\n`);
          }
        }, 60000);
      }
    } catch (e: any) {
      fs.appendFileSync(LOG_FILE, `${new Date().toISOString()} - [ERROR] Pair ${pair}: ${e.message}\n`);
    }
  }
}

function startBot() {
  if (analysisInterval) return;
  if (!fs.existsSync(RESULTS_FILE)) fs.writeFileSync(RESULTS_FILE, '[]');
  analyze();
  analysisInterval = setInterval(analyze, 30000);
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/results', (req, res) => {
    if (fs.existsSync(RESULTS_FILE)) {
      res.json(JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8')));
    } else {
      res.json([]);
    }
  });

  app.get('/api/status', (req, res) => res.json({ running: !!analysisInterval }));

  app.post('/api/restart', (req, res) => {
    if (analysisInterval) clearInterval(analysisInterval);
    analysisInterval = null;
    startBot();
    res.json({ success: true });
  });

  app.get('/api/logs', (req, res) => {
    if (fs.existsSync(LOG_FILE)) {
      const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l.trim()).slice(-50);
      res.json(logs);
    } else {
      res.json(["No logs."]);
    }
  });

  startBot();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }

  app.listen(3000, '0.0.0.0', () => console.log('Server running on 3000'));
}

startServer();
