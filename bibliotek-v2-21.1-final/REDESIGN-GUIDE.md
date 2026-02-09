# 🏗️ REDESIGN - TO SEPARATE GRENSESNITT

## 🎯 **PROBLEM LØST:**

**Før:** Forvirrende struktur med admin og publikum blandet sammen på forsiden
**Etter:** To klart separerte grensesnitt med konsistent navigasjon

---

## 📐 **NY ARKITEKTUR:**

```
┌─────────────────────────────────────┐
│  PUBLIKUM (Bibliotek-nettside/app)  │
│  ────────────────────────────────── │
│  / (Forside)                        │
│  ├── Hero med søk                   │
│  ├── Quick links (Katalog, Digitalt)│
│  ├── Kommende arrangementer         │
│  ├── Åpningstider                   │
│  └── Footer med CMS-link            │
│                                     │
│  Konsistent navigasjon på alle sider│
│  [Hjem] [Katalog] [Digitalt]       │
│  [Arrangementer] [Min side]         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ADMIN (CMS for ansatte)            │
│  ────────────────────────────────── │
│  /admin                             │
│  ├── Dashboard                      │
│  ├── Arrangementer                  │
│  ├── Innhold                        │
│  ├── Varsler                        │
│  └── Statistikk                     │
│                                     │
│  Separat admin-navigasjon           │
│  [Dashboard] [Innhold] [Varsler]    │
└─────────────────────────────────────┘
```

---

## 📂 **ENDREDE FILER:**

### **1. Ny Publikums-forside** ✅
**Fil:** `/app/page.tsx`

**Før:**
- 4 kort (Admin, Katalog, Digitalt, Login)
- Teknisk landing page
- Forvirrende for besøkende

**Etter:**
- ✅ Header med konsistent navigasjon
- ✅ Hero-seksjon med call-to-actions
- ✅ 3 quick-link kort
- ✅ Kommende arrangementer (fra API)
- ✅ Åpningstider
- ✅ "Bli medlem" info-boks
- ✅ Footer med admin-link (diskret)

---

### **2. Ny Felles Header Komponent** ✅
**Fil:** `/components/PublicHeader.tsx`

**Features:**
- ✅ Logo og navn
- ✅ Navigasjonslenker
- ✅ Active state (underline på aktiv side)
- ✅ "Min side" call-to-action knapp
- ✅ Responsiv (mobile menu button)
- ✅ Bruker `usePathname()` for routing

**Brukes på:**
- `/` (Forside)
- `/katalog` (Katalog)
- `/digitalt` (Digitalt innhold)
- `/arrangementer` (Arrangementer)
- `/min-side` (Min side)

---

### **3. Oppdaterte Publikums-sider** ✅

Alle publikums-sider nå har:
- ✅ Importerer `PublicHeader`
- ✅ Fjernet individuelle headers
- ✅ Konsistent navigasjon
- ✅ Lik look-and-feel

**Oppdaterte filer:**
- `/app/katalog/page.tsx`
- `/app/arrangementer/page.tsx`
- `/app/digitalt/page.tsx`
- `/app/min-side/page.tsx`

---

### **4. Admin Separat** ✅

Admin-siden (`/admin`) er uendret og tydelig separert:
- Egen innlogging
- Egen navigasjon
- Kun tilgjengelig via footer-link eller direkte URL
- Ikke fremhevet på forsiden

---

## 🧪 **TESTING GUIDE:**

### **1. Publikums-flyt:**
```
1. Gå til http://localhost:3000
2. Se ny forside med hero, quick-links
3. Klikk "Katalog" i header
4. Se konsistent header på katalog-siden
5. Klikk "Digitalt innhold" i header
6. Se samme header på digitalt-siden
7. Klikk "Arrangementer" i header
8. Se samme header
9. Klikk "Min side" knapp (hvit)
10. Se innloggingsside eller min-side
```

### **2. Navigasjon test:**
```
1. Start på forsiden
2. Naviger til Katalog → Header viser "Katalog" understreket
3. Naviger til Digitalt → Header viser "Digitalt innhold" understreket
4. Naviger til Arrangementer → Header viser "Arrangementer" understreket
5. Klikk "Hjem" → Tilbake til forsiden
```

