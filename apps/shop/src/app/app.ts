import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppHeader } from './header/header.component';
import { AppFooter } from './footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons'; // Import your brand icons

@Component({
  imports: [RouterModule, AppHeader, AppFooter, FontAwesomeModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected title = 'TyapTech';
  // Bind the icons to properties for your template
  faGithub = faGithub;
  faGoogle = faGoogle;
}
