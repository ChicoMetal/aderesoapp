import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { HttpClientModule } from '@angular/common/http';
import { ChatGptService } from './chatgpt.service';
import { ChallengeService } from './challenge.service';
import { ConfigService } from './config.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

export function loadConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

const ANGULAR_MATERIAL = [
  MatButtonModule,
  MatCardModule,
  MatDividerModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
]

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    ...ANGULAR_MATERIAL,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfig,
      deps: [ConfigService],
      multi: true
    },
    PokemonService,
    StarWarsService,
    ChatGptService,
    ChallengeService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
