import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { combineAll, combineLatest, filter, last, map, merge, Observable, of, pipe, retry, startWith, take, tap, timeout } from 'rxjs';
import { ChatGptService } from './chatgpt.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Aderesoapp';

  pokemon: IPokemon[] = [];
  starWarsCharacter: IStarWarsCharacter[] = [];
  starWarsPlanet: IStarWarsPlanet[] = [];

  constructor(
    private readonly _pokemonService: PokemonService,
    private readonly _starWarsService: StarWarsService,
    private readonly _chatGptService: ChatGptService,
  ) {}

  ngOnInit(): void {
    let planet$: Observable<IStarWarsPlanet>[] = [];
    let character$: Observable<IStarWarsCharacter>[] = [];
    let pokemon$: Observable<IPokemon>[] = [];

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
          you're and assistance than only speak plain JSON, a valid JSON in a single line that I could parse using JSON.parse() function.
          Also you have a very wide knowledge about the world of Star Wars and Pokemon, so you can use that knowledge to create a valid JSON with accurate information.
          In the paragraph, get the required arithmetic operation indicating the operation and the operands but not the result, make sure to add the keys of the operands in order according to the paragraph, same for the operation order.
          Example: {
            operation: ['addition'],
            operands: {
              'Character': [{
                name: 'Luke Skywalker',
                attribute: 'mass'
              }],
              'Pokemon': [{
                name: 'Pikachu',
                attribute: 'base_experience'
              }],
              'Planet': [
                {
                  name: 'Coruscant',
                  attribute: 'orbital_period'
                },
                {
                  name: 'Dorin',
                  attribute: 'diameter'
                }
              ]
            },
            operationInstruction: 'Pokemon[0].base_experience#*#Planet[0].orbital_period#+#Character[0].mass#+#Planet[1].diameter'
          }
          The paragraph could be in Spanish or English, but the JSON must be in English.
          Paragraph is:
          En el bullicioso planeta de Coruscant, donde las luces de la ciudad nunca se apagan, un pequeño Oshawott emprende una misión matemática. Decide multiplicar su altura por la vasta población de Coruscant, un número tan grande como las estrellas en el cielo. Pero la aventura no termina ahí, pues Oshawott añade el diámetro del misterioso planeta Dorin al resultado de su cálculo. ¿Qué revelará este fascinante enigma intergaláctico sobre la relación entre un Pokémon y los planetas del universo?
          `},
      ]
    };
    this._chatGptService.sendMessage(body)
    .pipe(
      timeout(120 * 1000),
      tap(value => console.log('ChatGPT response:', value)),
      map((response: any) => JSON.parse(response.choices[0].message.content)),
      retry(1000),
    )
    .subscribe((response: IChatGptResponse) => {
      console.log('ChatGPT response:', response);
      for (const key in response.operands) {
        const operand = response.operands[key];
        if (key === OperandsKeys.Character) {
          operand.forEach((character: any) => {
            character$.push(this.getCharacterByName(character.name));
          });
        } else if (key === OperandsKeys.Pokemon) {
          operand.forEach((pokemon: any) => {
            pokemon$.push(this.getPokemonByName(pokemon.name));
          });
        } else if (key === OperandsKeys.Planet) {
          operand.forEach((planet: any) => {
            planet$.push(this.getPlanetByName(planet.name));
          });
        }
      }

      const subscriber = []
      if (planet$.length > 0) {
        subscriber.push(combineLatest(planet$));
      } else {
        subscriber.push(of([]));
      }
      if (character$.length > 0) {
        subscriber.push(combineLatest(character$));
      } else {
        subscriber.push(of([]));
      }
      if (pokemon$.length > 0) {
        subscriber.push(combineLatest(pokemon$));
      } else {
        subscriber.push(of([]));
      }

      combineLatest(subscriber)
      .subscribe(([planet, character, pokemon]) => {

        this.starWarsPlanet = planet as unknown as IStarWarsPlanet[];
        this.starWarsCharacter = character as unknown as IStarWarsCharacter[];
        this.pokemon = pokemon as unknown as IPokemon[];
        let finalExpression = '';
        response.operationInstruction.split('#')
        .forEach((expression: string) => {
          const indexStart = expression.indexOf('[');
          if (indexStart === -1) {
            finalExpression += expression;
            return;
          }
          const indexEnd = expression.indexOf(']');
          const attributeStart = expression.indexOf('.');
          const index = +expression.substring(indexStart + 1, indexEnd);
          const attribute = expression.substring(attributeStart + 1, expression.length);
          const operand = expression.substring(0, indexStart);

          if (operand === OperandsKeys.Character) {
            const starWarCharacter = this.starWarsCharacter[index];
            finalExpression += `${(starWarCharacter as any)[attribute]}`
          } else if (operand === OperandsKeys.Pokemon) {
            const pokemon = this.pokemon[index];
            finalExpression += `${(pokemon as any)[attribute]}`
          } else if (operand === OperandsKeys.Planet) {
            const planet = this.starWarsPlanet[index];
            finalExpression += `${(planet as any)[attribute]}`
          }
        });
        console.log('Final expression:', finalExpression, 'Value', eval(finalExpression));
      });

    });
  }

  private getPlanetByName(planetName: string): Observable<IStarWarsPlanet> {
    return this._starWarsService.getPlanetDetailsByName(planetName)
      .pipe(
        timeout(60 * 1000),
        retry(1000),
        map((data: any) => {
          // transform to get next properties name, height, mass, homeworld
          data = data.results[0];
          return {
            name: data.name,
            rotation_period: +data.rotation_period,
            orbital_period: +data.orbital_period,
            diameter: +data.diameter,
            surface_water: +data.surface_water,
            population: +data.population,
          };
        })
      );
  }

  private getCharacterByName(characterName: string): Observable<IStarWarsCharacter> {
    return this._starWarsService.getPersonDetailsByName(characterName)
      .pipe(
        timeout(60 * 1000),
        retry(1000),
        map((data: any) => {
          data = data.results[0];
          return {
            name: data.name,
            height: +data.height,
            mass: +data.mass,
            homeworld: data.homeworld,
          };
        })
      );
  }

  private getPokemonByName(pokemonName: string): Observable<IPokemon> {
    return this._pokemonService.getPokemonDetails(pokemonName)
      .pipe(
        timeout(60 * 1000),
        retry(1000),
        map((data: any) => ({
          name: data.name,
          base_experience: +data.base_experience,
          height: +data.height,
          weight: +data.weight,
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
  operation: Operation[];
  operands: {
    [key: string]: [{
      name: string;
      attribute: string;
    }]
  };
  operationInstruction: string;
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
