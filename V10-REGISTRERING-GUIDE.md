# 📝 BIBLIOTEK v10.0 - REGISTRERING AV LÅNEKORT!

## ✨ **HVA ER NYTT:**

### **KOMPLETT REGISTRERINGSFLYT!** 🎯
Ny brukerregistrering med 4-stegs prosess:
1. **Intro** - Fordeler med lånekort
2. **Skjema** - Personopplysninger
3. **ID-porten** - BankID simulering
4. **Success** - Velkomst med lånekort

---

## 🎯 **FEATURES:**

### **1. Introduksjonsside (`/registrer`)**
**Gradient hero med fordeler:**
- 📖 Ubegrenset utlån
- 📱 Digitalt innhold  
- 🎭 Arrangementer
- 🏆 Gamification

**CTA buttons:**
- "Registrer deg nå" (primary)
- "Har allerede kort? Logg inn" (secondary)

---

### **2. Registreringsskjema**
**Påkrevde felter:**
- ✅ Fornavn *
- ✅ Etternavn *
- ✅ Fødselsdato *
- ✅ E-post *
- ✅ Mobilnummer *

**Valgfrie felter:**
- Adresse
- Postnummer
- Poststed

**Validering:**
- Client-side validering
- Toast feilmeldinger
- Aksept av vilkår påkrevd

---

### **3. ID-porten Simulering**
**UX Flow:**
- Loading spinner
- "Bekrefter med BankID" melding
- 2 sekunder delay (realistisk)
- Auto-redirect til success

**Sikkerhet:**
- 🔒 "Sikker identifikasjon via ID-porten" badge
- Simulert for demo
- Klar for ekte integrasjon

---

### **4. Success / Velkomstside**
**Gradient success hero (grønn):**
- 🎉 Gratulerer-melding
- Lånekort-nummer (stort, monospace)
- "Skriv ned dette" instruksjon

**Quick actions:**
- 3 info-kort (Søk, Digitalt, Arrangementer)
- "Gå til Min Side" (primary CTA)
- "Søk i katalogen" (secondary)

**Tips:**
- 💡 "Besøk Min Side for QR-kode"

---

## 📂 **NYE FILER:**

| Fil | Beskrivelse |
|-----|-------------|
| `/app/registrer/page.tsx` | Komplett registreringsflyt (4 steps) |
| `/app/api/registrer/route.ts` | API for brukeropprettelse |

---

## 🗄️ **DATABASE ENDRINGER:**

### **Prisma Schema Oppdatert:**
```prisma
model Bruker {
  // NYE FELTER:
  fornavn      String?    // Fornavn
  etternavn    String?    // Etternavn
  fodselsdato  DateTime?  // Fødselsdato
  passord      String?    // Hashed passord (bcrypt)
  mobil        String?    // Mobilnummer
  
  // EKSISTERENDE:
  navn         String
  epost        String? @unique
  bibliotekkortnummer String @unique
  ...
}
```

**Migrering påkrevd:**
```bash
npx prisma migrate dev --name add_registration_fields
npx prisma generate
```

---

## 🔗 **INTEGRASJONER:**

### **Lenker lagt til:**

**1. Login side (`/login`):**
```
"Har du ikke lånekort ennå?"
[Registrer deg her →] (grønn knapp)
```

**2. Hero section (`/`):**
```
[🔍 Utforsk katalogen] (hvit)
[📝 Bli medlem] (grønn) ← NY!
[📅 Se arrangementer] (outline)
```

---

## 🚀 **INSTALLASJON:**

### **Steg 1: Installer filer**
```bash
cd ~/Documents/BibliotekProsjekt

# Kopier v10.0
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' ~/Downloads/bibliotek-v10.0-REGISTRERING/bibliotek-v2.1-final/ .
```

### **Steg 2: Database migrering**
```bash
# Installer bcryptjs for passord-hashing
npm install bcryptjs
npm install --save-dev @types/bcryptjs

# Kjør Prisma migrering
npx prisma migrate dev --name add_registration_fields
npx prisma generate
```

### **Steg 3: Restart server**
```bash
pkill -9 node && rm -rf .next && npm run dev
```

---

## 🧪 **TEST GUIDE:**

### **Test 1: Intro Side**
```
1. Gå til http://localhost:3001/registrer
2. Se gradient hero (blå)
3. Se 4 fordel-kort:
   - Ubegrenset utlån
   - Digitalt innhold
   - Arrangementer
   - Gamification
4. Se 2 buttons:
   - "Registrer deg nå"
   - "Har allerede kort? Logg inn"
```

### **Test 2: Registreringsskjema**
```
1. Klikk "Registrer deg nå"
2. Fyll ut skjema:
   Fornavn: Ola
   Etternavn: Nordmann
   Fødselsdato: 1990-01-01
   E-post: ola@example.com
   Mobil: 12345678
3. Aksepter vilkår (checkbox)
4. Klikk "Gå videre til BankID"
```

