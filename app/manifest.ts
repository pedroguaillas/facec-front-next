import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'FACEC - Facturación Electrónica',
    short_name: 'Facec',
    description: 'Aplicación de facturación electrónica para Ecuador',
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Splash y barra de título de la app instalada: mismo color que el header (modo claro)
    background_color: '#f1f5f9',
    theme_color: '#ffffff',
    categories: ['business', 'finance', 'productivity'],
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android recorta el ícono (círculo, squircle): la F va reducida dentro de la zona segura
      { src: '/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  }
}
