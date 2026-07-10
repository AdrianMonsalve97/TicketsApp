import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, input, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketStatus } from '../../models/enums/ticket-status';
import { Ticket } from '../../models/interfaces/ticket.model';
import { User } from '../../models/interfaces/user.model';
import { ActualizarTicketRequestBody } from '../../models/interfaces/ticket-api.model';
import {
  ActualizarTicketMemoria,
  ActualizarTicketMemoriaPaso,
  TicketWorkflowMemoryRecord,
} from '../../models/interfaces/ticket-workflow.model';
import { CatalogoStoreService } from '../../core/state/catalogo-store.service';
import { ParametroCatalogo } from '../../models/interfaces/catalogo.model';
import { RepositorioRamaService } from '../../core/services/repositorio-rama';
import { AplicativoService } from '../../core/services/aplicativo.service';
import { AplicacionRepositorioStoreService } from '../../core/state/aplicacion-repositorio-store.service';
import { Repository } from '../../models/interfaces/repository.model';
import { RamasModel } from '../../models/interfaces/ramas.model';
import { Aplicativo } from '../../models/interfaces/aplicativo.model';

export interface ActualizarTicketStepSave {
  paso: ActualizarTicketMemoriaPaso;
  ticket: Ticket;
  updatedTicket: Ticket;
  backendBody: ActualizarTicketRequestBody;
  memoria: ActualizarTicketMemoria;
  aplicativoAsignado?: {
    idAplicativo: string;
  } | null;
  ramaAsignada?: {
    idRepositorio: string;
    idRama: string;
  } | null;
}

interface ActualizarStepConfig {
  id: ActualizarTicketMemoriaPaso;
  label: string;
  description: string;
}

@Component({
  selector: 'app-actualizar-ticket-stepper',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './actualizar-ticket-stepper.html',
})
export class ActualizarTicketStepperComponent implements OnInit {
  private fb = inject(FormBuilder);
  private catalogoStore = inject(CatalogoStoreService);
  private repositorioRamaService = inject(RepositorioRamaService);
  private aplicativoService = inject(AplicativoService);
  private aplicacionRepositorioStore = inject(AplicacionRepositorioStoreService);

  ticket = input.required<Ticket>();
  usuariosAsignables = input<User[]>([]);
  estadosDisponibles = input<TicketStatus[]>([]);
  puedeEditarDefinicion = input(false);
  puedeReasignar = input(false);
  puedeCambiarEstado = input(false);
  puedeEditarDiagnostico = input(false);
  puedeSeleccionarDependencias = input(false);
  puedePersistirDependencias = input(false);
  puedePersistirRepositorios = input(false);
  usuarioFirmaIdNumero = input(0);
  usuarioNombre = input('Usuario');
  memoriaTicket = input<TicketWorkflowMemoryRecord | null>(null);

  onStepSave = output<ActualizarTicketStepSave>();
  onCancel = output<void>();

  public activeStep: ActualizarTicketMemoriaPaso = 'definicion';
  public definicionForm!: FormGroup;
  public asignacionForm!: FormGroup;
  public diagnosticoForm!: FormGroup;
  public solucionForm!: FormGroup;
  public validacionForm!: FormGroup;
  public conocimientoForm!: FormGroup;
  public aplicativos: Aplicativo[] = [];
  public repositorios: Repository[] = [];
  public repositoriosDiagnostico: Repository[] = [];
  public ramasRepositorio: RamasModel[] = [];

  public severidades = computed(() => this.catalogoStore.getCatalogo('severidades'));
  public estadosHistoriaUsuario = computed(() => this.catalogoStore.getCatalogo('estadosHistoriaUsuario'));
  public ambientes = computed(() => this.catalogoStore.getCatalogo('ambientes'));
  public riesgosCambio = computed(() => this.catalogoStore.getCatalogo('riesgosCambio'));
  public resultadosValidacion = computed(() => this.catalogoStore.getCatalogo('resultadosValidacion'));
  public categoriasConocimiento = computed(() => this.catalogoStore.getCatalogo('categoriasConocimiento'));
  public estadosArticuloConocimiento = computed(() => this.catalogoStore.getCatalogo('estadosArticuloConocimiento'));
  public nivelesReutilizacion = computed(() => this.catalogoStore.getCatalogo('nivelesReutilizacionConocimiento'));

