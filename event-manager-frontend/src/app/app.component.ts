import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, CurrentUser } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'event-manager-frontend';

  constructor(private authService: AuthService, private router: Router) {}

  get currentUser(): CurrentUser | null {
    return this.authService.getUser();
  }

  get isOrganisateur(): boolean {
    return this.currentUser?.role === 'ORGANISATEUR';
  }

  get isParticipant(): boolean {
    return this.currentUser?.role === 'PARTICIPANT';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}
