import type { ApplicationConfig } from "@angular/core"
import { provideRouter } from "@angular/router"
import { provideAnimations } from "@angular/platform-browser/animations"
import { provideFirebaseApp, initializeApp } from "@angular/fire/app"
import { provideAuth, getAuth } from "@angular/fire/auth"
import { routes } from "./app.routes"
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http"

const firebaseConfig = {
  apiKey: "AIzaSyBgKI1y53L3RdAwMJrgheFES_FXdCblD70",
  authDomain: "projet-devops-et-apis-e5a1e.firebaseapp.com",
  projectId: "projet-devops-et-apis-e5a1e",
  storageBucket: "projet-devops-et-apis-e5a1e.appspot.com",
  messagingSenderId: "546958526888",
  appId: "1:546958526888:web:69e78c326b9accedd1359d",
  measurementId: "G-75EC11N1F8",
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi())
  ],
}
