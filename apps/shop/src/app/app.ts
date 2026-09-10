import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppHeader } from './header/header.component';
import { AppFooter } from './footer/footer.component';

@Component({
  imports: [RouterModule, AppHeader, AppFooter],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected title = 'TyapTech';
}
