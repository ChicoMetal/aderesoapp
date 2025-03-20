import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { combineLatest, map, Observable, of, startWith, take } from 'rxjs';
import { ChatGptService } from './chatgpt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Aderesoapp';

  pokemon: IPokemon | undefined;
  starWarsCharacter: IStarWarsCharacter | undefined;
  starWarsPlanet: IStarWarsPlanet | undefined;

  constructor(
    private readonly _pokemonService: PokemonService,
    private readonly _starWarsService: StarWarsService,
    private readonly _chatGptService: ChatGptService,
  ) {}

  ngOnInit(): void {
    let planet$: Observable<IStarWarsPlanet>;
    let character$: Observable<IStarWarsCharacter>;
    let pokemon$: Observable<IPokemon>;

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
    this._chatGptService.sendMessage(body)
    .pipe(
      map((response: any) => JSON.parse(response.choices[0].message.content))
    )
    .subscribe((response: IChatGptResponse) => {
      console.log('ChatGPT response:', response);
      for (const key in response.operands) {
        const operand = response.operands[key];
        if (key === OperandsKeys.Character) {
          character$ = this.getCharacterByName(operand.name);
        } else if (key === OperandsKeys.Pokemon) {
          pokemon$ = this.getPokemonByName(operand.name);
        } else if (key === OperandsKeys.Planet) {
          planet$ = this.getPlanetByName(operand.name);
        }
      }


      combineLatestWithOptional(
        planet$,
        character$,
        pokemon$,
      )
      .subscribe(([planet, character, pokemon]) => {
        console.log('Subscriptions:', planet, character, pokemon);
        this.starWarsPlanet = planet as unknown as IStarWarsPlanet;
        this.starWarsCharacter = character as unknown as IStarWarsCharacter;
        this.pokemon = pokemon as unknown as IPokemon;

        // const operation = response.operation;
        // const operands = response.operands;

        let result: number | string;
        // switch (operation) {
        //   case Operation.addition:
        //     result = character.height + pokemon.base_experience;
        //     break;
        //   case Operation.subtraction:
        //     result = character.height - pokemon.base_experience;
        //     break;
        //   case Operation.multiplication:
        //     result = character.height * pokemon.base_experience;
        //     break;
        //   case Operation.division:
        //     result = character.height / pokemon.base_experience;
        //     break;
        //   case Operation.exponentiation:
        //     result = Math.pow(character.height, pokemon.base_experience);
        //     break;
        //   case Operation.modulus:
        //     result = character.height % pokemon.base_experience;
        //     break;
        //   case Operation.square_root:
        //     result = Math.sqrt(character.height);
        //     break;
        //   default:
        //     result = 'Invalid operation';
        // }
        // console.log('Result:', result);
      });
    });
  }

  private getPlanetByName(planetName: string): Observable<IStarWarsPlanet> {
    return this._starWarsService.getPlanetDetailsByName(planetName)
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
      );
  }

  private getCharacterByName(characterName: string): Observable<IStarWarsCharacter> {
    return this._starWarsService.getPersonDetailsByName(characterName)
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
      );
  }

  private getPokemonByName(pokemonName: string): Observable<IPokemon> {
    return this._pokemonService.getPokemonDetails(pokemonName)
      .pipe(
        map((data: any) => ({
          name: data.name,
          base_experience: data.base_experience,
          height: data.height,
          weight: data.weight,
        }))
      );
  }
}

interface IPokemon {
  name: string;
  base_experience: number;
  height: number;
  weight: number;
}
interface IStarWarsCharacter {
  name: string;
  height: number;
  mass: number;
  homeworld: string;
}
interface IStarWarsPlanet {
  name: string;
  rotation_period: number;
  orbital_period: number;
  diameter: number;
  surface_water: number;
  population: number;
}

interface IChatGptResponse {
  operation: Operation,
  operands: {
    [key: string]: {
      name: string;
      attribute: string;
    }
  }
}

enum OperandsKeys {
  Character = 'Character',
  Pokemon = 'Pokemon',
  Planet = 'Planet',
}

enum Operation {
  addition = 'addition',
  subtraction = 'subtraction',
  multiplication = 'multiplication',
  division = 'division',
  exponentiation = 'exponentiation',
  modulus = 'modulus',
  square_root = 'square_root',
}

function combineLatestWithOptional<T extends any[]>(
  ...observables: { [K in keyof T]: Observable<T[K]> | null | undefined }
): Observable<T[]> {
  return combineLatest(
    observables.map(obs => obs ? obs : of(null))
  ) as Observable<T> ;
}
