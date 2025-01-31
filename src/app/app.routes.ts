import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'map',
        loadComponent:()=>import('./map/map.component').then((m:any) => m.MapComponent)
    },
    {
        path:'',
        redirectTo:'map',
        pathMatch:'full'
    },
    {
        path:'arcgis-webmap',
        loadComponent:()=>import('./arcgis/arcgis.component').then((m:any) => m.ArcgisComponent)
    },
    {
        path:'arcgis-map',
        loadComponent:()=>import('./arcgis-map/arcgis-map.component').then((m:any) => m.ArcgisMapComponent)
    },
    {
        path:'arcgis-map-geojson',
        loadComponent:()=>import('./arcgis-map-geojson/arcgis-map-geojson.component').then((m:any) => m.ArcgisMapGeojsonComponent)
    },
];
