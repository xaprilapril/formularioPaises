import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface OrganizacionFormData {
	nombre: string;
	siglas: string;
	pais: string;
	capital: string;
	bandera: string;
	moneda: string;
}

@Injectable({
	providedIn: 'root',
})
export class GuardarFormularioService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = 'http://localhost:5000/api/organizaciones';

	guardar(datos: OrganizacionFormData): Observable<{ mensaje: string }> {
		return this.http.post<{ mensaje: string }>(this.apiUrl, datos);
	}
}