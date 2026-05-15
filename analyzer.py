import requests
import math
import time
import schedule
import logging
from datetime import datetime, timedelta

# --- الإعدادات (Settings) ---
# ضع مفاتيحك هنا أو استخدم متغيرات البيئة
API_KEY = "YOUR_RAPIDAPI_KEY"  # جلب من https://rapidapi.com/api-sports/api/api-football
TELEGRAM_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN" # جلب من @BotFather
CHAT_ID = "YOUR_CHAT_ID"  # معرف القناة أو القروب

# إعداد الـ Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class BettingAnalyzer:
    def __init__(self):
        self.base_url = "https://api-football-v1.p.rapidapi.com/v3"
        self.headers = {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
        }

    def get_upcoming_matches(self, league_id=39, season=2023):
        """جلب المباريات القادمة (افتراضياً الدوري الإنجليزي)"""
        url = f"{self.base_url}/fixtures"
        next_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        querystring = {"league": league_id, "season": season, "date": next_date}
        
        try:
            response = requests.get(url, headers=self.headers, params=querystring)
            return response.json().get('response', [])
        except Exception as e:
            logging.error(f"Error fetching matches: {e}")
            return []

    def get_team_stats(self, team_id, league_id, season):
        """جلب إحصائيات الفريق لآخر المباريات"""
        url = f"{self.base_url}/teams/statistics"
        querystring = {"league": league_id, "season": season, "team": team_id}
        
        try:
            response = requests.get(url, headers=self.headers, params=querystring)
            return response.json().get('response', {})
        except Exception as e:
            logging.error(f"Error fetching team stats: {e}")
            return None

    def poisson_probability(self, actual, expected):
        """حساب توزيع بواسون"""
        return (math.exp(-expected) * (expected**actual)) / math.factorial(actual)

    def predict_match(self, home_stats, away_stats):
        """تحليل المباراة باستخدام توزيع بواسون"""
        # استخراج متوسط الأهداف المسجلة والمستقبلة
        home_attack = home_stats['goals']['for']['average']['home']
        home_defense = home_stats['goals']['against']['average']['home']
        away_attack = away_stats['goals']['for']['average']['away']
        away_defense = away_stats['goals']['against']['average']['away']

        # حساب الأهداف المتوقعة (بتبسيط: متوسط القوة)
        # ملاحظة: في النسخة الاحترافية نستخدم متوسط الدوري أيضاً
        expected_home = float(home_attack) * float(away_defense) / 1.5 # 1.5 هو متوسط تقريبي
        expected_away = float(away_attack) * float(home_defense) / 1.5

        # حساب احتمالات النتائج (0-5 أهداف)
        prob_home_win = 0
        prob_away_win = 0
        prob_draw = 0
        prob_over_2_5 = 0
        prob_btts = 0

        for h in range(6):
            for a in range(6):
                p = self.poisson_probability(h, expected_home) * self.poisson_probability(a, expected_away)
                if h > a: prob_home_win += p
                elif a > h: prob_away_win += p
                else: prob_draw += p
                
                if (h + a) > 2.5: prob_over_2_5 += p
                if h > 0 and a > 0: prob_btts += p

        return {
            "home_win": round(prob_home_win * 100, 2),
            "away_win": round(prob_away_win * 100, 2),
            "draw": round(prob_draw * 100, 2),
            "over_2_5": round(prob_over_2_5 * 100, 2),
            "btts": round(prob_btts * 100, 2),
            "exp_home": round(expected_home, 2),
            "exp_away": round(expected_away, 2)
        }

    def send_telegram_message(self, message):
        """إرسال الرسالة إلى تليجرام"""
        url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
        payload = {
            "chat_id": CHAT_ID,
            "text": message,
            "parse_mode": "Markdown"
        }
        try:
            requests.post(url, data=payload)
        except Exception as e:
            logging.error(f"Error sending Telegram message: {e}")

    def run_analysis(self):
        logging.info("Starting analysis cycle...")
        matches = self.get_upcoming_matches()
        
        for match in matches:
            home_team = match['teams']['home']
            away_team = match['teams']['away']
            league = match['league']
            fixture_id = match['fixture']['id']

            logging.info(f"Analyzing: {home_team['name']} vs {away_team['name']}")

            home_stats = self.get_team_stats(home_team['id'], league['id'], league['season'])
            away_stats = self.get_team_stats(away_team['id'], league['id'], league['season'])

            if home_stats and away_stats:
                prediction = self.predict_match(home_stats, away_stats)
                
                # بناء الرسالة
                msg = f"⚽ *{home_team['name']} vs {away_team['name']}*\n"
                msg += f"📅 التاريخ: {match['fixture']['date'][:16].replace('T', ' ')}\n"
                msg += f"🏆 الدوري: {league['name']}\n\n"
                
                msg += "📊 *توقعات الإحصائيات (Poisson Analysis):*\n"
                msg += f"🏠 فوز المضيف: {prediction['home_win']}%\n"
                msg += f"🚀 فوز الضيف: {prediction['away_win']}%\n"
                msg += f"🤝 تعادل: {prediction['draw']}%\n"
                msg += f"🔥 Over 2.5: {prediction['over_2_5']}%\n"
                msg += f"🥅 BTTS: {prediction['btts']}%\n\n"
                
                # اختيار التوقع الأفضل (Value Bet Logic)
                best_bet = ""
                confidence = 0
                if prediction['home_win'] > 60:
                    best_bet = f"فوز {home_team['name']}"
                    confidence = prediction['home_win']
                elif prediction['away_win'] > 60:
                    best_bet = f"فوز {away_team['name']}"
                    confidence = prediction['away_win']
                elif prediction['over_2_5'] > 65:
                    best_bet = "أكثر من 2.5 هدف"
                    confidence = prediction['over_2_5']
                elif prediction['btts'] > 65:
                    best_bet = "كلا الفريقين يسجلان (BTTS)"
                    confidence = prediction['btts']
                else:
                    best_bet = "لا يوجد اختيار عالي القيمة"
                    confidence = max(prediction.values())

                msg += f"💡 *التوقع المختار:* {best_bet}\n"
                msg += f"🎯 نسبة الثقة: {confidence}%\n"
                msg += "---------------------------\n"
                msg += "🤖 تم التحليل تلقائياً بواسطة AI Analyzer"

                self.send_telegram_message(msg)
                time.sleep(2) # تجنب كتم الـ API

def job():
    analyzer = BettingAnalyzer()
    analyzer.run_analysis()

# جدولة المهمة كل 12 ساعة
schedule.every(12).hours.do(job)

if __name__ == "__main__":
    logging.info("Bot is starting...")
    # تشغيل المهمة فوراً عند البداية
    job()
    while True:
        schedule.run_pending()
        time.sleep(1)
