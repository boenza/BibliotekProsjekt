# 🗄️ DATABASE SETUP GUIDE

Slik setter du opp PostgreSQL database med Supabase + Prisma.

---

## 📋 **STEG 1: OPPRETT SUPABASE-KONTO (3 min)**

### **1️⃣ Registrer deg:**

Gå til: **https://supabase.com/dashboard**

- Klikk "Start your project"
- Sign up med **GitHub** (anbefalt) eller e-post
- Bekreft e-posten din

---

### **2️⃣ Opprett nytt prosjekt:**

1. Klikk "New project"
2. **Fyll ut:**
   - **Name:** `bergen-bibliotek` (eller ditt navn)
   - **Database Password:** Lag et sterkt passord
     - **VIKTIG:** Skriv ned passordet! Du trenger det senere.
     - Forslag: Bruk en passordgenerator
   - **Region:** `West EU (Ireland)` (nærmest Norge)
   - **Pricing Plan:** `Free` (helt gratis!)
3. Klikk "Create new project"
4. **Vent 2-3 minutter** mens databasen starter...

---

### **3️⃣ Hent database URL:**

Når prosjektet er klart (grønn indikator):

1. **Gå til:** Settings (⚙️ ikon i sidebar)
2. **Klikk:** "Database"
3. **Scroll ned til:** "Connection string"
4. **Velg:** "URI" i dropdown
5. **Kopier** connection string

Det ser slik ut:
```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghij.supabase.co:5432/postgres
```

**VIKTIG:** 
- Erstatt `[YOUR-PASSWORD]` med passordet du lagde!
- Eksempel: `postgresql://postgres:MineSuperHemmelige123!@db.xyz.supabase.co:5432/postgres`

---

## 📋 **STEG 2: LEGG TIL I .env.local (2 min)**

### **1️⃣ Åpne prosjektet i VS Code**

```bash
cd ~/Documents/BibliotekProsjekt
code .
```

---

### **2️⃣ Opprett .env.local fil:**

**I VS Code:**
- Høyreklikk i filtreet
- "New File"
- Navn: `.env.local`

**ELLER i Terminal:**
```bash
touch .env.local
```

---

### **3️⃣ Lim inn konfigurasjon:**

Åpne `.env.local` og lim inn:

```bash
# OpenAI (hvis du har satt opp AI)
OPENAI_API_KEY=sk-proj-...

# DATABASE (fra Supabase)
DATABASE_URL="postgresql://postgres:DITT-PASSORD@db.xxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:DITT-PASSORD@db.xxx.supabase.co:5432/postgres"
```

**Erstatt:**
- `DITT-PASSORD` → Ditt faktiske Supabase-passord
- `db.xxx.supabase.co` → Din faktiske Supabase URL

**Eksempel:**
```bash
DATABASE_URL="postgresql://postgres:MittPass123!@db.abcdefghij.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:MittPass123!@db.abcdefghij.supabase.co:5432/postgres"
```

**Save filen** (Cmd+S)

---

## 📋 **STEG 3: INSTALLER PAKKER (3 min)**

### **1️⃣ Installer nye dependencies:**

```bash
npm install
```

Dette installerer:
- `@prisma/client` - Database klient
- `prisma` - Database verktøy
- `zod` - Validering

---

### **2️⃣ Generer Prisma Client:**

```bash
npm run db:generate
```

Du skal se:
```
✔ Generated Prisma Client
```

---

### **3️⃣ Push schema til database:**

```bash
npm run db:push
```

Dette lager alle tabeller i databasen!

Du skal se:
```
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

---

### **4️⃣ Seed databasen med eksempeldata:**

```bash
npm run db:seed
```

Du skal se:
```
🌱 Seeding database...
✅ Slettet eksisterende data
✅ Opprettet filialer
✅ Opprettet bøker
✅ Opprettet anbefalinger
✅ Opprettet arrangementer
✅ Opprettet artikler
🎉 Database seeded successfully!
```

---

## ✅ **STEG 4: VERIFISER AT DET VIRKER**

### **1️⃣ Åpne Prisma Studio (database GUI):**

```bash
npm run db:studio
```

→ Åpner: http://localhost:5555

Her kan du:
- Se alle tabeller
- Se eksempeldata
- Redigere data manuelt

---

### **2️⃣ Sjekk at tabellene finnes:**

I Prisma Studio, sjekk at du ser:
- ✅ anbefalinger (3 rader)
- ✅ arrangementer (2 rader)
- ✅ artikler (1 rad)
- ✅ filialer (3 rader)
- ✅ bøker (3 rader)
- ✅ brukere (0 rader - kommer senere)
- ✅ lån (0 rader)
- ✅ reservasjoner (0 rader)

---

## 🎉 **FERDIG!**

Du har nå:
- ✅ PostgreSQL database på Supabase
- ✅ Prisma ORM konfigurert
- ✅ Database schema opprettet (11 tabeller!)
- ✅ Eksempeldata lagt inn
- ✅ Alt klart for å koble admin-siden!

---

## 🔄 **NYTTIGE KOMMANDOER:**

```bash
# Se database i nettleser
npm run db:studio

# Push schema-endringer til database
npm run db:push

# Generer Prisma Client på nytt
npm run db:generate

# Seed database med ny data
npm run db:seed
```

---

## 🆘 **FEILSØKING:**

### **"P1001: Can't reach database server"**
- Sjekk at DATABASE_URL er riktig
- Sjekk at passordet er korrekt (ingen `[` `]`)
- Sjekk at du har internett

### **"Invalid connection string"**
- Sjekk at URL starter med `postgresql://`
- Sjekk at det ikke er mellomrom i URL
- Kopier på nytt fra Supabase

### **"Error: P1009: Database already exists"**
- Dette er OK! Bruk `npm run db:push`

### **Prisma Studio åpner ikke**
```bash
# Stopp og start på nytt
# Ctrl+C
npm run db:studio
```

---

## 🚀 **NESTE STEG:**

Når database er klar:
1. Koble admin CMS til database
2. Hent data fra database i brukersiden
3. Test at alt fungerer!

**Klar for å fortsette? 🎯**
