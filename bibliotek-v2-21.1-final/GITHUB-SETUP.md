# 🐙 GITHUB SETUP

Slik setter du opp GitHub for Bibliotek-prosjektet.

---

## 🎯 **HVORFOR GITHUB?**

✅ **Claude kan lese koden din** direkte
✅ **Enkel synkronisering** av endringer
✅ **Versjonskontroll** (kan rulle tilbake)
✅ **Backup** i skyen
✅ **Standard** for utviklere

---

## 📋 **STEG-FOR-STEG:**

### **1️⃣ OPPRETT GITHUB-KONTO (hvis du ikke har)**

Gå til: https://github.com/signup

- Registrer deg med e-post
- Velg brukernavn
- Bekreft e-post

---

### **2️⃣ INSTALLER GIT PÅ MAC**

Sjekk om du har Git:
```bash
git --version
```

**Hvis du IKKE har Git:**
```bash
# Installer via Homebrew
brew install git

# ELLER last ned fra:
# https://git-scm.com/download/mac
```

---

### **3️⃣ KONFIGURER GIT**

```bash
git config --global user.name "Ditt Navn"
git config --global user.email "din@epost.no"
```

---

### **4️⃣ INITIALISER GIT I PROSJEKTET**

```bash
cd ~/Documents/BibliotekProsjekt

# Initialiser git
git init

# Legg til alle filer
git add .

# Første commit
git commit -m "🎉 Initial commit - Felles Formidlingsløsning v2.1"
```

---

### **5️⃣ OPPRETT REPO PÅ GITHUB**

1. **Gå til:** https://github.com/new

2. **Fyll ut:**
   - Repository name: `felles-formidling` (eller `bibliotek-bergen`)
   - Description: "Felles formidlingsløsning for norske bibliotek"
   - **VIKTIG:** Velg **Private** (ikke offentlig ennå!)
   - **IKKE** huk av på "Add README"

3. **Klikk:** "Create repository"

---

### **6️⃣ KOBLE LOKAL MAPPE TIL GITHUB**

GitHub viser deg kommandoer. Kjør disse:

```bash
cd ~/Documents/BibliotekProsjekt

# Koble til remote
git remote add origin https://github.com/DITT-BRUKERNAVN/felles-formidling.git

# Push til GitHub
git branch -M main
git push -u origin main
```

**Hvis du får feilmelding om autentisering:**
- GitHub spør etter passord
- Bruk **Personal Access Token** (ikke passord!)
- Se steg 7 👇

---

### **7️⃣ LAG PERSONAL ACCESS TOKEN**

**Hvis `git push` feiler:**

1. **Gå til:** https://github.com/settings/tokens
2. **Klikk:** "Generate new token" → "Classic"
3. **Fyll ut:**
   - Note: "BibliotekProsjekt"
   - Expiration: 90 days
   - Scopes: Huk av **repo** (alle underpunkter)
4. **Klikk:** "Generate token"
5. **KOPIER** token (vises bare én gang!)

**Prøv git push igjen:**
```bash
git push -u origin main
```
- Username: ditt GitHub-brukernavn
- Password: **LIM INN TOKEN** (ikke passord!)

---

### **8️⃣ VERIFISER AT DET VIRKET**

1. **Gå til:** https://github.com/DITT-BRUKERNAVN/felles-formidling
2. **Du skal se alle filene dine!** 🎉

---

## 🔄 **DAGLIG ARBEIDSFLYT:**

### **Når du gjør endringer:**

```bash
# Se hva som er endret
git status

# Legg til endringer
git add .

# Commit med melding
git commit -m "Lagt til ny funksjon"

# Push til GitHub
git push
```

### **Når Claude gir deg oppdateringer:**

```bash
# Hent endringer fra GitHub
git pull

# Installer nye pakker (hvis package.json endret)
npm install

# Restart serveren
npm run dev
```

---

## 🤝 **DELE MED CLAUDE:**

Når prosjektet er på GitHub:

1. **Del lenken:** `https://github.com/DITT-BRUKERNAVN/felles-formidling`
2. **Claude kan:**
   - Lese koden din
   - Foreslå endringer
   - Lage pull requests
   - Debugge problemer

**VIKTIG:**
- Sett repo til **Private** først
- Claude trenger ikke tilgang til å pushe
- Du kan gjøre det offentlig senere når det er klart

---

## 🆘 **FEILSØKING:**

### **"fatal: not a git repository"**
```bash
cd ~/Documents/BibliotekProsjekt
git init
```

### **"authentication failed"**
- Bruk Personal Access Token, ikke passord
- Se steg 7

### **"remote origin already exists"**
```bash
git remote remove origin
git remote add origin https://github.com/...
```

### **"nothing to commit"**
- Du har ingen endringer
- Det er OK!

---

## ✅ **FERDIG!**

Nå har du:
- ✅ Git versjonskontroll
- ✅ Backup på GitHub
- ✅ Enkel deling med Claude
- ✅ Profesjonell arbeidsflyt

---

## 🚀 **NESTE STEG:**

1. **Test at alt virker:** `npm run dev`
2. **Del GitHub-lenken** med Claude
3. **Vi fortsetter med database-setup!**

**Ha det gøy! 🎉**
