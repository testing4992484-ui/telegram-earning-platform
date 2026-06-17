# 🚀 GitHub Actions & Firebase Deployment Setup

Yeh guide GitHub Actions workflow ko setup karne ke liye hai jisse code push hote hi Firebase pe automatically deploy ho.

---

## 📋 Prerequisites

- GitHub account
- Firebase project (earning-testing-2afdb)
- GitHub token (already provided)
- Firebase service account key

---

## 🔧 Step 1: Firebase Service Account Key Generate Karo

### 1.1 Firebase Console Mein Jao

1. [Firebase Console](https://console.firebase.google.com/) open karo
2. `earning-testing-2afdb` project select karo
3. Settings (⚙️) → Project Settings

### 1.2 Service Account Key Generate Karo

1. **Service Accounts** tab mein jao
2. **Firebase Admin SDK** section mein jao
3. **Generate New Private Key** button click karo
4. JSON file download hoga - **isko safely save karo!**

---

## 🔐 Step 2: GitHub Secrets Setup Karo

### 2.1 Repository Settings Mein Jao

1. GitHub repository open karo
2. **Settings** tab → **Secrets and variables** → **Actions**

### 2.2 Required Secrets Add Karo

Add following secrets:

| Secret Name | Value | Source |
|------------|-------|--------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON file content | Firebase Console |
| `FIREBASE_API_KEY` | API Key | Firebase Config |
| `FIREBASE_AUTH_DOMAIN` | Auth Domain | Firebase Config |
| `FIREBASE_STORAGE_BUCKET` | Storage Bucket | Firebase Config |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID | Firebase Config |
| `FIREBASE_APP_ID` | App ID | Firebase Config |
| `FIREBASE_MEASUREMENT_ID` | Measurement ID | Firebase Config |

### 2.3 Firebase Config Kaise Milega?

1. Firebase Console mein jao
2. Project Settings
3. **Your apps** section mein jao
4. Web app select karo
5. Config copy karo:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "earning-testing-2afdb",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 2.4 Service Account Key Kaise Add Karo?

1. Downloaded JSON file ko text editor mein open karo
2. **Entire JSON content** copy karo
3. GitHub Secrets mein `FIREBASE_SERVICE_ACCOUNT` secret mein paste karo
4. Save karo

---

## ✅ Step 3: Workflow File Verify Karo

`.github/workflows/deploy.yml` file pehle se set hai:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  build-and-test:
    # Build aur test karta hai
    
  deploy-firebase:
    # Firebase pe deploy karta hai
```

---

## 🚀 Step 4: First Deployment Test Karo

### 4.1 Code Push Karo

```bash
cd telegram-earning-platform-repo
git add .
git commit -m "Initial commit with GitHub Actions"
git push origin main
```

### 4.2 GitHub Actions Monitor Karo

1. GitHub repository open karo
2. **Actions** tab mein jao
3. Latest workflow run dekho
4. Status check karo:
   - ✅ Green = Success
   - ❌ Red = Failed

### 4.3 Logs Check Karo

1. Workflow run click karo
2. **build-and-test** job expand karo
3. Logs dekho
4. Errors fix karo (agar koi ho)

---

## 📊 Workflow Stages

### Stage 1: Build & Test
```
✓ Checkout code
✓ Setup Node.js
✓ Install dependencies
✓ Run linter
✓ Build application
✓ Run tests
```

### Stage 2: Deploy to Firebase
```
✓ Checkout code
✓ Setup Node.js
✓ Install dependencies
✓ Build application
✓ Deploy to Firebase Hosting
```

---

## 🔍 Troubleshooting

### Problem: Build Fails

**Solution:**
1. GitHub Actions logs check karo
2. Error message note karo
3. Locally `npm run build` test karo
4. Fix karo aur push karo

### Problem: Firebase Deployment Fails

**Solution:**
1. Secrets properly set hain check karo
2. Firebase project ID correct hai check karo
3. Service account key valid hai check karo
4. Firebase console mein Hosting enabled hai check karo

### Problem: "Permission denied" Error

**Solution:**
```
Firebase service account key mein issue ho sakta hai:
1. Firebase Console mein new key generate karo
2. GitHub Secrets update karo
3. Workflow re-run karo
```

### Problem: "Module not found" Error

**Solution:**
```bash
# Locally test karo
npm ci
npm run build

# Agar locally work kare to GitHub Actions mein issue hai
# Logs carefully check karo
```

---

## 📈 Monitoring Deployments

### GitHub Actions Dashboard

1. Repository → **Actions** tab
2. Latest workflow runs dekho
3. Status check karo
4. Deployment time dekho

### Firebase Console

1. Firebase Console open karo
2. **Hosting** section mein jao
3. Deployment history dekho
4. Live URL dekho

---

## 🔄 Automatic Deployments

Jab bhi code push hota hai:

```
1. GitHub Actions trigger hota hai
2. Code build hota hai
3. Tests run hoti hain
4. Firebase pe deploy hota hai
5. Live app update hota hai
```

**Deployment time:** ~2-5 minutes

---

## 🛠️ Manual Deployment (Optional)

Agar GitHub Actions se deploy nahi karna ho:

```bash
# Locally build karo
npm run build

# Firebase CLI install karo
npm install -g firebase-tools

# Login karo
firebase login

# Deploy karo
firebase deploy --only hosting
```

---

## 📝 Workflow Customization

### Deployment Trigger Change Karo

Current: `main` branch pe push

```yaml
on:
  push:
    branches:
      - main
      - develop  # Add develop branch
```

### Schedule Deployment (Optional)

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Daily 2 AM UTC
```

### Manual Trigger Add Karo

```yaml
on:
  workflow_dispatch:  # Manual trigger from GitHub UI
```

---

## 🔐 Security Best Practices

1. ✅ Secrets ko GitHub mein safely store karo
2. ✅ Service account key ko public mat karo
3. ✅ Firebase rules properly configure karo
4. ✅ Regular backups lena
5. ✅ Access logs monitor karna

---

## 📞 Support

### Errors Aaye To:

1. GitHub Actions logs check karo
2. Firebase console check karo
3. Secrets properly set hain verify karo
4. Locally build test karo

### Useful Links:

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Firebase CLI Docs](https://firebase.google.com/docs/cli)

---

## ✅ Deployment Checklist

- [ ] Firebase service account key generated
- [ ] GitHub Secrets configured
- [ ] Workflow file in place
- [ ] firebase.json configured
- [ ] database.rules.json set
- [ ] First deployment tested
- [ ] Logs checked for errors
- [ ] Live app verified

---

**Happy Deploying! 🚀**

Ab har push par automatically Firebase pe deploy hoga! 🎉

