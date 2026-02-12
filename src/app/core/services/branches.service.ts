import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private http = inject(HttpClient);
  private apiUrl = '/api/branches'; 

  getBranches() {
    return this.http.get<any[]>(this.apiUrl);
  }
}