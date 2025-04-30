import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable()
export class ChallengeService {

  // private readonly apiUrl = 'https://recruiting.adere.so/chat_completion';
  private readonly apiUrl = 'api/challenge';
  private readonly apiKey = this.configService.get('apiKey'); // Replace with your actual API key
  private headers: HttpHeaders;

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService) {
      this.headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      });
    }

  getChallengeTest(): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/test`, { headers: this.headers });
  }

  startChallenge(): Observable<any> {

    return this.http.get<any>(`${this.apiUrl}/start/deleteme`, { headers: this.headers });
  }

  solve(body: {problem_id: string, answer: number}): Observable<any> {

    return this.http.post<any>(`${this.apiUrl}/solution/deleteme`, body, { headers: this.headers });
  }
}
