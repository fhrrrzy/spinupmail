const BACKEND_ORIGIN = "https://spinupmail.fahrurrozy4214.workers.dev";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      const target = new URL(url.pathname + url.search, BACKEND_ORIGIN);
      return fetch(new Request(target, request));
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404) {
      return asset;
    }

    return env.ASSETS.fetch(new URL("/index.html", url));
  },
};
