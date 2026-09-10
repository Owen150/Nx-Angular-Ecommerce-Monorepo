import { TestBed, ComponentFixture } from '@angular/core/testing';
import { App } from './app';
import { appRoutes } from './app.routes';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(appRoutes)],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect the empty path to the home route', () => {
    expect(appRoutes[0]).toEqual(
      expect.objectContaining({
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      })
    );

    expect(appRoutes).toContainEqual(
      expect.objectContaining({
        path: 'home',
      })
    );
  });

  it('should render title in header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-name span')?.textContent).toContain(
      'TyapTech'
    );
  });

  it('should render navigation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const productLink = Array.from(compiled.querySelectorAll('.link')).find(
      link => link.textContent?.includes('Products')
    );

    expect(productLink).toBeTruthy();
    expect(productLink?.textContent).toContain('Products');
  });

  it('should render footer with correct copyright', () => {
    const footer = fixture.nativeElement.querySelector('.app-footer');
    expect(footer).toBeTruthy();
    expect(footer?.textContent).toContain('© 2025 TyapTech');
    expect(footer?.textContent).toContain('Michael Owen Oduor');
  });

  it('should have router outlet for dynamic content', () => {
    const routerOutlet = fixture.nativeElement.querySelector('router-outlet');
    expect(routerOutlet).toBeTruthy();
  });

  it('should apply change detection strategy OnPush', () => {
    const metadata = (App as unknown as { ɵcmp: { onPush: boolean } })['ɵcmp'];
    expect(metadata.onPush).toBeTruthy();
  });
});
