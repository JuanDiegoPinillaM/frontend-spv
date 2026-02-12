import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'; // <--- 1. Importar withInterceptors
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptors'; // <--- 2. Importar tu interceptor

// Importar iconos (mantén esto como lo tenías)
import { FeatherModule } from 'angular-feather';
import { Home, ShoppingCart, Package, Users, LogOut, Menu, Plus, Edit, Trash2, Search, Filter } from 'angular-feather/icons';

const icons = { Home, ShoppingCart, Package, Users, LogOut, Menu, Plus, Edit, Trash2, Search, Filter };

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    
    // 👇 AQUÍ ESTÁ LA MAGIA 👇
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]) // Activamos el interceptor aquí
    ),

    importProvidersFrom(
      SweetAlert2Module.forRoot(),
      FeatherModule.pick(icons)
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};