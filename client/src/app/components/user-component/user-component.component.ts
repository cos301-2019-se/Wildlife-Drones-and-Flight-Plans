import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'app-user-component',
  templateUrl: './user-component.component.html',
  styleUrls: ['./user-component.component.scss'],
})
export class UserComponentComponent implements OnInit {
  @Input('name') name:string;
  @Input('surname') surname:string;
  @Input('job') job:string;
  @Input('id') id:number;
  constructor() { }

  ngOnInit() {}

}
