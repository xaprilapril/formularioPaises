import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { ApiPaises, PaisOpcion } from '../../servicios/api-paises';
import { GuardarFormularioService } from '../../servicios/guardar-formulario.service';

@Component({
  selector: 'formulario-paises-app',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.html',
  styleUrl: './formulario.scss'
})
export class Formulario implements OnInit {
  private readonly apiPaises = inject(ApiPaises);
  private readonly guardarFormulario = inject(GuardarFormularioService);

  protected paises: PaisOpcion[] = [];
  protected cargandoPaises = false;
  protected guardando = false;
  protected mensajeExito = '';
  protected mensajeError = '';

  readonly miForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    siglas: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2), Validators.maxLength(10)] }),
    pais: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    capital: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    bandera: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    moneda: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.cargarPaises();
  }

  cargarPaises(): void {
    this.cargandoPaises = true;
    this.apiPaises
      .obtenerPaises()
      .pipe(finalize(() => {
        this.cargandoPaises = false;
      }))
      .subscribe({
        next: (paises) => {
          this.paises = paises;
        },
        error: () => {
          this.mensajeError = 'No se pudo cargar la lista de países.';
        },
      });
  }

  seleccionarPais(): void {
    const codigoPais = this.miForm.controls.pais.value;
    const paisSeleccionado = this.paises.find((pais) => pais.codigo === codigoPais);

    if (!codigoPais) {
      this.miForm.patchValue({ capital: '', bandera: '', moneda: '' });
      return;
    }

    this.mensajeError = '';
    this.apiPaises.obtenerPais(codigoPais, paisSeleccionado?.nombre).subscribe({
      next: (pais) => {
        this.miForm.patchValue({
          capital: pais.capital,
          bandera: pais.bandera,
          moneda: pais.moneda,
        });
      },
      error: () => {
        this.miForm.patchValue({ capital: '', bandera: '', moneda: '' });
        this.mensajeError = 'No se pudo obtener la información del país seleccionado.';
      },
    });
  }

  alEnviar(): void {
    if (this.miForm.invalid) {
      this.miForm.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';
    const valoresFormulario = this.miForm.getRawValue();
    const paisSeleccionado = this.paises.find((pais) => pais.codigo === valoresFormulario.pais);
    const datosParaGuardar = {
      ...valoresFormulario,
      pais: paisSeleccionado?.nombre ?? valoresFormulario.pais,
    };

    this.guardarFormulario
      .guardar(datosParaGuardar)
      .pipe(finalize(() => {
        this.guardando = false;
      }))
      .subscribe({
        next: () => {
          this.mensajeExito = 'Organización guardada correctamente.';
          this.miForm.reset({
            nombre: '',
            siglas: '',
            pais: '',
            capital: '',
            bandera: '',
            moneda: '',
          });
        },
        error: () => {
          this.mensajeError = 'No se pudo guardar la organización.';
        },
      });
  }
}
