https://restv2.fireant.vn/symbols/SHS/historical-quotes?startDate=2023-02-27&endDate=2026-02-27&offset=0&limit=1

[
{
"date": "2026-02-27T00:00:00",
"symbol": "SHS",
"priceHigh": 19.3,
"priceLow": 18.8,
"priceOpen": 19.0,
"priceAverage": 19.060755920791497,
"priceClose": 18.9,
"priceBasic": 19.0,
"totalVolume": 13604600.0,
"dealVolume": 13604600.0,
"putthroughVolume": 0.0,
"totalValue": 259313960000.0,
"putthroughValue": 0.0,
"buyForeignQuantity": 9100.0,
"buyForeignValue": 173452878.87920263,
"sellForeignQuantity": 887087.0,
"sellForeignValue": 16908548787.507166,
"buyCount": 0.0,
"buyQuantity": 17175500.0,
"sellCount": 0.0,
"sellQuantity": 24945100.0,
"adjRatio": 1.0,
"currentForeignRoom": 392993556.0,
"propTradingNetDealValue": 0.0,
"propTradingNetPTValue": 0.0,
"propTradingNetValue": 0.0,
"unit": 1000.0
}
]

đây là api để lấy các thông tin giao dịch của 1 mã chứng khoán

- nhiệm vụ: tạo frontend để thống kê các thông tin của 1 mã cổ phiếu từ ngày nào tới ngày nào với input là offset
- tạo riêng 1 phần để thống kê giao dịch của khối ngoại với mã cổ phiếu này. khối ngoại còn giữ khối lượng cổ phiếu này là bao nhiêu và vẽ chart điểm mua bán nhiều nhất
- công nghệ sử dụng vuejs, axios, primevue, chartjs
