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

## Cumplimiento de la consigna

| Criterio | Evidencia en esta entrega |
| --- | --- |
| React y organización por responsabilidades | Código de aplicación en `frontend/src`, separado en `assets`, `components`, `pages`, `services`, `utils` y `styles`. |
| App no concentra toda la aplicación | `src/App.jsx` declara rutas y `src/main.jsx` monta React y los providers. Las pantallas están en `src/pages`. |
| Frontend independiente | `frontend/package.json` tiene sus propios comandos y dependencias; Vite sirve React sin depender de Express para renderizar. La API solo es necesaria para los datos y operaciones. |
| Componentes reutilizables | `FormField`, `ProductPhoto`, `ProductCard`, `ProductFilters`, `PageHeading`, `ContentState`, `Modal` y `Layout` se comparten entre formularios y pantallas. |
| Respeto del boceto | Se conservan inicio con foto de fondo, historia con imagen lateral, galería, contacto, colores y tipografías de `mockup/` e `Identidad.md`. Las mejoras se justifican en Decisiones de diseño. |
| Datos de productos desde la API | El catálogo, los detalles y el panel comparten `ProductsProvider`; no hay un catálogo ni precios duplicados en los componentes. |
| Peticiones centralizadas | `src/services/api.js` contiene el único `fetch` de la aplicación. `products.js` y `admin.js` definen las operaciones de cada recurso. |
| Procesamiento y errores HTTP | Los servicios procesan JSON, verifican el estado HTTP y el contrato `{ success, data }`, y lanzan errores ante red, JSON o respuestas incorrectas. |
| Carga y respuesta visual | Carga de productos y sesión, botones bloqueados y estado Guardando/Eliminando/Verificando, resultados de filtros y vista previa de fotos. |
| Éxitos y errores consistentes | Un solo `NotificationProvider` muestra avisos de éxito y error con roles `status` y `alert`. No se usa `alert()` del navegador. |
| Validación de formularios | Usuario y clave requeridos; campos del producto, precio, stock, tipo y tamaño de foto validados. Los errores se asocian al campo y el foco va al primer error. |
| Confirmación antes de eliminar | `ManagePage` abre `Modal` con el nombre del producto y permite cancelar; solo confirma el borrado después de aceptar. |
| Accesibilidad básica | HTML semántico, labels asociados, texto alternativo, nombres para botones de icono, salto al contenido, foco visible, diálogos nativos y navegación por teclado. |
| Integración con Entrega 2 | Se conserva Express y el CRUD `/api/products`, ampliado con stock, sesiones y fotos; se mantiene el contrato de respuesta y las capas existentes. |
| Código claro y verificable | Formato con Prettier, pruebas unitarias y de API, pruebas Playwright de CRUD y revisión axe de las pantallas en escritorio y móvil. |

Las rutas, el panel protegido, el stock y las fotos son ampliaciones funcionales;
no reemplazan el diseño público ni justifican mover lógica HTTP a las pantallas.
El ejemplo `http://localhost:3000/products` de la consigna es orientativo: esta
Entrega 2 ya usa `/api/products`, y el frontend consume esa ruta real mediante
el proxy. La carpeta `public` es opcional en la estructura sugerida: las imágenes
y fuentes utilizadas por React se resuelven desde `assets` y las dependencias.
Los textos editoriales del negocio no representan datos ficticios de productos.

## Pantallas y funcionalidades

- Inicio con imagen de fondo, reservas por WhatsApp y productos desde la API.
- Sobre nosotros con historia, horarios y enlace al mapa.
- Catálogo con búsqueda sin acentos, filtro por categorías y detalle de productos.
- Panel interno en `/panel-de-control`, sin enlaces en la navegación pública.
- Acceso con usuario y contraseña validados en el backend, cookie HttpOnly y cierre de sesión.
- Creación, edición y eliminación confirmada de productos con nombre, stock,
  precio, descripción, categoría, foto y disponibilidad.
