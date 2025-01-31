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
import Query from "@arcgis/core/rest/support/Query";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-map-arcgis',
  templateUrl: './arcgis-map.component.html',
  standalone:true,
  styleUrls: ['./arcgis-map.component.scss'],
  imports: [MatSlideToggleModule,MatButtonModule,MatSliderModule, MatSelectModule,MatFormFieldModule,SpinnerComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ArcgisMapComponent implements AfterViewInit {
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
  layerView:any=[];
  rangeVal:number[]=[0,0];
  isLayerViewQueryWorking:boolean=false;
  conditions:string[]=['Poor','Good','Excellent'];
  private indianStates = 'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/refs/heads/master/Indian_States';
  // @ViewChild('calciteNavigationLogo') calciteNavigationLogo!:ElementRef
  // constructor() {
  //   setCalciteComponentsAssetPath("https://js.arcgis.com/calcite-components/2.13.2/assets");
  // }

  @ViewChild('mapViewDiv', { static: true }) mapViewEl!: ElementRef;
  @ViewChild('spinner',{static: true}) spinner!: ElementRef;
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
    this.map = new Map({
      basemap: 'streets-navigation-vector', // Dynamic Basemap
    });
    this.view = new MapView({
      container: this.mapViewEl.nativeElement,
      map: this.map,
      center: this.initLatLng, // Dynamic Center (Delhi, India)
      zoom: 17
    });


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
    this.view.when(() => {
      this.view.on("click", (event) => {
        this.handleMapClick(event);
      });
    });

    // Add a popup, with 'Feature Layer Fields' data, when clicked on Feature Layer Fields points.
    const popupTrailheads = {
      title: "{FID}",
      content:
        "<b>FID:</b> {FID}<br><b>Tree_ID:</b> {Tree_ID}<br><b>Collected:</b> {Collected}<br><b>Crew:</b> {Crew}<br><b>Status:</b> {status}<br><b>Land_Use:</b> {Land_Use}<br><b>Tree_Age:</b> {Tree_Age}<br><b>Condition:</b> {Condition}<br><b>GroundArea:</b> {GroundArea}<br><b>Live_Top:</b> {Live_Top}<br><b>Crown_Base:</b> {Crown_Base}<br><b>Tree_Site:</b> {Tree_Site}<br><b>Sci_Name:</b> {Sci_Name}<br><b>S_Value:</b> {S_Value}<br><b>Street:</b> {Street}<br><b>Native:</b> {Native}<br><b>Dedication:</b> {Dedication}"
    };

    // FeatureLayer - Added
    this.featureLayer = new FeatureLayer({
      //url:this.landscape_trees_featurelayer_url,
      url:this.indianStates,
       outFields: ["TRL_NAME", "CITY_JUR", "X_STREET", "PARKING", "status","Land_Use","Live_Top","Crown_Base","Tree_Site","Tree_Age","Condition","GroundArea","Sci_Name","S_Value","Street","Native","Dedication"],
        popupTemplate: popupTrailheads
    }); 
    this.map.add(this.featureLayer);

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
    spatialReference: { wkid: 4326 } // Optional but recommended
  });

  const pointSymbol = new SimpleMarkerSymbol({
  color: "red",
  size: "12px"
});

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
  new ParcelLayer({ url:this.landscape_trees_featurelayer_url}).queryFeatures(query)
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
      const symbol = {
        type: "simple-fill",
        color: [20, 130, 200, 0.5],
        outline: {
          color: "white",
          width: 0.5
        }
      };

       const pointFillSymbol = new SimpleFillSymbol({
             type: "simple-fill",
              color: [20, 130, 200, 0.5],
              outline: {
                color: "white",
                width: 0.5
              }
          });
      
      //setTimeout(() => {
        
       
        response.features.map((feature:any) => {
          this.pointDataAttrs.push(feature.attributes)

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
          const pointGraphic = new Point({
            x: feature.geometry.longitude,
            y: feature.geometry.latitude,
          });
          const pointSymbol = new SimpleMarkerSymbol({
            color: "transparent",
            outline: {
                color: "blue",
                width: 2
              },
            size: `${feature.attributes.GroundArea/94}px`
          });
          this.graphic = new Graphic({
            geometry: pointGraphic,
            symbol: pointSymbol,
            //symbol: symbol,
          })
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
    this.queryLayerView(`${field} = '${data.value}'`)
  }
}

goto_location(longLat:number[]){
  this.view.goTo(                           // go to point with a custom animation duration
    { center: longLat },
    { duration: 2000 }
  );
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
