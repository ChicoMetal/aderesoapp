import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class StarWarsService {

  private apiUrl = 'https://swapi.dev/api';

  constructor(private http: HttpClient) { }

  getPeopleList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people`);
  }

  getPersonDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people/${id}`);
  }

  getPersonDetailsByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/people/?search=${name}`);
  }

  getStarshipsList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/starships`);
  }

  getStarshipDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/starships/${id}`);
  }

  getPlanetsList(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/planets`);
  }

  getPlanetDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/planets/${id}`);
  }

  getPlanetDetailsByName(name: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/planets/?search=${name}`);
  }
}
