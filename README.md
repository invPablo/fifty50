# Tranzfr — Split Bills App 💰

Una app mobile para dividir gastos de forma sencilla y clara.

**Precio:** $0.99 en App Store / Google Play

## Features

✅ Crear grupos con múltiples miembros
✅ Agregar gastos y especificar quién pagó y quiénes dividen
✅ Cálculo automático de deudas
✅ Liquidación propuesta (quién paga a quién y cuánto)
✅ Balance por persona
✅ Historial de gastos
✅ Persistencia local (AsyncStorage)

## Stack Técnico

- **React Native** (Expo)
- **Zustand** - State management
- **React Navigation** - Navegación
- **AsyncStorage** - Persistencia
- **Styling:** StyleSheet nativo

## Instalación & Setup

### 1. Instalar dependencias
```bash
cd Tranzfr
npm install
```

### 2. Correr en desarrollo
```bash
npx expo start
```

Luego:
- Presiona `a` para Android emulator
- Presiona `i` para iOS simulator (Mac only)
- Presiona `w` para web version
- O escanea el QR con Expo Go app en tu teléfono

### 3. Build para distribución

Para publicar necesitarás:
- Apple Developer Account ($99/año)
- Google Play Developer Account ($25 one-time)

## Estructura del Proyecto

```
Tranzfr/
├── App.js              # Entrada principal
├── store.js            # Zustand state management
├── screens/
│   ├── GroupsScreen.js
│   └── GroupDetailScreen.js
├── package.json
└── README.md
```

## Próximos Pasos

1. **Testear localmente**
   ```bash
   npm install
   npx expo start
   ```

2. **Build APK/IPA para app stores**
   ```bash
   npx eas build --platform android
   npx eas build --platform ios
   ```

3. **Publicar a App Store / Google Play**
   - Configurar precio a $0.99
   - Escribir descripción
   - Submit para review

---

**Stack:** Expo + React Native + Zustand + AsyncStorage  
**Monetización:** $0.99 one-time purchase  
**Status:** MVP completo listo para publicar
