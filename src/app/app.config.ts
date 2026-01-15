import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(), 
    provideFirebaseApp(() => initializeApp({
      projectId: "projet-devops-et-apis-7dbab",
      appId: "1:446629304058:web:c9fe26577f1751ce1b9b43",
      storageBucket: "projet-devops-et-apis-7dbab.firebasestorage.app",
      apiKey: "AIzaSyCmxQWaGi9-Ntt2UW_wVxHbHgLqcW-15AE",
      authDomain: "projet-devops-et-apis-7dbab.firebaseapp.com",
      messagingSenderId: "446629304058",
      measurementId: "G-XVMX0WCX1G"
    })),
  
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}
