import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import { AuthenticationService } from './../../services/authentication.service';
//import { File } from '@ionic-native/file/ngx';
@Component({
  selector: 'app-csvreader',
  templateUrl: './csvreader.page.html',
  styleUrls: ['./csvreader.page.scss'],
})
export class CSVReaderPage implements OnInit {
  @ViewChild('csvInput') csvInput: ElementRef;
  file: File;
  formData:FormData;
  error;
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
     if(result)
     {
       console.log('Valid');
       this.error = 'File is being processed on the server.This may take some time.';
       this.csvInput.nativeElement.value = "";
     }
     else
     {
      console.log('Invalid');
      this.error = 'Headers of the file are incorrect.Please correct the headers.';
      this.csvInput.nativeElement.value = "";
     }
  }

  ngOnInit() {
  }

}
