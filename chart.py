import sys
import json
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib import const
import pytz
from datetime import datetime

try:
    data = json.loads(sys.argv[1])

    date_str = data["date"]
    time_str = data["time"]
    lat, lon = map(float, data["location"].split(","))
    timezone_name = data["timezone"]

    # Convert to UTC offset
    tz = pytz.timezone(timezone_name)
    naive_dt = datetime.strptime(
        f"{date_str} {time_str}",
        "%Y-%m-%d %H:%M"
    )
    localized_dt = tz.localize(naive_dt)
    utc_offset = localized_dt.strftime("%z")
    utc_offset = f"{utc_offset[:3]}:{utc_offset[3:]}"

    formatted_date = date_str.replace("-", "/")

    date = Datetime(formatted_date, time_str, utc_offset)
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
