import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(), 
    provideFirebaseApp(() => initializeApp({
      projectId: "projet-devops-et-apis-f9524",
      appId: "1:704851120956:web:eb2cd9d935bf18e9110439",
      storageBucket: "projet-devops-et-apis-f9524.firebasestorage.app",
      apiKey: "AIzaSyCqvdelOGIkAIToFjdU7rbeZRNdXEy72-I",
      authDomain: "projet-devops-et-apis-f9524.firebaseapp.com",
      messagingSenderId: "704851120956"
    })),
  
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideMessaging(() => getMessaging()),
    provideHttpClient(withInterceptorsFromDi()),
  ],
}
