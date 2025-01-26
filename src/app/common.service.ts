import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest} from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class CommonService {
 
  constructor(private _http: HttpClient) { }

  fetchGeojson(geoJsonUrl:string){
    let hr = new HttpRequest('GET',geoJsonUrl,null,{
      reportProgress:true,
      responseType:'arraybuffer'
    });
    return this._http.request(hr)
  }


}
