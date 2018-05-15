import {BrowserModule} from '@angular/platform-browser';
// import {WorkerAppModule} from '@angular/platform-webworker';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {ChartsModule} from 'ng2-charts';

import {AppService} from './app.service';
import {AppComponent} from './app.component';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        // WorkerAppModule,
        CommonModule,
        FormsModule,
        HttpClientModule,
        ChartsModule,
    ],
    providers: [
        AppService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
