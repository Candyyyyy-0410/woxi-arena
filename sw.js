/* 离线缓存: 装到主屏幕后没网也能玩 */
const CACHE = 'woxi-web-c4ab86cde1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    // 手机上优先用本地缓存(秒开), 同时后台悄悄拉一次最新页面; 断网就吃缓存
    e.respondWith(
      caches.open(CACHE).then(function (c) {
        return c.match('./index.html').then(function (hit) {
          const net = fetch(req, { cache: 'no-store' }).then(function (r) {
            if (r && r.ok) return c.put('./index.html', r.clone()).then(function () { return r; });
            return r;
          });
          if (hit) { e.waitUntil(net.catch(function () {})); return hit; }
          return net.catch(function () {
            return c.match('./index.html').then(function (f) {
              return f || new Response('离线, 而且缓存里还没有这一版。', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
            });
          });
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        return fetch(req, { cache: 'no-cache' }).then(function (r) {
          if (r && r.ok) c.put(req, r.clone());
          return r;
        }).catch(function () {
          return c.match('./index.html').then(function (fb) {
            return fb || new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
          });
        });
      });
    })
  );
});