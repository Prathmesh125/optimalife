# Optima Life Sciences

![Optima Life Sciences Hero]

Welcome to the **Optima Life Sciences** website repository! This is a modern, high-performance web application built with Next.js 15, TailwindCSS, and Firebase.

## 🌟 Key Features

- **Next.js 15 App Router**: Leveraging the latest React paradigms for fast, server-rendered pages.
- **Dynamic Content Management (CMS)**: A fully bespoke, built-in Admin Panel (`/admin`) that uses a **Section-Wise Block Architecture**. No clunky third-party CMS needed!
- **Block-Based Blog Editor**: Write beautifully rich articles with independent text, image, and heading blocks, right from the dashboard.
- **Firebase Integration**: Robust real-time database (Firestore), authentication, and storage solutions.
- **Responsive & Modern UI**: Built with TailwindCSS, featuring smooth micro-animations, glassmorphism, and a deeply curated premium color palette.
- **SEO Optimized**: Fully integrated Generative Engine Optimization (GEO) practices, JSON-LD schemas, and dynamic metadata generation to rank high on both Google and AI search engines.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [Firebase Firestore](https://firebase.google.com/)
- **Storage**: Cloudflare R2 / Firebase Storage
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Prathmesh125/optimalife.git
   cd optimalife/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the `web/` directory and add your Firebase credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔐 Admin Panel Access
The website comes with a powerful, bespoke admin dashboard located at `/admin`.
Here, authorized personnel can manage the Homepage, About Us, Careers, Contact Information, and publish Blog Posts.

## 🌐 Deployment
This project is optimized for frictionless deployment on [Vercel](https://vercel.com/).
Simply import the repository, set the Root Directory to `web`, add your environment variables, and hit Deploy!

---
*Built with ❤️ for Optima Life Sciences.*
