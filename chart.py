import json
import sys
from flatlib import const
from flatlib.chart import Chart
from flatlib.datetime import Datetime
from flatlib.geopos import GeoPos
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from zoneinfo import ZoneInfo
from datetime import datetime

data = json.loads(sys.argv[1])

# Format date properly for Flatlib
formatted_date = data["date"].replace("-", "/")

# --- Geocode City ---
geolocator = Nominatim(user_agent="vedic_gpt_app")
location = geolocator.geocode(data["location"])

if not location:
    raise ValueError("Could not find location")

lat = location.latitude
lon = location.longitude

# --- Find Timezone ---
tf = TimezoneFinder()
timezone_str = tf.timezone_at(lat=lat, lng=lon)

if not timezone_str:
    raise ValueError("Could not determine timezone")

# --- Convert local time to UTC offset ---
local_dt = datetime.fromisoformat(f"{data['date']}T{data['time']}")
tz = ZoneInfo(timezone_str)
local_dt = local_dt.replace(tzinfo=tz)

utc_offset = local_dt.utcoffset()
hours_offset = int(utc_offset.total_seconds() / 3600)
offset_str = f"{hours_offset:+03d}:00"

# --- Build Chart ---
date = Datetime(formatted_date, data["time"], offset_str)
pos = GeoPos(lat, lon)
chart = Chart(date, pos)

result = {
    "ascendant": chart.get(const.ASC).sign,
    "sun": chart.get(const.SUN).sign,
    "moon": chart.get(const.MOON).sign,
    "mars": chart.get(const.MARS).sign,
    "location_used": location.address,
    "timezone": timezone_str
}

print(json.dumps(result))
