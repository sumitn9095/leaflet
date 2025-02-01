// ArcGIS - WebMap 

import { AfterViewInit, Component,CUSTOM_ELEMENTS_SCHEMA, ViewChild,ElementRef} from '@angular/core';
import {MatButtonModule} from '@angular/material/button'
import {MatSlideToggleModule} from '@angular/material/slide-toggle'
import {MatSliderModule} from '@angular/material/slider';
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-zoom";
import "@arcgis/map-components/dist/components/arcgis-search";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-legend";
import Legend from '@arcgis/core/widgets/Legend';
import { ArcgisMapCustomEvent} from '@arcgis/map-components/dist/types/components';
import { setAssetPath as setCalciteComponentsAssetPath } from '@esri/calcite-components/dist/components';

import WebMap from '@arcgis/core/WebMap';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import ParcelLayer from '@arcgis/core/layers/FeatureLayer';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import Graphic from '@arcgis/core/Graphic';
import Point from "@arcgis/core/geometry/Point";
import Polyline from "@arcgis/core/geometry/Polyline";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import Query from "@arcgis/core/rest/support/Query";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SpinnerComponent } from '../spinner/spinner.component';
import { ArcgisMap } from '@arcgis/map-components/dist/components/arcgis-map';
import { ArcgisComponent } from '../arcgis/arcgis.component';

