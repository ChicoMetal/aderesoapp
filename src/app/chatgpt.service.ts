import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ChatGptService {

  // private readonly apiUrl = 'https://recruiting.adere.so/chat_completion';
  private readonly apiUrl = '/api/chat_completion';
  private readonly apiKey = '80649341-c3f7-4848-b155-f75cf50006f6'; // Replace with your actual API key

  constructor(private http: HttpClient) { }

  sendMessage(body: object): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    return this.http.post<any>(this.apiUrl, body, { headers });
  }
}
