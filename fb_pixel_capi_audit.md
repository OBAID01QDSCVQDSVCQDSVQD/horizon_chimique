# Audit Facebook Pixel + CAPI — SDK Batiment

## ✅ Architecture Générale — BONNE

| Composant | Fichier | État |
|-----------|---------|------|
| Utility centrale | `src/utils/trackFbEvent.js` | ✅ Correcte |
| Route CAPI | `src/app/api/capi/route.js` | ✅ Fonctionne (`[CAPI] Success sent to Facebook` vu dans les logs) |
| Déduplication | `eventID` partagé Browser + CAPI | ✅ Implémenté |
| Cookies `_fbc`/`_fbp` | envoyés via CAPI | ✅ Implémenté |
| IP + User-Agent | récupérés côté serveur | ✅ Implémenté |
| Hachage SHA-256 | email, téléphone, nom | ✅ Implémenté |

---

## 🔴 PROBLÈME CRITIQUE — Pixel non initialisé

Le pixel Facebook **n'est pas chargé dans le navigateur** !

Dans `layout.tsx`, le pixel n'est rendu que si `fbPixelId !== null` :
```js
let fbPixelId = null;
// Ce bloc est entièrement commenté → fbPixelId reste toujours null
```

**Conséquence :** `window.fbq` n'existe jamais → tous les appels `window.fbq('track', ...)` échouent silencieusement.

**Seul le CAPI fonctionne** (côté serveur via `/api/capi`), mais sans le Pixel navigateur :
- Pas de déduplication réelle
- Pas de tracking navigateur
- Le score de correspondance CAPI sera bas (pas de `_fbp`/`_fbc` cohérents)

### Correction requise dans `layout.tsx` :

```js
// REMPLACER le bloc commenté par :
const pixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
```

Et dans le JSX :
```jsx
{pixelId && (
  <Script id="fb-pixel" strategy="afterInteractive" dangerouslySetInnerHTML={{
    __html: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
    `
  }} />
)}
```

Et ajouter dans `.env.local` :
```
NEXT_PUBLIC_FB_PIXEL_ID=TON_PIXEL_ID
```

---

## 📊 État de chaque Événement

### PageView
- **Fichier :** `FacebookPixelEvents.tsx`
- **Browser Pixel :** ⚠️ INACTIF (fbq non chargé)
- **CAPI :** ✅ Actif — vu dans les logs : `[CAPI] Received event: PageView`
- **Déduplication :** ✅ event_id généré
- **Problème :** Double tracking possible (URL change tracker peut se déclencher 2 fois sur hydration)

### ViewContent (Produit)
- **Fichier :** `ProductClient.js` (L.28–46)
- **Browser Pixel :** ⚠️ `window.fbq` direct sans CAPI — pas de deduplication
- **CAPI :** ❌ Absent — pas d'appel à `trackFbEvent()`
- **Correction :** Remplacer `window.fbq('track', 'ViewContent', ...)` par `trackFbEvent('ViewContent', {...})`

### InitiateCheckout (Devis depuis produit)
- **Fichier :** `ProductClient.js` (L.185)
- **Browser Pixel :** ✅ Via `trackFbEvent()`
- **CAPI :** ✅ Via `trackFbEvent()`
- **État :** ✅ Correct

### Lead (Soumission devis)
- **Fichier :** `devis/page.js` (L.50)
- **Browser Pixel :** ✅ Via `trackFbEvent()` avec userData
- **CAPI :** ✅ Avec email/phone hashés
- **État :** ✅ Correct — meilleur événement du projet

### Contact / ScheduleAppointment (page /merci)
- **Fichier :** `merci/page.js`
- **Browser Pixel :** ✅ Via `trackFbEvent()`
- **CAPI :** ✅
- **Problème :** `ScheduleAppointment` n'est **pas un événement standard** Facebook — utiliser `Schedule` à la place

### WhatsAppClick
- **Fichier :** `WhatsAppButton.js`
- **Browser Pixel :** ⚠️ `window.fbq` direct — pas via `trackFbEvent()`
- **CAPI :** ❌ Absent
- **Correction :** Remplacer par `trackFbEvent('CustomEvent', { content_name: 'WhatsAppClick' })`

### AddToWishlist (Like)
- **Fichier :** `LikeButton.js` (L.36)
- **Browser Pixel :** ⚠️ `window.fbq` direct — pas via `trackFbEvent()`
- **CAPI :** ❌ Absent
- **Correction :** Remplacer par `trackFbEvent('AddToWishlist', {...})`

### Search (Catalogue produits)
- **Fichier :** `products/page.js` (L.49)
- **Browser Pixel :** ⚠️ `window.fbq` direct — pas via `trackFbEvent()`
- **CAPI :** ❌ Absent
- **Correction :** Remplacer par `trackFbEvent('Search', { search_string: searchTerm })`

### Contact (PDF download)
- **Fichier :** `ProductClient.js` (L.200)
- **Browser Pixel :** ✅ Via `trackFbEvent()`
- **CAPI :** ✅
- **État :** ✅ Correct

### CompleteRegistration
- **Fichier :** `merci/page.js` (type=register)
- **Browser Pixel :** ✅ Via `trackFbEvent()`
- **CAPI :** ✅
- **État :** ✅ Correct

---

## 🟡 CAPI — Problèmes mineurs

| Problème | Impact | Correction |
|----------|--------|------------|
| `API_VERSION = 'v19.0'` | ⚠️ Version ancienne | Passer à `v22.0` |
| `test_event_code` envoyé si `FB_TEST_EVENT_CODE` défini | ℹ️ Normal en dev | Bien vérifier qu'il n'est pas défini en production |
| `event_source_url` peut être vide en SSR | ℹ️ Mineur | Déjà géré avec fallback |

---

## 🎯 Priorités de Correction

### 🔴 Urgent
1. **Activer le Pixel navigateur** dans `layout.tsx` avec `NEXT_PUBLIC_FB_PIXEL_ID`

### 🟠 Important
2. **`ViewContent` (ProductClient)** → remplacer `window.fbq` direct par `trackFbEvent()`
3. **`WhatsAppClick`** → ajouter CAPI via `trackFbEvent()`
4. **`AddToWishlist` (LikeButton)** → ajouter CAPI via `trackFbEvent()`
5. **`Search`** → ajouter CAPI via `trackFbEvent()`

### 🟡 Optionnel
6. Mettre à jour `API_VERSION` vers `v22.0`
7. Renommer `ScheduleAppointment` → `Schedule`