@Component({
  selector: 'app-arcgis-map-geojson',
  standalone: true,
  imports: [MatSlideToggleModule,MatButtonModule,MatSliderModule, MatSelectModule,MatFormFieldModule,SpinnerComponent],
  templateUrl: './arcgis-map-geojson.component.html',
  styleUrl: './arcgis-map-geojson.component.scss',
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ArcgisMapGeojsonComponent implements AfterViewInit {
 //initLatLng:number[]=[-73.79144999999875, 40.703683118287934];
  initLatLng:number[]=[-82.44109, 35.6122];

  map!: Map;
  webMap!:WebMap;
  view!: MapView;
  graphic!:Graphic
  pointId:number=0;
  featureLayer!:FeatureLayer;
  geoJsonLayer!:GeoJSONLayer;
  landscape_trees_featurelayer_url:string ="https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0";
  enablePlotPoints:boolean=false;
  pointDataAttrs:any[]=[];
  pointDataAttrs_count:number=0;
  layerView:any=[];
  rangeVal:number[]=[0,0];
  isLayerViewQueryWorking:boolean=false;
  india_center:number[]=[78.9629,20.5937]
  conditions:string[]=['Poor','Good','Excellent'];
  private indianStates = 'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/refs/heads/master/Indian_States';

  // private indianStates = 'https://raw.githubusercontent.com/srinathkr07/COVID-19-in-India/refs/heads/master/india-polygon.geojson'
  // @ViewChild('calciteNavigationLogo') calciteNavigationLogo!:ElementRef
  // constructor() {
  //   setCalciteComponentsAssetPath("https://js.arcgis.com/calcite-components/2.13.2/assets");
  // }

  @ViewChild('mapViewDiv', { static: true }) mapViewEl!: ElementRef;
  @ViewChild('spinner',{static: true}) spinner!: ElementRef;
  @ViewChild('calciteNavigationLogo') calciteNavigationLogo!:ElementRef

    // @ViewChild('arcgismap', { static: true }) arcgismap!: HTMLArcgisMapElement;

  // constructor() {
  //   setCalciteComponentsAssetPath("https://js.arcgis.com/calcite-components/2.13.2/assets");
  // }

  // arcgisViewChange(event: ArcgisMapCustomEvent<any>) {
  //    //console.log("arcGIS event: ", event);
  //     const { center, zoom } = event?.target;
  //     console.log("Center (lon/lat): ", `${center?.longitude}, ${center?.latitude}`);
  //     console.log("Zoom: ", zoom);
          
  // }


  

ngAfterViewInit(): void {
   


    // view hitTest
    // this.view.popupEnabled = false;  // Disable the default popup behavior
    // this.view.on("click", function(event) { // Listen for the click event
    //   view.hitTest(event).then(function (hitTestResults){ // Search for features where the user clicked
    //     if(hitTestResults.results) {
    //       view.openPopup({ // open a popup to show some of the results
    //         location: event.mapPoint,
    //         title: "Hit Test Results",
    //         content: hitTestResults.results.length + "Features Found"
    //       });
    //     }
    //   })
    // });


    // ✅ Add Click Event Listener
  

    // Add a popup, with 'Feature Layer Fields' data, when clicked on Feature Layer Fields points.
    const popupTemplate = {
      title: "{NAME_1}", // Use the "name" field from the GeoJSON properties
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "NAME_1", // Field from the GeoJSON properties
              label: "State Name",
            },
            {
              fieldName: "TYPE_1", // Another field from the GeoJSON properties
              label: "State Type",
            },
          ],
        },
      ],
    };

    const fillSymbol = new SimpleFillSymbol({
      color: [241, 99, 52, 0.51],
      outline: {
        color: "black",
        width: 1,
      },
    });

    const renderer = new SimpleRenderer({
      symbol: fillSymbol
    });

    // FeatureLayer - Added
    this.geoJsonLayer = new GeoJSONLayer({
      //url:this.landscape_trees_featurelayer_url,
      url:this.indianStates,
      renderer: renderer,
      popupTemplate: popupTemplate
    }); 

    this.isLayerViewQueryWorking=true;

    // Add error handling for the GeoJSONLayer
      this.geoJsonLayer.watch("loadStatus", (status) => {
        if (status === "failed") {
          console.error("GeoJSONLayer failed to load:", this.geoJsonLayer.loadError);
        }
      });

      this.geoJsonLayer.watch("loaded", (status) => {
        console.log("GeoJSONLayer loaded",status,this.geoJsonLayer);
        this.queryLayerView(`1=1`)
         // Add the Legend widget
        const legend = new Legend({
          view: this.view,
          layerInfos: [{
            layer: this.geoJsonLayer,
            title: 'Indian States'
          }]
        });

        // Add the Legend to the bottom-left corner of the view
        this.view.ui.add(legend, 'bottom-left');
      })
  
    this.geoJsonLayer.when().then(res=>{
      this.geoJsonLayer.on(('refresh'),()=>{
        console.log('geoJsonLayer')
      })
    })

    // Fetch the 'Feature Layer Fields:', to interact with them
    // featureLayer.load().then(() => {
    //   featureLayer.fields.forEach((r:any)=>{
    //     console.log('Feature Layer Fields name:', r?.name);
    //   })
    // });

  // Create an object for storing attributes related to the line
  const lineAtt = {
    Name: "Keystone Pipeline",
    Owner: "TransCanada",
    Length: "3,456 km",
     customPoint: true
  };

  const pointGraphic = new Point({
    x: this.initLatLng[0],
    y: this.initLatLng[1],
    //spatialReference: { wkid: 4326 } // Optional but recommended
  });

  const pointSymbol = new SimpleMarkerSymbol({
    color: "red",
    size: "12px"
  });

  this.map = new Map({
    basemap: 'streets-navigation-vector', // Dynamic Basemap
  });
  this.view = new MapView({
    container: this.mapViewEl.nativeElement,
    map: this.map,
    center: this.india_center, // Dynamic Center (Delhi, India)
    zoom: 0.5
  });

    this.view.when(() => {
      this.view.goTo( 
          { center: this.india_center },
          { duration: 20004 }
        );
        this.view.zoom = 4;
      this.view.on("click", (event) => {
        console.log("mapPoint-event",event);
        this.handleMapClick(event);
      });
    });

  this.map.add(this.geoJsonLayer);


 

//   const polylineGeometry = new Polyline({
//   paths: [
//     [77.1025, 28.7041],  // Point 1 (x, y)
//     [78.4867, 17.3850]   // Point 2
//   ],
//   spatialReference: { wkid: 4326 } // Optional but recommended
// });


