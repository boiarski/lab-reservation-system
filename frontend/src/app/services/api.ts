import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private getHeaders() {
    const token = this.auth.getToken();

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  getDashboard() {
    return this.http.get<any>(`${this.baseUrl}/dashboard`, this.getHeaders());
  }

  getEquipment() {
    const url = `${this.baseUrl}/equipment`;

    return this.http.get<any[]>(url, this.getHeaders());
  }

  getEquipmentById(id: number | string) {
    return this.http.get<any>(`${this.baseUrl}/equipment/${id}`, this.getHeaders());
  }

  getEquipmentAvailability(id: number | string) {
    return this.http.get<any>(
      `${this.baseUrl}/equipment/${id}/availability`,
      this.getHeaders()
    );
  }

  confirmEquipmentReport(id: number | string) {
    return this.http.patch<any>(
      `${this.baseUrl}/equipment/reports/${id}/confirm`,
      {},
      this.getHeaders()
    );
  }

  dismissEquipmentReport(id: number | string) {
    return this.http.patch<any>(
      `${this.baseUrl}/equipment/reports/${id}/dismiss`,
      {},
      this.getHeaders()
    );
  }

  createReservation(data: any) {
    return this.http.post<any>(
      `${this.baseUrl}/reservations`,
      data,
      this.getHeaders()
    );
  }

  cancelReservation(id: number | string) {
    return this.http.patch<any>(
      `${this.baseUrl}/reservations/${id}/cancel`,
      {},
      this.getHeaders()
    );
  }

  completeReservation(id: number | string) {
    return this.http.patch<any>(
      `${this.baseUrl}/reservations/${id}/complete`,
      {},
      this.getHeaders()
    );
  }

  approveReservation(id: number | string) {
    return this.http.patch<any>(
      `${this.baseUrl}/reservations/${id}/approve`,
      {},
      this.getHeaders()
    );
  }

  rejectReservation(id: number | string, data: any) {
    return this.http.patch<any>(
      `${this.baseUrl}/reservations/${id}/reject`,
      data,
      this.getHeaders()
    );
  }

  changePassword(data: any) {
    return this.http.patch<any>(
      `${this.baseUrl}/users/me/password`,
      data,
      this.getHeaders()
    );
  }
}