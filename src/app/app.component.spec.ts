import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { Challenge, IChatGptResponse, IPokemon, IStarWarsCharacter, IStarWarsPlanet, Operation } from './interfaces';
import { PokemonService } from './pokemon.service';
import { StarWarsService } from './star-wars.service';
import { ChallengeService } from './challenge.service';
import { ChatGptService } from './chatgpt.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        {
          provide: PokemonService,
          useValue: jasmine.createSpyObj('PokemonService', ['getPokemons'])
        },
        {
          provide: StarWarsService,
          useValue: jasmine.createSpyObj('StarWarsService', ['getCharacters', 'getPlanets'])
        },
        {
          provide: ChallengeService,
          useValue: jasmine.createSpyObj('ChallengeService', ['getChallengeTest', 'startChallenge', 'solve'])
        },
        {
          provide: ChatGptService,
          useValue: jasmine.createSpyObj('ChatGptService', ['getChatGptResponse'])
        }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'aderesoapp'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('aderesoapp');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.content span')?.textContent).toContain('aderesoapp app is running!');
  });

  it('should build the formular', () => {
    const challenge: Challenge = {
      id: 'c9fa80ee-5f17-4124-b47c-2d77822d1555',
      problem: 'En el vibrante planeta de Toydaria, Kit Fisto, el Maestro Jedi con una sonrisa siempre presente, se embarca en una misión matemática. Primero, decide multiplicar su propia altura por el periodo orbital del planeta Toydaria, intrigado por la relación entre su estatura y el tiempo cósmico. Luego, para añadir un giro a su aventura, divide este resultado por la altura del veloz Ben Quadinaros. Pero la travesía no termina ahí, pues Kit Fisto decide dividir una vez más el resultado obtenido por la base de experiencia del Pokémon Maractus. ¿Qué revelará este cálculo intergaláctico en su búsqueda de conocimiento?',
      expression: '"Kit Fisto".height * "Toydaria".orbital_period / "Ben Quadinaros".height / "Maractus".base_experience',
      solution: 1.3742331288,
    }
    const GPTResponse: IChatGptResponse = {
        "operation": [
            Operation.multiplication,
            Operation.division,
            Operation.division
        ],
        "operands": {
            "Character": [
                {
                    "name": "Kit Fisto",
                    "attribute": "height"
                },
                {
                    "name": "Ben Quadinaros",
                    "attribute": "height"
                }
            ],
            "Pokemon": [
                {
                    "name": "Maractus",
                    "attribute": "base_experience"
                }
            ],
            "Planet": [
                {
                    "name": "Toydaria",
                    "attribute": "orbital_period"
                }
            ]
        },
        "operationInstruction": "Character[0].height#*#Planet[0].orbital_period#/#Character[1].height#/#Pokemon[0].base_experience"
    }
    const pokemons: IPokemon[] = [
      { "name": "maractus", "base_experience": 161, "height": 10, "weight": 280 }
    ]
    const characters: IStarWarsCharacter[] = [
      { "name": "Kit Fisto", "height": 196, "mass": 87, "homeworld": "https://swapi.dev/api/planets/44/" },
      { "name": "Ben Quadinaros", "height": 163, "mass": 65, "homeworld": "https://swapi.dev/api/planets/41/" },
    ]
    const planets: IStarWarsPlanet[] = [
      { "name": "Toydaria", "rotation_period": 21, "orbital_period": 184, "diameter": 7900, "surface_water": 0, "population": 11000000 }
    ]

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.challenge = challenge;
    component.pokemon = pokemons as IPokemon[];
    component.starWarsCharacter = characters as IStarWarsCharacter[];
    component.starWarsPlanet = planets as IStarWarsPlanet[];
    component.challenge = challenge;

    // Act
    component.parseResponse(GPTResponse);

    // Assert
    expect(component.challenge.solution).toBe(component.results.solution);
  });

  fit('should build the formula 2', () => {
    const challenge: Challenge = {
      id: 'eef4d1f5-c7a9-4cd0-b739-7334767647f2',
      problem: 'En el bullicioso planeta de Toydaria, Dexter Jettster, el amigable dueño de la cafetería, se embarca en un enigma matemático galáctico. Primero, decide sumar su propia altura a un cálculo intrigante: multiplica el periodo de rotación de Toydaria por la base de experiencia del musculoso Machoke. Luego, para añadir un toque de misterio, divide este producto por la base de experiencia de la elegante Pheromosa. ¿Qué fascinante resultado descubrirá Dexter en esta aventura intergaláctica?',
      expression: '"Dexter Jettster".height + "Toydaria".rotation_period * "Machoke".base_experience / "Pheromosa".base_experience',
      solution: 208.4631578947,
    }
    const GPTResponse: IChatGptResponse = {
        "operation": [
            Operation.addition,
            Operation.multiplication,
            Operation.division,
        ],
        "operands": {
            "Character": [
                {
                    "name": "Dexter Jettster",
                    "attribute": "height"
                }
            ],
            "Pokemon": [
                {
                    "name": "Machoke",
                    "attribute": "base_experience"
                },
                {
                    "name": "Pheromosa",
                    "attribute": "base_experience"
                }
            ],
            "Planet": [
                {
                    "name": "Toydaria",
                    "attribute": "rotation_period"
                }
            ]
        },
        "operationInstruction": "Character[0].height#+#(Planet[0].rotation_period#*#Pokemon[0].base_experience)#/#Pokemon[1].base_experience"
    };
    const pokemons: IPokemon[] = [
      { "name": "machoke", "base_experience": 142, "height": 15, "weight": 705 },
      { "name": "pheromosa", "base_experience": 285, "height": 18, "weight": 250 },
    ]
    const characters: IStarWarsCharacter[] = [
      { "name": "Dexter Jettster", "height": 198, "mass": 102, "homeworld": "https://swapi.dev/api/planets/55/" },
    ]
    const planets: IStarWarsPlanet[] = [
      { "name": "Toydaria", "rotation_period": 21, "orbital_period": 184, "diameter": 7900, "surface_water": 2, "population": 11000000 }
    ]

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    component.challenge = challenge;
    component.pokemon = pokemons as IPokemon[];
    component.starWarsCharacter = characters as IStarWarsCharacter[];
    component.starWarsPlanet = planets as IStarWarsPlanet[];
    component.challenge = challenge;

    // Act
    component.parseResponse(GPTResponse);

    // Assert
    expect(component.challenge.solution).toBe(component.results.solution);
  });
});
