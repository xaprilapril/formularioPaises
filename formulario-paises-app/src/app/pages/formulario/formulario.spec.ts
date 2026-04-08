import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { ApiPaises } from '../../servicios/api-paises';
import { GuardarFormularioService } from '../../servicios/guardar-formulario.service';
import { Formulario } from './formulario';

describe('Formulario', () => {
  let component: Formulario;
  let fixture: ComponentFixture<Formulario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        {
          provide: ApiPaises,
          useValue: {
            obtenerPaises: () => of([{ codigo: 'COL', nombre: 'Colombia' }]),
            obtenerPais: () => of({ codigo: 'COL', nombre: 'Colombia', capital: 'Bogotá', bandera: '', moneda: 'Peso colombiano' }),
          },
        },
        {
          provide: GuardarFormularioService,
          useValue: {
            guardar: () => of({ mensaje: 'OK' }),
          },
        },
      ],
      imports: [Formulario],
    }).compileComponents();

    fixture = TestBed.createComponent(Formulario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