### **Test 3: Validering**
```
1. Prøv å sende uten fornavn
   → Toast: "Fyll inn fornavn og etternavn"
2. Prøv uten aksept av vilkår
   → Toast: "Du må akseptere vilkårene"
3. Fyll ut alt korrekt → går videre
```

### **Test 4: ID-porten Simulering**
```
1. Etter submit: Loading screen
2. Se spinner (2 sekunder)
3. "Bekrefter med BankID"
4. 🔒 Sikkerhet badge
5. Auto-redirect til success
```

### **Test 5: Success / Velkomst**
```
1. Gradient hero (grønn) med 🎉
2. "Velkommen til Bergen Bibliotek!"
3. Lånekort-nummer vises (10 sifre)
4. 3 info-kort
5. 2 CTA buttons:
   - "Gå til Min Side"
   - "Søk i katalogen"
6. Tips om QR-kode
```

### **Test 6: Database Verifisering**
```bash
# Sjekk at bruker ble opprettet:
npx prisma studio

# Gå til "brukere" tabellen
# Verifiser ny bruker med:
- Generert bibliotekkortnummer
- Hashed passord
- Fornavn, etternavn
- Fødselsdato
- E-post, mobil
- rolle: "LAANER"
- aktiv: true
```

### **Test 7: Logg inn med nytt kort**
```
1. Gå til /login
2. Bruk generert lånekort-nummer
3. PIN: (samme som lånekort-nummer for demo)
4. Skal kunne logge inn!
5. Se QR-kode på Min Side
```

---

## 🎨 **DESIGN FEATURES:**

### **Intro Gradient:**
```css
background: linear-gradient(135deg, #16425b 0%, #2a6a8e 100%)
```

### **Success Gradient:**
```css
background: linear-gradient(135deg, #2d7a50 0%, #16a34a 100%)
```

### **Buttons:**
- **Primary (blå):** `bg-[#16425b]`
- **Success (grønn):** `bg-[#2d7a50]`
- **Secondary:** `border-2 border-gray-300`

### **Form Fields:**
```css
focus:border-[#16425b]
border-2 border-gray-200
rounded-lg
px-4 py-3
```

---

## 🔐 **SIKKERHET:**

### **Passord Hashing:**
```typescript
import bcrypt from 'bcryptjs'

// Hash passord (10 rounds)
const hashedPassword = await bcrypt.hash(password, 10)

// For demo: passord = bibliotekkortnummer
```

### **Lånekort-nummer Generering:**
```typescript
// 10 random sifre
const generateCardNumber = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString()
}

// Sjekk unikt i database
while (await prisma.bruker.findUnique({ where: { bibliotekkortnummer }})) {
  bibliotekkortnummer = generateCardNumber()
}
```

### **E-post Validering:**
```typescript
// Sjekk om e-post allerede finnes
const existingUser = await prisma.bruker.findUnique({
  where: { epost }
})

if (existingUser) {
  return { error: 'E-postadressen er allerede registrert' }
}
```

---

## 📊 **API STRUCTURE:**

### **POST `/api/registrer`**

**Request:**
```json
{
  "fornavn": "Ola",
  "etternavn": "Nordmann",
  "fodselsdato": "1990-01-01",
  "adresse": "Storgata 1",
  "postnummer": "5003",
  "poststed": "Bergen",
  "epost": "ola@example.com",
  "mobil": "12345678"
}
```

**Response (success):**
```json
{
  "success": true,
  "bibliotekkortnummer": "3847562019",
  "navn": "Ola Nordmann",
  "message": "Bruker opprettet!"
}
```

**Response (error):**
```json
{
  "error": "E-postadressen er allerede registrert"
}
```

---

## 🎯 **BRUKERFLYT:**

```
Forside
   ↓
Klikk "📝 Bli medlem" (Hero)
   ↓
/registrer (Intro)
   ↓
Klikk "Registrer deg nå"
   ↓
Skjema (Fyll ut)
   ↓
Klikk "Gå videre til BankID"
   ↓
ID-porten simulering (2 sek)
   ↓
POST /api/registrer
   ↓
Success side
   ↓
Bruker får lånekort-nummer
   ↓
Klikk "Gå til Min Side"
   ↓
Se QR-kode + gamification
```

---

## 📝 **KRAV OPPFYLT:**

Fra kravspesifikasjonen:

### **K038-EVA - Registrering og pålogging:**
- ✅ "Registrering av ny låner direkte i løsningen"
- ✅ "Etablering av lokalt lånekort"
- ✅ "Brukervennlig og sømløs prosess"
- ✅ "Identitetskontroll" (simulert ID-porten)
- ✅ "Håndtering av eksisterende bruker" (e-post sjekk)

