// CloudFront Function (viewer-request): rutas internas de Angular -> /index.html
function handler(event) {
  var req = event.request;
  if (!req.uri.includes('.')) { req.uri = '/index.html'; }
  return req;
}
