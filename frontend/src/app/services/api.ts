import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
    console.log('API URL:', this.baseUrl);
  }

  getEquipment() {
    return this.http.get<any[]>(`${this.baseUrl}/equipment`);
  }

  getReservations() {
    return this.http.get<any[]>(`${this.baseUrl}/reservations`);
  }

  createReservations(data: any) {
    return this.http.post(`${this.baseUrl}/reservations`, data);
  }
}