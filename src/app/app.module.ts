import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatRadioModule, MatTooltipModule, MatSidenavModule, MatButtonToggleModule, MatTabsModule, MatIconModule } from '@angular/material';
import { SpinnerModule } from './utility/spinner/spinner.module';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AuthService } from './service/auth.service';
import { AuthGuardService } from './service/auth-guard.service';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LayoutComponent } from './layout/layout.component';


// 建立TranslateHttpLoader作為語系檔的讀取器
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFontAwesomeModule,
    SpinnerModule,
    FormsModule,
    MatDialogModule,
    MatRadioModule,
    MatTooltipModule,
    MatSidenavModule,
    MatButtonToggleModule,
    MatTabsModule,
    MatIconModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      },
      defaultLanguage: 'zh-TW'
    }),
    
  ],
  
  providers: [
    AuthService,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
