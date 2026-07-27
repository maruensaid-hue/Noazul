"use client";

import { useEffect, useState } from "react";

/**
 * Intermediate hop between Mercado Pago's checkout (which needs a real
 * http(s) back_url) and the mobile app's noazul:// deep link — see
 * server/mercadoPago.ts's deepLink(). Reads status/scheme from
 * window.location.search directly (not the useSearchParams hook) so this
 * page doesn't need a Suspense boundary.
 */
export default function PaymentReturnPage() {
  const [appUrl, setAppUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status") ?? "success";
    const scheme = params.get("scheme") ?? "noazul";
    const url = `${scheme}://payment/return?status=${status}`;
    setAppUrl(url);
    window.location.replace(url);
  }, []);

  return (
    <main style={{ fontFamily: "sans-serif", padding: 40, textAlign: "center" }}>
      <p>Redirecionando para o NoAzul...</p>
      {appUrl ? (
        <p>
          Se não abrir automaticamente, <a href={appUrl}>toque aqui</a>.
        </p>
      ) : null}
    </main>
  );
}
