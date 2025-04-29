import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigService } from './config.service';

@Injectable()
export class ChallengeService {

  // private readonly apiUrl = 'https://recruiting.adere.so/chat_completion';
  private readonly apiUrl = 'api/challenge';
  private readonly apiKey = this.configService.get('apiKey'); // Replace with your actual API key

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService) {}

  getChallengeTest(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    return this.http.get<any>(`${this.apiUrl}/test`, { headers });
  }
}
