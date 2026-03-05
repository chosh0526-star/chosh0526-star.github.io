// 캐시(임시 저장소) 이름 설정
const CACHE_NAME = 'planner-v1';

// 오프라인에서도 작동하도록 미리 저장해둘 파일들
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon.png'
];

// 1. 매니저 취업 (설치 단계) - 파일들을 캐시에 저장
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('파일들을 안전하게 캐시했습니다!');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. 매니저 열일 (요청 가로채기) - 인터넷이 끊겨도 캐시에서 파일 꺼내주기
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 캐시에 있으면 그거 주고, 없으면 인터넷에서 가져오기
        return response || fetch(event.request);
      })
  );
});