# Salamanca · Entrega 3

Frontend React integrado con la API de productos de la Entrega 2.

## Ejecutar

Requisitos: Node.js 20.19 o superior y npm.

Desde la raíz del repositorio, en una terminal:

```bash
npm --prefix backend install
npm --prefix backend start
```

En otra terminal:

```bash
npm --prefix frontend install
npm --prefix frontend run dev
```

Abrir http://localhost:5173. La API escucha en http://localhost:3000/api/products.
Vite reenvía `/api` al backend mediante un proxy, sin necesitar cambios de CORS.
Los proyectos tienen sus propias dependencias y comandos: el frontend se ejecuta
independientemente; sin la API presenta un error y permite reintentar.

## Organización

```text
backend/                 API Express de la Entrega 2
frontend/
	index.html             Documento de entrada
	vite.config.js         Configuración y proxy
	src/
		assets/              Fotos locales
		components/          Navegación, formularios, diálogos, tarjetas y providers
		pages/               Inicio, nosotros, catálogo, gestión y página 404
		services/            Único punto de comunicación HTTP con la API
		utils/               Validaciones, búsqueda, precios y datos del negocio
		styles/              Diseño compartido y responsive
		tests/               Pruebas de navegador y accesibilidad
		App.jsx              Rutas
		main.jsx             Entrada de React y providers
mockup/                  Boceto visual original
wireframe/               Wireframe original
Identidad.md             Colores y tipografías originales
```

Todo el código de aplicación y sus pruebas está dentro de `frontend/src`.
Los archivos de configuración necesarios para Vite y npm están en `frontend/`.

## Pantallas y funcionalidades

- Inicio con imagen de fondo, reservas por WhatsApp y productos desde la API.
- Sobre nosotros con historia, horarios y enlace al mapa.
- Catálogo con búsqueda sin acentos, filtro por categorías y detalle de productos.
- Gestión con listado, creación, edición, disponibilidad y eliminación confirmada.
- Validaciones por campo y notificaciones compartidas para errores y éxitos.
- Estados de carga, error, reintento y listas sin resultados.
- Etiquetas asociadas, botones semánticos, texto alternativo, foco visible,
	salto al contenido y diálogos nativos con Escape, foco atrapado y restaurado.
- Adaptación a escritorio y móvil y respeto por reducción de movimiento.

Las peticiones GET, POST, PUT y DELETE están centralizadas en
`frontend/src/services/products.js`. Se procesa el contrato `{ success, data }`
de la API real, no una lista de productos escrita en los componentes.

## Decisiones de diseño

Se preservan la paleta `#3E2723`, `#F4E3CE`, `#E8871E`, los títulos Fraunces,
el texto Mulish, el inicio con fotografía a pantalla completa, la historia
con imagen lateral, la galería de productos y el pie de contacto del boceto.
El naranja se reserva para acciones; se mejora el contraste de los textos.
El catálogo agrega nombres y precios de la API a la galería. La pantalla
de gestión utiliza una tabla para facilitar la comparación y edición sin
reemplazar el diseño público por un panel genérico.

Las tipografías se sirven localmente mediante Fontsource. Las fotos de Unsplash
también están guardadas localmente y son ilustrativas, no fotos
verificadas del local. Los productos sin `imageUrl` usan una imagen de su
categoría; la gestión permite añadir una URL específica. Fuentes de las fotos:

- https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb
- https://images.unsplash.com/photo-1555507036-ab1f4038808a
- https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd

Los datos de dirección, teléfono y horarios provienen del boceto original.
El botón Reservar inicia una consulta por WhatsApp: no confirma una reserva
ni guarda reservas en la API, que solo administra productos.

## Verificación

```bash
npm --prefix backend test
npm --prefix frontend test
npm --prefix frontend run build
cd frontend
npx playwright install chromium
npm run test:e2e
```

Las pruebas E2E inician los servidores automáticamente si no están funcionando.
Verifican CRUD real, validaciones, duplicados, carga, fallos de red, reintento,
navegación móvil, foco de diálogos, imágenes y accesibilidad con axe en
1366, 390 y 320 píxeles. Las capturas quedan en `frontend/test-results/`.
Los productos de prueba se eliminan al finalizar.

## Alcance

El backend original almacena productos **en memoria**: al reiniciarlo se
restablecen los tres productos iniciales. No hay autenticación en la API;
la gestión es una demostración académica, no un panel protegido para producción.

Para comprobar el build local: `npm --prefix frontend run preview` (puerto 4173),
con el backend en funcionamiento. En un despliegue, configurar un proxy del
servidor web para `/api` y fallback a `index.html` para las rutas React.
Opcionalmente `VITE_API_URL` cambia la base de API durante el build; si se usa
otro origen, ese servidor debe permitir CORS. Nunca colocar secretos en variables
de Vite porque son públicas.