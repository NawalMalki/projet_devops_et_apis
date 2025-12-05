import type { Routes } from "@angular/router"
import { SignInComponent } from "./components/sign-in/sign-in.component"
import { SignUpComponent } from "./components/sign-up/sign-up.component"
import { HomeComponent } from "./components/home/home.component"
import { UserProfileComponent } from "./components/user-profile/user-profile.component"
import { BookDetailsComponent } from "./components/book-details/book-details.component"
import { LibraryComponent } from "./components/library/library.component"
import { ReadingComponent } from "./components/reading/reading.component"
import { FinishedComponent } from "./components/finished/finished.component"
import { FavoritesComponent } from "./components/favorites/favorites.component"

export const routes: Routes = [
  { path: "", redirectTo: "/sign-in", pathMatch: "full" },
  { path: "sign-in", component: SignInComponent },
  { path: "sign-up", component: SignUpComponent },
  { path: "home", component: HomeComponent },
  { path: "profile", component: UserProfileComponent },
  { path: "book/:id", component: BookDetailsComponent },
  { path: "library", component: LibraryComponent },
  { path: "reading", component: ReadingComponent },
  { path: "finished", component: FinishedComponent },
  { path: "favorites", component: FavoritesComponent },
  { path: "**", redirectTo: "/sign-in" },
]