  public steps: ActualizarStepConfig[] = [
    { id: 'definicion', label: 'Definicion', description: 'Titulo y descripcion' },
    { id: 'asignacion', label: 'Gestion', description: 'Estado y responsable' },
    { id: 'diagnostico', label: 'Diagnostico', description: 'Causa y sintomas' },
    { id: 'solucion', label: 'Solucion', description: 'Plan tecnico' },
    { id: 'validacion', label: 'Validacion', description: 'Resultado QA' },
    { id: 'conocimiento', label: 'Conocimiento', description: 'Diccionario tecnico' },
  ];

  ngOnInit(): void {
    const ticket = this.ticket();
    const memory = this.memoriaTicket();
    const latest = this.getConsolidatedUpdate(memory);

    this.definicionForm = this.fb.group({
      titulo: [{ value: ticket.titulo, disabled: !this.puedeEditarDefinicion() }, [Validators.required, Validators.minLength(5)]],
      descripcion: [{ value: ticket.descripcion, disabled: !this.puedeEditarDefinicion() }, [Validators.required, Validators.minLength(10)]],
      esDesarrollo: [
        latest?.esDesarrollo ?? ticket.esDesarrollo ?? Boolean(ticket.nombreHu ?? ticket.historiaUsuario),
      ],
      idEstadoHistoriaUsuario: [
        latest?.idEstadoHistoriaUsuario ?? memory?.creacion.idEstadoHistoriaUsuario ?? null,
      ],
      historiaUsuario: [
        latest?.historiaUsuario ?? ticket.nombreHu ?? ticket.historiaUsuario ?? memory?.creacion.historiaUsuario ?? '',
      ],
      urlHu: [
        latest?.urlHu ?? ticket.urlHu ?? '',
      ],
      carpetaMedios: [
        latest?.carpetaMedios ?? ticket.carpetaMedios ?? '',
      ],
    });

    this.asignacionForm = this.fb.group({
      estadoActual: [{ value: ticket.estadoActual, disabled: !this.puedeCambiarEstado() }, Validators.required],
      idUsuarioAsignado: [{ value: Number(ticket.idUsuarioAsignado), disabled: !this.puedeReasignar() }, [Validators.required, Validators.min(1)]],
      comentario: [''],
    });

    this.diagnosticoForm = this.fb.group({
      sintomaConfirmado: [''],
      pasosReproduccion: [''],
      idAmbienteConfirmado: [null],
      idSeveridadDefecto: [null],
      idAplicativo: [{ value: null, disabled: !this.puedeSeleccionarDependencias() }],
      idRepositorio: [{ value: null, disabled: !this.puedeSeleccionarDependencias() }],
      idRama: [{ value: null, disabled: !this.puedeSeleccionarDependencias() }],
      causaRaiz: [{ value: ticket.causaRaiz ?? '', disabled: !this.puedeEditarDiagnostico() }],
      comentario: [''],
    });

    this.solucionForm = this.fb.group({
      solucionPropuesta: [{ value: ticket.solucionPropuesta ?? '', disabled: !this.puedeEditarDiagnostico() }],
      solucionAplicada: [''],
      pullRequestUrl: [''],
      commitId: [''],
      requiereDespliegue: [false],
      idRiesgoCambio: [null],
      observacionesTecnicas: [''],
      comentario: [''],
    });

    if (this.puedeSeleccionarDependencias()) {
      this.cargarAplicativos();
      this.cargarRepositorios();
      this.diagnosticoForm.get('idAplicativo')?.valueChanges.subscribe((idAplicativo) => {
        this.diagnosticoForm.patchValue({ idRepositorio: null, idRama: null }, { emitEvent: false });
        this.filtrarRepositoriosPorAplicativo(idAplicativo);
      });
      this.diagnosticoForm.get('idRepositorio')?.valueChanges.subscribe((idRepositorio) => {
        this.diagnosticoForm.patchValue({ idRama: null }, { emitEvent: false });
        this.cargarRamasRepositorio(idRepositorio);
      });
    }

    this.validacionForm = this.fb.group({
      idResultadoValidacion: [null],
      idAmbienteValidado: [null],
      observacionesQa: [''],
      comentario: [''],
    });

    this.conocimientoForm = this.fb.group({
      idCategoriaConocimiento: [null],
      idEstadoArticuloConocimiento: [null],
      resumenConocimiento: [''],
      recomendacionFutura: [''],
      idNivelReutilizacion: [null],
      tags: [''],
      casosRelacionados: [''],
      comentario: [''],
    });
  }

