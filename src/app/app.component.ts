import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from './common.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers:[CommonService]
})
export class AppComponent {
  title = 'geojson';
}
