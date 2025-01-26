import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private districts:string = `https://india-pincode-details-with-latitude-and-longitude.p.rapidapi.com/districts?page=1&limit=10&state=`;
  private rapidApiKey:string=`62423a003fmsh971033e0461b3bdp134f05jsnce6ca1ea96d7`
  constructor(private _http: HttpClient) { }

  fetchGeojson(geoJsonUrl:string){
    let hr = new HttpRequest('GET',geoJsonUrl,null,{
      reportProgress:true,
      responseType:'arraybuffer'
    });
    return this._http.request(hr)
  }

  fetchPincode(state:string){
    let hph = new HttpHeaders();
    // hph.append('Content-Type','application/json');
    // hph.append('X-Rapidapi-Key','62423a003fmsh971033e0461b3bdp134f05jsnce6ca1ea96d7');
    // hph.append('X-Rapidapi-Host','india-pincode-details-with-latitude-and-longitude.p.rapidapi.com');
    const headers = new HttpHeaders({
      'Content-Type':'application/json',
      'X-RapidAPI-Key': this.rapidApiKey, // Add RapidAPI key
      'X-RapidAPI-Host': 'india-pincode-details-with-latitude-and-longitude.p.rapidapi.com', // Replace with your RapidAPI host
    });
    let hr = new HttpRequest('GET', `${this.districts}${state}`,null, {
      reportProgress:true,
      responseType:'json',
      headers: headers,
    });
    return this._http.request(hr)
  }
}