  setStep(step: ActualizarTicketMemoriaPaso): void {
    this.activeStep = step;
  }

  guardarPaso(step: ActualizarTicketMemoriaPaso): void {
    const source = this.ticket();
    const updatedTicket = this.buildUpdatedTicket(source, step);
    const backendBody = this.buildBackendBody(source, updatedTicket, step);
    const memoria = this.buildMemoria(updatedTicket, step);

    this.onStepSave.emit({
      paso: step,
      ticket: source,
      updatedTicket,
      backendBody,
      memoria,
      aplicativoAsignado: this.buildAplicativoAsignado(step),
      ramaAsignada: this.buildRamaAsignada(step),
    });
  }

  get activeStepConfig(): ActualizarStepConfig {
    return this.steps.find((step) => step.id === this.activeStep) ?? this.steps[0];
  }

  trackParametro(index: number, parametro: ParametroCatalogo): number {
    return parametro.idParametro || index;
  }

  trackUser(index: number, user: User): string {
    return user.idUsuario || `usuario-${index}`;
  }

  private buildUpdatedTicket(source: Ticket, step: ActualizarTicketMemoriaPaso): Ticket {
    const ticket: Ticket = {
      ...source,
      fechaUltimaActualizacion: new Date(),
    };

    if (step === 'definicion') {
      const value = this.definicionForm.getRawValue();
      ticket.titulo = value.titulo;
      ticket.descripcion = value.descripcion;
      ticket.esDesarrollo = this.tieneDatosDesarrollo(value);
      ticket.historiaUsuario = this.toNullableString(value.historiaUsuario) ?? undefined;
      ticket.nombreHu = ticket.historiaUsuario;
      ticket.urlHu = this.toNullableString(value.urlHu) ?? undefined;
      ticket.carpetaMedios = this.toNullableString(value.carpetaMedios) ?? undefined;
    }

    if (step === 'asignacion') {
      const value = this.asignacionForm.getRawValue();
      ticket.estadoActual = value.estadoActual;
      ticket.idUsuarioAsignado = Number(value.idUsuarioAsignado);
    }

    if (step === 'diagnostico') {
      ticket.causaRaiz = this.toNullableString(this.diagnosticoForm.getRawValue().causaRaiz) ?? undefined;
    }

    if (step === 'solucion') {
      ticket.solucionPropuesta = this.toNullableString(this.solucionForm.getRawValue().solucionPropuesta) ?? undefined;
    }

    return ticket;
  }