// const polygonGeometry = new Polygon({
//   rings: [
//     [77.1025, 28.7041], // Point 1 (x, y)
//     [78.4867, 17.3850], // Point 2
//     [72.8777, 19.0760], // Point 3
//     [77.1025, 28.7041]  // Closing the polygon
//   ],
//   spatialReference: { wkid: 4326 }
// });


  // Graphic - Point -------------------------------------
  // this.graphic = new Graphic({
  // geometry: pointGraphic,
  // symbol: pointSymbol,
  // attributes: lineAtt,
  //   popupTemplate: {
  //     // autocasts as new PopupTemplate()
  //     title: "{Name}",
  //     content: [
  //       {
  //         type: "fields",
  //         fieldInfos: [
  //           {
  //             fieldName: "Name"
  //           },
  //           {
  //             fieldName: "Owner"
  //           },
  //           {
  //             fieldName: "Length"
  //           }
  //         ]
  //       }
  //     ]
  //   }
  // });
  // Add the line graphic to the view's GraphicsLayer
  // this.view.graphics.add(this.graphic);
  //  // ✅ Wait for the layer to load, then query
  //   this.view.whenLayerView(this.featureLayer).then((layerView) => {
  //     console.log("layerView",layerView);
  //     //this.layerView=layerView;
  //     //this.queryLayerView(layerView);
  //   });
  }

  handleMapClick = async(event: any) =>{

  this.pointId++;
 const lineAtt = {
          Name: `Point ${this.pointId}`,
          Owner: "TransCanada",
          Length: "3,456 km",
          customPoint: true,
          Latitude:event.mapPoint.latitude,
          Longitude:event.mapPoint.longitude
        };

  const hitResponse = await this.view.hitTest(event);
console.log("mapPoint",event.mapPoint,event)
    // Check if any feature was clicked
    if (hitResponse.results.length > 0) {
      //const graphic = hitResponse?.results[0]?.graphic; // First clicked feature
      console.log("hitResponse.results : ", hitResponse.results);
       const graphicHit = hitResponse.results.find((result) => "graphic" in result);
      if (graphicHit) {
      const graphic = (graphicHit as any).graphic; 
      console.log("Feature clicked:", graphic.attributes);

      if(graphic.attributes.hasOwnProperty('FID') || graphic.attributes.hasOwnProperty('customPoint')) {

      
        // Show a popup with feature details
        // this.view.popup.open({
        //   title: "Feature Info",
        //   content: `Feature ID: ${graphic.attributes.OBJECTID}`, // Customize this based on your layer's attributes
        //   location: event.mapPoint,
        // });
      } else {
      console.log("No features clicked, new Point added");
        
        if(this.enablePlotPoints) {
        
        // Convert screen click to map coordinates
        const pointt = new Point({
          x: event.mapPoint.longitude,
          y: event.mapPoint.latitude,
          spatialReference: { wkid: 4326 },
        });

        // Create a simple marker symbol
        const symbol = new SimpleMarkerSymbol({
          color: "red",
          size: "10px",
        });

        // Create a graphic and add it to the view
        const graphiccc = new Graphic({
          geometry: pointt,
          symbol: symbol,
          attributes: lineAtt,
          popupTemplate: {
            // autocasts as new PopupTemplate()
            title: "{Name}",
            content: [
              {
                type: "fields",
                fieldInfos: [
                  {
                    fieldName: "Name"
                  },
                  {
                    fieldName: "Owner"
                  },
                  {
                    fieldName: "Latitude"
                  },
                  {
                    fieldName: "Longitude"
                  }
                ]
              }
            ]
          }
        });

        this.view.graphics.remove(graphiccc); // Clear previous markers
        this.view.graphics.add(graphiccc);

        console.log(`Clicked at: ${pointt.x}, ${pointt.y}`);
        }
      }
    } 
    }
  }


  // queryFeats=async(qry:any)=>{
  //   const qry2 = await this.geoJsonLayer.queryFeatures(qry);
  //   console.log('features:', qry2);
  // }

  async queryLayerView(whereClause: string) {
    this.isLayerViewQueryWorking=true;
    console.log("whereClause",whereClause)
    const query = new Query();
    query.where = whereClause; // Change condition as needed
    query.returnGeometry = true;
    query.outFields = ["*"]; // Retrieve all fields

    let aqq = this.highlightSymbol;
    let bqq = this.view;
    // Execute the query
    let garr:any = [];
    let pointDataAttrsArr:any[]=[]
    
  this.geoJsonLayer.queryFeatures(query)
    .then((response) => {
      
      //this.spinner
      this.pointDataAttrs=[];
      this.view.graphics.removeAll();
      // Handle the results
      console.log("Query results:", response.features);

      // Optionally, display the results on the map
      // response.features.forEach(function(feature) {
      //   console.log("Parcel ID:", feature.attributes.ParcelID);
      //   console.log("Geometry:", feature.geometry);
      // });


      // --------- S ------------
      // let symbol = {
      //   type: "simple-fill",
      //   color: [20, 130, 200, 0.5],
      //   outline: {
      //     color: "white",
      //     width: 0.5
      //   }
      // };

      //  let pointFillSymbol = new SimpleFillSymbol({
      //        type: "simple-fill",
      //         color: [20, 130, 200, 0.5],
      //         outline: {
      //           color: "white",
      //           width: 0.5
      //         }
      //     });
      
      //setTimeout(() => {
        if(response.features.length < this.pointDataAttrs_count) {}
        else this.pointDataAttrs_count = response.features.length;
      // this.pointDataAttrs = response.features
        response.features.map((feature:any,i:number) => {
          const long = feature.geometry.extent.center.longitude;
          const lat = feature.geometry.extent.center.latitude;
          let latlng:any=[long,lat];
          feature.attributes.latlng=latlng;
          this.pointDataAttrs.push(feature.attributes);
          
          // ------ NOT Working --------- 
          // let point12 = new Point({
          //   x: feature.geometry.longitude,
          //   y: feature.geometry.latitude,
          // });
          // this.graphic = new Graphic({
          //   geometry: point12,
          //   symbol: new SimpleFillSymbol({
          //     style: "solid",
          //     color: 'rgba(39, 163, 35, 0.4)', // Red transparent fill
          //     outline: { color: "red", width: 2 },
          //   }),
          // });
          // this.view.graphics.add(this.graphic)

          // ------ Working --------------
         this.graphic = new Graphic({
            geometry: feature.geometry,
            symbol: new SimpleFillSymbol({
              color: [239, 235, 111, 0.56], // Red color with 50% opacity
              
              outline: {
                color: [255, 0, 0],
                width: 1
              }
            })
          });
          this.view.graphics.add(this.graphic)

          // --------------------
          //feature.symbol = symbol;
          //feature.geometry = pointGraphic;
          //return feature;
        });
        
        //this.view.graphics.addMany(response.features);
      //}, 1800);
    })
    .catch((error) =>{
      console.error("Query failed:", error);
      this.isLayerViewQueryWorking=false;
    })
    .finally(()=>{
      this.isLayerViewQueryWorking=false;
    })
    // this.pointDataAttrs = ;
    // setTimeout(() => {
    //     garr.forEach((f:any)=>this.view.graphics.add(f))
    // }, 1800);
    
  }

