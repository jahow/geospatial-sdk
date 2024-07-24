import Map from "ol/Map";
import { MapContextDiff } from "@geospatial-sdk/core";
import { createLayer } from "./create-map";

/**
 * Apply a context diff to an OpenLayers map
 * @param map
 * @param contextDiff
 */
export async function applyContextDiffToMap(
    map: Map,
    contextDiff: MapContextDiff,
): Promise<Map> {
  const layers = map.getLayers();

  // removed layers (sorted by descending position)
  if (contextDiff.layersRemoved.length > 0) {
    const removed = contextDiff.layersRemoved.sort(
        (a, b) => b.position - a.position,
    );
    for (const layerRemoved of removed) {
      layers.item(layerRemoved.position).dispose();
      layers.removeAt(layerRemoved.position);
    }
  }

  // insert added layers
  const newLayers = await Promise.all(
      contextDiff.layersAdded.map((layerAdded) => createLayer(layerAdded.layer))
  );

  newLayers.forEach((layer, index) => {
    const position = contextDiff.layersAdded[index].position;
    if (position >= layers.getLength()) {
      layers.push(layer);
    } else {
      layers.insertAt(position, layer);
    }
  });

  // move reordered layers (sorted by ascending new position)
  if (contextDiff.layersReordered.length > 0) {
    const reordered = contextDiff.layersReordered.sort(
        (a, b) => a.newPosition - b.newPosition,
    );
    const olLayers = reordered.map((layer) =>
        layers.item(layer.previousPosition),
    );
    const layersArray = layers.getArray();
    for (let i = 0; i < reordered.length; i++) {
      layersArray[reordered[i].newPosition] = olLayers[i];
    }
    map.setLayers([...layersArray]);
  }

  // recreate changed layers
  for (const layerChanged of contextDiff.layersChanged) {
    layers.item(layerChanged.position).dispose();
    createLayer(layerChanged.layer).then(layer => {
      layers.setAt(layerChanged.position, layer);
    });
  }
  return map;
}
