import { Component, AfterViewInit } from '@angular/core';
import {HttpResponse, HttpProgressEvent, HttpEvent, HttpEventType} from '@angular/common/http';
import { CommonService } from '../common.service';
import * as L from 'leaflet';
import { CityPincodemMock } from '../city-pincodem-mock';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox'
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule,MatCheckboxModule,LoaderComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  providers:[CityPincodemMock]
})
export class MapComponent implements AfterViewInit {
  private world = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/countries.geojson'; // Example GeoJSON API
  private indianStates = 'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/refs/heads/master/Indian_States';
  private geoJsonLayer:any=null;
  private markersGroup:any;
  public mapSelectionType:string='India';
  public stateNames:string[]=[]
  private geoFeaturesObj:any={}
  loadingName:string=''
  public progress:number=0
  public progressOver:boolean=true;
  public pincodeDataOfDistricts:any[]=[]
  private geoObj:any={
    features:[],
    type:"FeatureCollection"
  }
  constructor(private _cs:CommonService, private mockpin:CityPincodemMock){}
  map!:L.Map
  ngAfterViewInit(): void {
     this.initMap();
     this.loadGeojson(this.indianStates);
      this.loadingName = 'India'
  }
  initMap(){
    this.map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map)
  }

  loadGeojson(geoUrl:string){
    //let geoUrl = this.world;
    this._cs.fetchGeojson(geoUrl).subscribe({
      next:(data:HttpEvent<any>)=>{
        if(data.type == HttpEventType.Sent ) {
          this.progressOver = false
this.progress = 0
        }
        else if(data.type == HttpEventType.DownloadProgress ) {
          const progressEvent = data as HttpProgressEvent;
            if (progressEvent.total) {
              this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            }
        }
        else if(data instanceof HttpResponse) {
          //console.log("mockpincodes",this.mockpin)
           let yuu = this.convertArrayBufferToGeoJson(data.body);
           console.log("yuu",yuu);
           this.geoFeaturesObj = yuu.features
            if(this.mapSelectionType === 'India')this.buildStates(yuu.features)
           this.addGeoJsonLayer(yuu);
        }
      },
      error:(err => {
        this.progressOver = true
      }),
      complete:()=>{
                 this.progress = 100
                  this.progressOver = true
              }
    })
  }


  buildStates(mapData:any){
    mapData.map((u:any) => {
      this.stateNames.push(u.properties.NAME_1);
    });
    console.log("states",this.stateNames);
  }

   private convertArrayBufferToGeoJson(buffer: ArrayBuffer): any {
    // Decode the ArrayBuffer to a string
    const decoder = new TextDecoder('utf-8');
    const jsonString = decoder.decode(buffer);

    // Parse the string into a GeoJSON object
    return JSON.parse(jsonString);
  }

  addGeoJsonLayer(data:any){
    if(this.geoJsonLayer !== null) this.map.removeLayer(this.geoJsonLayer);
    this.geoJsonLayer = L.geoJSON(data,{
      onEachFeature:(feature,layer:L.Path)=>{
        console.log("onEachFeature",layer,data)
        if (feature.properties) {
          let pucontent = ``;
          if(this.mapSelectionType === 'World'){
            pucontent += `<div class='mapHoverRow'><b>Country:</b> ${feature?.properties?.name}</div>`;
            pucontent += `<div class='mapHoverRow'><b>Country Id:</b> ${feature?.id}</div>`;
          } else {
            pucontent += `<div class='mapHoverRow'><b>State:</b> ${feature?.properties?.NAME_1}</div>`;
            pucontent += `<div class='mapHoverRow'><b>Type:</b> ${feature?.properties?.TYPE_1}</div>`;
          }
           const pathLayer = layer as L.Path
          layer.on('mouseover',(e)=>{
            //console.log('country details',pucontent)
            const pu = L.popup().setLatLng(e.latlng).setContent(pucontent).openOn(this.map)
            layer.setStyle({
              color: "red", // Highlight border color
              weight: 3,    // Highlight border width
              fillColor: "yellow", // Highlight fill color
              fillOpacity: 0.1,    // Highlight fill opacity
            });
          });
          layer.on('mouseout',()=>{
           layer.setStyle({
            color: 'blue',
            weight: 2,
            fillColor: "blue", // Highlight fill color
            fillOpacity: 0.1,    // Highlight fill opacity
          });
          });
         
          layer.on('click',(e)=>{
            this.clearMarkers()
            console.log('country details',pucontent)
            this.loadingName = feature?.properties?.NAME_1
            this._cs.fetchPincode(feature?.properties?.NAME_1).subscribe({
       
                   next:(data:HttpEvent<any>)=>{
        if(data.type == HttpEventType.Sent ) {
          this.progressOver = false
this.progress = 0
        }
        else if(data.type == HttpEventType.DownloadProgress ) {
          const progressEvent = data as HttpProgressEvent;
            if (progressEvent.total) {
              this.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
              
            }
        }
                else if(data instanceof HttpResponse) {
                 
                    console.log("data?.districts",data)
                     this.pincodeDataOfDistricts = data?.body.districts;
                    data?.body.districts?.map((y:any) => {
                     
                      //console.log("!!!!!data?.districts",y)
                      let markerPopupContent='';
                      //this.markersGroup = L.layerGroup().addTo(this.map);
                      const marker = L.marker([y.Latitude, y.Longitude]).addTo(this.map);
                      markerPopupContent  += `<div class='mapHoverRow'><b>RegionName:</b> ${y.RegionName}</div>`;
                      markerPopupContent  += `<div class='mapHoverRow'><b>DivisionName:</b> ${y.DivisionName}</div>`;
                      markerPopupContent  += `<div class='mapHoverRow'><b>Pincode:</b> ${y.Pincode}</div>`;
                      marker.bindPopup(markerPopupContent).openPopup();
                    })
                  }
              },
              error:(err => {
                this.progressOver = true
              }),
              complete:()=>{
                 this.progress = 100
                  this.progressOver = true
              },
            })

            // let dists:any = this.mockpin.dd()

            // dists?.districts?.map((y:any)=>{
            //   let markerPopupContent='';
            //   //this.markersGroup = L.layerGroup().addTo(this.map);
            //   const marker = L.marker([y.Latitude, y.Longitude]).addTo(this.map);
            //   markerPopupContent  += `<div class='mapHoverRow'><b>RegionName:</b> ${y.RegionName}</div>`;
            //   markerPopupContent  += `<div class='mapHoverRow'><b>DivisionName:</b> ${y.DivisionName}</div>`;
            //   markerPopupContent  += `<div class='mapHoverRow'><b>Pincode:</b> ${y.Pincode}</div>`;
            //   marker.bindPopup(markerPopupContent).openPopup();
            // })
          });
          // const marker1 = L.marker([51.5, -0.09]);
          // const marker2 = L.marker([51.51, -0.1]);
          // const layerGroup = L.layerGroup([marker1, marker2]).addTo(this.map);
        }
      },
      style: {
        color: 'blue',
        weight: 2,
        fillColor: "blue", // Highlight fill color
        fillOpacity: 0.1,    // Highlight fill opacity
      },
    }).addTo(this.map)
  }


  changeMap(val:any){
    console.log('map-changed',val);
    this.mapSelectionType = val.value;

    if(val.value === 'World') {
      this.stateNames=[]
      this.loadGeojson(this.world);
      this.pincodeDataOfDistricts =[]
    }
    else this.loadGeojson(this.indianStates);
    this.loadingName =this.mapSelectionType;
  }

  updateStatesShow(state:string,val:any){
   // this.geoObj.features.push()
    this.clearMarkers()
     this.pincodeDataOfDistricts =[]
    //this.map.removeLayer(this.markersGroup);
    if(val.checked) {
      let selectedStateTile = this.geoFeaturesObj.find((t:any) => t.properties.NAME_1 === state);
      this.geoObj.features.push(selectedStateTile);
      this.addGeoJsonLayer(this.geoObj);
      console.log('state shoed',state,val,this.geoObj);
    } else {
      let isStateThere = this.geoObj.features.find((y:any) => y.properties.NAME_1.includes(state))
      console.log('isStateThere',isStateThere);
      if(isStateThere.hasOwnProperty('type')) {
        let tempGeoObj = this.geoObj.features.filter((y:any) => y.properties.NAME_1 !== state)
        this.geoObj.features = tempGeoObj;
        this.addGeoJsonLayer(this.geoObj);
      }
    }
    console.log('state shoed',state,val,this.geoObj);
  }


  clearMarkers(){
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });
  }
}