- Subida de fotos desde el dispositivo, vista previa y opción de reemplazar o quitar la imagen.
- Validaciones por campo y notificaciones compartidas para errores y éxitos.
- Estados de carga, error, reintento y listas sin resultados.
- Etiquetas asociadas, botones semánticos, texto alternativo, foco visible,
	salto al contenido y diálogos nativos con Escape, foco atrapado y restaurado.
- Adaptación a escritorio y móvil y respeto por reducción de movimiento.

Las peticiones GET, POST, PUT y DELETE están centralizadas en
`frontend/src/services/products.js`, y el acceso en `services/admin.js`.
Ambos reutilizan el cliente HTTP de `services/api.js`. Se procesa el contrato `{ success, data }`
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
categoría; el panel permite subir una foto específica. Fuentes de las fotos:

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

Las pruebas E2E inician servidores temporales aislados en los puertos 3001 y 5174
con una clave aleatoria de prueba, sin utilizar la clave personal del administrador.
Verifican bloqueo sin sesión, usuario/clave incorrectos, cierre y pérdida de sesión,
CRUD real con stock y fotos subidas, edición completa, reemplazo y conservación
de foto, validaciones, duplicados, carga, fallos de red, reintento,
navegación móvil, foco de diálogos, imágenes y accesibilidad con axe en
1366, 390 y 320 píxeles. Las capturas quedan en `frontend/test-results/`.
Los productos de prueba se eliminan al finalizar.

## Alcance

Los productos se guardan permanentemente en `backend/data/products.json`.
Crear, editar y eliminar escribe el archivo antes de devolver éxito, usando
un archivo temporal y reemplazo atómico. Los tres productos originales se cargan
solo la primera vez, cuando no existe el archivo. Reiniciar el servidor no borra
productos ni vuelve a cargar registros eliminados. Los IDs no se reutilizan.
Un archivo corrupto detiene el arranque sin sobrescribirlo: restaurar un respaldo.
`PRODUCTS_FILE` permite elegir otra ubicación para pruebas o despliegue.
Este almacenamiento es para una única instancia de Node; varias instancias
concurrentes requieren una base de datos con control de concurrencia.
Las sesiones siguen en memoria y se invalidan al reiniciar. Para producción
se necesita almacenamiento de sesiones, HTTPS y una configuración adecuada.
Respaldar `backend/data` y `backend/uploads`: están ignorados por Git, por lo que
subir el código no incluye los datos del negocio. Eliminar esas carpetas o usar
un disco efímero sin volumen persistente sí provoca pérdida de datos.
Las fotos se guardan en `backend/uploads`, ignorado por Git. Reemplazar o borrar
un producto no borra automáticamente fotos antiguas: se conservan por seguridad.
Los archivos subidos pero no asociados por un fallo al guardar también quedan
en esa carpeta. Para producción hace falta una política de limpieza y respaldo.

## Configurar el administrador

Desde la raíz del repositorio, solo si todavía no existe `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Editar localmente `backend/.env`: completar `ADMIN_USERNAME` con el usuario elegido
(hasta 100 caracteres) y `ADMIN_PASSWORD` con una clave propia de entre 12 y 256
caracteres. Si ya existe, agregar el usuario sin sobrescribir la clave actual.
No compartir la contraseña ni subir el archivo a Git: `.env` está ignorado.
Mantener `ADMIN_ORIGIN=http://localhost:5173` para el servidor de desarrollo.
Para usar `preview`, cambiarlo a `http://localhost:4173`.
Reiniciar el backend después de configurar o cambiar estos valores.

Abrir http://localhost:5173/panel-de-control. Es una ruta de la misma aplicación
React, no un sitio separado. No se anuncia en el menú ni en el pie públicos.
La ruta antigua `/gestion` redirige a la nueva. Sin sesión, la URL muestra el
formulario de usuario y contraseña; una vez autenticado, muestra el panel con
los controles de productos y Cerrar sesión. Ocultar una ruta no brinda seguridad
por sí solo: el backend exige sesión para modificar productos y subir archivos.
La clave no se guarda en React, localStorage ni sessionStorage; la cookie es
HttpOnly y SameSite=Strict. La sesión dura 30 minutos. Después de cinco intentos
fallidos por IP, el acceso se bloquea durante 15 minutos.
Sin usuario y clave válidos configurados, el backend mantiene el acceso bloqueado.
Cambiar las credenciales requiere reiniciar el backend para revocar las sesiones anteriores.

