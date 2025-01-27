import { Component,Input,OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent implements OnChanges {
  constructor(){}
  @Input('per') 'per':number=0
  @Input('progressOver') 'progressOver':boolean
@Input('loadingName') 'loadingName':string=''
  ngOnChanges(changes: SimpleChanges): void {
    console.log("persent",changes)
  }

}
