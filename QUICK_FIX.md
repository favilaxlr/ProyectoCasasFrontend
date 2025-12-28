# ⚡ SOLUCIÓN RÁPIDA - Error 401 en Render

## 🔴 El problema:
Tu frontend está intentando conectarse a `localhost:4000` en lugar de tu backend de Render.

## ✅ Solución en 3 pasos:

### 1. FRONTEND en Render Dashboard
Ve a tu servicio de **Frontend** → Environment → Add Environment Variables:

```
VITE_BASE_URL=https://proyectocasasbackend.onrender.com
VITE_ROLE_ADMIN=admin
```

### 2. BACKEND en Render Dashboard  
Ve a tu servicio de **Backend** → Environment → Verifica/Añade:

```
BASE_URL_FRONTEND=https://proyectocasasfrontend.onrender.com
ENVIROMENT=production
```

### 3. REDEPLOY
- Guarda las variables
- Haz "Manual Deploy" en ambos servicios (Backend y Frontend)
- Espera 5-10 minutos

## 🎯 Resultado esperado:
- ✅ No más errores 401
- ✅ Login funciona
- ✅ Las propiedades se cargan

---

## 📋 Checklist rápido:
- [ ] Frontend tiene `VITE_BASE_URL`
- [ ] Backend tiene `BASE_URL_FRONTEND` con URL real
- [ ] Backend tiene `ENVIROMENT=production`
- [ ] MongoDB Atlas permite conexiones (IP 0.0.0.0/0)
- [ ] Redeployado ambos servicios

---

**Ver instrucciones completas en:** [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
