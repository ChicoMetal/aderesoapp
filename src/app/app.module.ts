import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { HttpClientModule } from '@angular/common/http';
import { ChatGptService } from './chatgpt.service';
import { ChallengeService } from './challenge.service';
import { ConfigService } from './config.service';

export function loadConfig(configService: ConfigService) {
  return () => configService.loadConfig();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
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
