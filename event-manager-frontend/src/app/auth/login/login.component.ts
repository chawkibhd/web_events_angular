import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

// ⭐ Imports Spartan UI (Helm)
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    // ⭐ Spartan UI
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // mode actuel : 'login' ou 'register'
  mode: 'login' | 'register' = 'login';

  // champs login
  loginEmail = '';
  loginPassword = '';

  // champs inscription
  regEmail = '';
  regFullName = '';
  regPassword = '';
  regRole: 'ORGANISATEUR' | 'PARTICIPANT' = 'PARTICIPANT';

  // messages
  loginError?: string;
  registerError?: string;
  registerSuccess?: string;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      // déjà connecté : on redirige vers la vue adaptée
      if (user.role === 'ORGANISATEUR') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/events']);
      }
    }
  }

  changeMode(newMode: 'login' | 'register') {
    this.mode = newMode;
    this.loginError = undefined;
    this.registerError = undefined;
    this.registerSuccess = undefined;
  }

  onLogin() {
    this.loginError = undefined;

    if (!this.loginEmail || !this.loginPassword) {
      this.loginError = 'Merci de saisir email et mot de passe.';
      return;
    }

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        const user = this.authService.getUser();
        if (user && user.role === 'ORGANISATEUR') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/events']);
        }
      },
      error: () => {
        this.loginError = 'Email ou mot de passe incorrect.';
      }
    });
  }

  onRegister() {
    this.registerError = undefined;
    this.registerSuccess = undefined;

    if (!this.regEmail || !this.regFullName || !this.regPassword) {
      this.registerError = 'Merci de remplir tous les champs.';
      return;
    }

    this.authService.register({
      email: this.regEmail,
      fullName: this.regFullName,
      password: this.regPassword,
      role: this.regRole
    }).subscribe({
      next: (msg) => {
        console.log('Réponse register = ', msg);
        this.registerError = undefined;
        this.registerSuccess = 'Compte créé avec succès. Vous pouvez maintenant vous connecter.';
        // this.changeMode('login');
      },
      error: (err) => {
        console.error('Erreur API register :', err);
        if (err.status === 400 && typeof err.error === 'string') {
          this.registerError = err.error;
        } else {
          this.registerError = 'Erreur lors de la création du compte (email peut-être déjà utilisé).';
        }
      }
    });
  }
}
