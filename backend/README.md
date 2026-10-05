# Backend Salamanca

API REST de productos implementada con Express y organizada en capas MVC.
Los productos se guardan en disco y sobreviven a los reinicios. Express también
sirve el frontend React compilado y el panel de control.

## Ejecución

```bash
npm --prefix ../frontend install
npm install
npm start
```

El servidor escucha en el puerto `3000` por defecto. Se puede cambiar con la variable de entorno `PORT`.
`npm start` y `npm run dev` compilan el frontend antes de iniciar. Abrir
http://localhost:3000/api/products para acceder al panel con usuario y contraseña.
El sitio público está en http://localhost:3000/ y el catálogo en `/productos`.
El panel reutiliza React de `frontend/src`; no requiere un segundo servidor.
Para editar React con recarga automática, usar Vite en 5173. Para actualizar la
versión servida por Express, ejecutar `npm --prefix ../frontend run build`.

## Administrador

Copiar `.env.example` a `.env` si no existe, y completar localmente
`ADMIN_USERNAME` (hasta 100 caracteres) y `ADMIN_PASSWORD` con una clave propia
de 12 a 256 caracteres. El servidor carga ese archivo al arrancar;
reiniciarlo después de cambiar la configuración. No subir `.env` a Git.
`ADMIN_ORIGIN` indica el origen del frontend autorizado (por defecto localhost:5173).
No hay credenciales predeterminadas. Si falta la configuración, el login devuelve 503.
El frontend abre el panel interno en `/panel-de-control`, sin enlace público.
También está disponible directamente en `/api/products` cuando el navegador
solicita HTML. Los orígenes locales del puerto del backend están autorizados
junto al `ADMIN_ORIGIN` configurado.

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/admin/session` | Consultar si la sesión actual está autenticada |
| POST | `/api/admin/login` | Validar `{ "username": "...", "password": "..." }` y crear la sesión |
| POST | `/api/admin/logout` | Revocar sesión y eliminar su cookie |

El login emite una cookie HttpOnly, SameSite=Strict, con duración de 30 minutos.
En producción requiere HTTPS. Los intentos fallidos se limitan a cinco por IP
cada 15 minutos. Los orígenes externos no autorizados se rechazan.
El secreto de firma se genera al arrancar: reiniciar invalida todas las sesiones.
El almacenamiento de sesiones es en memoria, adecuado para esta entrega local;
un despliegue necesita un almacén persistente y configuración de proxy/HTTPS.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/products` | Obtener todos los productos |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear un producto |
| PUT | `/api/products/:id` | Modificar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |

El cuerpo para crear o modificar acepta `name`, `description`, `category`, `price`,
`stock`, `imageUrl` y `available`. El stock debe ser un número entero no negativo
(por defecto cero) y el precio un número mayor que cero. Para modificar se pueden
enviar solo los campos que cambian. No se descuenta stock automáticamente.

GET es público. POST, PUT y DELETE requieren una sesión de administrador válida;
sin ella devuelven 401. Ocultar los controles en React no reemplaza esta validación.

Las respuestas exitosas usan `{ "success": true, "data": ... }`; las respuestas de error usan `{ "success": false, "message": "..." }`.
Para obtener JSON del listado, enviar `Accept: application/json`. Si se solicita
HTML al abrir `/api/products`, se devuelve el panel visual. Sin ese encabezado
HTML explícito la ruta conserva el comportamiento JSON original.

## Persistencia

Los datos se almacenan en `backend/data/products.json`, junto al siguiente ID.
Las mutaciones escriben un archivo temporal y lo reemplazan atómicamente antes
de devolver éxito. Al reiniciar se lee el mismo archivo; una lista vacía sigue
vacía y los productos borrados no reaparecen. Los ejemplos solo se cargan si
el archivo todavía no existe. Si está corrupto, no se sobrescribe.
`PRODUCTS_FILE` permite configurar una ubicación alternativa.
Respaldar `data` y `uploads`, ambos ignorados por Git. El disco debe ser permanente
en un despliegue. Este repositorio JSON admite una sola instancia del servidor;
para varios procesos concurrentes usar una base de datos.

## Fotos

`POST /api/uploads` requiere sesión y recibe un archivo en el campo `photo` de
un formulario multipart. Devuelve `{ success: true, data: { imageUrl: "/api/uploads/...webp" } }`.
Esa URL se usa como `imageUrl` al crear o editar el producto con JSON.
La descarga de fotos es pública para que se vean en el catálogo.

Se aceptan JPG, PNG y WebP hasta 5 MB y 20 millones de píxeles. Se comprueba el
contenido decodificándolo con Sharp, se aplica la orientación y se convierte
a WebP de hasta 1400 x 1400, con nombre aleatorio y sin metadatos originales.
Los errores conservan el contrato de la API; los archivos inválidos no se guardan.

Las fotos permanecen en `backend/uploads`, ignorado por Git, incluso al reemplazar
una imagen o borrar un producto. Solo las sesiones continúan en memoria.
Para producción hacen falta un almacén de sesiones, cuotas, limpieza y respaldo.

## Pruebas

```bash
npm test
```