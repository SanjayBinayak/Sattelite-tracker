import "./style.css";
import * as Cesium from "cesium";
import * as satellite from "satellite.js";
import { getTlesFromPython, getTleByNorad } from "./fetcher.js";

window.CESIUM_BASE_URL = "/Cesium";

const viewer = new Cesium.Viewer("cesiumContainer", {
  animation: true,
  timeline: true,
  shouldAnimate: true,
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

viewer.scene.globe.enableLighting = true;

function addSatelliteEntity(sat) {
  if (!sat.line1 || !sat.line2) return null;

  const satrec = satellite.twoline2satrec(sat.line1, sat.line2);
  const norad = sat.line1.substring(2, 7).trim();

  const positionProperty = new Cesium.CallbackProperty((time) => {
    const date = Cesium.JulianDate.toDate(time);
    const pv = satellite.propagate(satrec, date);
    if (!pv.position) return undefined;

    const gmst = satellite.gstime(date);
    const geo = satellite.eciToGeodetic(pv.position, gmst);

    return Cesium.Cartesian3.fromDegrees(
      Cesium.Math.toDegrees(geo.longitude),
      Cesium.Math.toDegrees(geo.latitude),
      geo.height * 1000
    );
  }, false);

  return viewer.entities.add({
    id: norad,
    name: sat.name,
    position: positionProperty,
    point: {
      pixelSize: 10,
      color: Cesium.Color.RED,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 2,
    },
    label: {
      text: sat.name,
      font: "14px sans-serif",
      showBackground: true,
      pixelOffset: new Cesium.Cartesian2(0, -20),
    },
  });
}

async function trackLiveSatellite() {
  try {
    console.clear();
    console.log("Fetching TLEs...");

    viewer.trackedEntity = undefined;
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();

    const satellites = await getTlesFromPython();

    console.log("Received:", satellites);

    if (!satellites || satellites.length === 0) {
      console.error("No satellites received.");
      return;
    }

    let firstEntity = null;

    for (const sat of satellites) {
      const entity = addSatelliteEntity(sat);
      if (entity && !firstEntity) {
        firstEntity = entity;
      }
    }

    if (firstEntity) {
      await viewer.flyTo(viewer.entities);
      viewer.trackedEntity = firstEntity;
    }

    console.log(`${viewer.entities.values.length} satellites loaded.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

async function trackSatelliteByNorad(noradId) {
  try {
    viewer.trackedEntity = undefined;
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();

    const satellites = await getTleByNorad(noradId);

    if (!satellites || satellites.length === 0) {
      console.error(`No satellite found for NORAD ID ${noradId}`);
      return;
    }

    const entity = addSatelliteEntity(satellites[0]);

    if (entity) {
      await viewer.flyTo(viewer.entities);
      viewer.trackedEntity = entity;
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

async function loadCZML(file) {
  try {
    viewer.trackedEntity = undefined;
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();

    const ds = await Cesium.CzmlDataSource.load(file);

    viewer.dataSources.add(ds);

    await viewer.flyTo(ds);
  } catch (err) {
    console.error(err);
  }
}


document
  .getElementById("satellites")
  .addEventListener("click", trackLiveSatellite);

document
  .getElementById("trackNorad")
  .addEventListener("click", () => {
    const input = document.getElementById("noradInput");
    const noradId = input.value.trim();
    if (!noradId) return;
    trackSatelliteByNorad(noradId);
  });

document
  .getElementById("noradInput")
  .addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      document.getElementById("trackNorad").click();
    }
  });

document
  .getElementById("clear")
  .addEventListener("click", () => {
    viewer.trackedEntity = undefined;
    viewer.entities.removeAll();
    viewer.dataSources.removeAll();
  });