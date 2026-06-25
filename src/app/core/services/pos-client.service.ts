import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  POSClient,
  CreatePOSClientRequest,
  UpdatePOSClientRequest,
} from '../models/pos-client.model';

@Injectable({ providedIn: 'root' })
export class PosClientService {
  private readonly apiUrl = 'http://localhost:3000/pos-clients';

  constructor(private http: HttpClient) {}

  getAll(companyId: number): Observable<POSClient[]> {
    return this.http.get<POSClient[]>(`${this.apiUrl}?companyId=${companyId}`);
  }

  getById(id: number): Observable<POSClient> {
    return this.http.get<POSClient>(`${this.apiUrl}/${id}`);
  }

  create(data: CreatePOSClientRequest): Observable<POSClient> {
    return this.http.post<POSClient>(this.apiUrl, data);
  }

  update(id: number, data: UpdatePOSClientRequest): Observable<POSClient> {
    return this.http.patch<POSClient>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<POSClient> {
    return this.http.delete<POSClient>(`${this.apiUrl}/${id}`);
  }

  registerSync(id: number): Observable<POSClient> {
    return this.http.post<POSClient>(`${this.apiUrl}/${id}/sync`, {});
  }
}