  private buildBackendBody(
    source: Ticket,
    updatedTicket: Ticket,
    step: ActualizarTicketMemoriaPaso,
  ): ActualizarTicketRequestBody {
    const body: ActualizarTicketRequestBody = {};

    if (step === 'definicion' && this.puedeEditarDefinicion()) {
      if (updatedTicket.titulo !== source.titulo) body.titulo = updatedTicket.titulo;
      if (updatedTicket.descripcion !== source.descripcion) body.descripcion = updatedTicket.descripcion;
    }

    if (step === 'definicion') {
      const value = this.definicionForm.getRawValue();
      const esDesarrollo = this.tieneDatosDesarrollo(value);
      const nombreHu = this.toNullableString(value.historiaUsuario);
      const urlHu = this.toNullableString(value.urlHu);
      const carpetaMedios = this.toNullableString(value.carpetaMedios);

      if (esDesarrollo !== Boolean(source.esDesarrollo)) body.esDesarrollo = esDesarrollo;
      if ((nombreHu ?? '') !== (source.nombreHu ?? source.historiaUsuario ?? '')) body.nombreHu = nombreHu;
      if ((urlHu ?? '') !== (source.urlHu ?? '')) body.urlHu = urlHu;
      if ((carpetaMedios ?? '') !== (source.carpetaMedios ?? '')) body.carpetaMedios = carpetaMedios;

      if ((body.nombreHu || body.urlHu || body.carpetaMedios) && body.esDesarrollo === undefined && !source.esDesarrollo) {
        body.esDesarrollo = true;
      }
    }

    if (step === 'asignacion') {
      const value = this.asignacionForm.getRawValue();
      if (this.puedeCambiarEstado() && updatedTicket.estadoActual !== source.estadoActual) {
        body.nuevoEstado = this.toBackendStatus(updatedTicket.estadoActual);
      }
      if (this.puedeReasignar() && Number(updatedTicket.idUsuarioAsignado) !== Number(source.idUsuarioAsignado)) {
        body.idUsuarioAsignado = Number(updatedTicket.idUsuarioAsignado);
      }
      if (this.toNullableString(value.comentario)) {
        body.comentario = this.toNullableString(value.comentario);
      }
    }

    if (step === 'diagnostico' && this.puedeEditarDiagnostico()) {
      const value = this.diagnosticoForm.getRawValue();
      if ((updatedTicket.causaRaiz ?? '') !== (source.causaRaiz ?? '')) {
        body.causaRaiz = updatedTicket.causaRaiz ?? null;
      }
      if (this.toNullableString(value.comentario)) {
        body.comentario = this.toNullableString(value.comentario);
      }
    }

    if (step === 'solucion' && this.puedeEditarDiagnostico()) {
      const value = this.solucionForm.getRawValue();
      if ((updatedTicket.solucionPropuesta ?? '') !== (source.solucionPropuesta ?? '')) {
        body.solucionPropuesta = updatedTicket.solucionPropuesta ?? null;
      }
      if (this.toNullableString(value.comentario)) {
        body.comentario = this.toNullableString(value.comentario);
      }
    }

    if (step === 'validacion') {
      const value = this.validacionForm.getRawValue();
      if (this.toNullableString(value.comentario)) {
        body.comentario = this.toNullableString(value.comentario);
      }
    }

    if (step === 'conocimiento') {
      const value = this.conocimientoForm.getRawValue();
      if (this.toNullableString(value.comentario)) {
        body.comentario = this.toNullableString(value.comentario);
      }
    }

    return body;
  }

