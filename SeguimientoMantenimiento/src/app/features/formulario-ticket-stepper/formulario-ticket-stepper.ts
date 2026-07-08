import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicStepperComponent, StepItemConfig } from '../../shared/organisms/stepper/stepper';
import { CrearTicketRequestBody } from '../../models/interfaces/ticket-api.model';
import { User } from '../../models/interfaces/user.model';
import { Roles } from '../../models/enums/roles';

@Component({
  selector: 'app-formulario-ticket-stepper',
  imports: [CommonModule, ReactiveFormsModule, DynamicStepperComponent],
  templateUrl: './formulario-ticket-stepper.html',
})
export class FormularioTicketStepperComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);

  pasoDefinicion = viewChild.required<TemplateRef<unknown>>('pasoDefinicion');
  pasoAsignacion = viewChild.required<TemplateRef<unknown>>('pasoAsignacion');

  onFormComplete = output<CrearTicketRequestBody>();
  usuariosAsignables = input<User[]>([]);
  rolActual = input<'PMO_LT' | 'DEV' | 'QA'>('DEV');
  puedeAsignarUsuarios = input(false);
  usuarioActualId = input<string>('');
  usuarioActualNombre = input<string>('Usuario');

  public formPasoUno!: FormGroup;
  public formPasoDos!: FormGroup;
  public configuracionPasos: StepItemConfig[] = [];

  ngOnInit(): void {
    this.formPasoUno = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.formPasoDos = this.fb.group({
      codigoCaso: ['', [Validators.required, Validators.minLength(5)]],
      origenTicket: [1, Validators.required],
      idUsuarioAsignado: [Number(this.usuarioActualId()), [Validators.required, Validators.min(1)]],
    });
  }

  ngAfterViewInit(): void {
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

  completarRegistro(): void {
    const idUsuarioAsignado = this.puedeAsignarUsuarios()
      ? Number(this.formPasoDos.value.idUsuarioAsignado)
      : Number(this.usuarioActualId());

    this.onFormComplete.emit({
      codigoCaso: this.formPasoDos.value.codigoCaso,
      origenTicket: Number(this.formPasoDos.value.origenTicket) as 1 | 2,
      titulo: this.formPasoUno.value.titulo,
      descripcion: this.formPasoUno.value.descripcion,
      idUsuarioAsignado,
    });
  }

  public trackUser(index: number, user: User): string {
    return user.idUsuario || `usuario-${index}`;
  }

  public usuariosFiltrados(): User[] {
    if (this.puedeAsignarUsuarios()) {
      return this.usuariosAsignables();
    }

    const miUsuario = this.usuariosAsignables().find(
      (usuario) => usuario.idUsuario === this.usuarioActualId(),
    );

    if (miUsuario) return [miUsuario];

    return [
      {
        idUsuario: this.usuarioActualId(),
        nombreUsuario: this.usuarioActualNombre(),
        nombres: this.usuarioActualNombre(),
        apellidos: '',
        rol: Roles.Desarrollador,
        idArea: null,
        activo: true,
        bloqueado: false,
        password: '',
        avatarUrl: '',
      },
    ];
  }

  private actualizarEstatusPasos(): void {
    if (this.configuracionPasos.length === 2) {
      this.configuracionPasos[0].isValid = this.formPasoUno.valid;
      this.configuracionPasos[1].isValid = this.formPasoDos.valid;
    }
  }
}
