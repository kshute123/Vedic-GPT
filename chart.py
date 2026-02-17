import sys
import json
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib import const

try:
    data = json.loads(sys.argv[1])

    formatted_date = data["date"].replace("-", "/")

    lat, lon = map(float, data["location"].split(","))

    date = Datetime(
        formatted_date,
        data["time"],
        data["timezone"]   # <-- DO NOT hardcode UTC
    )

    pos = GeoPos(lat, lon)
    chart = Chart(date, pos)

    result = {
        "sun": chart.get(const.SUN).sign,
        "moon": chart.get(const.MOON).sign,
        "ascendant": chart.get(const.ASC).sign
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
