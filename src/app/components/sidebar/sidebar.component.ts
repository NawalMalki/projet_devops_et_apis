import { CommonModule } from "@angular/common"
import { Component, Input, Output, EventEmitter } from "@angular/core"
import { RouterModule } from "@angular/router"

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrls: ["./sidebar.component.css"],
})
export class SidebarComponent {
@Input() isOpen: boolean = false;
@Output() isOpenChange = new EventEmitter<boolean>(); 
  

  menuItems = [
    { icon: "🏠", label: "Accueil", route: "/home", active: true },
    { icon: "📚", label: "Ma bibliothèque", route: "/library", active: false },
    { icon: "📖", label: "En cours de lecture", route: "/reading", active: false },
    { icon: "✅", label: "Terminés", route: "/finished", active: false },
    { icon: "⭐", label: "Favoris", route: "/favorites", active: false },
  ]

  categories = [
    { name: "Fiction", count: 124 },
    { name: "Non-Fiction", count: 89 },
    { name: "Science", count: 56 },
    { name: "Histoire", count: 43 },
    { name: "Biographie", count: 32 },
  ]

  closeSidebar() {
    this.isOpenChange.emit(false); 
  }

  onMenuItemClick(item: any) {
    this.menuItems.forEach((menuItem) => (menuItem.active = false))
    item.active = true
  }
}
