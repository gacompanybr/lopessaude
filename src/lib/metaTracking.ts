// Captura automática de identificadores de rastreamento da Meta
// (cookies _fbc / _fbp e parâmetros de URL fbclid / ctwa_clid).

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface MetaTracking {
  fbc: string | null;
  fbp: string | null;
  ctwa_clid: string | null;
}

export function captureMetaTracking(): MetaTracking {
  if (typeof window === "undefined") {
    return { fbc: null, fbp: null, ctwa_clid: null };
  }

  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get("fbclid");
  const ctwa_clid = params.get("ctwa_clid");

  let fbc = getCookie("_fbc");
  // Se houver fbclid e ainda não há _fbc, monta o valor padrão
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  const fbp = getCookie("_fbp");

  return {
    fbc: fbc || null,
    fbp: fbp || null,
    ctwa_clid: ctwa_clid || null,
  };
}