  private buildMemoria(ticket: Ticket, step: ActualizarTicketMemoriaPaso): ActualizarTicketMemoria {
    const base: ActualizarTicketMemoria = {
      fechaActualizacion: new Date().toISOString(),
      paso: step,
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      idEstadoHistoriaUsuario: this.toNullableNumber(this.definicionForm.getRawValue().idEstadoHistoriaUsuario),
      historiaUsuario: this.toNullableString(this.definicionForm.getRawValue().historiaUsuario),
      esDesarrollo: this.tieneDatosDesarrollo(this.definicionForm.getRawValue()),
      urlHu: this.toNullableString(this.definicionForm.getRawValue().urlHu),
      carpetaMedios: this.toNullableString(this.definicionForm.getRawValue().carpetaMedios),
      estadoActual: ticket.estadoActual,
      idUsuarioAsignado: Number(ticket.idUsuarioAsignado),
    };

    if (step === 'diagnostico') {
      const value = this.diagnosticoForm.getRawValue();
      return {
        ...base,
        sintomaConfirmado: this.toNullableString(value.sintomaConfirmado),
        pasosReproduccion: this.toNullableString(value.pasosReproduccion),
        idAmbienteConfirmado: this.toNullableNumber(value.idAmbienteConfirmado),
        idSeveridadDefecto: this.toNullableNumber(value.idSeveridadDefecto),
        idAplicativo: this.toNullableString(value.idAplicativo),
        idRepositorio: this.toNullableString(value.idRepositorio),
        idRama: this.toNullableString(value.idRama),
        causaRaiz: this.toNullableString(value.causaRaiz),
        comentario: this.toNullableString(value.comentario),
      };
    }

    if (step === 'solucion') {
      const value = this.solucionForm.getRawValue();
      return {
        ...base,
        solucionPropuesta: this.toNullableString(value.solucionPropuesta),
        solucionAplicada: this.toNullableString(value.solucionAplicada),
        pullRequestUrl: this.toNullableString(value.pullRequestUrl),
        commitId: this.toNullableString(value.commitId),
        requiereDespliegue: Boolean(value.requiereDespliegue),
        idRiesgoCambio: this.toNullableNumber(value.idRiesgoCambio),
        observacionesTecnicas: this.toNullableString(value.observacionesTecnicas),
        comentario: this.toNullableString(value.comentario),
      };
    }

    if (step === 'validacion') {
      const value = this.validacionForm.getRawValue();
      return {
        ...base,
        idResultadoValidacion: this.toNullableNumber(value.idResultadoValidacion),
        idAmbienteValidado: this.toNullableNumber(value.idAmbienteValidado),
        observacionesQa: this.toNullableString(value.observacionesQa),
        comentario: this.toNullableString(value.comentario),
      };
    }

    if (step === 'conocimiento') {
      const value = this.conocimientoForm.getRawValue();
      return {
        ...base,
        idCategoriaConocimiento: this.toNullableNumber(value.idCategoriaConocimiento),
        idEstadoArticuloConocimiento: this.toNullableNumber(value.idEstadoArticuloConocimiento),
        resumenConocimiento: this.toNullableString(value.resumenConocimiento),
        recomendacionFutura: this.toNullableString(value.recomendacionFutura),
        idNivelReutilizacion: this.toNullableNumber(value.idNivelReutilizacion),
        tags: this.toList(value.tags),
        casosRelacionados: this.toList(value.casosRelacionados),
        comentario: this.toNullableString(value.comentario),
      };
    }

    const comentario =
      step === 'asignacion'
        ? this.toNullableString(this.asignacionForm.getRawValue().comentario)
        : null;

    return {
      ...base,
      causaRaiz: ticket.causaRaiz ?? null,
      solucionPropuesta: ticket.solucionPropuesta ?? null,
      comentario,
    };
  }

  private toNullableNumber(value: unknown): number | null {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : null;
  }

  private toNullableString(value: unknown): string | null {
    const stringValue = String(value ?? '').trim();
    return stringValue || null;
  }

