import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '@core/services/auth-service';

import { LoginComponent } from './login-component';

describe('LoginComponent', () => {
  function setup(returnUrl: string | null) {
    const navigateByUrl = vi.fn().mockResolvedValue(true);
    const login = vi.fn(() => of({ accessToken: 'token', expiresIn: 3600 }));

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigateByUrl } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(returnUrl ? { returnUrl } : {}),
            },
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    return { fixture, component, navigateByUrl, login };
  }

  it('should create', () => {
    const { component } = setup(null);
    expect(component).toBeTruthy();
  });

  it('navigates to /home when returnUrl is absent', () => {
    const { component, navigateByUrl } = setup(null);

    component.form.setValue({ email: 'user@example.com', password: 'secret' });
    component.onSubmit(new Event('submit'));

    expect(navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('navigates to returnUrl when it is a valid internal path', () => {
    const { component, navigateByUrl } = setup('/home');

    component.form.setValue({ email: 'user@example.com', password: 'secret' });
    component.onSubmit(new Event('submit'));

    expect(navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });

  it('falls back to /home when returnUrl is an external URL', () => {
    const { component, navigateByUrl } = setup('//evil.com');

    component.form.setValue({ email: 'user@example.com', password: 'secret' });
    component.onSubmit(new Event('submit'));

    expect(navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
  });
});
