# Backend Salamanca

API REST de productos implementada con Express y organizada en capas MVC. Los datos de ejemplo y los cambios realizados se mantienen en memoria y se pierden al reiniciar el servidor.

## Ejecución

```bash
npm install
npm start
```

El servidor escucha en el puerto `3000` por defecto. Se puede cambiar con la variable de entorno `PORT`.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/products` | Obtener todos los productos |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear un producto |
| PUT | `/api/products/:id` | Modificar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |

El cuerpo para crear o modificar acepta `name`, `description`, `category`, `price`, `imageUrl` y `available`. Para modificar, se pueden enviar solo los campos que cambian.

Las respuestas exitosas usan `{ "success": true, "data": ... }`; las respuestas de error usan `{ "success": false, "message": "..." }`.

## Pruebas

```bash
npm test
```