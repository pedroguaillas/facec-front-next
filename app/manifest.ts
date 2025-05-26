import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Facturación Electrónica',
    short_name: 'Facec',
    description: 'Aplicación de facturación electrónica',
    start_url: '/',
    display: 'standalone',
    background_color: '#1d293d',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
  }
}