import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { catchError, combineAll, combineLatest, filter, finalize, last, map, merge, Observable, of, pipe, retry, startWith, take, tap, throwError, timeout } from 'rxjs';
import { ChatGptService } from './chatgpt.service';
import { ChallengeService } from './challenge.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Aderesoapp';

  loading = false;
  pokemon: IPokemon[] = [];
  starWarsCharacter: IStarWarsCharacter[] = [];
  starWarsPlanet: IStarWarsPlanet[] = [];
  challenge: ChallengeTest = {} as unknown as ChallengeTest;
  results: IResult = {
    GPTResponse: undefined,
    solution: 0,
    finalExpression: '',
    coincidence: false,
  }

  solvedChallenges: SolvedChallenge[] = [];

  constructor(
    private readonly _pokemonService: PokemonService,
    private readonly _starWarsService: StarWarsService,
    private readonly _chatGptService: ChatGptService,
    private readonly _challengeService: ChallengeService,
  ) {}

  ngOnInit(): void {
  }

  solve(): void {
    this.loading = true;
    this.savedPreviousChallenge();

    let planet$: Observable<IStarWarsPlanet>[] = [];
    let character$: Observable<IStarWarsCharacter>[] = [];
    let pokemon$: Observable<IPokemon>[] = [];

    this._challengeService.getChallengeTest()
    .pipe(
      catchError((error) => {
        this.loading = false;
        return error;
      }),
    )
    .subscribe((challenge: ChallengeTest) => {
        console.log('Challenge:', challenge);
        this.challenge = challenge;
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
                  'Character': [
                    {
                      name: 'Luke Skywalker',
                      attribute: 'mass'
                    },
                    {
                      name: 'Leia Organa',
                      attribute: 'height'
                    }
                  ],
                  'Pokemon': [
                    {
                      name: 'Pikachu',
                      attribute: 'base_experience'
                    },
                    {
                      name: 'Charmander',
                      attribute: 'height'
                    }
                  ],
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
              Also make sure that only the operator symbols are always in middle of the symbol #, right before and right after.
              Remember to think step by step to make sure you're doing the right thing, especially categorizing the StarWar Character, StarWar Planets and Pokemons.
              Paragraph is:
              ${challenge.problem}
              `},
          ]
        };
        this._chatGptService.sendMessage(body)
          .pipe(
            timeout(120 * 1000),
            tap(value => console.log('ChatGPT response:', value)),
            map((response: any) => JSON.parse(response.choices[0].message.content)),
            retry({ count: 3, delay: 1000 }),
            catchError((error) => {
              this.loading = false;
              return error;
            }),
          )
          .subscribe((response: IChatGptResponse) => {
            this.calculate(response, character$, pokemon$, planet$, challenge);
          });
    });
  }

  private savedPreviousChallenge(): void {
    console.warn('this.challenge', this.challenge, )
    if (
      (this.challenge === null || this.challenge === undefined || Object.keys(this.challenge).length === 0) &&
      this.pokemon.length === 0 &&
      this.starWarsCharacter.length === 0 &&
      this.starWarsPlanet.length === 0
    ) return;

    const challenge: SolvedChallenge = {
      pokemon: this.pokemon,
      starWarsCharacter: this.starWarsCharacter,
      starWarsPlanet: this.starWarsPlanet,
      challenge: this.challenge,
      results: this.results,
    }
    this.solvedChallenges.unshift({...challenge});
    console.warn(challenge, this.solvedChallenges)
    this.cleanPreviousChallenge();
  }

  private cleanPreviousChallenge(): void {
    this.pokemon = [];
    this.starWarsCharacter = [];
    this.starWarsPlanet = [];
    this.challenge = {} as unknown as ChallengeTest;
    this.results = {
      GPTResponse: undefined,
      solution: 0,
      finalExpression: '',
      coincidence: false,
    }
  }

  private calculate(
    response: IChatGptResponse,
    character$: Observable<IStarWarsCharacter>[],
    pokemon$: Observable<IPokemon>[],
    planet$: Observable<IStarWarsPlanet>[],
    challenge: ChallengeTest,
  ) {
    console.log('ChatGPT response:', response);
    this.results.GPTResponse = response;
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

    const subscriber = [];
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
    .pipe(
      finalize(() => this.loading = false),
    )
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
              finalExpression += `${(starWarCharacter as any)[attribute]}`;
            } else if (operand === OperandsKeys.Pokemon) {
              const pokemon = this.pokemon[index];
              finalExpression += `${(pokemon as any)[attribute]}`;
            } else if (operand === OperandsKeys.Planet) {
              const planet = this.starWarsPlanet[index];
              finalExpression += `${(planet as any)[attribute]}`;
            }
          });
        const result = eval(finalExpression).toFixed(10);
        this.results.finalExpression = finalExpression;
        this.results.solution = result;
        this.results.coincidence = result == challenge.solution;
        console.log('Final expression:', finalExpression, 'Value', result, challenge.solution);
        console.log('Result:', finalExpression, 'Value', result == challenge.solution);
      });
  }

  private getPlanetByName(planetName: string): Observable<IStarWarsPlanet> {
    return this._starWarsService.getPlanetDetailsByName(planetName)
      .pipe(
        timeout(60 * 1000),
        retry({ count: 2, delay: 1000 }),
        tap(data => {
          if(data?.count <= 0 || data?.results?.length > 0) {
            throwError(() => new Error('Planet not found'));
          }
        }),
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
        retry({ count: 2, delay: 1000 }),
        tap(data => {
          if(data?.count <= 0 || data?.results?.length > 0) {
            throwError(() => new Error('Character not found'));
          }
        }),
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
        retry({ count: 2, delay: 1000 }),
        tap(data => {
          if(data?.count <= 0 || data?.results?.length > 0) {
            throwError(() => new Error('Pokemon not found'));
          }
        }),
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

interface ChallengeTest {
  id: string;
  problem: string;
  expression: string;
  solution: number;
}

interface SolvedChallenge {
  pokemon: IPokemon[];
  starWarsCharacter: IStarWarsCharacter[];
  starWarsPlanet: IStarWarsPlanet[];
  challenge: ChallengeTest;
  results: IResult;
}

interface IResult {
  solution: number;
  GPTResponse: IChatGptResponse | undefined;
  finalExpression: string;
  coincidence: boolean;
}
function combineLatestWithOptional<T extends any[]>(
  ...observables: { [K in keyof T]: Observable<T[K]> | null | undefined }
): Observable<T[]> {
  return combineLatest(
    observables.map(obs => obs ? obs : of(null))
  ) as Observable<T> ;
}
