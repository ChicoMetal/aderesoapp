import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { HttpClientModule } from '@angular/common/http';
import { ChatGptService } from './chatgpt.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
  ],
  providers: [
    PokemonService,
    StarWarsService,
    ChatGptService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
