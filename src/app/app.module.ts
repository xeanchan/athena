import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatRadioModule, MatTooltipModule, MatSidenavModule, MatButtonToggleModule, MatTabsModule } from '@angular/material';
import { SpinnerModule } from './utility/spinner/spinner.module';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TranslateService } from './service/translate.service';
import { AuthService } from './service/auth.service';
import { AuthGuardService } from './service/auth-guard.service';
import { TranslatePipe } from './pipes/translate-pipe';

/**
 * i18n
 * @param service 
 */
export function setupTranslateFactory(
  service: TranslateService): Function {
  return () => {
    console.log(navigator.language);
    service.use('zh-TW');
  };
}

@NgModule({
  declarations: [
    AppComponent
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
    MatTabsModule
  ],
  
  providers: [
    AuthService,
    AuthGuardService,
    TranslatePipe,
    TranslateService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupTranslateFactory,
      deps: [ TranslateService ],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
