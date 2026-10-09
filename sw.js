/* 离线缓存: 首页秒开 + 整包后台打包进手机, 装到主屏幕后没网也能玩 */
const CACHE = 'woxi-web-b0d77d40dc';
const ALL = ["./","./index.html","./manifest.webmanifest","./icon-180.png","./icon-192.png","./icon-512.png","./generated/baiqi-defeat.jpg","./generated/baishouyue-defeat.jpg","./generated/black-pet.png","./generated/drag-baiqi-1.jpg","./generated/drag-baiqi-2.jpg","./generated/drag-baishouyue-1.jpg","./generated/drag-baishouyue-2.jpg","./generated/drag-baishouyue-3.jpg","./generated/drag-baishouyue-4.jpg","./generated/drag-baishouyue-5.jpg","./generated/drag-baishouyue-6.jpg","./generated/drag-hanxin-1.jpg","./generated/drag-hanxin-2.jpg","./generated/drag-hanxin-3.jpg","./generated/drag-hanxin-4.jpg","./generated/drag-kai-1.jpg","./generated/drag-kai-2.jpg","./generated/drag-kuangtie-1.jpg","./generated/drag-kuangtie-2.jpg","./generated/drag-kuangtie-3.jpg","./generated/drag-laixiao-1.jpg","./generated/drag-laixiao-2.jpg","./generated/drag-laixiao-3.jpg","./generated/drag-laixiao-4.jpg","./generated/drag-laixiao-5.jpg","./generated/drag-lan-1.jpg","./generated/drag-lan-2.jpg","./generated/drag-lan-3.jpg","./generated/drag-lan-4.jpg","./generated/drag-shenzui-1.jpg","./generated/drag-shenzui-2.jpg","./generated/drag-shenzui-3.jpg","./generated/drag-shenzui-4.jpg","./generated/drag-shenzui-5.jpg","./generated/drag-yao-1.jpg","./generated/drag-yao-2.jpg","./generated/drag-yao-3.jpg","./generated/drag-yao-4.jpg","./generated/drag-zhaoyun-1.jpg","./generated/drag-zhaoyun-2.jpg","./generated/drag-zhaoyun-3.jpg","./generated/drag-zhaoyun-4.jpg","./generated/drag-zhaoyun-5.jpg","./generated/drag-zhugeliang-1.jpg","./generated/drag-zhugeliang-2.jpg","./generated/drag-zhugeliang-3.jpg","./generated/drag-zhugeliang-4.jpg","./generated/exec-baiqi.jpg","./generated/exec-baishouyue.jpg","./generated/exec-hanxin.jpg","./generated/exec-kai.jpg","./generated/exec-kuangtie.jpg","./generated/exec-laixiao.jpg","./generated/exec-lan.jpg","./generated/exec-shenzui.jpg","./generated/exec-yao.jpg","./generated/exec-zhaoyun.jpg","./generated/exec-zhugeliang.jpg","./generated/exec2-baiqi.jpg","./generated/exec2-kai.jpg","./generated/exec2-laixiao.jpg","./generated/exec2-lan.jpg","./generated/exec2-yao.jpg","./generated/exec2-zhugeliang.jpg","./generated/exec3-baiqi.jpg","./generated/exec3-baishouyue.jpg","./generated/exec3-hanxin.jpg","./generated/exec3-kai.jpg","./generated/exec3-kuangtie.jpg","./generated/exec3-laixiao.jpg","./generated/exec3-lan.jpg","./generated/exec3-shenzui.jpg","./generated/exec3-yao.jpg","./generated/exec3-zhaoyun.jpg","./generated/exec3-zhugeliang.jpg","./generated/exec4-baiqi.jpg","./generated/exec4-baishouyue.jpg","./generated/exec4-hanxin.jpg","./generated/exec4-kai.jpg","./generated/exec4-kuangtie.jpg","./generated/exec4-laixiao.jpg","./generated/exec4-lan.jpg","./generated/exec4-shenzui.jpg","./generated/exec4-yao.jpg","./generated/exec4-zhaoyun.jpg","./generated/exec4-zhugeliang.jpg","./generated/exec5-baiqi.jpg","./generated/exec5-baishouyue.jpg","./generated/exec5-hanxin.jpg","./generated/exec5-kai.jpg","./generated/exec5-kuangtie.jpg","./generated/exec5-laixiao.jpg","./generated/exec5-lan.jpg","./generated/exec5-shenzui.jpg","./generated/exec5-yao.jpg","./generated/exec5-zhaoyun.jpg","./generated/exec5-zhugeliang.jpg","./generated/flyer-baiqi-1.jpg","./generated/flyer-baiqi-2.jpg","./generated/flyer-baishouyue-1.jpg","./generated/flyer-baishouyue-2.jpg","./generated/flyer-hanxin-1.jpg","./generated/flyer-hanxin-2.jpg","./generated/flyer-kai-1.jpg","./generated/flyer-kai-2.jpg","./generated/flyer-kuangtie-1.jpg","./generated/flyer-kuangtie-2.jpg","./generated/flyer-laixiao-1.jpg","./generated/flyer-laixiao-2.jpg","./generated/flyer-lan-1.jpg","./generated/flyer-lan-2.jpg","./generated/flyer-shenzui-1.jpg","./generated/flyer-shenzui-2.jpg","./generated/flyer-yao-1.jpg","./generated/flyer-yao-2.jpg","./generated/flyer-zhaoyun-1.jpg","./generated/flyer-zhaoyun-2.jpg","./generated/flyer-zhugeliang-1.jpg","./generated/flyer-zhugeliang-2.jpg","./generated/hanxin-defeat.jpg","./generated/kai-defeat.jpg","./generated/kuangtie-defeat.jpg","./generated/laixiao-defeat.jpg","./generated/lan-defeat.jpg","./generated/package-brick.jpg","./generated/package-cesspool.jpg","./generated/package-cremate.jpg","./generated/package-feed.jpg","./generated/package-firework.jpg","./generated/package-scatter.jpg","./generated/package-shelf.jpg","./generated/package-simple.jpg","./generated/package-skeleton.jpg","./generated/package-soap.jpg","./generated/package-spittoon.jpg","./generated/package-urinal.jpg","./generated/package-wine.jpg","./generated/relic-1.jpg","./generated/relic-2.jpg","./generated/relic-3.jpg","./generated/shenzui-defeat.jpg","./generated/sign-1.jpg","./generated/sign-2.jpg","./generated/stomp-baiqi-1.jpg","./generated/stomp-baiqi-2.jpg","./generated/stomp-baishouyue-1.jpg","./generated/stomp-hanxin-1.jpg","./generated/stomp-hanxin-2.jpg","./generated/stomp-kai-1.jpg","./generated/stomp-kai-2.jpg","./generated/stomp-kuangtie-1.jpg","./generated/stomp-kuangtie-2.jpg","./generated/stomp-lan-1.jpg","./generated/stomp-lan-2.jpg","./generated/stomp-shenzui-1.jpg","./generated/stomp-zhaoyun-1.jpg","./generated/stomp-zhaoyun-2.jpg","./generated/stomp-zhugeliang-1.jpg","./generated/wreath-2.jpg","./generated/wreath-3.jpg","./generated/wreath.jpg","./generated/yao-defeat.jpg","./generated/zhaoyun-defeat.jpg","./generated/zhugeliang-defeat.jpg"];
const CORE = ALL.slice(0, 6);

