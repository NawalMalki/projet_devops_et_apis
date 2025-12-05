import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
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
      projectId: "projet-devops-et-apis-f94a9",
      appId: "1:314168005118:web:a4aece6564590f9075b0af",
      storageBucket: "projet-devops-et-apis-f94a9.firebasestorage.app",
      apiKey: "AIzaSyBwBpnjAtxHI5dwueC4QlChjA2j3d_GSiM",
      authDomain: "projet-devops-et-apis-f94a9.firebaseapp.com",
      messagingSenderId: "314168005118",
      measurementId: "G-4RTSGDK235"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};