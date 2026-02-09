# 🐛 BUGFIXES v3.2

**Dato:** 8. februar 2025  
**Versjon:** 3.2  
**Status:** Fikser fra testing

---

## 🔧 FIKSET:

### **1. Dupliser arrangement viser ikke kopi**

**Problem:**  
- Dupliser-knappen fungerte  
- API-et opprettet kopi  
- Men listen viste ikke den nye kopien

**Årsak:**  
- Admin GET `/api/arrangementer` filtrerte på `publisert: true`
- Dupliserte arrangementer er `publisert: false` (kladd)
- Dermed ble de ikke vist i listen

**Løsning:**
```typescript
// ✅ ETTER: Admin ser alle arrangementer
export async function GET() {
  const arrangementer = await prisma.arrangement.findMany({
    orderBy: { dato: 'asc' }
  })
  return NextResponse.json(arrangementer)
}

// Frontend filtrerer selv på publisert
const filteredEvents = arrangementer.filter(event =>
  event.publisert && ...
)
```

**Resultat:**  
✅ Admin ser både publiserte og utkast  
✅ Frontend ser kun publiserte  
✅ Dupliserte arrangementer vises umiddelbart

---

### **2. Varsel ikke rødt banner for type "viktig"**

**Problem:**  
- Varselet viste, men ikke med riktig farge
- Type "viktig" skulle gi rød bakgrunn
- Viste grå istedenfor

**Årsak:**  
- Database lagrer "Viktig" (stor V)
- Switch-statement sjekket "viktig" (liten v)
- Case-sensitivity mismatch

**Løsning:**
```typescript
// ✅ Case-insensitive matching
const getBackgroundColor = (type: string) => {
  const lowerType = type.toLowerCase()
  switch (lowerType) {
    case 'info': return 'bg-blue-50 ...'
    case 'advarsel': return 'bg-yellow-50 ...'
    case 'viktig': return 'bg-red-50 ...'
  }
}
```

**Resultat:**  
✅ Info = blått banner  
✅ Advarsel = gult banner  
✅ Viktig = rødt banner 🚨

---

### **3. Søk gir ingen treff for Agnes Ravatn**

**Problem:**  
- Søket fungerte teknisk
- API returnerte 200 OK
- Men ingen bøker viste

**Debugging lagt til:**
```typescript
// API logging
console.log('🔍 KATALOG SØKE:', { query, sjanger })
console.log('📚 RESULTAT:', bøker.length, 'bøker funnet')

// ILS adapter logging
console.log('🔎 Database søk WHERE:', where)
console.log('💾 Database returnerte:', result.length, 'bøker')

// Seed verification
const agnesBooks = await prisma.bok.findMany({
  where: { forfatter: { contains: 'Agnes', mode: 'insensitive' } }
})
console.log(`→ Fant ${agnesBooks.length} Agnes Ravatn bøker`)
```

**Neste steg for bruker:**
1. Kjør seed på nytt: `npm run db:seed`
2. Se i konsollen om Agnes Ravatn bøker finnes
3. Test søk og se logging

---

## 📦 INSTALLASJON:

```bash
# 1. Last ned og pakk ut
cd ~/Downloads
unzip -o bibliotek-v3.2-BUGFIXES.zip
cd bibliotek-v2.1-final

# 2. Kopier til prosjekt
cp -r * ~/Documents/BibliotekProsjekt/
cd ~/Documents/BibliotekProsjekt

# 3. Installer (hvis nødvendig)
npm install

# 4. Oppdater database
npm run db:push
npm run db:seed

# OBS! Se i output fra seed:
# Du skal se:
#   → Fant 3 Agnes Ravatn bøker:
#      - Dei sju dørene
#      - Fugletribunalet
#      - Veke 53

# 5. Slett cache og start
rm -rf .next
npm run dev
```

---

## 🧪 TEST PÅ NYTT:

### **Test 1: Dupliser arrangement** ✅
1. http://localhost:3000/admin/arrangementer
2. Klikk "📋 Dupliser"
3. ✅ Nytt arrangement vises med "(kopi)"
4. ✅ Status er "Kladd"

### **Test 2: Varsling** ✅
1. http://localhost:3000/admin/varsler
2. Opprett varsel type "Viktig"
3. Gå til http://localhost:3000/katalog
4. ✅ Rødt banner vises 🚨

### **Test 3: Søk Agnes Ravatn**
1. http://localhost:3000/katalog
2. Søk "agnes ravatn"
3. Se i terminal/konsoll:
```
🔍 KATALOG SØKE: { query: 'agnes ravatn', sjanger: undefined }
🔎 Database søk WHERE: { "OR": [...] }
💾 Database returnerte: 3 bøker
📚 RESULTAT: 3 bøker funnet
Første bok: Dei sju dørene av Agnes Ravatn
```
4. ✅ 3 bøker skal vises i UI

---

## ⚠️ HVIS SØKET FORTSATT IKKE VIRKER:

**Sjekk 1: Seed output**
Når du kjører `npm run db:seed`, skal du se:
```
✅ Opprettet bøker (inkludert Agnes Ravatn)
   → Fant 3 Agnes Ravatn bøker:
      - Dei sju dørene
      - Fugletribunalet
      - Veke 53
```

**Hvis du IKKE ser dette:**
- Seed feilet
- Database-tilkobling problem
- Sjekk .env.local har DATABASE_URL

**Sjekk 2: Console logging**
Når du søker, skal du se i terminal:
```
🔍 KATALOG SØKE: ...
🔎 Database søk WHERE: ...
💾 Database returnerte: X bøker
📚 RESULTAT: X bøker funnet
```

**Hvis du ser "0 bøker":**
- Bøkene er ikke i database
- Kjør seed på nytt

**Sjekk 3: Database direkte**
```bash
cd ~/Documents/BibliotekProsjekt
npx prisma studio
```
- Åpner database GUI
- Gå til "bok" table
- Søk etter "Agnes"
- Skal finne 3 bøker

---

## 🎯 FORVENTET RESULTAT ETTER FIXES:

1. ✅ Dupliserte arrangementer vises i admin
2. ✅ Viktige varsler har rødt banner
3. ✅ Søk etter "Agnes Ravatn" viser 3 bøker
4. 📝 Debug-logging hjelper med troubleshooting

---

## 📁 ENDREDE FILER:

```
app/api/arrangementer/route.ts    # Fjernet publisert-filter
app/arrangementer/page.tsx         # Frontend filtrerer publisert
app/admin/varsler/page.tsx         # Case-insensitive type
components/VarselBanner.tsx        # Case-insensitive type
app/api/katalog/route.ts           # Logging
lib/ils-adapter.ts                 # Logging
prisma/seed.ts                     # Verification logging
```

---

## 🚀 NESTE STEG:

Når alle 3 tester fungerer, fortsett med **FASE 2**:
1. ID-porten mock
2. Digitalt innhold
3. Quick-reserve
4. Varsling-preferanser

**God testing! 🎉**