### **Brukertest L-2:**
- ✅ "Du er A. Olsen og har ikke bibliotekkort fra før"
- ✅ "Opprett ny låner ved å registrere deg"
- ✅ "Registrere deg med ID-porten/Bibliotekkortet" (simulert)
- ✅ "Fullfør registreringen og logg inn på Min Side"

---

## 🔄 **ENDREDE FILER:**

| Fil | Endring |
|-----|---------|
| `/app/registrer/page.tsx` | **NY** - Komplett registreringsflyt |
| `/app/api/registrer/route.ts` | **NY** - API endpoint |
| `/prisma/schema.prisma` | + fornavn, etternavn, fodselsdato, passord, mobil |
| `/app/login/page.tsx` | + Registreringslenke (grønn boks) |
| `/components/Hero.tsx` | + "Bli medlem" knapp |

---

## 📦 **DEPENDENCIES:**

### **Nye pakker:**
```json
{
  "bcryptjs": "^2.4.3",
  "@types/bcryptjs": "^2.4.6"
}
```

**Installer:**
```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

---

## 🚧 **VIDERE UTVIKLING:**

### **Fase 1 - Ekte ID-porten:**
- [ ] Koble til ekte ID-porten/BankID
- [ ] OAuth2 flow
- [ ] Hente data fra Folkeregisteret
- [ ] Verifisere identitet

### **Fase 2 - E-post Verifisering:**
- [ ] Send verifikasjons-e-post
- [ ] Klikk link for å aktivere
- [ ] Resend verification
- [ ] E-post template design

### **Fase 3 - Velkomst-e-post:**
- [ ] Send velkomst-e-post automatisk
- [ ] Inkluder lånekort-nummer
- [ ] Tips for nye brukere
- [ ] Lenker til viktige sider

### **Fase 4 - Barn/Foresatte:**
- [ ] Registrering av barn under 18
- [ ] Kobling til foresatte
- [ ] Samtykke fra foresatte
- [ ] Altersgr

enser

---

## 🎉 **RESULTAT:**

**Før v10.0:**
- ❌ Ingen registreringsflyt
- ❌ Kun demo-brukere
- ❌ Må opprettes manuelt

**Etter v10.0:**
- ✅ **Komplett registreringsflyt**
- ✅ **4-stegs prosess** (intro → skjema → ID-porten → success)
- ✅ **Auto-generert lånekort**
- ✅ **Validering** (client + server)
- ✅ **Sikker passord-hashing**
- ✅ **Velkomstside** med QR-kode
- ✅ **CTA lenker** på forside og login
- ✅ **Meets kravspec K038-EVA**

---

## 🏆 **HIGHLIGHT FEATURES:**

1. **Smooth UX:**
   - Gradient transitions
   - Loading states
   - Success celebrations
   - Clear CTAs

2. **Validation:**
   - Client-side checks
   - Server-side validation
   - Duplicate detection
   - Toast feedback

3. **Security:**
   - Bcrypt hashing
   - Unique card numbers
   - E-post verification ready
   - ID-porten ready

4. **Design:**
   - Bergen brand colors
   - Serif headings
   - Gradient heroes
   - Professional forms

---

## ⚠️ **VIKTIGE NOTATER:**

1. **Migrering er påkrevd!**
   ```bash
   npx prisma migrate dev --name add_registration_fields
   ```

2. **bcryptjs må installeres:**
   ```bash
   npm install bcryptjs
   ```

3. **ID-porten er simulert:**
   - 2 sekunder delay
   - Ingen ekte BankID
   - Klar for integrasjon

4. **Passord for demo:**
   - Settes til samme som lånekort-nummer
   - I prod: bruk sterk passord-generator

---

## 📊 **FEATURE SUMMARY:**

| Feature | Status | Beskrivelse |
|---------|--------|-------------|
| **Registreringsside** | ✅ **LIVE** | Intro med fordeler |
| **Skjema** | ✅ **LIVE** | Personopplysninger |
| **Validering** | ✅ **LIVE** | Client + server |
| **ID-porten** | ⏳ **SIMULERT** | 2 sek loading |
| **API Endpoint** | ✅ **LIVE** | POST /api/registrer |
| **Auto-generering** | ✅ **LIVE** | Lånekort-nummer |
| **Success Side** | ✅ **LIVE** | Velkomst + QR tips |
| **Database** | ✅ **OPPDATERT** | Nye felter |
| **Lenker** | ✅ **LIVE** | Hero + Login |
| E-post Verifikasjon | 📅 **FUTURE** | Send verification |
| Ekte ID-porten | 📅 **FUTURE** | OAuth2 BankID |

---

**Built with ❤️ for Bergen Bibliotek**
**v10.0 - Registrering av Lånekort - February 2026**
