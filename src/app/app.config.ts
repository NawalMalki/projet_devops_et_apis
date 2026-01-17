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
      apiKey: "AIzaSyBgKI1y53L3RdAwMJrgheFES_FXdCblD70",
  authDomain: "projet-devops-et-apis-e5a1e.firebaseapp.com",
  projectId: "projet-devops-et-apis-e5a1e",
  storageBucket: "projet-devops-et-apis-e5a1e.firebasestorage.app",
  messagingSenderId: "546958526888",
  appId: "1:546958526888:web:69e78c326b9accedd1359d",
  measurementId: "G-75EC11N1F8"
    })),
  
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}