El stock admite enteros desde cero y se administra por separado del indicador
Disponible en la carta. No se descuenta automáticamente porque no hay pedidos
ni ventas en esta API. Los productos originales sin stock cargado comienzan en cero.
La foto es opcional; se aceptan JPG, PNG y WebP de hasta 5 MB. El servidor valida
el contenido real, limita la resolución de entrada y convierte a WebP con tamaño
máximo de 1400 píxeles. En una edición sin archivo nuevo se conserva la foto actual.

Para comprobar el build local: `npm --prefix frontend run preview` (puerto 4173),
con el backend en funcionamiento. En un despliegue, configurar un proxy del
servidor web para `/api` y fallback a `index.html` para las rutas React.
El acceso administrador requiere frontend y API bajo el mismo origen público
usando ese proxy. Configurar `ADMIN_ORIGIN` con la URL pública y HTTPS para las
cookies seguras en producción. Nunca colocar claves en variables de Vite,
porque son públicas. `API_PROXY_TARGET` permite cambiar el destino interno del
proxy para pruebas o desarrollo sin cambiar la URL pública de la API.

## Levantar en modo desarrollo

Requisitos: Node.js 20.19 o superior y npm. Abrir dos terminales en la raíz
del repositorio `RuizMatias-Salamanca`:

```bash
cd ~/Documentos/RuizMatias-Salamanca
```

### 1. Preparación inicial

Instalar las dependencias de ambos proyectos:

```bash
npm --prefix backend install
npm --prefix frontend install
```

Si todavía no existe `backend/.env`, crearlo desde el ejemplo:

```bash
cp backend/.env.example backend/.env
```

Completar localmente `ADMIN_USERNAME` y `ADMIN_PASSWORD` con las credenciales
elegidas y mantener `ADMIN_ORIGIN=http://localhost:5173` y `PORT=3000`.
La contraseña debe tener entre 12 y 256 caracteres. Si el archivo ya existe,
editarlo sin sobrescribir las credenciales. No subirlo a Git.

### 2. Terminal del backend

Desde la raíz del repositorio:

```bash
npm --prefix backend run dev
```

La API escucha en el puerto 3000. El modo desarrollo reinicia Node al cambiar
el código del backend. Ese reinicio conserva los productos guardados y cierra
las sesiones. Antes de iniciar, npm compila React automáticamente para servirlo
también desde Express. Las dependencias del frontend deben estar instaladas.
Después de modificar `.env`, reiniciar manualmente el proceso.

### 3. Terminal del frontend

Desde la raíz del repositorio, en la segunda terminal:

```bash
npm --prefix frontend run dev -- --port 5173 --strictPort
```

Vite sirve la web en el puerto 5173 y actualiza la interfaz al editar React o CSS.
El proxy conecta `/api` con el backend en el puerto 3000. Si un puerto está
ocupado por otra instancia del proyecto, detener esa instancia antes de iniciar
otra; `--strictPort` evita cambiar de URL y romper el origen autorizado del panel.
Mantener ambas terminales abiertas y usar `Ctrl+C` en cada una para detenerlas.

### URLs del sitio

| Pantalla | URL |
| --- | --- |
| Inicio | http://localhost:5173/ |
| Sobre nosotros | http://localhost:5173/nosotros |
| Catálogo de productos | http://localhost:5173/productos |
| Panel de control: ingreso y administración | http://localhost:5173/panel-de-control |
| Ruta anterior de gestión: redirige al panel | http://localhost:5173/gestion |
| Panel servido directamente por Express | http://localhost:3000/api/products |
| Sitio completo servido por Express | http://localhost:3000/ |

El panel pertenece a la misma web y no tiene enlace en el menú público.
Ingresar con el usuario y la contraseña configurados en el backend para crear,
editar y eliminar productos. Cualquier otra ruta muestra la página 404.

