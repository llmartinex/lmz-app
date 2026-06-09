# 🚀 Guía de configuración — LMZ App

## 1. Crear proyecto en Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com)
2. **Crear proyecto** → ponle nombre (ej. `lmz-app`)
3. Desactiva Google Analytics si quieres (no es necesario)

### Activar Authentication
- Firebase Console → **Authentication** → Comenzar
- Proveedores de acceso → **Google** → Habilitar → Guardar

### Activar Firestore
- Firebase Console → **Firestore Database** → Crear base de datos
- Elige **Modo de producción** → Europa como región (ej. `eur3`)

### Reglas de Firestore (pegar en la pestaña "Reglas"):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Obtener las claves
- Firebase Console → ⚙️ Configuración del proyecto → Tus apps → **Web** (icono `</>`)
- Registra la app → copia el objeto `firebaseConfig`

## 2. Pegar las claves en la app

Abre `src/firebase/config.js` y reemplaza los valores:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "lmz-app.firebaseapp.com",
  projectId: "lmz-app",
  storageBucket: "lmz-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

## 3. Instalar dependencias y probar en local

```bash
cd lmz-app
npm install
npm run dev
```

Abre [http://localhost:5173/lmz-app/](http://localhost:5173/lmz-app/)

## 4. Desplegar en GitHub Pages

### Primera vez:
```bash
# Instalar la herramienta de despliegue
npm install -D gh-pages

# Añadir scripts en package.json (ya incluidos)
# "predeploy": "npm run build"
# "deploy": "gh-pages -d dist"

# Desplegar
npm run deploy
```

### Cada vez que quieras actualizar:
```bash
npm run deploy
```

La app quedará en: `https://TU_USUARIO.github.io/lmz-app/`

> ⚠️ Asegúrate de que en `vite.config.js` el `base` coincide con el nombre de tu repo de GitHub.

## 5. Añadir dominio autorizado en Firebase

Para que el login con Google funcione en producción:
- Firebase Console → Authentication → Settings → **Dominios autorizados**
- Añadir: `TU_USUARIO.github.io`

---

## Estructura del proyecto

```
lmz-app/
├── src/
│   ├── firebase/config.js     ← tus claves aquí
│   ├── hooks/
│   │   ├── useAuth.js         ← autenticación
│   │   └── useHabits.js       ← lógica de hábitos + Firebase
│   ├── components/
│   │   ├── Login.jsx          ← pantalla de login
│   │   ├── Dashboard.jsx      ← pantalla principal
│   │   ├── HabitCard.jsx      ← tarjeta de cada hábito
│   │   └── WeekView.jsx       ← vista de los últimos 7 días
│   ├── App.jsx
│   └── main.jsx
└── public/
    ├── manifest.json          ← configuración PWA
    └── sw.js                  ← service worker (offline)
```
