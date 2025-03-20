import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { map } from 'rxjs';
import { ChatGptService } from './chatgpt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'aderesoapp';

  pokemon: IPokemon | undefined;
  starWarsCharacter: IStarWarsCharacter | undefined;
  starWarsPlanet: IStarWarsPlanet | undefined;

  constructor(
    private readonly _pokemonService: PokemonService,
    private readonly _starWarsService: StarWarsService,
    private readonly _chatGptService: ChatGptService,
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const pokemonName = 'pikachu';
    this.getPokemonByName(pokemonName);

    const characterName = 'Luke Skywalker';
    this.getCharacterByName(characterName);

    const planetName = 'Tatooine';
    this.getPlanetByName(planetName);

    const body = {
      'model': 'gpt-4o-mini',
      'messages': [
        {'role': 'developer', 'content': `Given the next three possible data objects.
          Character: {
            name: string;
            height: number;
            mass: number;
            homeworld: string;
          }
          Pokemon: {
            name: string;
            base_experience: number;
            height: number;
            weight: number;
          }
          Planet: {
            name: string;
            rotation_period: number;
            orbital_period: number;
            diameter: number;
            surface_water: number;
            population: number;
          }
          you're and assistance than only speak JSON, a valid JSON in a single line that I could parse using JSON.parse() function.
          In the paragraph, get the required arithmetic operation indicating the operation and the operands but not the result
          Example: {
            operation: 'addition',
            operands: {
              'Character': {
                name: 'Luke Skywalker',
                attribute: 'mass'
              },
              'Pokemon': {
                name: 'Pikachu',
                attribute: 'base_experience'
              }
          }
          Paragraph:
          En una galaxia muy, muy lejana, Luke Skywalker se encuentra en el planeta Tatooine, donde ha decidido entrenar a su nuevo compañero Pokémon, Vulpix. Mientras Luke mueve su sable de luz, se pregunta cuánta experiencia ganará al entrenar con Vulpix si su masa es multiplicada por la experiencia base que este Pokémon puede alcanzar. ¿Qué tan poderoso se volverá Luke con la ayuda de su amigo Pokémon?
          `},
      ]
    };
    this._chatGptService.sendMessage(body).subscribe((response) => {
      console.log('ChatGPT response:', response.choices[0].message.content);
      console.log('ChatGPT response:', JSON.parse(response.choices[0].message.content));
    });
  }

  private getPlanetByName(planetName: string) {
    this._starWarsService.getPlanetDetailsByName(planetName)
      .pipe(
        map((data: any) => {
          // transform to get next properties name, height, mass, homeworld
          data = data.results[0];
          return {
            name: data.name,
            rotation_period: data.rotation_period,
            orbital_period: data.orbital_period,
            diameter: data.diameter,
            surface_water: data.surface_water,
            population: data.population,
          };
        })
      )
      .subscribe(data => {
        this.starWarsPlanet = data;
      });
  }

  private getCharacterByName(characterName: string) {
    this._starWarsService.getPersonDetailsByName(characterName)
      .pipe(
        map((data: any) => {
          data = data.results[0];
          return {
            name: data.name,
            height: data.height,
            mass: data.mass,
            homeworld: data.homeworld,
          };
        })
      )
      .subscribe(data => {
        this.starWarsCharacter = data;
      });
  }

  private getPokemonByName(pokemonName: string) {
    this._pokemonService.getPokemonDetails(pokemonName)
      .pipe(
        map((data: any) => ({
          name: data.name,
          base_experience: data.base_experience,
          height: data.height,
          weight: data.weight,
        }))
      )
      .subscribe(data => {
        this.pokemon = data;
      });
  }
}

declare interface IPokemon {
  name: string;
  base_experience: number;
  height: number;
  weight: number;
}
declare interface IStarWarsCharacter {
  name: string;
  height: number;
  mass: number;
  homeworld: string;
}
declare interface IStarWarsPlanet {
  name: string;
  rotation_period: number;
  orbital_period: number;
  diameter: number;
  surface_water: number;
  population: number;
}
