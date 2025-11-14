README — Mastering Podcast Spotify (Mac, ffmpeg)

1) Requisitos
- macOS con Homebrew
- ffmpeg instalado:  brew install ffmpeg

2) Archivos
- Prompt_Mastering_Podcast_PEIPM50_FINAL.txt  → Prompt de sistema/orquestador.
- masterizar.sh                               → Script de mastering manual (NR + nivelación + loudnorm).
- README_Mastering_Podcast_Spotify.txt        → Esta guía.

3) Uso rápido
- Exportá desde Ableton: WAV 24-bit, sin limitador, picos máx. -6 dBFS.
- En Terminal, ubicáte donde estén los archivos y corré:
  chmod +x masterizar.sh
  ./masterizar.sh "mi_podcast.wav"

- Resultado en carpeta ./salida:
  *_MASTER.wav  (24-bit, listo para Spotify)
  *_MASTER.mp3  (320 kbps, para compartir)

4) Ajustes opcionales (variables de entorno)
- Intensidad NR (afftdn):   NR=12    (subí a 14–16 si hay más estática)
- High-pass filter (Hz):    HPF=80   (subí a 100–120 si hay rumbles)
- Loudness:                 TARGET_I=-14   TP=-1.0   LRA=11

Ejemplos:
  NR=14 HPF=100 ./masterizar.sh "mi_podcast.wav"
  TARGET_I=-16 ./masterizar.sh "mi_podcast.wav"

5) Notas
- Este script usa loudnorm en single-pass (rápido y confiable). Si deseás precisión máxima, consultame para darte versión 2-pass con análisis previo.
- Si tu ffmpeg no trae dynaudnorm, se usa compresión suave (acompressor) como fallback.
- Si disponés de stems (voces/música), el sidechain real se aplica dentro del DAW. Este script apunta a un mixdown estéreo final.
