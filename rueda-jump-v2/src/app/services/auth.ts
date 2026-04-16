import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { buildApiUrl } from '../shared/api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = buildApiUrl('/api/auth');

  constructor(private http: HttpClient) { }

  registrarCliente(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registro`, datos);
  }

  iniciarSesion(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, datos);
  }

  guardarToken(token: string) { localStorage.setItem('token_rueda_jump', token); }
  obtenerToken() { return localStorage.getItem('token_rueda_jump'); }
  cerrarSesion() { localStorage.removeItem('token_rueda_jump'); }
}
