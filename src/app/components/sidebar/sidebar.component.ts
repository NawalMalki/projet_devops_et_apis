import { CommonModule } from "@angular/common"
import { Component, Input, Output, EventEmitter, type OnInit } from "@angular/core"
import {  Router, RouterModule } from "@angular/router"
import { BooksService, Genre } from "../../services/books.service"

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = false
  @Output() isOpenChange = new EventEmitter<boolean>()

  menuItems = [
    { label: "Accueil", route: "/home", active: true },
    { label: "Ma bibliothèque", route: "/library", active: false },
    {  label: "En cours de lecture", route: "/reading", active: false },
    {  label: "Terminés", route: "/finished", active: false },
    {  label: "Favoris", route: "/favorites", active: false },
  ]

  categories: Genre[] = []
  isLoadingGenres = true

  constructor(
    private booksService: BooksService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadGenres()
  }

  loadGenres() {
    this.isLoadingGenres = true
    this.booksService.getGenres().subscribe({
      next: (genres) => {
        this.categories = genres
        this.isLoadingGenres = false
      },
      error: (error) => {
        console.error("Erreur lors du chargement des genres:", error)
        this.isLoadingGenres = false
      },
    })
  }

  onGenreClick(genre: Genre, event: Event) {
    event.preventDefault()
    this.router.navigate(["/home"], { queryParams: { genre: genre.name } })
    this.closeSidebar()
  }

  closeSidebar() {
    this.isOpenChange.emit(false)
  }

  onMenuItemClick(item: any) {
    this.menuItems.forEach((menuItem) => (menuItem.active = false))
    item.active = true
  }
}
