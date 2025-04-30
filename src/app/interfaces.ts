export interface IPokemon {
  name: string;
  base_experience: number;
  height: number;
  weight: number;
}
export interface IStarWarsCharacter {
  name: string;
  height: number;
  mass: number;
  homeworld: string;
}
export interface IStarWarsPlanet {
  name: string;
  rotation_period: number;
  orbital_period: number;
  diameter: number;
  surface_water: number;
  population: number;
}

export interface OperanContent {
  name: string;
  attribute: string;
}

export interface IChatGptResponse {
  operation: Operation[];
  operands: {
    [key: string]: OperanContent[];
  };
  operationInstruction: string;
}

export enum OperandsKeys {
  Character = 'Character',
  Pokemon = 'Pokemon',
  Planet = 'Planet',
}

export enum Operation {
  addition = 'addition',
  subtraction = 'subtraction',
  multiplication = 'multiplication',
  division = 'division',
  exponentiation = 'exponentiation',
  modulus = 'modulus',
  square_root = 'square_root',
}

export interface Challenge {
  id: string;
  problem: string;
  expression?: string;
  solution?: number;
}

export interface SolvedChallenge {
  pokemon: IPokemon[];
  starWarsCharacter: IStarWarsCharacter[];
  starWarsPlanet: IStarWarsPlanet[];
  challenge: Challenge;
  results: IResult;
}

export interface IResult {
  solution: number;
  GPTResponse: IChatGptResponse | undefined;
  finalExpression: string;
  coincidence: boolean;
}

export interface SolutionBody {
  problem_id: string;
  answer: number;
}
