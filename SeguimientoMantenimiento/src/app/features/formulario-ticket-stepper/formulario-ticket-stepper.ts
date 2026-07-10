import {
  AfterViewInit,
  Component,
  OnInit,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicStepperComponent, StepItemConfig } from '../../shared/organisms/stepper/stepper';
import { User } from '../../models/interfaces/user.model';
import { Roles } from '../../models/enums/roles';
import { CatalogoStoreService } from '../../core/state/catalogo-store.service';
import { ParametroCatalogo } from '../../models/interfaces/catalogo.model';
import { CrearTicketFlowPayload } from '../../models/interfaces/ticket-workflow.model';

@Component({
  selector: 'app-formulario-ticket-stepper',
  imports: [CommonModule, ReactiveFormsModule, DynamicStepperComponent],
  templateUrl: './formulario-ticket-stepper.html',
})
export class FormularioTicketStepperComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private catalogoStore = inject(CatalogoStoreService);

  pasoDefinicion = viewChild.required<TemplateRef<unknown>>('pasoDefinicion');
  pasoCaso = viewChild.required<TemplateRef<unknown>>('pasoCaso');
  pasoClasificacion = viewChild.required<TemplateRef<unknown>>('pasoClasificacion');
  pasoAsignacion = viewChild.required<TemplateRef<unknown>>('pasoAsignacion');

  onFormComplete = output<CrearTicketFlowPayload>();
  usuariosAsignables = input<User[]>([]);
  rolActual = input<'PMO_LT' | 'DEV' | 'QA'>('DEV');
  puedeAsignarUsuarios = input(false);
  usuarioActualId = input<string>('');
  usuarioActualNombre = input<string>('Usuario');

  public formDefinicion!: FormGroup;
  public formCaso!: FormGroup;
  public formClasificacion!: FormGroup;
  public formAsignacion!: FormGroup;
  public configuracionPasos: StepItemConfig[] = [];

  public origenesTicket = computed(() => this.catalogoStore.getCatalogo('origenesTicket'));
  public tiposCaso = computed(() => this.catalogoStore.getCatalogo('tiposCaso'));
  public prioridades = computed(() => this.catalogoStore.getCatalogo('prioridades'));
  public impactos = computed(() => this.catalogoStore.getCatalogo('impactos'));
  public estadosHistoriaUsuario = computed(() => this.catalogoStore.getCatalogo('estadosHistoriaUsuario'));
  public ambientes = computed(() => this.catalogoStore.getCatalogo('ambientes'));
  public cargandoCatalogos = computed(() => this.catalogoStore.cargando());

  constructor() {
    effect(() => {
      this.aplicarCatalogosIniciales();
    });
  }

  ngOnInit(): void {
    this.formDefinicion = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
    });

    this.formCaso = this.fb.group({
      codigoCaso: ['', [Validators.required, Validators.minLength(5)]],
      origenTicket: [null, Validators.required],
    });

    this.formClasificacion = this.fb.group({
      idTipoCaso: [null, Validators.required],
      idPrioridad: [null, Validators.required],
      idImpacto: [null],
      idEstadoHistoriaUsuario: [null, Validators.required],
      historiaUsuario: [''],
      idAmbienteReportado: [null],
    });

    this.formAsignacion = this.fb.group({
      idUsuarioAsignado: [Number(this.usuarioActualId()), [Validators.required, Validators.min(1)]],
      comentarioInicial: [''],
    });

    this.aplicarCatalogosIniciales();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.configuracionPasos = [
        {
          value: 1,
          header: 'Definicion',
          template: this.pasoDefinicion(),
          isValid: this.formDefinicion.valid,
        },
        {
          value: 2,
          header: 'Caso',
          template: this.pasoCaso(),
          isValid: this.formCaso.valid,
        },
        {
          value: 3,
          header: 'Clasificacion',
          template: this.pasoClasificacion(),
          isValid: this.formClasificacion.valid,
        },
        {
          value: 4,
          header: 'Asignacion',
          template: this.pasoAsignacion(),
          isValid: this.formAsignacion.valid,
        },
      ];

      [
        this.formDefinicion,
        this.formCaso,
        this.formClasificacion,
        this.formAsignacion,
      ].forEach((form) => form.statusChanges.subscribe(() => this.actualizarEstatusPasos()));
    });
  }

  completarRegistro(): void {
    const idUsuarioAsignado = this.puedeAsignarUsuarios()
      ? Number(this.formAsignacion.value.idUsuarioAsignado)
      : Number(this.usuarioActualId());
    const esDesarrollo = this.esCasoDesarrollo();

    const backendBody = {
      codigoCaso: this.formCaso.value.codigoCaso,
      origenTicket: Number(this.formCaso.value.origenTicket) as 1 | 2,
      titulo: this.formDefinicion.value.titulo,
      descripcion: this.formDefinicion.value.descripcion,
      idUsuarioAsignado,
      esDesarrollo,
    };

    this.onFormComplete.emit({
      backendBody,
      memoria: {
        ...backendBody,
        idTipoCaso: this.toNullableNumber(this.formClasificacion.value.idTipoCaso),
        idPrioridad: this.toNullableNumber(this.formClasificacion.value.idPrioridad),
        idImpacto: this.toNullableNumber(this.formClasificacion.value.idImpacto),
        idEstadoHistoriaUsuario: this.toNullableNumber(this.formClasificacion.value.idEstadoHistoriaUsuario),
        historiaUsuario: this.toNullableString(this.formClasificacion.value.historiaUsuario),
        idAmbienteReportado: this.toNullableNumber(this.formClasificacion.value.idAmbienteReportado),
        comentarioInicial: this.toNullableString(this.formAsignacion.value.comentarioInicial),
      },
    });
  }

  public trackParametro(index: number, parametro: ParametroCatalogo): number {
    return parametro.idParametro || index;
  }

  public obtenerValorBackendOrigen(parametro: ParametroCatalogo): number {
    return Number(parametro.valor ?? parametro.idParametro);
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
    if (this.configuracionPasos.length !== 4) return;
    this.configuracionPasos[0].isValid = this.formDefinicion.valid;
    this.configuracionPasos[1].isValid = this.formCaso.valid;
    this.configuracionPasos[2].isValid = this.formClasificacion.valid;
    this.configuracionPasos[3].isValid = this.formAsignacion.valid;
  }

  private aplicarCatalogosIniciales(): void {
    this.aplicarValorInicial(this.formCaso, 'origenTicket', this.origenesTicket(), (parametro) =>
      this.obtenerValorBackendOrigen(parametro),
    );
    this.aplicarValorInicial(this.formClasificacion, 'idTipoCaso', this.tiposCaso());
    this.aplicarValorInicial(this.formClasificacion, 'idPrioridad', this.prioridades());
    this.aplicarValorInicial(this.formClasificacion, 'idEstadoHistoriaUsuario', this.estadosHistoriaUsuario());
  }

  private aplicarValorInicial(
    form: FormGroup | undefined,
    controlName: string,
    catalogo: ParametroCatalogo[],
    mapper: (parametro: ParametroCatalogo) => number = (parametro) => parametro.idParametro,
  ): void {
    if (!form || catalogo.length === 0 || form.value[controlName]) return;
    form.patchValue({ [controlName]: mapper(catalogo[0]) });
  }

  private toNullableNumber(value: unknown): number | null {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
  }

  private toNullableString(value: unknown): string | null {
    const stringValue = String(value ?? '').trim();
    return stringValue || null;
  }

  private esCasoDesarrollo(): boolean {
    const idTipoCaso = this.toNullableNumber(this.formClasificacion.value.idTipoCaso);
    const tipo = idTipoCaso ? this.catalogoStore.findById('tiposCaso', idTipoCaso) : null;
    const tiposDesarrollo = ['BUG', 'REQUERIMIENTO', 'MEJORA', 'VULNERABILIDAD'];
    return (
      tiposDesarrollo.includes(tipo?.codigo ?? '') ||
      Boolean(this.toNullableString(this.formClasificacion.value.historiaUsuario))
    );
  }
}
