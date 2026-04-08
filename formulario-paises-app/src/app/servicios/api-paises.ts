import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';

export interface PaisOpcion {
  codigo: string;
  nombre: string;
}

export interface PaisDetalle {
  codigo: string;
  nombre: string;
  capital: string;
  bandera: string;
  moneda: string;
}

interface RespuestaPaisRestCountries {
  cca3?: string;
  name?: {
    common?: string;
  };
  capital?: string[];
  flags?: {
    png?: string;
    svg?: string;
  };
  currencies?: Record<string, { name?: string }>;
}

type RespuestaPaisApi = RespuestaPaisRestCountries | RespuestaPaisRestCountries[];

@Injectable({
  providedIn: 'root',
})
export class ApiPaises {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://restcountries.com/v3.1';

  obtenerPaises(): Observable<PaisOpcion[]> {
    return this.http
      .get<RespuestaPaisRestCountries[]>(`${this.apiUrl}/all?fields=cca3,name`)
      .pipe(
        map((paises) =>
          paises
            .map((pais) => ({
              codigo: pais.cca3 ?? '',
              nombre: pais.name?.common ?? 'Sin nombre',
            }))
            .filter((pais) => pais.codigo !== '')
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
        ),
      );
  }

  obtenerPais(codigo: string, nombrePais?: string): Observable<PaisDetalle> {
    const campos = 'cca3,name,capital,flags,currencies';

    return this.http
      .get<RespuestaPaisApi>(`${this.apiUrl}/alpha/${encodeURIComponent(codigo)}?fields=${campos}`)
      .pipe(
        map((respuesta) => this.formatearPais(this.normalizarRespuesta(respuesta))),
        catchError((error) => {
          if (!nombrePais) {
            return throwError(() => error);
          }

          return this.http
            .get<RespuestaPaisApi>(
              `${this.apiUrl}/name/${encodeURIComponent(nombrePais)}?fullText=true&fields=${campos}`,
            )
            .pipe(map((respuesta) => this.formatearPais(this.normalizarRespuesta(respuesta))));
        }),
      );
  }

  private normalizarRespuesta(respuesta: RespuestaPaisApi): RespuestaPaisRestCountries | undefined {
    return Array.isArray(respuesta) ? respuesta[0] : respuesta;
  }

  private formatearPais(pais?: RespuestaPaisRestCountries): PaisDetalle {
    const moneda = pais?.currencies
      ? Object.values(pais.currencies)[0]?.name ?? Object.keys(pais.currencies)[0] ?? 'No disponible'
      : 'No disponible';

    return {
      codigo: pais?.cca3 ?? '',
      nombre: pais?.name?.common ?? 'Sin nombre',
      capital: pais?.capital?.[0] ?? 'No disponible',
      bandera: pais?.flags?.png ?? pais?.flags?.svg ?? '',
      moneda,
    };
  }
}
