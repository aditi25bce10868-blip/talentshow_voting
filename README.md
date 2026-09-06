# 🎭 BashCraft Talent Show Voting System

A real-time audience voting platform designed for talent shows and live events.

The system enables audiences to securely rate performances from their mobile devices while organizers can monitor participation, manage voting sessions, and display live results through a dedicated host dashboard.

---

## 🌟 About the System

The **BashCraft Talent Show Voting System** is a web-based real-time voting platform developed to simplify and modernize audience participation during live talent events.

Audience members can join the event using a QR code, authenticate using their college email, and rate performances on a **1–5 star scale**.

Organizers get a centralized admin interface to manage the event, monitor voting activity, and control the display of results.

The system is designed to provide a **fast, simple, mobile-friendly, and transparent voting experience** for both audiences and event organizers.

---

## ✨ Key Features

### 👥 Audience Voting
- QR-based event access
- College email authentication
- Mobile-friendly voting interface
- 1–5 star performance rating
- Real-time voting status
- One vote per audience member per voting session

### 🎛️ Admin Dashboard
- Secure administrator login
- Manage live voting sessions
- Start and end voting
- Reset voting sessions
- Monitor audience participation
- View voting statistics
- Control leaderboard visibility

### 📊 Live Results
- Real-time vote updates
- Rating distribution
- Average performance ratings
- Number of participants who have voted
- Remaining audience count
- Live leaderboard support

### 🖥️ Host / Projector View
- Dedicated presentation interface
- Performance information
- Real-time result visualization
- Designed for large-screen event display

### 🏆 Event Results
- Performance-wise voting records
- Rating-based evaluation
- Historical voting data
- Final leaderboard
- Top 3 winner display

### 🔐 Security
- Firebase Authentication
- Protected administrative access
- Firestore security rules
- Controlled voting access
- Secure cloud-based data storage

---

## 🛠️ Tech Stack

### Frontend
- **React.js**
- **Vite**
- **Tailwind CSS**
- **Framer Motion**

### Backend & Database
- **Firebase Authentication**
- **Cloud Firestore**
- **Firebase Realtime Data Synchronization**

### Deployment
- **Vercel**
- **GitHub**

### Libraries
- **Recharts** — data visualization
- **QRCode React** — QR code generation

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js
- npm
- A Firebase account
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd quizlive
```
2. Install Dependencies
  ```bash
npm install
```
4. Configure Firebase

Create a Firebase project and enable:

Firebase Authentication
Cloud Firestore

Create a .env file in the project root based on .env.example.
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_JOIN_URL=http://localhost:5173
```
4. Start the Development Server
 ```bash
npm run dev
```

The application will now be available locally.

🌐 Deployment

The application can be deployed using Vercel with Firebase as the cloud backend.
```bash
Deployment Architecture
Audience Devices
       │
       ▼
     Vercel
       │
       ▼
    Firebase
   ┌─────────┐
   │  Auth   │
   │Firestore│
   └─────────┘
       │
       ▼
 Admin / Host
```
Once deployed, the application can be accessed through a public URL, allowing audience members to participate using Wi-Fi or mobile data.

## 🎯 Use Cases

| Event Type | Application |
|---|---|
| 🎭 **Talent Shows** | Audience rating for live performances |
| 🎤 **Singing Competitions** | Rate individual or group performances |
| 💃 **Dance Competitions** | Real-time audience scoring |
| 🎬 **Cultural Events** | Interactive audience participation |
| 🏆 **College Fests** | Live voting during competitions |
| 🎸 **Music Performances** | Audience feedback and ratings |
| 🎨 **Talent Showcases** | Evaluate multiple performances |
| 🎙️ **Open-Mic Events** | Instant audience ratings |
| 🏫 **Student Events** | Interactive event engagement |
| 🤝 **Inter-College Competitions** | Centralized audience voting |

> **Flexible by design:** The platform can be adapted to any event requiring real-time audience feedback, ratings, or live voting.

---

## 💡 Benefits

| ⚡ Fast | 📱 Accessible | 📊 Real-Time | 🔐 Secure |
|---|---|---|---|
| Instant vote submission and result updates | Works directly from audience mobile devices | Live participation and voting statistics | Authentication and controlled access |

### Why It Matters

- 📄 **Paperless** — Eliminates manual voting and paperwork
- 🧮 **Automated** — Reduces manual counting and calculation
- 🌐 **Internet-Based** — Accessible through Wi-Fi or mobile data
- 👥 **Audience-Friendly** — Simple and intuitive voting experience
- 🎛️ **Organizer-Friendly** — Centralized controls for event management
- 🏆 **Transparent** — Clear and structured voting results
- 📈 **Scalable** — Designed for live events with large audiences

---
## 👨‍💻 About BashCraft Web Development Team

**BashCraft Web Development Team** is a student-led development team under **BashCraft Club, VIT Bhopal University**.

We build practical and impactful digital solutions for **campus events, student communities, and real-world challenges** — turning ideas into technology that people can actually use.

---

<div align="center">

### 🚀 Built by BashCraft

**BashCraft Web Development Team**  
*BashCraft Club • VIT Bhopal University*

<br>

**💡 Imagine. Build. Innovate.**

<br>

Made with ❤️ and code by the **BashCraft Web Development Team**

</div>



ating experiences. Making events smarter.
