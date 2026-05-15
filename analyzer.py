import requests
import math
import time
import schedule
import logging
import json
import os
from datetime import datetime, timedelta

# --- Configuration & Secrets ---
API_KEY = os.getenv("FOOTBALL_API_KEY", "YOUR_RAPIDAPI_KEY")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "YOUR_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "YOUR_CHAT_ID")

# Advanced Settings
STATS_FILE = "stats.json"
PENDING_FILE = "pending_matches.json"
LEAGUES_FILE = "leagues_config.json"

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Default Leagues (Can be toggled via Dashboard)
DEFAULT_LEAGUES = [
    {"id": 39, "name": "Premier League", "active": True},
    {"id": 140, "name": "La Liga", "active": True},
    {"id": 135, "name": "Serie A", "active": True},
    {"id": 78, "name": "Bundesliga", "active": True},
    {"id": 61, "name": "Ligue 1", "active": True},
    {"id": 307, "name": "Saudi Pro League", "active": True},
    {"id": 233, "name": "Egypt Premier League", "active": True},
    {"id": 2, "name": "UEFA Champions League", "active": True}
]

class GlobalBettingAI:
    def __init__(self):
        self.headers = {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
        }
        self.base_url = "https://api-football-v1.p.rapidapi.com/v3"
        self._init_files()

    def _init_files(self):
        if not os.path.exists(STATS_FILE):
            with open(STATS_FILE, 'w') as f:
                json.dump({"wins": 0, "losses": 0, "history": []}, f)
        
        if not os.path.exists(PENDING_FILE):
            with open(PENDING_FILE, 'w') as f:
                json.dump([], f)
        
        if not os.path.exists(LEAGUES_FILE):
            with open(LEAGUES_FILE, 'w') as f:
                json.dump(DEFAULT_LEAGUES, f)

    def get_active_leagues(self):
        try:
            with open(LEAGUES_FILE, 'r') as f:
                return [l for l in json.load(f) if l['active']]
        except:
            return DEFAULT_LEAGUES

    def poisson_prob(self, k, lamb):
        return (math.exp(-lamb) * (lamb**k)) / math.factorial(k)

    def analyze_match(self, home_stats, away_stats, h2h_stats):
        """Advanced Poisson + Historical Weighted Analysis"""
        try:
            h_att = float(home_stats['goals']['for']['average']['home'])
            h_def = float(home_stats['goals']['against']['average']['home'])
            a_att = float(away_stats['goals']['for']['average']['away'])
            a_def = float(away_stats['goals']['against']['average']['away'])
            
            # Expected Goals
            exp_h = (h_att + a_def) / 2
            exp_a = (a_att + h_def) / 2
            
            # Probability Matrices
            results = {"h": 0, "a": 0, "d": 0, "over25": 0, "btts": 0}
            for i in range(6):
                for j in range(6):
                    p = self.poisson_prob(i, exp_h) * self.poisson_prob(j, exp_a)
                    if i > j: results["h"] += p
                    elif j > i: results["a"] += p
                    else: results["d"] += p
                    
                    if (i + j) > 2.5: results["over25"] += p
                    if i > 0 and j > 0: results["btts"] += p
            
            # Normalization
            total = results["h"] + results["a"] + results["d"]
            for k in results: results[k] = round((results[k] / total) * 100, 2)
            
            return results
        except Exception as e:
            logging.error(f"Analysis error: {e}")
            return None

    def send_telegram(self, msg):
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        requests.post(url, json={"chat_id": CHAT_ID, "text": msg, "parse_mode": "Markdown"})

    def fetch_and_predict(self):
        leagues = self.get_active_leagues()
        now = datetime.now()
        target_date = (now + timedelta(days=1)).strftime('%Y-%m-%d')
        
        all_pending = []
        try:
            with open(PENDING_FILE, 'r') as f: all_pending = json.load(f)
        except: pass

        for league in leagues:
            logging.info(f"Analyzing League: {league['name']}")
            url = f"{self.base_url}/fixtures"
            params = {"league": league['id'], "season": 2025, "date": target_date}
            
            res = requests.get(url, headers=self.headers, params=params).json()
            fixtures = res.get('response', [])
            
            for f in fixtures[:5]: # Limit per league to save API calls
                f_id = f['fixture']['id']
                home = f['teams']['home']
                away = f['teams']['away']
                
                # Get Stats
                h_stats = requests.get(f"{self.base_url}/teams/statistics", headers=self.headers, params={"league": league['id'], "season": 2025, "team": home['id']}).json().get('response')
                a_stats = requests.get(f"{self.base_url}/teams/statistics", headers=self.headers, params={"league": league['id'], "season": 2025, "team": away['id']}).json().get('response')
                
                if h_stats and a_stats:
                    pred = self.analyze_match(h_stats, a_stats, None)
                    if not pred: continue
                    
                    # Selection Logic
                    best_bet, conf = "N/A", 0
                    if pred['h'] > 65: best_bet, conf = f"Home Win ({home['name']})", pred['h']
                    elif pred['a'] > 65: best_bet, conf = f"Away Win ({away['name']})", pred['a']
                    elif pred['over25'] > 70: best_bet, conf = "Over 2.5 Goals", pred['over25']
                    
                    if conf > 60:
                        msg = f"🏆 *{league['name']}*\n⚽ {home['name']} vs {away['name']}\n\n"
                        msg += f"📊 Poisson Probabilities:\n- Home: {pred['h']}%\n- Away: {pred['a']}%\n- Over 2.5: {pred['over25']}%\n\n"
                        msg += f"💡 *BEST BET:* {best_bet}\n🎯 Confidence: {conf}%"
                        
                        self.send_telegram(msg)
                        
                        # Store for result tracking
                        all_pending.append({
                            "id": f_id,
                            "match": f"{home['name']} vs {away['name']}",
                            "bet": best_bet,
                            "type": "h" if "Home" in best_bet else "a" if "Away" in best_bet else "over25",
                            "status": "pending"
                        })
                        time.sleep(1)

        with open(PENDING_FILE, 'w') as f:
            json.dump(all_pending, f)

    def check_results(self):
        """Check pending matches and update stats"""
        try:
            with open(PENDING_FILE, 'r') as f: pending = json.load(f)
        except: return

        if not pending: return

        updated_pending = []
        with open(STATS_FILE, 'r') as f: stats = json.load(f)

        for p in pending:
            res = requests.get(f"{self.base_url}/fixtures", headers=self.headers, params={"id": p['id']}).json()
            match_data = res.get('response', [])[0]
            status = match_data['fixture']['status']['short']
            
            if status == 'FT':
                goals_h = match_data['goals']['home']
                goals_a = match_data['goals']['away']
                win = False
                
                if p['type'] == 'h' and goals_h > goals_a: win = True
                elif p['type'] == 'a' and goals_a > goals_h: win = True
                elif p['type'] == 'over25' and (goals_h + goals_a) > 2.5: win = True
                
                result_text = "✅ WIN" if win else "❌ LOSS"
                if win: stats['wins'] += 1
                else: stats['losses'] += 1
                
                stats['history'].append({"match": p['match'], "bet": p['bet'], "result": "win" if win else "loss", "score": f"{goals_h}-{goals_a}"})
                
                self.send_telegram(f"📢 *Match Result Update*\n\n⚽ {p['match']}\n🎯 Bet: {p['bet']}\n🏁 Score: {goals_h}-{goals_a}\n\n{result_text}")
            else:
                updated_pending.append(p)

        with open(PENDING_FILE, 'w') as f: json.dump(updated_pending, f)
        with open(STATS_FILE, 'w') as f: json.dump(stats, f)

def run_scheduler():
    ai = GlobalBettingAI()
    
    # Jobs
    schedule.every(12).hours.do(ai.fetch_and_predict)
    schedule.every(1).hours.do(ai.check_results)
    
    # Run immediately on start
    ai.fetch_and_predict()
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    run_scheduler()
