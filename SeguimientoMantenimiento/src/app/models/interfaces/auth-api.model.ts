export type BackendRol = 'Desarrollador' | 'QA' | 'LiderTecnico' | 'Planner';

export interface LoginResponseDto {
  token: string;
  fechaExpiracion: string;
  usuario: {
    idUsuario: number;
    nombreUsuario: string;
    nombres: string;
    rol: BackendRol;
    area?: string | null;
    debeCambiarContrasena?: boolean;
  };
}
