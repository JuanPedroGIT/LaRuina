# Fiestas de Agosto — La Ruina 2026

Aplicación web para gestionar el programa de actividades y encuestas de las fiestas de agosto de La Ruina (14–18 de agosto de 2026).

## 🚀 Despliegue

La app se despliega en **Netlify** con una función serverless para la persistencia.

| Entorno | URL |
|---|---|
| Producción | `https://fiestas-agosto-2026.netlify.app` |

### Estructura del proyecto

```
.
├── index.html              # Frontend completo (HTML + CSS + JS embebidos)
├── config.json             # Títulos de la web y fechas de las fiestas (editar aquí)
├── favicon.svg             # Favicon y marca de agua
├── laRuina.png             # Imagen/logo de La Ruina
├── netlify.toml            # Config de Netlify (directorio de funciones)
└── netlify/
    └── functions/
        └── api.js          # Función serverless: proxy REST a JSONBin.io
```

### Configuración en Netlify

Variables de entorno necesarias en el panel de Netlify (**Site configuration > Environment variables**):

| Variable | Descripción |
|---|---|
| `JSONBIN_KEY` | API key de JSONBin.io (master key) |
| `JSONBIN_PROGRAM_ID` | ID del bin donde se guarda el programa de actividades |
| `JSONBIN_POLLS_ID` | ID del bin donde se guardan las encuestas |

## ⚙️ Configuración (`config.json`)

Los textos de la cabecera y los días de las fiestas se cambian en `config.json`, sin tocar el HTML:

| Campo | Qué controla |
|---|---|
| `tituloPestana` | Título de la pestaña del navegador |
| `cabecera` | Líneas del título grande (una por elemento) |
| `subtitulo` | Texto bajo el título (fechas) |
| `pie` | Texto del pie de página |
| `dias` | Lista de días (`fecha` en formato `DD/MM/AAAA` y `nota`) |

Los días se muestran en el orden de `dias`. Si añades un día nuevo, aparece vacío; si quitas uno, sus actividades guardadas no se borran, simplemente dejan de mostrarse.

## 💾 Persistencia

Los datos se almacenan en **JSONBin.io**, un servicio de almacenamiento JSON como servicio.

### Cómo funciona

```
Navegador ──GET/PUT──▶ Netlify Function (/api) ──GET/PUT──▶ JSONBin.io
```

1. **Lectura**: el frontend hace `GET /.netlify/functions/api?resource=program` (o `polls`). La función reenvía la petición a `GET /v3/b/{binId}/latest` en JSONBin y devuelve el JSON.

2. **Escritura**: el frontend hace `PUT /.netlify/functions/api?resource=program` con el JSON en el body. La función reenvía a `PUT /v3/b/{binId}` en JSONBin.

3. La API key de JSONBin **nunca** se expone al cliente — vive solo en las variables de entorno de Netlify.

### Estructura de los datos

**Programa** (`JSONBIN_PROGRAM_ID`):

```json
{
  "days": [
    {
      "date": "14/08/2026",
      "note": "Viernes — Arranque",
      "activities": [
        {
          "type": "comida",
          "title": "Paella popular",
          "participants": ["Ana", "Luis"],
          "responsables": ["Juan"]
        }
      ]
    }
  ]
}
```

**Encuestas** (`JSONBIN_POLLS_ID`):

```json
{
  "polls": [
    {
      "id": "poll-1691000000000",
      "question": "¿Qué cenamos el 15?",
      "options": [
        { "text": "Pizza", "votes": ["Marta", "Carlos"] },
        { "text": "Sushi", "votes": ["Elena"] }
      ]
    }
  ]
}
```

## 🛠 Desarrollo local

Al ser una app Netlify, usa la CLI de Netlify para probar las funciones localmente:

```bash
npm install -g netlify-cli
netlify dev
```

Esto levanta un servidor local con la función `/api` disponible.

O simplemente abre `index.html` directamente para trabajar en el frontend (las llamadas a la API fallarán sin la función, pero la UI es navegable).

## 🎨 Diseño

- Tipografías: **Bebas Neue** (títulos), **Work Sans** (cuerpo), **IBM Plex Mono** (etiquetas, botones)
- Paleta: fondo papel, tarjetas claras, acentos saffron/rojo/teal
- Marca de agua: `favicon.svg` sutil en todo el fondo de la página
- Banderines animados en la parte superior (con `prefers-reduced-motion` para accesibilidad)
- Dos pestañas: **Programa** (actividades por día con participantes y responsables) y **Encuestas** (votaciones con opciones)

## 📝 Notas

- Las actividades tienen tres tipos: `comida` (borde saffron), `cena` (borde teal), `actividad` (borde rojo)
- Cada actividad permite añadir/quitar participantes y responsables con un clic
- Las encuestas permiten crear, votar y eliminar — los votos son por nombre, sin autenticación
- El guardado es automático tras cada acción (añadir/quitar personas, crear/borrar encuestas, votar)