  private toList(value: unknown): string[] | null {
    const items = String(value ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return items.length ? items : null;
  }

  private buildRamaAsignada(step: ActualizarTicketMemoriaPaso): { idRepositorio: string; idRama: string } | null {
    if (step !== 'diagnostico' || !this.puedePersistirRepositorios()) return null;
    const value = this.diagnosticoForm.getRawValue();
    const idRepositorio = this.toNullableString(value.idRepositorio);
    const idRama = this.toNullableString(value.idRama);
    return idRepositorio && idRama ? { idRepositorio, idRama } : null;
  }

  private buildAplicativoAsignado(step: ActualizarTicketMemoriaPaso): { idAplicativo: string } | null {
    if (step !== 'diagnostico' || !this.puedePersistirDependencias()) return null;
    const idAplicativo = this.toNullableString(this.diagnosticoForm.getRawValue().idAplicativo);
    return idAplicativo ? { idAplicativo } : null;
  }

  private cargarAplicativos(): void {
    this.aplicativoService.getAplicativos(false).subscribe({
      next: (aplicativos) => {
        this.aplicativos = aplicativos.filter((aplicativo) => aplicativo.activo);
      },
    });
  }

  private cargarRepositorios(): void {
    this.repositorioRamaService.getRepositorios().subscribe({
      next: (repositorios) => {
        this.repositorios = repositorios;
        this.filtrarRepositoriosPorAplicativo(this.diagnosticoForm?.getRawValue().idAplicativo);
      },
    });
  }

  private filtrarRepositoriosPorAplicativo(idAplicativo: string | null | undefined): void {
    this.repositoriosDiagnostico =
      this.aplicacionRepositorioStore.obtenerRepositoriosRelacionados(idAplicativo, this.repositorios);
  }

  private cargarRamasRepositorio(idRepositorio: string | null | undefined): void {
    if (!idRepositorio) {
      this.ramasRepositorio = [];
      return;
    }

    this.repositorioRamaService.getRamas(idRepositorio).subscribe({
      next: (ramas) => {
        this.ramasRepositorio = ramas;
      },
      error: () => {
        this.ramasRepositorio = [];
      },
    });
  }

  private tieneDatosDesarrollo(value: {
    esDesarrollo?: boolean;
    historiaUsuario?: unknown;
    urlHu?: unknown;
    carpetaMedios?: unknown;
  }): boolean {
    return Boolean(
      value.esDesarrollo ||
        this.toNullableString(value.historiaUsuario) ||
        this.toNullableString(value.urlHu) ||
        this.toNullableString(value.carpetaMedios),
    );
  }

  private toBackendStatus(status: TicketStatus) {
    const statuses: Record<TicketStatus, ActualizarTicketRequestBody['nuevoEstado']> = {
      [TicketStatus.EN_ANALISIS]: 'EnAnalisis',
      [TicketStatus.EN_PROCESO]: 'EnProceso',
      [TicketStatus.BLOQUEO]: 'Bloqueado',
      [TicketStatus.ENTREGADO_A_LT]: 'Entregado',
      [TicketStatus.DESPLIEGUE_A_DESARROLLO]: 'DespliegueApitesting',
      [TicketStatus.EN_REVISION_DESARROLLO]: 'EnRevisionApitesting',
      [TicketStatus.APROBADO_PARA_QA]: 'AprobadoApitesting',
      [TicketStatus.DESPLIEGUE_A_QA]: 'DespligueQA',
      [TicketStatus.EN_REVISION_QA]: 'EnRevisionQA',
      [TicketStatus.APROBADO_QA]: 'AprobadoQA',
      [TicketStatus.PENDIENTE_CERTIFICACION]: 'PendienteCertificacion',
      [TicketStatus.CERTIFICADO]: 'Certificado',
      [TicketStatus.DESPLIEGUE_A_PRODUCCION]: 'DespliegueProduccion',
      [TicketStatus.FINALIZADO]: 'Certificado',
      [TicketStatus.DEVUELTO]: 'BUG',
      [TicketStatus.ROLLBACK]: 'Rollback',
    };

    return statuses[status] ?? 'EnAnalisis';
  }

  private getConsolidatedUpdate(memory: TicketWorkflowMemoryRecord | null): ActualizarTicketMemoria | null {
    if (!memory?.actualizaciones.length) return null;

    return memory.actualizaciones.reduce<ActualizarTicketMemoria>(
      (acumulado, actualizacion) => ({
        ...acumulado,
        ...actualizacion,
        fechaActualizacion: actualizacion.fechaActualizacion,
        paso: actualizacion.paso,
      }),
      {
        fechaActualizacion: new Date().toISOString(),
        paso: 'definicion',
      },
    );
  }
}
