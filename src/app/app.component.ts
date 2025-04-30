import { Component, OnInit } from '@angular/core';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import {
  catchError,
  combineLatest,
  concatMap,
  filter,
  finalize,
  last,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  retry,
  tap,
  throwError,
  timeout
} from 'rxjs';
import { ChatGptService } from './chatgpt.service';
import { ChallengeService } from './challenge.service';
import {
  Challenge,
  IChatGptResponse,
  IPokemon,
  IResult,
  IStarWarsCharacter,
  IStarWarsPlanet,
  OperandsKeys,
  SolutionBody,
  SolvedChallenge
} from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'AderesoApp';

  loading = false;
  pokemon: IPokemon[] = [];
  starWarsCharacter: IStarWarsCharacter[] = [];
  starWarsPlanet: IStarWarsPlanet[] = [];
  challenge!: Challenge;
  results: IResult = {
    GPTResponse: undefined,
    solution: 0,
    finalExpression: '',
    coincidence: false,
  }

  solvedChallenges: SolvedChallenge[] = [];
  successCounter = 0;
  unsuccessCounter = 0;

  constructor(
    private readonly _pokemonService: PokemonService,
    private readonly _starWarsService: StarWarsService,
    private readonly _chatGptService: ChatGptService,
    private readonly _challengeService: ChallengeService,
  ) {}

  ngOnInit(): void {}

  solve(): void {
    this.getAndResolve(() => this._challengeService.getChallengeTest());
    // const body: SolutionBody = {
    //   problem_id: this.challenge.id,
    //   answer: this.results.solution,
    // }
    // this.getAndResolve(() => this._challengeService.solve(body));
  }

  solveChallenge(challenge: Challenge): void {
    this.loading = true;
    const prompt = `You're an assistant that only responds with valid, single-line JSON that can be parsed using JSON.parse(). You have expert-level knowledge of Star Wars and Pokémon, and you will use this knowledge to extract data accurately from the paragraph provided. The data types you will work with are one of the following: Character = { name: string; height: number; mass: number; homeworld: string; } Pokemon = { name: string; base_experience: number; height: number; weight: number; } Planet = { name: string; rotation_period: number; orbital_period: number; diameter: number; surface_water: number; population: number; } Your response must be only JSON, all in a single line, with no line breaks or extra characters. The names of characters, Pokémon, and planets must match exactly as mentioned in the paragraph, as they are used to fetch data from APIs. Identify which entities belong to each object type (Character, Pokemon, Planet) based on context. Extract the arithmetic operation requested in the paragraph and represent it clearly in the JSON structure. The operation must include: the type of operation(s) in order (addition, subtraction, multiplication, division); the list of operands grouped by object type (can be empty); and the operationInstruction, where you show the correct arithmetic expression by referencing the operand’s position in the list using: Type[index].attribute. Operators must be wrapped using # symbols, like #+# or #/#. Make sure the order of operations matches the original paragraph logic. Each of the operand lists (Character, Pokemon, Planet) must be included in the JSON, even if some are empty. Paragraphs may be in English or Spanish, but your JSON must always be in English. Think step by step to ensure that each entity is correctly classified and that the operations are in the correct order as described in the paragraph. Here is an example of the expected output format: {\"operation\": [\"addition\"], \"operands\": { \"Character\": [ { \"name\": \"Luke Skywalker\", \"attribute\": \"mass\" }, { \"name\": \"Leia Organa\", \"attribute\": \"height\" } ], \"Pokemon\": [ { \"name\": \"Pikachu\", \"attribute\": \"base_experience\" }, { \"name\": \"Charmander\", \"attribute\": \"height\" } ], \"Planet\": [ { \"name\": \"Coruscant\", \"attribute\": \"orbital_period\" }, { \"name\": \"Dorin\", \"attribute\": \"diameter\" } ] }, \"operationInstruction\": \"Pokemon[0].base_experience#*#Planet[0].orbital_period#+#Character[0].mass#+#Planet[1].diameter\" }. Now analyze the following paragraph and respond with only the output JSON: ${challenge.problem}"`;
    // const prompt = `Given the next three possible data objects:
    //       Character: {
    //         name: string;
    //         height: number;
    //         mass: number;
    //         homeworld: string;
    //       }
    //       Pokemon: {
    //         name: string;
    //         base_experience: number;
    //         height: number;
    //         weight: number;
    //       }
    //       Planet: {
    //         name: string;
    //         rotation_period: number;
    //         orbital_period: number;
    //         diameter: number;
    //         surface_water: number;
    //         population: number;
    //       }
    //       you're and assistance than only speak plain JSON, a valid JSON in a single line that I could parse using JSON.parse() function.
    //       Also you have a very wide knowledge about the world of Star Wars and Pokemon, so you can use that knowledge to create a valid JSON with accurate information.
    //       It's important that the names of the planets, pokemons and characters are exactly equal to the ones in the paragraph given this is the data that will be used to get the information using APIs.
    //       In the paragraph, get the required arithmetic operation indicating the operation and the operands but not the result, make sure to add the keys of the operands in order according to the paragraph, same for the operation order.
    //       Example: {
    //         operation: ['addition'],
    //         operands: {
    //           'Character': [
    //             {
    //               name: 'Luke Skywalker',
    //               attribute: 'mass'
    //             },
    //             {
    //               name: 'Leia Organa',
    //               attribute: 'height'
    //             }
    //           ],
    //           'Pokemon': [
    //             {
    //               name: 'Pikachu',
    //               attribute: 'base_experience'
    //             },
    //             {
    //               name: 'Charmander',
    //               attribute: 'height'
    //             }
    //           ],
    //           'Planet': [
    //             {
    //               name: 'Coruscant',
    //               attribute: 'orbital_period'
    //             },
    //             {
    //               name: 'Dorin',
    //               attribute: 'diameter'
    //             }
    //           ]
    //         },
    //         operationInstruction: 'Pokemon[0].base_experience#*#Planet[0].orbital_period#+#Character[0].mass#+#Planet[1].diameter'
    //       }
    //       Be aware that each operand type (Planet, Pokemon, Character) are a list that could contain 0 or an indeterminate number of elements, make sure to add the complete list for each one.
    //       The paragraph could be in Spanish or English, but the JSON must be in English.
    //       Also make sure that only the operator symbols are always in middle of the symbol #, right before and right after, so make sure the operator are always like this for exmple of a division #/#.
    //       Additionally, given that these are arithmetic operations, make sure to add the correct order of operations according to the order in the paragraph, so if you have a division and a multiplication, make sure that the division is before the multiplication.
    //       Remember to think step by step to make sure you're doing the right thing, especially categorizing the StarWar Character, StarWar Planets and Pokemons.
    //       Paragraph is:
    //       ${challenge.problem}
    //       `;
    const body = {
      'model': 'gpt-4o-mini',
      'messages': [
        {'role': 'developer', 'content': prompt},
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
        this.calculate(response, challenge);
      });
  }

  start(): void {
    this.getAndResolve(() => this._challengeService.startChallenge());
  }
  avoid(): void {
    const body: SolutionBody = {
      problem_id: this.challenge.id,
      answer: 0,
    }
    this.getAndResolve(() => this._challengeService.solve(body));
  }

  private getAndResolve(callback: () => Observable<Challenge>): void {
    this.loading = true;
    this.savedPreviousChallenge();

    callback()
    .pipe(
      catchError((error: any): Observable<never> => {
        this.loading = false;
        return throwError(() => error);
      }),
    )
    .subscribe((challenge: Challenge) => {
      console.log('Challenge:', challenge);
      this.challenge = challenge;
      this.solveChallenge(challenge);
    });
  }

  private savedPreviousChallenge(): void {

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
    this.challenge = {} as unknown as Challenge;
    this.results = {
      GPTResponse: undefined,
      solution: 0,
      finalExpression: '',
      coincidence: false,
    }
  }

  private calculate(
    response: IChatGptResponse,
    challenge: Challenge,
  ) {
    let planet$: Observable<IStarWarsPlanet>[] = [];
    let character$: Observable<IStarWarsCharacter>[] = [];
    let pokemon$: Observable<IPokemon>[] = [];

    console.log('ChatGPT response:', response);
    this.results.GPTResponse = response;
    for (const key in response.operands) {
      const operand = response.operands[key];
      if (key === OperandsKeys.Character) {
        operand.forEach((character: any) => {
          character$.push(this.getCharacterByName(character.name).pipe(filter((data: any) => data !== null)));
        });
      } else if (key === OperandsKeys.Pokemon) {
        operand.forEach((pokemon: any) => {
          pokemon$.push(this.getPokemonByName(pokemon.name).pipe(filter((data: any) => data !== null)));
        });
      } else if (key === OperandsKeys.Planet) {
        operand.forEach((planet: any) => {
          planet$.push(this.getPlanetByName(planet.name).pipe(filter((data: any) => data !== null)));
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

        this.buildFormula(
          challenge,
          response
        );
      },
    () => {},
    () => {
      this.successCounter = this.solvedChallenges.filter((challenge: SolvedChallenge) => {
        return challenge.results.coincidence;
      }).length;
      this.unsuccessCounter = this.solvedChallenges.filter((challenge: SolvedChallenge) => {
        return !challenge.results.coincidence;
      }).length;
    });
  }

  public buildFormula(
    challenge: Challenge,
    response: IChatGptResponse,
  ): void {
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
    console.log('finalExpression:', finalExpression);
    const result = eval(finalExpression).toFixed(10);
    this.results.finalExpression = finalExpression;
    this.results.solution = +result;
    this.results.coincidence = result == challenge.solution;

    console.log('Result:', this.results);
    console.log('Final expression:', finalExpression, 'Value', result, challenge.solution);
    console.log('Value', result == challenge.solution);
  }

  private getPlanetByName(planetName: string): Observable<IStarWarsPlanet | null> {
    return this._starWarsService.getPlanetDetailsByName(planetName)
      .pipe(
        mergeMap((data: any) => {
          if (data?.count <= 0 || data?.results?.length <= 0) {
            return throwError(() => new Error('Planet not found'));
          }
          return of(data);
        }),
        retry({ count: 2, delay: 1000 }),
        catchError((error: unknown) => {
          console.error('Error:', error);
          return of(null);
        }),
        map((data: any) => {
          if (!data) {
            return null;
          }
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

  private getCharacterByName(characterName: string): Observable<IStarWarsCharacter | null> {
    return this._starWarsService.getPersonDetailsByName(characterName)
      .pipe(
        mergeMap((data: any) => {
          if (data?.count <= 0 || data?.results?.length <= 0) {
            return throwError(() => new Error('Character not found'));
          }
          return of(data);
        }),
        retry({ count: 2, delay: 1000 }),
        catchError((error: unknown) => {
          console.error('Error:', error);
          return of(null);
        }),
        map((data: any) => {
          if (!data) {
            return null;
          }
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

  private getPokemonByName(pokemonName: string): Observable<IPokemon | null> {
    return this._pokemonService.getPokemonDetails(pokemonName)
      .pipe(
        mergeMap((data: any) => {
          if (data?.count <= 0 || data?.results?.length <= 0) {
            return throwError(() => new Error('Pokemon not found'));
          }
          return of(data);
        }),
        retry({ count: 2, delay: 1000 }),
        catchError((error: unknown) => {
          console.error('Error:', error);
          return of(null);
        }),
        map((data: any) => {
          if (!data) {
            return null;
          }
          let pokemon;
          const requiredKeys = ['name', 'base_experience', 'height', 'weight'];
          if (requiredKeys.every(key => key in data)) {
            pokemon = data;
          } else {
            pokemon = data.results[0];
          }

          return {
            name: pokemon.name,
            base_experience: +pokemon.base_experience,
            height: +pokemon.height,
            weight: +pokemon.weight,
          };
        })
      );
  }
}


function combineLatestWithOptional<T extends any[]>(
  ...observables: { [K in keyof T]: Observable<T[K]> | null | undefined }
): Observable<T[]> {
  return combineLatest(
    observables.map(obs => obs ? obs : of(null))
  ) as Observable<T> ;
}
