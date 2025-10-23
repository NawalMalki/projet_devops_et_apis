import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  standalone: true,
  imports: [CommonModule],
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=1a1a1a&color=fff&size=200',
    bio: 'Passionate reader and book collector. Love fiction, science, and history.',
    joinDate: 'January 2024',
    stats: {
      booksRead: 47,
      currentlyReading: 3,
      favorites: 12,
      reviews: 23
    }
  };

  isEditMode = false;

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  saveProfile() {
    // TODO: Implement save logic
    console.log('Saving profile...');
    this.isEditMode = false;
  }
}