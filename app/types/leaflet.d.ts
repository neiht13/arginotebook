import * as L from 'leaflet';

declare module 'leaflet' {
  interface MarkerClusterGroupOptions {
    iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
  }

  class MarkerClusterGroup extends L.FeatureGroup {
    constructor(options?: MarkerClusterGroupOptions);
    clearLayers(): this;
    getLayers(): L.Layer[];
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
} 