highlightSymbol = new SimpleFillSymbol({
  color: [255, 0, 0, 0.4], // Red transparent fill
  outline: { color: "red", width: 4 },
});

updatePlotPoints(data:any){
  console.log("plot points:",data);
  this.enablePlotPoints=data.checked
}

removeAllCustomPoints(){
  this.view.graphics.removeAll();
}

onFeatureQuery(field:string,type:string,data:any) {
  console.log("onFeatureQuery:",field,type,data);
  if(type === 'range') {
    this.rangeVal[data?.source?.thumbPosition-1]=data?.source?.value;
    if(this.rangeVal[0]!==undefined || this.rangeVal[1]!==undefined) {
      //this.queryLayerView(`${field} > ${rangeVal[0]} && ${field} < ${rangeVal[1]}`)
      this.queryLayerView(`${field} BETWEEN ${this.rangeVal[0]} AND ${this.rangeVal[1]}`)
    }
  } else if(type === 'select') {
    if(data.value.length) this.queryLayerView(`${field} = ${data.value}`)
    else this.queryLayerView(`1=1`)
  } else if(type === 'type') {
    this.queryLayerView(`${field} = ${data}`)
  }
}

goto_location(longLat:number[],field:string,type:string,data:any){
  console.log("longLat",longLat)
  this.view.goTo(                           // go to point with a custom animation duration
    { center: longLat },
    { duration: 2000 }
  );
  this.view.zoom = 6;
  this.onFeatureQuery(field,type,data);
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

}
