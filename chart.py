import sys
import json
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from flatlib.chart import Chart
from flatlib import const

try:
    # Get JSON input from Node
    data = json.loads(sys.argv[1])

    # Fix date format (YYYY-MM-DD → YYYY/MM/DD)
    formatted_date = data["date"].replace("-", "/")

    # Parse location
    lat, lon = data["location"].split(",")

    # Create Flatlib objects
    date = Datetime(formatted_date, data["time"], "+00:00")
    pos = GeoPos(lat, lon)
    chart = Chart(date, pos)

    sun = chart.get(const.SUN)
    moon = chart.get(const.MOON)
    asc = chart.get(const.ASC)

    result = {
        "sun": sun.sign,
        "moon": moon.sign,
        "ascendant": asc.sign
    }

    print(json.dumps(result))

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)
