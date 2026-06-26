from spacetrack import SpaceTrackClient

# Initialize the client with your Space-Track credentials
st = SpaceTrackClient(identity="binayaksanjay421@gmail.com", password="SRB3bXhU!tK8Y*g")

# Fetch the latest TLE for the ISS (NORAD ID: 25544)
# The "gp" (General Perturbations) method retrieves the latest active element sets
tle_data = st.gp(norad_cat_id=25544, format="tle")

import sys

# Simply print the raw TLE text data to stdout at the end of your script
print(tle_data)
sys.exit(0)