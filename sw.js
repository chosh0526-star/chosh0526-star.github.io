// 🎯 버전 업그레이드!
const CACHE_NAME = 'planner-v3';

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 매니저 즉시 투입
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 찌꺼기 캐시 삭제 완료:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 즉시 권한 뺏어오기
  );
});

// 🎯 [핵심] 인터넷 먼저 (Network First) 전략
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 서버에서 최신 파일을 받아오면 캐시(창고)도 몰래 최신본으로 업데이트!
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response; // 최신 화면 보여주기
      })
      .catch(() => {
        // 인터넷이 끊겼거나 서버 에러 났을 때만 옛날 캐시 꺼내오기
        return caches.match(event.request);
      })
  );
});