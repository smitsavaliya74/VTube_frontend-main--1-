# VTube Frontend 🎥

Welcome to the frontend repository of **VTube**, a modern and dynamic video-sharing application! This project serves as the user interface for the VTube platform, allowing users to watch, upload, like, and comment on videos, as well as manage their channels and subscriptions.

## 🚀 Tech Stack

This project is built with modern web technologies to ensure a fast, responsive, and beautiful user experience:

- **Framework:** React 19
- **Build Tool:** Vite (for lightning-fast hot module replacement and optimized builds)
- **Routing:** React Router v7
- **Styling:** Vanilla CSS (custom design system, rich aesthetics, dynamic animations)
- **Icons:** Lucide React
- **HTTP Client:** Axios (with custom interceptors for authentication)
- **Date Formatting:** date-fns

## 🌟 Key Features

- **Authentication System:** Secure login, registration, and password recovery.
- **Video Management:** Upload videos with thumbnails, edit details, and delete.
- **Interactive UI:** Smooth hover effects, micro-animations, and responsive layouts.
- **Engagement:** Like videos, add comments, and subscribe to channels.
- **Dashboard:** A creator studio dashboard to view stats and manage uploaded content.

## 🛠️ Local Development Setup

To run this project on your local machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/Solanki-Manan/VTube_frontend.git
cd VTube_frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory. You can use the provided `.env.sample` (if available) or create it manually:

```env
VITE_API_URL=http://localhost:8000/api/v1
```
*(When deploying to production, this will automatically switch to your deployed backend URL based on the `import.meta.env.MODE` logic in `src/services/api.js`)*

### 4. Start the Development Server
```bash
npm run dev
```
Your application will now be running at `http://localhost:5173`.

## 📦 Deployment

This frontend is designed to be easily deployed on platform-as-a-service providers like **Vercel** or **Netlify**. 

1. Connect your GitHub repository to Vercel.
2. Vercel will automatically detect the Vite build settings.
3. Make sure to add any necessary environment variables in the Vercel dashboard.
4. Click Deploy!

## 🤝 Backend Repository
This frontend communicates with a custom Node.js/Express backend. You can find the backend repository here:
[VTube Backend (Project_yt)](https://github.com/Solanki-Manan/Project_yt)

---
*Built with ❤️ by smit savaliya*