### **3. Admin-tilgang:**
```
1. På forsiden, scroll til footer
2. Se "For ansatte" seksjon
3. Klikk "→ CMS/Admin innlogging"
4. Blir sendt til /admin
5. Separat admin-grensesnitt
```

---

## 🎨 **DESIGN-ENDRINGER:**

### **Forside (/):**

**Hero:**
- Gradient bakgrunn (#16425b → #2d6a8e)
- Stor heading: "Velkommen til Bergen Bibliotek"
- 2 call-to-action knapper
- Moderne, inviterende design

**Quick Links:**
- 3 hvite kort i grid
- Ikoner: 📖 🎬 📅
- Hover-effekter
- Direkte lenker til hovedseksjoner

**Kommende Arrangementer:**
- Dynamisk fra API
- Viser 3 neste arrangementer
- Kategori-badges
- "Se alle →" lenke

**Info-bokser:**
- Åpningstider (blå)
- Bli medlem (grønn)
- Call-to-actions

**Footer:**
- 3 kolonner: Info, Kontakt, For ansatte
- Diskret admin-link
- Copyright og tech stack

---

### **Header (Alle sider):**

**Logo-seksjon:**
- 📚 emoji
- "Bergen Bibliotek" (stor)
- "Felles Formidlingsløsning" (liten)

**Navigasjon:**
- Hjem, Katalog, Digitalt innhold, Arrangementer
- Active state: hvit underline
- Hover: opacity 80%

**Min side:**
- Hvit knapp
- Prominent plassering
- Call-to-action stil

---

## 📊 **BRUKEROPPLEVELSE:**

### **Før:**
❌ Forvirrende blanding av admin og publikum
❌ Ingen klar hovedside
❌ Teknisk, ikke inviterende
❌ Ulike headers på hver side

### **Etter:**
✅ Klar separasjon: Publikum vs Admin
✅ Profesjonell bibliotek-nettside
✅ Inviterende forside med hero
✅ Konsistent navigasjon overalt
✅ Moderne, polert design

---

## 🚀 **IMPLEMENTASJONS-DETALJER:**

### **PublicHeader Active State:**
```typescript
const isActive = (path: string) => {
  if (path === '/') {
    return pathname === '/' // Exact match for home
  }
  return pathname.startsWith(path) // Prefix match for others
}
```

### **Kommende Arrangementer (Dynamisk):**
```typescript
useEffect(() => {
  fetchKommendeArrangementer()
}, [])

const fetchKommendeArrangementer = async () => {
  const response = await fetch('/api/arrangementer')
  const data = await response.json()
  setKommendeArrangementer(data.slice(0, 3)) // Kun 3 første
}
```

### **Responsiv Design:**
- Desktop: Full navigasjon
- Mobile: Hamburger menu (placeholder)
- Grid: 1 kolonne (mobile) → 3 kolonner (desktop)

---

## ✅ **OPPDATERT STRUKTUR:**

```
/                         → Publikums-forside ✨ NY DESIGN
├── /katalog              → Søk i samlingen (PublicHeader)
├── /digitalt             → E-bøker og streaming (PublicHeader)
├── /arrangementer        → Forfattermøter og kurs (PublicHeader)
├── /min-side             → Lån og reservasjoner (PublicHeader)
└── /login                → Innlogging

/admin                    → CMS for ansatte (Separat)
├── /admin/arrangementer  → Administrer arrangementer
├── /admin/innhold        → Administrer innhold
├── /admin/varsler        → Administrer varsler
└── /admin/statistikk     → Se statistikk
```

---

## 📝 **TEKNISKE NOTER:**

### **Delt Header Komponent:**
- Unngår code duplication
- Enkelt å oppdatere navigasjon
- Konsistent på alle sider

### **usePathname Hook:**
- Fra `next/navigation`
- Henter current route
- Brukes for active state

### **Footer Admin-link:**
- Diskret plassering
- Ikke fremhevet
- Kun for ansatte

---

## 🎯 **NESTE STEG:**

Nå som arkitekturen er ryddig, kan vi fokusere på:

1. **ID-porten Mock** - Autentisering demo
2. **Varsling-preferanser** - Brukerinnstillinger
3. **Mobile Menu** - Hamburger for mobil
4. **Favoritter** - Hjerte-funksjon på bøker
5. **"Se kø"** - Kø-visning for utlånte bøker

---

**Built with ❤️ for Bergen Bibliotek**
**Architecture Redesign - February 2026**
