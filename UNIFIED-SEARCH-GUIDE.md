# 🔍 UNIFIED SEARCH & DESIGN MERGE - KOMPLETT!

## 🎯 **HVA ER NYTT:**

### **1. UNIFIED SEARCH** ✅
Søk på tvers av ALLE innholdstyper samtidig:
- **Fysiske bøker** (katalog)
- **E-bøker & lydbøker** (Biblio)
- **Filmer & serier** (Filmoteket)
- **Arrangementer**

### **2. FANCY UI KOMPONENTER** ✅
- **BookCover Generator** - Algoritmiske bokomslag
- **UnifiedSearch** - Smart søk med dropdown
- **Design System** - Forbedret typography og colors

---

## 📂 **NYE FILER:**

### **1. Unified Search API**
**Fil:** `/app/api/search/route.ts`

**Funksjonalitet:**
- Søker i Prisma database (fysiske bøker, arrangementer)
- Søker i digital content adapter (Biblio, Filmoteket)
- Kombinerer og strukturerer resultater
- Returnerer grupperte resultater

**Endpoint:**
```
GET /api/search?q=harry+potter
```

**Response:**
```json
{
  "query": "harry potter",
  "total": 8,
  "results": {
    "physical": [
      {
        "id": "...",
        "type": "physical_book",
        "title": "Harry Potter og De vises stein",
        "author": "J.K. Rowling",
        "genre": "Fantasy",
        "available": true,
        "location": "Fysisk samling"
      }
    ],
    "digital": [
      {
        "id": "...",
        "type": "digital_book",
        "title": "Harry Potter...",
        "author": "J.K. Rowling",
        "subtype": "ebok",
        "provider": "biblio",
        "location": "Digitalt"
      }
    ],
    "events": []
  }
}
```

---

### **2. UnifiedSearch Komponent**
**Fil:** `/components/UnifiedSearch.tsx`

**Features:**
- ✅ Real-time søk (300ms debounce)
- ✅ Dropdown med grupperte resultater
- ✅ Ikoner for hver type innhold
- ✅ Direktelenker til riktig side
- ✅ Loading state
- ✅ Empty state
- ✅ Click-outside-to-close

**Bruk:**
```tsx
import UnifiedSearch from '@/components/UnifiedSearch'

<UnifiedSearch 
  placeholder="Søk..."
  autoFocus={true}
  className="max-w-2xl"
/>
```

---

### **3. BookCover Generator**
**Fil:** `/components/BookCover.tsx`

**Features:**
- ✅ Algoritmisk generering basert på tittel
- ✅ Deterministic (samme tittel = samme cover)
- ✅ Gradient bakgrunn med hue/saturation
- ✅ Dekorative shapes (circles/rects)
- ✅ 3 størrelser: small, normal, large
- ✅ Playfair Display font for titler

**Bruk:**
```tsx
import BookCover from '@/components/BookCover'

<BookCover 
  title="De syv søstre"
  author="Lucinda Riley"
  size="large"
  hue={210}
  saturation={35}
/>
```

**Størrelser:**
- `small`: 84x120px
- `normal`: 140x200px  
- `large`: 252x360px

---

## 🎨 **DESIGN SYSTEM (Fra gammel kode):**

### **Typography:**
- **Serif:** 'Fraunces' (headings, titler)
- **Sans:** 'DM Sans' (body, UI)

### **Colors:**
```css
--ink: #141b2d           /* Hovedtekst */
--ocean: #16425b         /* Primærfarge (Bergen blå) */
--fjord: #2a6a8e         /* Sekundær */
--sky: #7cb5d4           /* Accent */
--accent: #c8513a        /* Handling (rød/oransje) */
--success: #2d7a50       /* Grønn */
--warning: #b07a24       /* Gul */
```

### **Shadows:**
```css
--shadow-sm: 0 1px 3px rgba(20,27,45,0.04)
--shadow-md: 0 4px 12px rgba(20,27,45,0.06)
--shadow-lg: 0 12px 40px rgba(20,27,45,0.1)
--shadow-xl: 0 24px 64px rgba(20,27,45,0.14)
```

---

## 🔧 **IMPLEMENTERING:**

### **STEG 1: Legg til UnifiedSearch i PublicHeader**

**Oppdater:** `/components/PublicHeader.tsx`

```tsx
import UnifiedSearch from './UnifiedSearch'

export default function PublicHeader() {
  return (
    <header className="bg-[#16425b] text-white">
      <div className="container-custom">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/">...</Link>
          
          {/* UNIFIED SEARCH */}
          <div className="flex-1 max-w-2xl mx-8">
            <UnifiedSearch />
          </div>
          
          {/* Actions */}
          <nav>...</nav>
        </div>
      </div>
    </header>
  )
}
```

---

### **STEG 2: Bruk BookCover i Katalog**

**Oppdater:** `/app/katalog/page.tsx`

```tsx
import BookCover from '@/components/BookCover'

// I book card render:
<BookCover 
  title={book.tittel}
  author={book.forfatter}
  size="normal"
/>
```

---

### **STEG 3: Bruk BookCover i Min Side**

