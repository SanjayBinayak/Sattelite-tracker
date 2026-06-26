import "./style.css";
import * as Cesium from "cesium";

window.CESIUM_BASE_URL = "/Cesium";

const viewer = new Cesium.Viewer("cesiumContainer", {
  animation: true,
  timeline: true,
  shouldAnimate: true,
  terrain: Cesium.Terrain.fromWorldTerrain(),
});

viewer.scene.globe.enableLighting = true;

async function loadCZML(file) {
  try {
    viewer.dataSources.removeAll();

    const dataSource = await Cesium.CzmlDataSource.load(file);

    viewer.dataSources.add(dataSource);

    viewer.flyTo(dataSource);
  } catch (err) {
    console.error(err);
  }
}

document
  .getElementById("satellites")
  .addEventListener("click", () => {
    loadCZML("/czml/simple.czml");
  });

document
  .getElementById("vehicle")
  .addEventListener("click", () => {
    loadCZML("/czml/Vehicle.czml");
  });

document
  .getElementById("clear")
  .addEventListener("click", () => {
    viewer.dataSources.removeAll();
  });