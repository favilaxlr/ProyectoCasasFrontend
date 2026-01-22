# 🚀 Guía de Despliegue en Render

## ❌ Problema Actual
Error 401 "No token autorización denegada" debido a:
- Variables de entorno incorrectas
- Problemas de CORS/Cookies entre dominios
- Tracking Prevention del navegador bloqueando cookies

---

## ✅ SOLUCIÓN PASO A PASO

### 1️⃣ BACKEND - Configuración en Render

#### A. Ve a tu servicio de Backend en Render Dashboard

#### B. Configura estas **Environment Variables**:

```env
MONGODB_URL=tu_url_de_mongodb_atlas
BASE_URL_BACKEND=https://proyectocasasbackend.onrender.com
BASE_URL_FRONTEND=https://proyectocasasfrontend.onrender.com
ENVIROMENT=production
TOKEN_SECRET=xxxx
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
SENDGRID_API_KEY=xxxx
SENDGRID_FROM_EMAIL=xxxx
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=xxxx
SETUP_ADMIN_USERNAME=Admin
SETUP_ADMIN_PWD=xxxx
SETUP_ADMIN_EMAIL=xxxx
SETUP_ADMIN_PHONE=xxxx
SETUP_ROLE_ADMIN=admin
SETUP_ROLE_USER=user
```

#### C. IMPORTANTE - Reemplaza:
- ✏️ `MONGODB_URL`: Usa tu URL de MongoDB Atlas (no localhost)


---

### 2️⃣ FRONTEND - Configuración en Render

#### A. Ve a tu servicio de Frontend en Render Dashboard

#### B. Configura estas **Environment Variables**:

```env
VITE_BASE_URL=https://proyectocasasbackend.onrender.com
VITE_ROLE_ADMIN=admin
```

#### C. Verifica el Build Command:
```bash
npm install && npm run build
```

#### D. Verifica el Start Command:
```bash
npm run preview
```

O si prefieres usar un servidor estático más robusto:
```bash
npx serve -s dist -l 10000
```

---

### 3️⃣ MONGODB ATLAS

Asegúrate de que tu MongoDB Atlas permita conexiones desde Render:

1. Ve a MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Selecciona **"Allow Access from Anywhere"** (0.0.0.0/0)
4. O añade las IPs de Render específicamente

---

### 4️⃣ Después de Configurar

1. **Guarda las variables de entorno** en Render
2. **Redeploy ambos servicios** (Backend y Frontend)
3. **Espera a que terminen los deployments** (puede tomar 5-10 minutos)
4. **Prueba tu aplicación**

---

## 🔍 Verificación

### A. Verifica que el Backend funciona:
Abre en tu navegador:
```
https://proyectocasasbackend.onrender.com/api/properties
```

Deberías ver una respuesta JSON (puede ser error 401 si requiere auth, pero debería responder)

### B. Verifica que el Frontend carga:
Abre tu URL de frontend en Render

### C. Prueba el Login:
1. Intenta hacer login
2. Abre las DevTools (F12) → Console
3. No deberían aparecer errores de CORS ni 401

---

## 🛠️ Troubleshooting

### Si sigues viendo errores 401:

1. **Verifica las cookies en DevTools:**
   - F12 → Application → Cookies
   - Deberías ver una cookie llamada `token`

2. **Verifica CORS:**
   - En DevTools Console, no debe haber errores de CORS
   - Si hay errores, verifica que `BASE_URL_FRONTEND` esté correctamente configurada

3. **Verifica las variables de entorno:**
   ```bash
   # En el Shell de Render (Backend)
   echo $BASE_URL_FRONTEND
   echo $BASE_URL_BACKEND
   
   # Deberían mostrar las URLs correctas
   ```

4. **Limpia cookies y caché del navegador:**
   - Ctrl + Shift + Delete
   - Limpia todo
   - Intenta de nuevo

### Si el Frontend no carga correctamente:

1. **Verifica los logs en Render:**
   - Ve a tu servicio Frontend
   - Click en "Logs"
   - Busca errores de build

2. **Verifica el package.json:**
   Asegúrate de tener el script preview:
   ```json
   {
     "scripts": {
       "preview": "vite preview --port 10000 --host"
     }
   }
   ```

---

## 📝 URLs de Ejemplo

Después de configurar todo, tus URLs deberían ser:

- **Backend:** `https://proyectocasasbackend.onrender.com`
- **Frontend:** `https://proyectocasasfrontend.onrender.com`
- **MongoDB:** `mongodb+srv://usuario:password@cluster.mongodb.net/dbname`

---

## ⚠️ IMPORTANTE - Seguridad

### Antes de ir a producción REAL:

1. **Cambia las credenciales de admin:**
   ```env
   SETUP_ADMIN_PWD=TuPasswordSeguro123!
   ```

2. **Regenera las claves de API:**
   - Twilio
   - SendGrid
   - Cloudinary
   
3. **Usa secretos más fuertes:**
   ```env
   TOKEN_SECRET=UnTokenMuySeguroYAleatorio123456789!@#$%
   ```

4. **NO SUBAS** archivos `.env` a GitHub
   - Ya deberían estar en `.gitignore`

---

## 📞 Si aún tienes problemas

Provee esta información:

1. URL de tu frontend en Render
2. URL de tu backend en Render
3. Screenshot de los errores en DevTools Console
4. Screenshot de tus variables de entorno en Render (oculta las claves)
5. Logs de Render (últimas 50 líneas)

---

## ✨ Checklist Final

- [ ] Variables de entorno configuradas en Backend
- [ ] Variables de entorno configuradas en Frontend
- [ ] MongoDB Atlas permite conexiones desde Render
- [ ] BASE_URL_FRONTEND y BASE_URL_BACKEND correctas
- [ ] Ambos servicios redeployados
- [ ] Cookies funcionando (verificado en DevTools)
- [ ] No hay errores de CORS
- [ ] Login funciona correctamente
- [ ] Admin puede acceder al panel
