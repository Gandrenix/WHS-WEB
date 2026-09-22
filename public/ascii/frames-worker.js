// Worker de MrnaAsciiAnimation: descarga el archivo de fotogramas y localiza dónde
// empieza cada uno (el separador \f), todo fuera del hilo principal. Antes esto pasaba
// en el propio componente con `text.split('\f')`, y separar un string de ~7 MB en 865
// trozos es trabajo síncrono: en el perfil de rendimiento aparecía como el fotograma más
// lento de toda la página (~300ms) justo cuando esta tarjeta entraba en pantalla. Aquí
// solo se calculan los índices (barato); el componente recorta cada fotograma al vuelo
// con `text.slice(...)`, que para ~8 KB por fotograma es insignificante.
self.onmessage = async (e) => {
  try {
    const res = await fetch(e.data.url);
    if (!res.ok) throw new Error(`ASCII frames: ${res.status}`);
    const text = await res.text();
    const offsets = [0];
    let i = text.indexOf('\f');
    while (i !== -1) {
      offsets.push(i + 1);
      i = text.indexOf('\f', i + 1);
    }
    self.postMessage({ ok: true, text, offsets });
  } catch (err) {
    self.postMessage({ ok: false, error: err instanceof Error ? err.message : String(err) });
  }
};
