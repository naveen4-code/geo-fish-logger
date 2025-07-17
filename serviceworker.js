self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("theboyz-cache").then((cache) =>
      cache.addAll(["/", "/index.html", "/style.css", "/app.js", "/logo.png"])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
