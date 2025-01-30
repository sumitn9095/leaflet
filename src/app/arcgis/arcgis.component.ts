// ArcGIS - WebMap 

import { AfterViewInit, Component,CUSTOM_ELEMENTS_SCHEMA, ViewChild,ElementRef} from '@angular/core';
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-zoom";
import "@arcgis/map-components/dist/components/arcgis-search";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-legend";
import { ArcgisMapCustomEvent} from '@arcgis/map-components/dist/types/components';
import { setAssetPath as setCalciteComponentsAssetPath } from '@esri/calcite-components/dist/components';

import WebMap from '@arcgis/core/WebMap';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

@Component({
  selector: 'app-arcgis',
  templateUrl: './arcgis.component.html',
  standalone:true,
  styleUrls: ['./arcgis.component.scss'],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ArcgisComponent implements AfterViewInit {
  initLatLng:number[]=[-73.79144999999875, 40.703683118287934];

   map!: Map;
   webMap!:WebMap;
  view!: MapView;

  // @ViewChild('calciteNavigationLogo') calciteNavigationLogo!:ElementRef
  // constructor() {
  //   setCalciteComponentsAssetPath("https://js.arcgis.com/calcite-components/2.13.2/assets");
  // }

   @ViewChild('mapViewDiv', { static: true }) mapViewEl!: ElementRef;

  // arcgisViewChange(event: ArcgisMapCustomEvent<any>) {
  //    //console.log("arcGIS event: ", event);
  //     const { center, zoom } = event?.target;
  //     console.log("Center (lon/lat): ", `${center?.longitude}, ${center?.latitude}`);
  //     console.log("Zoom: ", zoom);

  //     const { portalItem } = event?.target?.map;
  //         const navigationLogo = this.calciteNavigationLogo.nativeElement;
  //         navigationLogo.heading = portalItem?.title;
  //         navigationLogo.description = portalItem?.snippet;
  //         navigationLogo.thumbnail = portalItem?.thumbnailUrl;
  //         navigationLogo.href = portalItem?.itemPageUrl;
  //         navigationLogo.label = "Thumbnail of map";
  // }

ngAfterViewInit(): void {
  this.webMap = new WebMap({
    portalItem: {
    id: "05e015c5f0314db9a487a9b46cb37eca",
    //portal: "https://www.arcgis.com"               // Default: The ArcGIS Online Portal
  }
  });
  this.view = new MapView({
      container: this.mapViewEl.nativeElement,
      map: this.webMap,
      center: this.initLatLng, // Dynamic Center (Delhi, India)
      zoom: 10
    });
  }

//   // Attach Event Listener for View Change
//     this.view.when(() => {
//         console.log('WebMap Loaded Successfully!');

//         // Watch for changes in the map's extent (view change)
//         this.view.watch('extent', (newExtent) => {
//           console.log('View changed:', newExtent);
//          // this.handleViewChange(newExtent);
//         });

//         // Alternative: Detect zoom level changes
//         this.view.watch('zoom', (newScale) => {
//           console.log('Zoom level changed:', newScale);
//         });
//       });
// }

  // ngAfterViewInit(): void {
  //   const esriLoader = require('esri-loader');
  //   esriLoader.loadModules([
  //     'esri/Map',
  //     'esri/views/MapView',
  //     'esri/layers/GraphicsLayer',
  //     'esri/Graphic'
  //   ])
  //   .then((Map:any, MapView:any, GraphicsLayer:any, Graphic:any)=>{
  //     const map = new Map({
  //       basemap: 'streets-navigation-vector'
  //     });
  //     const mapView = new MapView({
  //       container:'mapViewDiv',
  //       map:map,
  //       center:this.initLatLng,
  //       zoom: 10
  //     })
  //     const point = {
  //       type: 'point',
  //       longitude: this.initLatLng[0],
  //       latitude: this.initLatLng[1],
  //     };
  //     const pointGraphic = new Graphic({
  //       geometry: point,
  //       Symbol: {
  //         type: 'simple-marker',
  //         color:'red',
  //         size:'12px'
  //       }
  //     })
  //     const graphicsLayer = new GraphicsLayer();
  //     graphicsLayer.add(pointGraphic);
  //     map.add(graphicsLayer);
  //   })
  //   .catch((err:Error) => {
  //     console.error('Error loading ArcGIS modules: ', err);
  //   });
  // }
}