**Oppdater:** `/app/min-side/page.tsx`

```tsx
import BookCover from '@/components/BookCover'

// I lån/reservasjoner:
<BookCover 
  title={loan.title}
  author={loan.author}
  size="small"
/>
```

---

## 🧪 **TESTING:**

### **Test 1: Unified Search**
```
1. Gå til forsiden
2. Søk etter "Harry Potter"
3. Se resultater fra:
   - Fysisk katalog
   - E-bøker (Biblio)
   - Eventuelt arrangementer
4. Klikk på resultat
5. Blir sendt til riktig side
```

### **Test 2: Book Covers**
```
1. Gå til /katalog
2. Se genererte bokomslag
3. Samme bok skal alltid ha samme cover
4. Hover over bok → Shadow effect
5. Klikk → Modal med stort cover
```

### **Test 3: Search States**
```
1. Søk med 1 tegn → Ingen resultater
2. Søk med 2+ tegn → Viser dropdown
3. Søk uten treff → "Ingen resultater"
4. Klikk utenfor → Dropdown lukkes
5. Loading state → Spinner vises
```

---

## 📊 **SEARCH FLOW:**

```
User types in search
      ↓
300ms debounce
      ↓
GET /api/search?q=...
      ↓
├─ Prisma: fysiske bøker
├─ Prisma: arrangementer  
├─ digital-content-adapter: Biblio
└─ digital-content-adapter: Filmoteket
      ↓
Combine results
      ↓
Group by type
      ↓
Return JSON
      ↓
UnifiedSearch renders dropdown
      ↓
User clicks result
      ↓
Navigate to detail page
```

---

## 🎯 **BRUKEROPPLEVELSE:**

### **Før:**
❌ Måtte søke separat i katalog vs digitalt
❌ Måtte gå til forskjellige sider
❌ Ingen unified view

### **Etter:**
✅ Ett søk finner ALT
✅ Grupperte resultater (fysisk/digitalt/events)
✅ Direktelenker til detaljer
✅ Smart dropdown
✅ Fancy book covers
✅ Professional UI

---

## 💡 **VIDERE UTVIKLING:**

### **Kort sikt:**
1. **QR-kode lånekort** (fra gammel kode)
2. **Toast notifications** (fra gammel kode)
3. **Gamification** (poeng, badges)
4. **Gebyr-betaling**

### **Lang sikt:**
1. **Manifest linking** - Koble fysisk + digitale versjoner
2. **Favoritter** - Lagre søk og bøker
3. **Anbefalinger** - "Lignende titler"
4. **Avansert filter** - I search dropdown

---

## 🔗 **MANIFEST LINKING (Fremtidig):**

Når samme verk finnes i flere formater:

```
"Harry Potter og De vises stein"
├─ Fysisk bok (Bergen Hovedbibliotek)
├─ E-bok (Biblio)
├─ Lydbok (Biblio)
└─ Film (Filmoteket)
```

**Visning:**
```
┌─────────────────────────────────┐
│ Harry Potter og De vises stein  │
│ av J.K. Rowling                 │
├─────────────────────────────────┤
│ 📚 Fysisk bok - Ledig          │
│ 📖 E-bok - Tilgjengelig         │
│ 🎧 Lydbok - Tilgjengelig        │
│ 🎬 Film - Tilgjengelig          │
└─────────────────────────────────┘
```

Dette krever:
1. **FRBR-modell** i database
2. **Work/Expression/Manifestation**
3. **ISBN/EAN matching**

---

## 📝 **TEKNISKE DETALJER:**

### **Search Debounce:**
- 300ms delay før søk kjøres
- Unngår spam av API-kall
- Smooth UX

### **Result Grouping:**
```typescript
results: {
  physical: [...],  // Fysiske bøker
  digital: [...],   // E-bøker, lydbøker, filmer
  events: [...]     // Arrangementer
}
```

### **Type Discrimination:**
```typescript
type: 'physical_book' | 'digital_book' | 'digital_film' | 'event'
```

### **BookCover Algorithm:**
```typescript
// Seeded random basert på tittel
seed = title.charCodeAt() sum
hue = seed % 360
saturation = 30 + (title.length % 30)

// Deterministic shapes
shapes = generateShapes(seed)
```

---

## ✅ **FEATURE STATUS:**

| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| Unified Search | ✅ **KOMPLETT** | Søk på tvers av alt |
| BookCover Generator | ✅ **KOMPLETT** | Algoritmiske omslag |
| Search Dropdown | ✅ **KOMPLETT** | Fancy UI |
| Result Grouping | ✅ **KOMPLETT** | Fysisk/Digitalt/Events |
| Direct Navigation | ✅ **KOMPLETT** | Lenker til detaljer |
| QR-kode lånekort | ⏳ **NESTE** | Fra gammel kode |
| Toast notifications | ⏳ **NESTE** | Fra gammel kode |
| Manifest linking | 📅 **FREMTIDIG** | FRBR-modell |

---

**Built with ❤️ for Bergen Bibliotek**
**Unified Search & Design Merge - February 2026**
