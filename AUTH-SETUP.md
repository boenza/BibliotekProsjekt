# 🔐 AUTENTISERING - SETUP GUIDE

## ✅ Fase C er ferdig!

Autentisering med NextAuth.js er nå implementert!

---

## 📋 KOMPONENTER:

### **1. NextAuth.js**
- Session management
- JWT tokens  
- Credentials provider for Bibliotekkortet

### **2. Database**
- NextAuth tabeller: `Account`, `Session`, `VerificationToken`
- Bruker-tabell oppdatert med `pin` felt
- Email er nå optional (epost)

### **3. Login System**
- Login-side: `/login`
- Mock SSO for Bibliotekkortet
- PIN-kode autentisering

### **4. Protected Routes**
- `/min-side` krever innlogging
- Auto-redirect til login hvis ikke autentisert

---

## 🚀 QUICK START:

### **1. Installer dependencies (allerede gjort)**
```bash
npm install next-auth @auth/prisma-adapter bcryptjs @types/bcryptjs
```

### **2. Oppdater database schema**
```bash
# Push oppdatert schema
npm run db:push

# Seed med demo-bruker (inkl. PIN)
npm run db:seed
```

### **3. Legg til miljøvariabler**
Opprett `.env.local`:

```bash
# Kopier fra .env.example
cp .env.example .env.local

# Generer NextAuth secret
openssl rand -base64 32

# Legg til i .env.local:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<din-genererte-secret>

# Samme database-URL som før:
DATABASE_URL="din-supabase-url"
DIRECT_URL="din-supabase-url"

# OpenAI (hvis du vil ha AI-funksjonalitet):
OPENAI_API_KEY=sk-proj-xxx
```

### **4. Start server**
```bash
npm run dev
```

---

## 🧪 TEST INNLOGGING:

### **Gå til login-siden:**
http://localhost:3000/login

### **Demo credentials:**
- **Lånekort:** `1234567890`
- **PIN:** `1234`

### **Flyt:**
1. Skriv inn lånekort og PIN
2. Klikk "Logg inn"
3. Redirectes til `/min-side`
4. Se dine lån og reservasjoner
5. Klikk "Logg ut" for å logge ut

---

## 🏗️ ARKITEKTUR:

```
User → Login Page (/login)
         ↓
    NextAuth API (/api/auth/[...nextauth])
         ↓
    Credentials Provider
         ↓
    Database (sjekk lånekort + PIN)
         ↓
    Create Session (JWT)
         ↓
    Redirect til Min Side
```

---

## 📁 NYE/OPPDATERTE FILER:

### **Auth Config:**
- `lib/auth.ts` - NextAuth konfiguration
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API route

### **Components:**
- `components/AuthProvider.tsx` - Session provider wrapper

### **Pages:**
- `app/login/page.tsx` - Login side
- `app/min-side/page.tsx` - Oppdatert med auth
- `app/page.tsx` - Oppdatert med login-knapp
- `app/layout.tsx` - Wrapper med AuthProvider

### **Database:**
- `prisma/schema.prisma` - NextAuth modeller
- `prisma/seed.ts` - Demo-bruker med PIN

---

## 🔑 SIKKERHETSMEKANISMER:

### **1. PIN-kode Autentisering**
- Demo: Aksepterer PIN `1234` for alle brukere
- Produksjon: Hash med bcrypt før lagring

```typescript
// I produksjon (ikke implementert ennå):
import { hash, compare } from 'bcryptjs'

// Når bruker opprettes:
const hashedPin = await hash('1234', 10)

// Når bruker logger inn:
const pinValid = await compare(userInputPin, bruker.pin)
```

### **2. Session Management**
- JWT tokens (serverless-friendly)
- HttpOnly cookies
- Automatisk refresh

### **3. Protected Routes**
- Client-side: `useSession()` hook
- Server-side: `getServerSession()` (for API routes)
- Redirect til login hvis uautentisert

---

## 🛡️ ROLLEBASERT TILGANG (Neste steg):

Systemet støtter roller, men håndhever dem ikke ennå:

- `BRUKER` - Vanlig bruker
- `BIBLIOTEKANSATT` - Kan registrere lån
- `REDAKTØR` - Kan lage innhold i CMS
- `ADMIN` - Full tilgang

**Implementering kommer i neste fase!**

---

## 🔄 MOCK SSO vs EKTE SSO:

### **DEMO (Nå):**
```typescript
// lib/auth.ts
const pinValid = credentials.pin === "1234"
```

### **PRODUKSJON (Senere):**
```typescript
// Koble til Bibliotekkortet SSO
// OAuth2 / OIDC flow
// Verifiser mot nasjonalt system
```

---

## 🐛 FEILSØKING:

### **Problem: "Invalid session"**
**Løsning:** 
```bash
# Slett eksisterende sessions
npm run db:push -- --force-reset
npm run db:seed
```

### **Problem: "NEXTAUTH_SECRET not set"**
**Løsning:**
```bash
# Generer secret
openssl rand -base64 32

# Legg til i .env.local
NEXTAUTH_SECRET=<generated-secret>
```

### **Problem: "User not found"**
**Løsning:**
```bash
# Kjør seed på nytt
npm run db:seed
```

---

## 📊 DEMO-BRUKERE:

Etter `npm run db:seed`:

| Lånekort | PIN | Rolle | Navn |
|----------|-----|-------|------|
| 1234567890 | 1234 | BRUKER | Demo Bruker |

**Flere brukere kan legges til i `prisma/seed.ts`**

---

## ✨ NESTE STEG:

### **Fase C.5 - Rollehåndhevelse:**
- Beskytt `/admin/*` ruter
- Middleware for rolle-sjekk
- API-endpoint autorisasjon

### **Fase D - React Native:**
- Mobile app
- QR-scanner for bibliotekkortet
- Push notifications

---

## 🎉 GRATULERER!

Du har nå:
- ✅ Fungerende autentisering
- ✅ Login/logout flow
- ✅ Protected routes
- ✅ Session management
- ✅ Database-integrasjon

**Klar for demo! 🚀**
