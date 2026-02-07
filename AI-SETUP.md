# 🤖 AI-SETUP GUIDE

Slik setter du opp AI-skrivestøtte i Felles Formidlingsløsning.

---

## 🎯 HVA TRENGER DU:

✅ En OpenAI API-nøkkel (gratis å starte!)

---

## 📝 STEG-FOR-STEG:

### **1️⃣ Opprett OpenAI-konto**

Gå til: https://platform.openai.com/signup

- Registrer deg med e-post eller Google
- Bekreft e-posten din
- Logg inn på OpenAI Platform

### **2️⃣ Få API-nøkkel**

1. Gå til: https://platform.openai.com/api-keys
2. Klikk **"Create new secret key"**
3. Gi nøkkelen et navn (f.eks. "Bergen Bibliotek Dev")
4. Kopier nøkkelen (den vises bare én gang!)
5. Lagre den et trygt sted

Din nøkkel ser slik ut:
```
sk-proj-abc123...xyz789
```

### **3️⃣ Legg til nøkkelen i prosjektet**

1. **Åpne prosjektet i VS Code**
   
2. **Opprett `.env.local` fil** i rot-mappen:
   ```bash
   touch .env.local
   ```

3. **Lim inn API-nøkkelen:**
   ```bash
   OPENAI_API_KEY=sk-proj-abc123...xyz789
   ```

4. **Restart dev serveren:**
   ```bash
   # Stopp serveren (Ctrl+C)
   # Start på nytt:
   npm run dev
   ```

---

## ✅ TEST AT DET VIRKER:

1. Gå til: http://localhost:3000/admin/innhold/anbefalinger
2. Klikk **"+ Ny anbefaling"**
3. Fyll ut **tittel** (f.eks. "Nordlys")
4. Klikk **"✨ AI-hjelp"**
5. Vent ~3 sekunder
6. Se AI-generert forslag! 🎉

---

## 💰 PRISER (OpenAI):

**GPT-4o-mini** (som vi bruker):
- Veldig billig: ~$0.15 per 1000 forespørsler
- Gratis kredit: $5 når du starter
- Du får generert **30,000+ anbefalinger** gratis!

**For produksjon:**
- Estimert kostnad: ~300-500 kr/måned
- Basert på 100-200 anbefalinger/arrangementer per måned

---

## 🔐 SIKKERHET:

⚠️ **VIKTIG:**
- **ALDRI** commit `.env.local` til Git
- **ALDRI** del API-nøkkelen din
- Bruk forskjellige nøkler for utvikling og produksjon

`.gitignore` blokkerer automatisk `.env.local` ✅

---

## 🧪 DEMO-MODUS:

Hvis du **ikke** har API-nøkkel, fungerer systemet fortsatt:
- AI-knappen gir dummy-tekst
- Du kan teste grensesnittet
- Ingen feilmeldinger

---

## 🆘 FEILSØKING:

### **"Ugyldig API-nøkkel"**
- Sjekk at du kopierte hele nøkkelen
- Sjekk at det ikke er mellomrom før/etter
- Prøv å lage en ny nøkkel

### **"Rate limit exceeded"**
- Du har brukt opp gratis kreditt
- Legg til betalingskort på OpenAI
- Eller vent til neste måned

### **"AI-knappen gjør ingenting"**
- Restart dev serveren
- Sjekk konsollen for feilmeldinger
- Verifiser at `.env.local` eksisterer

---

## 🚀 NESTE STEG:

Når AI virker, kan du:
1. Teste på arrangementer også
2. Prøv "forbedre tekst"-funksjonen
3. Generer metadata for SEO

**God skriving! ✨**
