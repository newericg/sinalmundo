import { HttpInterceptorFn } from '@angular/common/http';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }
  return next(req.clone({
    setHeaders: { 'Cache-Control': 'max-age=60' }
  }));
};
