import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  private apiUrl = 'https://pokeapi.co/api/v2/pokemon/';
  
  constructor(private http: HttpClient) { }

  obtenerPokemon(search: string): Observable<any> {
    const data = search.toLowerCase();
    return this.http.get<any>(`${this.apiUrl}${data}/`);
  }
}