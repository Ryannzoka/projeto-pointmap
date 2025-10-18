<?php

/**
 * Proxy para Google Maps API
 * Esconde a chave do cliente
 */

require_once __DIR__ . '/config/env.php';

header('Content-Type: application/javascript');
header('Cache-Control: public, max-age=3600'); // Cache por 1 hora

$apiKey = getenv('GOOGLE_MAPS_API_KEY');

if (empty($apiKey)) {
    http_response_code(500);
    echo "console.error('API Key não configurada');";
    exit;
}

// Gera o código JavaScript que carrega o Google Maps
echo <<<JAVASCRIPT
((g) => {
    const p = "The Google Maps JavaScript API",
      c = "google",
      l = "importLibrary",
      q = "__ib__",
      m = document,
      b = window;

    b[c] = b[c] || {};
    const d = b[c].maps || (b[c].maps = {}),
      r = new Set(),
      e = new URLSearchParams(),
      u = () =>
        h ||
        (h = new Promise(async (f, n) => {
          const a = m.createElement("script");
          e.set("libraries", [...r] + "");
          for (const k in g)
            e.set(
              k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
              g[k]
            );
          e.set("callback", c + ".maps." + q);
          a.src = `https://maps.\${c}apis.com/maps/api/js?` + e;
          d[q] = f;
          a.onerror = () => (h = n(Error(p + " could not load.")));
          a.nonce = m.querySelector("script[nonce]")?.nonce || "";
          m.head.append(a);
        }));
    let h;
    d[l]
      ? console.warn(p + " only loads once. Ignoring:", g)
      : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({
    key: "{$apiKey}",
    v: "weekly",
  });
JAVASCRIPT;