import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AplicativoService } from '../../core/services/aplicativo.service';
import { RepositorioRamaService } from '../../core/services/repositorio-rama';
import { AplicacionRepositorioStoreService } from '../../core/state/aplicacion-repositorio-store.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Aplicativo } from '../../models/interfaces/aplicativo.model';
import { Repository } from '../../models/interfaces/repository.model';
import { canManageApplications } from '../../models/utils/role.utils';

@Component({
  selector: 'app-application-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './application-management.html',
})
export class ApplicationManagementComponent implements OnInit {
  private aplicativoService = inject(AplicativoService);
  private repositorioRamaService = inject(RepositorioRamaService);
  private aplicacionRepositorioStore = inject(AplicacionRepositorioStoreService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  public aplicativos = signal<Aplicativo[]>([]);
  public repositorios = signal<Repository[]>([]);
  public selectedAplicativoId = signal<string | null>(null);
  public isLoading = signal(false);

  public form = {
    nombre: '',
    descripcion: '',
  };

  public puedeAdministrar = computed(() => canManageApplications(this.authService.currentRole()));
  public selectedAplicativo = computed(() =>
    this.aplicativos().find((aplicativo) => aplicativo.idAplicativo === this.selectedAplicativoId()) ?? null,
  );
  public repositoriosSeleccionados = computed(() =>
    new Set(this.aplicacionRepositorioStore.obtenerRepositorios(this.selectedAplicativoId())),
  );

  ngOnInit(): void {
    if (!this.puedeAdministrar()) return;
    this.cargarDatos();
  }

  crearAplicativo(): void {
    const nombre = this.form.nombre.trim();
    if (!nombre) {
      this.toastService.warning('application-name-required', 'Nombre requerido', 'Indica el nombre de la aplicacion.');
      return;
    }

    this.isLoading.set(true);
    this.aplicativoService
      .createAplicativo({
        nombre,
        descripcion: this.form.descripcion.trim() || null,
      })
      .subscribe({
        next: (idAplicativo) => {
          const nuevo: Aplicativo = {
            idAplicativo,
            nombre,
            descripcion: this.form.descripcion.trim() || null,
            activo: true,
          };
          this.aplicativos.update((items) => [nuevo, ...items]);
          this.selectedAplicativoId.set(idAplicativo);
          this.form = { nombre: '', descripcion: '' };
          this.toastService.success('application-created', 'Aplicacion creada', 'Ya puedes asociar repositorios.');
        },
        error: () => {
          this.toastService.error('application-create-error', 'No se pudo crear la aplicacion');
        },
        complete: () => this.isLoading.set(false),
      });
  }

  seleccionarAplicativo(idAplicativo: string): void {
    this.selectedAplicativoId.set(idAplicativo);
  }

  toggleRepositorio(idRepositorio: string, checked: boolean): void {
    const idAplicativo = this.selectedAplicativoId();
    if (!idAplicativo) return;

    const current = new Set(this.aplicacionRepositorioStore.obtenerRepositorios(idAplicativo));
    if (checked) current.add(idRepositorio);
    else current.delete(idRepositorio);

    this.aplicacionRepositorioStore.guardarRepositorios(idAplicativo, [...current]);
  }

  isRepositorioRelacionado(idRepositorio: string): boolean {
    return this.repositoriosSeleccionados().has(idRepositorio);
  }

  repositoriosRelacionadosCount(aplicativo: Aplicativo): number {
    return this.aplicacionRepositorioStore.obtenerRepositorios(aplicativo.idAplicativo).length;
  }

  private cargarDatos(): void {
    this.isLoading.set(true);
    this.aplicativoService.getAplicativos(true).subscribe({
      next: (aplicativos) => {
        this.aplicativos.set(aplicativos);
        if (!this.selectedAplicativoId() && aplicativos.length) {
          this.selectedAplicativoId.set(aplicativos[0].idAplicativo);
        }
      },
      complete: () => this.isLoading.set(false),
    });

    this.repositorioRamaService.getRepositorios().subscribe({
      next: (repositorios) => this.repositorios.set(repositorios),
    });
  }
}
