import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
//import { File } from '@ionic-native/file/ngx';
@Component({
  selector: 'app-csvreader',
  templateUrl: './csvreader.page.html',
  styleUrls: ['./csvreader.page.scss'],
})
export class CSVReaderPage implements OnInit {
  file: File;
  formData:FormData;
  constructor(private auth: AuthenticationService) { }
  changeListener(event):void
  {
    this.formData = new FormData();
    console.log("File inserted");
    this.file = event.target.files[0];
    this.formData.append('csvFile',this.file);
    this.uploadFile();
  }

  async uploadFile()
  {
     const result = await this.auth.postForm('csvUploader',this.formData);
  }

  ngOnInit() {
  }

}
