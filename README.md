# LEBWPolish (Learn By Writing Polish)

### *Forge Your Fluency Through Active Construction*

**LEBWPolish** is a social, gamified learning platform where users master Polish not through passive clicking, but through active writing. It combines a unique "War Forge" sentence-building mechanic with collaborative learning spaces and a "brutal" streak system to ensure consistent progress.

---

## Core Philosophy: "The Writing Forge"

Most language apps focus on recognition. **LEBWPolish** focuses on **reconstruction**.

* **Active Production**: Users must write and construct sentences to progress.
* **Social Learning**: Learning Spaces allow users to see what others are writing in real-time.
* **Identity & Immersion**: Every user is assigned a Polish city or historical name upon joining a space.

---

## Features

### 1. The Learning Spaces (The Forge)

* **Level-Based Realms**: Unique writing environments tailored to user proficiency (A1-C2).
* **Social Feed**: A live "Forge Feed" where you can see sentences written by other learners in your space.
* **Vocabulary Runes**: A dedicated sidebar to add and save new words discovered during writing sessions.
* **XP Rewards**: Earn experience points for every sentence forged and word saved.

### 2. User Profiles & "Brutal" Motivation

* **The Codex**: Track your learning trends, total vocabulary count, and mastery percentage.
* **The Streak**: A reward system for daily consistency.
* *Reward*: Special badges and XP multipliers for daily writing.
* *Brutal Penalty*: If a day is missed, the system provides "Brutal" feedback, urging the user back into the forge to prevent linguistic "rust."



### 3. Administrative Command Center

* **Controlled Access**: Secure admin-only account creation to maintain a high-quality learning community.
* **Permission Engine**: Admins can assign users to specific spaces, grant permissions, and manage roles.
* **Account Deployment**: Tools to assign Polish identities (City/Name) to new recruits.

---

## Tech Stack

* **Frontend**: React.js & Tailwind CSS (Fully Responsive).
* **Animations**: Framer Motion for XP popups and "Forge" physics.
* **Backend**: Firebase (Firestore for data, Auth for security, Storage for images).
* **Deployment**: Hosted via Netlify / GitHub Pages.

---

## Project Structure

```text
src/
├── components/
│   ├── Navigation.jsx      # Adaptive Menu
│   ├── WritingForge.jsx    # The Sentence Engine
│   └── SocialFeed.jsx      # Peer-to-peer writing view
├── data/
│   └── forgeData.js        # Lesson & Level content
├── pages/
│   ├── Home.jsx            # Landing Page
│   ├── LearningSpace.jsx   # Collaborative Writing Room
│   ├── Profile.jsx         # Stats & Streak Tracker
│   └── AdminDashboard.jsx  # User & Permission Management
└── firebase/
    └── config.js           # Database & Storage setup

```

---

## Getting Started

1. **Clone & Install**
```bash
git clone https://github.com/Byadiso/lebwpolish.git
npm install

```


2. **Environment Variables**
Create a `.env` file with your Firebase credentials:
```env
VITE_FIREBASE_API_KEY=FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID= FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID= FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID= FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID= FIREBASE_MEASUREMENT_ID
...

```


3. **Run the App**
```bash
npm start

```



---


## Author

Designed and developed by Desire BYAMUNGU

**LEBWPolish** — *Writing is the only way forward.*

---