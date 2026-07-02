import {
  Component,
  OnInit,
  TemplateRef,
  AfterViewInit,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DynamicStepperComponent, StepItemConfig } from '../../shared/organisms/stepper/stepper';
import { CrearTicketRequestBody } from '../../models/interfaces/ticket-api.model';
import { User } from '../../models/interfaces/user.model';

@Component({
  selector: 'app-formulario-ticket-stepper',
  imports: [CommonModule, ReactiveFormsModule, DynamicStepperComponent],
  templateUrl: './formulario-ticket-stepper.html',
})
export class FormularioTicketStepperComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);

  pasoDefinicion = viewChild.required<TemplateRef<any>>('pasoDefinicion');
  pasoAsignacion = viewChild.required<TemplateRef<any>>('pasoAsignacion');

  onFormComplete = output<CrearTicketRequestBody>();
  usuariosAsignables = input<User[]>([]);
  rolActual = input<'PMO_LT' | 'DEV' | 'QA'>('DEV');
  usuarioActualId = input<string>('');
  usuarioActualNombre = input<string>('Usuario');

  public formPasoUno!: FormGroup;
  public formPasoDos!: FormGroup;

  public configuracionPasos: StepItemConfig[] = [];

  ngOnInit() {
    this.formPasoUno = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.formPasoDos = this.fb.group({
      codigoCaso: ['', [Validators.required, Validators.minLength(5)]],
      origenTicket: [1, Validators.required],
      idUsuarioAsignado: [this.usuarioActualId(), [Validators.required, Validators.min(1)]],
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.configuracionPasos = [
        {
          value: 1,
          header: 'Definición',
          template: this.pasoDefinicion(),
          isValid: this.formPasoUno.valid,
        },
        {
          value: 2,
          header: 'Asignación',
          template: this.pasoAsignacion(),
          isValid: this.formPasoDos.valid,
        },
      ];

      this.formPasoUno.statusChanges.subscribe(() => this.actualizarEstatusPasos());
      this.formPasoDos.statusChanges.subscribe(() => this.actualizarEstatusPasos());
    });
  }

  private actualizarEstatusPasos() {
    if (this.configuracionPasos.length === 2) {
      this.configuracionPasos[0].isValid = this.formPasoUno.valid;
      this.configuracionPasos[1].isValid = this.formPasoDos.valid;
    }
  }

  completarRegistro() {
    this.onFormComplete.emit({
      codigoCaso: this.formPasoDos.value.codigoCaso,
      origenTicket: Number(this.formPasoDos.value.origenTicket) as 1 | 2,
      titulo: this.formPasoUno.value.titulo,
      descripcion: this.formPasoUno.value.descripcion,
      idUsuarioAsignado: Number(this.formPasoDos.value.idUsuarioAsignado),
    });
  }

  public trackUser(_: number, user: User): string {
    return user.idUsuario;
  }

  public usuariosFiltrados(): User[] {
    const usuarios = this.usuariosAsignables();
    if (this.rolActual() === 'PMO_LT') {
      return usuarios;
    }

    const miUsuario = usuarios.find((usuario) => usuario.idUsuario === this.usuarioActualId());
    if (miUsuario) {
      return [miUsuario];
    }

    return [
      {
        idUsuario: this.usuarioActualId(),
        nombreUsuario: this.usuarioActualNombre(),
        nombres: this.usuarioActualNombre(),
        apellidos: '',
        rol: 'DESARROLLADOR' as never,
        idArea: null,
        activo: true,
        password: '',
        avatarUrl: '',
      },
    ];
  }
}
