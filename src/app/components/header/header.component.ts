import { CommonModule } from "@angular/common"
import { Component, EventEmitter, Output } from "@angular/core"
import { FormsModule } from "@angular/forms"
import  { Router } from "@angular/router"

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>()
  @Output() search = new EventEmitter<string>()

  showProfileMenu = false
  searchQuery = ""

  userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://ui-avatars.com/api/?name=John+Doe&background=1a1a1a&color=fff",
  }

  constructor(private router: Router) {}

  onToggleSidebar() {
    this.toggleSidebar.emit()
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      // Navigate to home with search query
      this.router.navigate(["/home"], {
        queryParams: { search: this.searchQuery.trim() },
      })
    }
  }

  onSearchKeyPress(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.onSearch()
    }
  }

  onLogout() {
    // TODO: Implement logout logic
    console.log("Logging out...")
  }
}
