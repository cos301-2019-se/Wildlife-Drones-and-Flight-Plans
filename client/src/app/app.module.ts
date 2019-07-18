import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { imports } from './app.imports';
import { providers } from './app.providers';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports : imports,
  providers :providers,
  bootstrap: [AppComponent]
})
export class AppModule {}
