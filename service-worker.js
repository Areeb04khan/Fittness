const CACHE_NAME = "daily-plan-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/planner.html",
  "/kitchen.html",
  "/progress.html",
  "/style.css",
  "/app.js",
  "/data.js",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
