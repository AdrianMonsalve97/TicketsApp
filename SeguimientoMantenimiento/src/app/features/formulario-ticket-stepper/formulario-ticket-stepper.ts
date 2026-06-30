import {
  Component,
  OnInit,
  ViewChild,
  TemplateRef,
  AfterViewInit,
  inject,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DynamicStepperComponent, StepItemConfig } from '../../shared/organism/stepper/stepper';
import { TicketStatus } from '../../models/enums/ticket-status';


@Component({
  selector: 'app-formulario-ticket-stepper',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DynamicStepperComponent],
  templateUrl: './formulario-ticket-stepper.html',
})
export class FormularioTicketStepperComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);

  @ViewChild('pasoDefinicion') pasoDefinicion!: TemplateRef<any>;
  @ViewChild('pasoInfraestructura') pasoInfraestructura!: TemplateRef<any>;
  @ViewChild('pasoAsignacion') pasoAsignacion!: TemplateRef<any>;
  @ViewChild('pasoSoporte') pasoSoporte!: TemplateRef<any>;

  @Output() onFormComplete = new EventEmitter<any>();

  public formPasoUno!: FormGroup;
  public formPasoDos!: FormGroup;
  public formPasoTres!: FormGroup;
  public formPasoFour!: FormGroup;

  public configuracionPasos: StepItemConfig[] = [];
  public listaEstados = Object.values(TicketStatus);

  ngOnInit() {
    this.formPasoUno = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      historiaUsuario: [''], // Sin validadores mecánicos
    });

    this.formPasoDos = this.fb.group({
      carpetaMedios: ['/medios/tickets/', Validators.required],
      repositorioId: ['', Validators.required],
    });

    this.formPasoTres = this.fb.group({
      estadoActual: [TicketStatus.EN_ANALISIS, Validators.required],
      desarrolladorAsignadoId: ['', Validators.required],
      qaAsignadoId: ['', Validators.required],
      ltAsignadoId: ['', Validators.required],
    });

    this.formPasoFour = this.fb.group({
      causaRaiz: ['', [Validators.required, Validators.minLength(10)]],
      solucionPropuesta: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.configuracionPasos = [
        {
          value: 1,
          header: 'Definición',
          template: this.pasoDefinicion,
          isValid: this.formPasoUno.valid,
        },
        {
          value: 2,
          header: 'Infraestructura',
          template: this.pasoInfraestructura,
          isValid: this.formPasoDos.valid,
        },
        {
          value: 3,
          header: 'Asignación',
          template: this.pasoAsignacion,
          isValid: this.formPasoTres.valid,
        },
        {
          value: 4,
          header: 'Soporte',
          template: this.pasoSoporte,
          isValid: this.formPasoFour.valid,
        },
      ];

      this.formPasoUno.statusChanges.subscribe(() => this.actualizarEstatusPasos());
      this.formPasoDos.statusChanges.subscribe(() => this.actualizarEstatusPasos());
      this.formPasoTres.statusChanges.subscribe(() => this.actualizarEstatusPasos());
      this.formPasoFour.statusChanges.subscribe(() => this.actualizarEstatusPasos());
    });
  }

  private actualizarEstatusPasos() {
    if (this.configuracionPasos.length === 4) {
      this.configuracionPasos[0].isValid = this.formPasoUno.valid;
      this.configuracionPasos[1].isValid = this.formPasoDos.valid;
      this.configuracionPasos[2].isValid = this.formPasoTres.valid;
      this.configuracionPasos[3].isValid = this.formPasoFour.valid;
    }
  }

  completarRegistro() {
    const randomId = Math.floor(1000 + Math.random() * 9000);

    const valHU = this.formPasoUno.value.historiaUsuario;

    const payload = {
      ...this.formPasoUno.value,
      ...this.formPasoDos.value,
      ...this.formPasoTres.value,
      ...this.formPasoFour.value,
      historiaUsuario: valHU && valHU.trim() !== '' ? valHU.trim() : null,
      idTicket: `TCK-${randomId}`,
      codigoCaso: `CASE-2026-${randomId}`,
      idUsuarioAsignado: 101,
      fechaAsignacion: new Date(),
      fechaUltimaActualizacion: new Date(),
      repositoriosAfectados: [
        {
          id: this.formPasoDos.value.repositorioId,
          nombre: `REPO_${this.formPasoDos.value.repositorioId}_CORE`,
          tipo: 'API',
        },
      ],
      historial: [],
    };

    this.onFormComplete.emit(payload);
  }
}
