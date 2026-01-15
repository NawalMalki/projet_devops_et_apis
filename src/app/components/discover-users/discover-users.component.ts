import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';

@Component({
  selector: 'app-discover-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './discover-users.component.html',
  styleUrls: ['./discover-users.component.css']
})
export class DiscoverUsersComponent implements OnInit {

  users: any[] = [];
  currentUserId!: string;

  constructor(
    private userService: UserService,
    private followService: FollowService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.currentUser!.uid;

    this.userService.getAllUsers().subscribe(users => {
      this.users = users.filter(u => u.uid !== this.currentUserId);
    });
  }

  async follow(userId: string) {
    await this.followService.follow(this.currentUserId, userId);
  }
}
