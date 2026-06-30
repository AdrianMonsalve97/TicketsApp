import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import Nora from '@primeuix/themes/nora';
import { definePreset } from '@primeuix/themes';

export const InterTheme = definePreset(Nora, {
  semantic: {
    primary: {
      50: '#FEFEFE',
      100: '#F9F9F9',
      200: '#F0F0F0',
      300: '#E0E0E0',
      400: '#929292',
      500: '#727272',
      600: '#575757',
      700: '#3B4350',
      800: '#2C323A',
      900: '#212529',
      950: '#141619',
    },
    colorScheme: {
      light: {
        surface: {
          50: '#FEFEFE',
          100: '#F9F9F9',
          200: '#F0F0F0',
          300: '#E0E0E0',
          400: '#929292',
          500: '#727272',
          600: '#575757',
          700: '#3B4350',
          800: '#2C323A',
          900: '#212529',
          950: '#141619',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: InterTheme,
        options: {
          darkModeSelector: 'none',
        },
      },
    }),
  ],
};
