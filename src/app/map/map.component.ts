import { Component, AfterViewInit } from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import { CommonService } from '../common.service';
import * as L from 'leaflet';
import { CityPincodemMock } from '../city-pincodem-mock';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox'

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule,MatCheckboxModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  providers:[CityPincodemMock]
})
export class MapComponent implements AfterViewInit {
  private world = 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/countries.geojson'; // Example GeoJSON API
  private indianStates = 'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/refs/heads/master/Indian_States';
  private geoJsonLayer:any=null;
  private mapSelectionType:string='India';
  public stateNames:string[]=[]
  private geoFeaturesObj:any={}
  private geoObj:any={
    features:[],
    type:"FeatureCollection"
  }
  constructor(private _cs:CommonService, private mockpin:CityPincodemMock){}
  map!:L.Map
  ngAfterViewInit(): void {
     this.initMap();
     this.loadGeojson(this.indianStates);
     
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
      next:(data:any)=>{
        if(data instanceof HttpResponse) {
          //console.log("mockpincodes",this.mockpin)
           let yuu = this.convertArrayBufferToGeoJson(data.body);
           console.log("yuu",yuu);
           this.geoFeaturesObj = yuu.features
            if(this.mapSelectionType === 'India')this.buildStates(yuu.features)
           this.addGeoJsonLayer(yuu);
        }
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
      onEachFeature:(feature,layer)=>{
        if (feature.properties) {
          let pucontent = ``;
          if(this.mapSelectionType === 'World'){
            pucontent += `<div class='mapHoverRow'><b>Country:</b> ${feature?.properties?.name}</div>`;
            pucontent += `<div class='mapHoverRow'><b>Country Id:</b> ${feature?.id}</div>`;
          } else {
            pucontent += `<div class='mapHoverRow'><b>State:</b> ${feature?.properties?.NAME_1}</div>`;
            pucontent += `<div class='mapHoverRow'><b>Type:</b> ${feature?.properties?.TYPE_1}</div>`;
          }
          layer.on('mouseover',(e)=>{
            //console.log('country details',pucontent)
            const pu = L.popup().setLatLng(e.latlng).setContent(pucontent).openOn(this.map)
          });
          // const marker1 = L.marker([51.5, -0.09]);
          // const marker2 = L.marker([51.51, -0.1]);
          // const layerGroup = L.layerGroup([marker1, marker2]).addTo(this.map);
        }
      },
      style: {
        color: 'blue',
        weight: 2,
        opacity: 0.6,
      },
    }).addTo(this.map)
  }


  changeMap(val:any){
    console.log('map-changed',val);
    this.mapSelectionType = val.value;
    if(val.value === 'World') this.loadGeojson(this.world);
    else this.loadGeojson(this.indianStates);
  }

  updateStatesShow(state:string,val:any){
    
    //this.geoObj.features.push()

    let selectedStateTile = this.geoFeaturesObj.find((t:any) => t.properties.NAME_1 === state);
    this.geoObj.features.push(selectedStateTile);
    this.addGeoJsonLayer(this.geoObj);
    console.log('state shoed',state,val,this.geoObj);

  }
}
