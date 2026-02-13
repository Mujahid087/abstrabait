# Smart Bookmark App 🔖

A modern, real-time bookmark management application built with Next.js and Supabase. Save, organize, and access your favorite links with a beautiful glassmorphism interface.

## ✨ Features

- **Google Authentication**: Secure sign-in with Google OAuth.
- **Real-time Updates**: Bookmarks display instantly across multiple tabs/devices without refreshing.
- **Optimistic UI**: Immediate feedback when adding or deleting bookmarks.
- **Responsive Design**: Beautiful glassmorphism aesthetic that works on all devices.
- **Private Bookmarks**: Your bookmarks are private and linked to your account.

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend & Auth**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Deployment**: Vercel (recommended)

## 📂 Folder Structure

```
smart-bookmark-app/
├── src/
│   ├── app/
│   │   ├── dashboard/      # Dashboard page (Protected)
│   │   │   └── page.js     # Main bookmark management logic
│   │   ├── globals.css     # Global styles & Tailwind imports
│   │   ├── layout.js       # Root layout
│   │   └── page.js         # Sign-in page
│   └── lib/
│       └── supabase.js     # Supabase client configuration
├── public/                 # Static assets
├── .env.local              # Environment variables
├── postcss.config.mjs      # PostCSS configuration
├── tailwind.config.js      # Tailwind configuration
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Mujahid087/abstrabait.git
    cd smart-bookmark-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Navigate to `http://localhost:3000`.

## 📄 License

This project is licensed under the MIT License.
