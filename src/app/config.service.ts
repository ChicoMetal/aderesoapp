// src/app/config.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  loadConfig(): Promise<void> {
    return fetch('/assets/config.json')
      .then(res => res.json())
      .then(data => {
        this.config = data;
      });
  }

  get(key: string): any {
    return this.config ? this.config[key] : null;
  }
}
