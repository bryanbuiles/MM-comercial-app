import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LocalStorageEnum } from '@shared/models/enums';
import { LocalStorageService } from '@shared/services/local-storage-service';

export const INTERCEPTOR_ENABLED = new HttpContextToken<boolean>(() => true);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const localService = inject(LocalStorageService);

  if (req.context.get(INTERCEPTOR_ENABLED) === false) return next(req);

  const token = localService.getItem(LocalStorageEnum.TOKEN) as string;

  if (!token) return next(req);

  const newReq = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });

  return next(newReq);
};


