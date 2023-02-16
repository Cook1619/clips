import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  constructor(private auth: AngularFireAuth) {}

  inSubmission = false;
  showAlert = false;
  alertMsg = 'Please wait. We are logging you in.';
  alertColor = 'blue';

  credentials = {
    email: '',
    password: '',
  };

  async signIn() {
    this.showAlert = true;
    this.alertMsg = 'Please wait, you are signing into your account.';
    this.alertColor = 'blue';
    this.inSubmission = true;
    try {
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,
        this.credentials.password
      );
    } catch (e) {
      this.alertMsg = 'An unexpected error occurred. Please try again later';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }
    this.alertMsg = 'Success! You have signed in.';
    this.alertColor = 'green';
  }
}