### URLs de la API

| Método | URL directa del backend | Función |
| --- | --- | --- |
| GET | http://localhost:3000/api/products | Panel si se solicita HTML; listado si se solicita JSON |
| GET | http://localhost:3000/api/products/1 | Consultar un producto por ID, público |
| POST | http://localhost:3000/api/products | Crear producto, requiere sesión |
| PUT | http://localhost:3000/api/products/1 | Editar producto por ID, requiere sesión |
| DELETE | http://localhost:3000/api/products/1 | Borrar producto por ID, requiere sesión |
| GET | http://localhost:3000/api/admin/session | Consultar la sesión actual |
| POST | http://localhost:3000/api/admin/login | Iniciar sesión con usuario y contraseña |
| POST | http://localhost:3000/api/admin/logout | Cerrar sesión |
| POST | http://localhost:3000/api/uploads | Subir una foto, requiere sesión |
| GET | `http://localhost:3000/api/uploads/<nombre>.webp` | Descargar una foto subida, pública |

El ID `1` es un ejemplo: reemplazarlo por el ID del producto correspondiente.
El nombre de una foto lo devuelve el servidor después de subirla. POST, PUT y
DELETE son peticiones HTTP, no páginas que se ejecutan al abrir un enlace.
La raíz http://localhost:3000/ muestra el sitio React compilado. Abrir
http://localhost:3000/api/products en un navegador muestra el panel con login.
La misma URL devuelve el listado cuando se solicita `Accept: application/json`;
el servicio de React ya envía ese encabezado. Para consultar JSON desde terminal:

```bash
curl -H 'Accept: application/json' http://localhost:3000/api/products
```

Desde React, estas rutas se consumen por el mismo origen del frontend, por ejemplo
http://localhost:5173/api/products. Usar el panel para las operaciones autenticadas:
el cliente HTTP utiliza el proxy para mantener las peticiones en el mismo origen.
Las cookies no se separan por puerto, pero las URLs 5173 y 3000 sí son orígenes
distintos para las peticiones del navegador.

### URLs de verificación

- Vista previa del build: http://localhost:4173/ después de ejecutar
	`npm --prefix frontend run build` y `npm --prefix frontend run preview`.
	No es el modo desarrollo. Requiere backend activo y `ADMIN_ORIGIN=http://localhost:4173`
	si se desea ingresar al panel, disponible en `/panel-de-control` de ese origen.
- Pruebas E2E: frontend temporal http://localhost:5174/ y API temporal
	http://localhost:3001/api/products. `npm --prefix frontend run test:e2e` los
	inicia y detiene automáticamente con credenciales de prueba; no son los
	servidores de desarrollo ni utilizan las credenciales personales.

### Panel y sitio en el puerto 3000

Después de instalar ambos proyectos y configurar las credenciales, basta con:

```bash
npm --prefix backend start
```

El comando compila React y después inicia Express. Abrir
http://localhost:3000/api/products e ingresar con el usuario y contraseña del
backend. No hace falta iniciar Vite para esta modalidad. Se reutilizan los mismos
componentes React y servicios de `frontend/src`, no otro frontend separado.
También se pueden abrir `/productos`, `/nosotros` y `/panel-de-control` en el
puerto 3000. Crear, editar o borrar desde cualquiera de los paneles modifica
la misma información persistente del backend, visible en el catálogo al cargarlo
de nuevo. No hay sincronización automática entre pestañas ya abiertas.

En desarrollo, Vite en 5173 mantiene la recarga automática. El panel de 3000 usa
el build: después de cambiar el frontend ejecutar `npm --prefix frontend run build`
y recargar el navegador. `npm --prefix backend run dev` también compila al iniciar,
pero no recompila React con cada edición. Los orígenes locales del propio backend
se admiten junto con `ADMIN_ORIGIN`; no hace falta cambiarlo para usar 3000.

Las pruebas usan archivos temporales, no el catálogo real. Además de probar
el panel servido por Express, verifican altas, ediciones y bajas tras reinicios
reales de la API.