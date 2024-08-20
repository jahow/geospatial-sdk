<script setup lang="ts">
import { createMapFromContext } from '@geospatial-sdk/openlayers'
import { onMounted, ref } from 'vue'

import "geopf-extensions-openlayers/css/Classic.css"
import { LayerSwitcher } from 'geopf-extensions-openlayers'

const mapRoot = ref<HTMLElement>()

onMounted(() => {
  createMapFromContext(
    {
      layers: [
        {
          type: 'xyz',
          url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        }
      ],
      view: {
        zoom: 5,
        center: [6, 48.5]
      }
    },
    mapRoot.value
  ).then((map) => {
    console.log(map)
    const layerSwitcher = ref(new LayerSwitcher())
    map.addControl(layerSwitcher.value)
  })
})
</script>

<template>
  <div ref="mapRoot" class="w-full h-full"></div>
</template>
