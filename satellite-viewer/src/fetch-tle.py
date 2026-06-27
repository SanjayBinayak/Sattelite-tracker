from spacetrack import SpaceTrackClient
import json
import sys
import os

# Login to Space-Track (credentials read from environment variables)
st = SpaceTrackClient(
    identity=os.environ.get("SPACETRACK_IDENTITY"),
    password=os.environ.get("SPACETRACK_PASSWORD")
)

# If a NORAD ID is passed as a command-line argument, look up just that satellite.
# Otherwise, fall back to the default tracked list.
if len(sys.argv) > 1:
    requested_id = int(sys.argv[1])
    norad_ids = [(requested_id, f"NORAD {requested_id}")]
else:
    norad_ids = [
        (25544, "ISS"),
        (20580, "Hubble Space Telescope"),
        (43013, "NOAA (JPSS-1)"),
        (49260, "LANDSAT"),
        (45206, "Starlink 1209"),
        (4804, "COSMOS 386")
    ]

satellites = []

for norad_id, names in norad_ids:
    try:
        tle = st.gp(norad_cat_id=norad_id, format="tle")

        lines = [
            line.strip()
            for line in tle.splitlines()
            if line.strip()
        ]

        if len(lines) == 2:
            satellites.append({
                "name": names,
                "line1": lines[0],
                "line2": lines[1]
            })

    except Exception as e:
        print(f"Failed to fetch {norad_id}: {e}")


print(json.dumps(satellites))