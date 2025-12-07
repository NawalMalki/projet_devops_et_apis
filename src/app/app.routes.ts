import type { Routes } from "@angular/router";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { HomeComponent } from "./components/home/home.component";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { BookDetailsComponent } from "./components/book-details/book-details.component";
import { LibraryComponent } from "./components/library/library.component";
import { ReadingComponent } from "./components/reading/reading.component";
import { FinishedComponent } from "./components/finished/finished.component";
import { FavoritesComponent } from "./components/favorites/favorites.component";
import { authGuard, publicGuard } from "./guards/auth.guard";

export const routes: Routes = [
  
  { path: "", redirectTo: "/sign-in", pathMatch: "full" },

  // Routes publiques (accessibles uniquement si NON connecté)
  { 
    path: "sign-in", 
    component: SignInComponent,
    canActivate: [publicGuard]  
  },
  { 
    path: "sign-up", 
    component: SignUpComponent,
    canActivate: [publicGuard]  
  },

  // Routes protégées (nécessitent une authentification)
  { 
    path: "home", 
    component: HomeComponent,
    canActivate: [authGuard]  // Vérifie l'authentification
  },
  { 
    path: "profile", 
    component: UserProfileComponent,
    canActivate: [authGuard]
  },
  { 
    path: "book/:id", 
    component: BookDetailsComponent,
    canActivate: [authGuard]
  },
  { 
    path: "library", 
    component: LibraryComponent,
    canActivate: [authGuard]
  },
  { 
    path: "reading", 
    component: ReadingComponent,
    canActivate: [authGuard]
  },
  { 
    path: "finished", 
    component: FinishedComponent,
    canActivate: [authGuard]
  },
  { 
    path: "favorites", 
    component: FavoritesComponent,
    canActivate: [authGuard]
  },

  { path: "**", redirectTo: "/sign-in" },
];