let pcRunning = false;

function pcCount() {
  return caches.open(CACHE).then(function (c) {
    let done = 0;
    return Promise.all(ALL.map(function (u) {
      return c.match(u).then(function (h) { if (h) done++; });
    })).then(function () { return done; });
  });
}

function pcTell(state) {
  return pcCount().then(function (done) {
    const msg = { type: 'wc', state: state, done: done, total: ALL.length };
    return self.clients.matchAll({ includeUncontrolled: true }).then(function (cs) {
      cs.forEach(function (cl) { try { cl.postMessage(msg); } catch (e) {} });
    });
  }).catch(function () {});
}

/* 单张图最多等 ms 毫秒, 卡死就掐掉重试, 免得整个打包僵住 */
function pcFetch(u, ms) {
  return new Promise(function (resolve, reject) {
    let done = false;
    const ctrl = ('AbortController' in self) ? new AbortController() : null;
    const t = setTimeout(function () {
      if (done) return;
      done = true;
      if (ctrl) { try { ctrl.abort(); } catch (e) {} }
      reject(new Error('timeout ' + u));
    }, ms);
    fetch(u, { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined }).then(function (r) {
      if (done) return;
      done = true;
      clearTimeout(t);
      resolve(r);
    }).catch(function (e) {
      if (done) return;
      done = true;
      clearTimeout(t);
      reject(e);
    });
  });
}

function runPrecache() {
  if (pcRunning) return;
  pcRunning = true;
  caches.open(CACHE).then(function (c) {
    const missing = [];
    return Promise.all(ALL.map(function (u) {
      return c.match(u).then(function (h) { if (!h) missing.push(u); });
    })).then(function () {
      if (!missing.length) { pcRunning = false; return pcTell('done'); }
      let idx = 0, doneN = ALL.length - missing.length, failed = 0;
      pcTell('running');
      function one() {
        if (idx >= missing.length) return Promise.resolve();
        const u = missing[idx++];
        let tries = 0;
        function attempt() {
          tries++;
          return pcFetch(u, 30000).then(function (r) {
            if (!r || !r.ok) throw new Error('bad ' + u);
            return c.put(u, r.clone());
          }).then(function () {
            doneN++;
            if (doneN % 4 === 0 || doneN >= ALL.length) pcTell('running');
            return one();
          }).catch(function () {
            if (tries < 3) {
              return new Promise(function (res) { setTimeout(res, 700 * tries); }).then(attempt);
            }
            failed++;
            return one();
          });
        }
        return attempt();
      }
      const ws = [];
      for (let i = 0; i < 4; i++) ws.push(one());
      return Promise.all(ws).then(function () {
        pcRunning = false;
        return pcTell(failed ? 'error' : 'done');
      });
    });
  }).catch(function () { pcRunning = false; pcTell('error'); });
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('woxi-web-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }).then(function () { runPrecache(); })
  );
});

self.addEventListener('message', function (e) {
  const d = e.data || {};
  if (d.type === 'wc-start') runPrecache();
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