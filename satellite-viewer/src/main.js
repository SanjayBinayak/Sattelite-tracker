import "./style.css";
import * as Cesium from "cesium";
import * as satellite from "satellite.js";
import { getTlesFromPython } from "./fetcher.js";

window.CESIUM_BASE_URL = "/Cesium";

const viewer = new Cesium.Viewer("cesiumContainer", {
  animation: true,
  timeline: true,
  shouldAnimate: true,
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

viewer.scene.globe.enableLighting = true;

async function trackLiveSatellite() {
  try {
    console.clear();
    console.log("Fetching TLE...");

    viewer.trackedEntity = undefined;
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();

    const tle = await getTlesFromPython();

    console.log("TLE:", tle);

    if (!tle || !tle.line1 || !tle.line2) {
      console.error("Invalid TLE received.");
      return;
    }

    const { name, line1, line2 } = tle;

    const satrec = satellite.twoline2satrec(line1, line2);

    const positionProperty = new Cesium.CallbackProperty((time) => {
      const date = Cesium.JulianDate.toDate(time);

      const pv = satellite.propagate(satrec, date);

      if (!pv.position) return undefined;

      // Greenwich Mean Sidereal Time
      const gmst = satellite.gstime(date);

      // Convert ECI -> Geodetic
      const geodetic = satellite.eciToGeodetic(
        pv.position,
        gmst
      );

      const longitude = Cesium.Math.toDegrees(
        geodetic.longitude
      );

      const latitude = Cesium.Math.toDegrees(
        geodetic.latitude
      );

      const height = geodetic.height * 1000;

      return Cesium.Cartesian3.fromDegrees(
        longitude,
        latitude,
        height
      );
    }, false);

    const entity = viewer.entities.add({
      id: "liveSatellite",

      name,

      position: positionProperty,

      point: {
        pixelSize: 12,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },

      label: {
        text: name,
        showBackground: true,
        font: "16px sans-serif",
        pixelOffset: new Cesium.Cartesian2(0, -25),
      },
    });

    await viewer.flyTo(entity);

    viewer.trackedEntity = entity;

    console.log("Satellite created.");

  } catch (err) {
    console.error(err);
  }
}

async function loadCZML(file) {
  viewer.trackedEntity = undefined;
  viewer.entities.removeAll();
  viewer.dataSources.removeAll();

  const ds = await Cesium.CzmlDataSource.load(file);

  viewer.dataSources.add(ds);

  viewer.flyTo(ds);
}

document
  .getElementById("satellites")
  .addEventListener("click", trackLiveSatellite);

document
  .getElementById("vehicle")
  .addEventListener("click", () => {
    loadCZML("/czml/Vehicle.czml");
  });

document
  .getElementById("clear")
  .addEventListener("click", () => {
    viewer.trackedEntity = undefined;
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();
  });