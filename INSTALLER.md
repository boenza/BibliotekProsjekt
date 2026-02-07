# 📦 INSTALLASJONSINSTRUKS

## 🎯 **HVOR SKAL MAPPEN LIGGE?**

```
/Users/bjornkjetilfredriksen/Documents/BibliotekProsjekt/
```

---

## 🚀 **STEG-FOR-STEG:**

### **1️⃣ SLETT GAMMEL MAPPE (VIKTIG!)**

```bash
# Åpne Terminal
cd ~/Documents

# Slett gammel BibliotekProsjekt
rm -rf BibliotekProsjekt

# Opprett ny, tom mappe
mkdir BibliotekProsjekt
```

---

### **2️⃣ PAKK UT NY MAPPE**

1. **Last ned ZIP** fra Claude
2. **Dobbeltklikk** på `bibliotek-v2.1-final.zip`
3. **Du får en mappe:** `bibliotek-v2.1-final`
4. **Flytt INNHOLDET inn i BibliotekProsjekt:**

```bash
# I Terminal:
cd ~/Downloads
mv bibliotek-v2.1-final/* ~/Documents/BibliotekProsjekt/
```

**RESULTAT:**
```
~/Documents/BibliotekProsjekt/
├── app/
├── components/
├── lib/
├── package.json
├── README.md
└── ... (alle filer direkte her!)
```

**IKKE sånn:**
```
❌ ~/Documents/BibliotekProsjekt/bibliotek-v2.1-final/app/
```

---

### **3️⃣ ÅPNE I VS CODE**

```bash
cd ~/Documents/BibliotekProsjekt
code .
```

**ELLER:**
- Åpne VS Code
- File → Open Folder
- Velg `BibliotekProsjekt`

---

### **4️⃣ INSTALLER PAKKER**

**I VS Code Terminal** (Ctrl + `):

```bash
npm install
```

Vent ~2-3 minutter...

---

### **5️⃣ LEGG TIL API-NØKKEL (VALGFRITT)**

**Hvis du vil teste AI:**

1. **Få API-nøkkel:** https://platform.openai.com/api-keys

2. **Opprett `.env.local` fil:**
```bash
touch .env.local
```

3. **Åpne `.env.local` i VS Code**

4. **Lim inn:**
```bash
OPENAI_API_KEY=sk-proj-DIN-NYE-NØKKEL-HER
```

5. **Save** (Cmd+S)

**UTEN API-nøkkel:**
- Alt fungerer fortsatt!
- AI gir dummy-tekst
- Du kan teste grensesnittet

---

### **6️⃣ START SERVEREN**

```bash
npm run dev
```

Vent til du ser:
```
✓ Ready in 2.5s
○ Local:    http://localhost:3000
```

---

### **7️⃣ ÅPNE I NETTLESER**

**Forside:**
http://localhost:3000

**Admin:**
http://localhost:3000/admin

**Katalog:**
http://localhost:3000/katalog

---

## ✅ **FUNGERER DET?**

### **Test admin:**
1. Gå til: http://localhost:3000/admin/innhold/anbefalinger
2. Klikk "+ Ny anbefaling"
3. Fyll ut tittel
4. Klikk "✨ AI-hjelp"
5. Se AI-generert tekst! (eller dummy-tekst uten API-nøkkel)

### **Test brukersiden:**
1. Gå til: http://localhost:3000/katalog
2. Søk etter "nordlys"
3. Filtrer på sjanger
4. Reserver en bok

---

## 🆘 **PROBLEMER?**

### **Port 3000 opptatt?**
```bash
npm run dev -- -p 3001
```

### **Module not found?**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Kan ikke finne filer?**
Sjekk at du er i riktig mappe:
```bash
pwd
```
Skal vise: `/Users/bjornkjetilfredriksen/Documents/BibliotekProsjekt`

---

## 🎉 **FERDIG!**

Når det virker, gå til **GITHUB-SETUP.md** for å sette opp versjonskontroll!
