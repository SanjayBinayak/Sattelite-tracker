from spacetrack import SpaceTrackClient
import json
# Login to Space-Track
st = SpaceTrackClient(
    identity="binayaksanjay421@gmail.com",
    password="SRB3bXhU!tK8Y*g"
)

# NORAD IDs you want to track
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