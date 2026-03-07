You are a senior quantitative engineer and fullstack developer.

Build a realtime Vietnamese stock trading tracker designed for T0 trading signals.

Stack:

Frontend

- Vue 3
- Vite
- Primevue
- ECharts

Backend

- Node.js
- Nestjs

Storage

- In-memory + optional Postgres

System must process realtime stock trades and detect smart money signals.

---

SYSTEM GOAL

Track all matched trades of selected stocks during trading session:

09:00 → 14:45

Poll data every 1 second from API.

Store trades and analyze them to detect unusual trading activity.

Send alerts to Telegram.

---

API SOURCE

GET

https://iboard-query.ssi.com.vn/le-table/stock/{symbol}

Example response:

{
"stockSymbol": "ACB",
"price": 23300,
"vol": 200000,
"val": 4660000000,
"accumulatedVol": 11699100,
"priceChange": -250,
"priceChangePercent": -1.06,
"side": "sd",
"time": "14:45:00"
}

---

DATA MODEL

Trade

{
symbol
price
volume
value
accumulatedVolume
priceChange
priceChangePercent
side
time
timestamp
}

Deduplicate trades using:

symbol + time + price + volume

---

BACKEND MODULES

services

pollingService.ts
tradeStore.ts
detectorService.ts
telegramService.ts

detectors

largeTrade.ts
volumeSpike.ts
buyPressure.ts
breakout.ts
absorption.ts
iceberg.ts

---

DETECTION ALGORITHMS

1️⃣ Large Trade

volume > 100000
OR
value > 3B

---

2️⃣ Volume Spike

avgVolume = average volume of last 30 trades

If:

currentVolume > avgVolume \* 5

---

3️⃣ Money Flow Burst

sum value of last 5 trades

If:

sum > 10B

---

4️⃣ Buy Pressure

buyVolume / sellVolume

in last 30 trades

If ratio > 2

---

5️⃣ Breakout

highest price last 5 minutes

If

price > highestPrice
AND
volume > avgVolume \* 3

---

6️⃣ Absorption

large sell volume appears

BUT

price drop < 0.1%

---

7️⃣ Iceberg Order Detection

Many trades with same price
small volume
high frequency

Example

10 trades
same price
within 5 seconds

---

ALERT SYSTEM

Send Telegram alerts.

Format:

🚨 SMART MONEY ALERT

Symbol: ACB

Signal: BREAKOUT

Price: 23300
Volume: 200000
Value: 4.66B

Time: 14:45:00

Cooldown:

30 seconds per signal.

---

FRONTEND PAGES

Sidebar layout.

Pages:

Dashboard
Stock Tracker
Settings

---

STOCK TRACKER PAGE

Features:

Input stock symbols
Start tracking
Stop tracking

Display:

Live trades table

Columns

Time
Price
Volume
Value
Change %

---

CHARTS

Use ECharts.

Charts required:

1️⃣ Price vs Time

Line chart.

2️⃣ Volume vs Time

Bar chart.

3️⃣ Money Flow

Bar chart using trade value.

4️⃣ Buy vs Sell Volume

Stacked chart.

---

INDICATOR PANEL

Display realtime signals:

Large Trade
Volume Spike
Buy Pressure
Money Flow Burst
Breakout
Absorption

Green = active
Gray = inactive

---

PERFORMANCE

Use in-memory queue.

Keep only last:

10,000 trades per symbol.

---

EXPORT

At end of trading session

export all trades to:

JSON file

---

PROJECT STRUCTURE

backend

server.ts

services
pollingService.ts
detectorService.ts
tradeStore.ts
telegramService.ts

detectors
largeTrade.ts
volumeSpike.ts
breakout.ts
buyPressure.ts
absorption.ts
iceberg.ts

frontend

src

components
Sidebar.vue
TradeTable.vue
StockChart.vue
SignalPanel.vue

pages
Dashboard.vue
StockTracker.vue
Settings.vue

---

Write clean modular code.

Use async polling every 1 second.

Ensure duplicate trades are ignored.

System must support tracking multiple stocks at same time.
