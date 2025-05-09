import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clone the request with CORS headers
  const corsRequest = req.clone({
    setHeaders: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
    },
    withCredentials: true
  });

  // Log the request for debugging
  console.log('CORS Interceptor:', corsRequest.url);

  return next(corsRequest);
};
