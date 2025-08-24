# Vistagram 📸

A modern, Instagram-inspired photo sharing application built with Next.js, featuring real-time interactions, beautiful UI, and seamless user experience.

![Vistagram Preview](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15.5.0-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 📱 Core Functionality

- **Photo Sharing**: Upload and share photos with captions
- **Real-time Feed**: Auto-loading posts with infinite scroll
- **Like System**: Like/unlike posts with real-time updates
- **User Profiles**: Personalized profiles with photo management
- **Responsive Design**: Mobile-first design with desktop optimization

### 🎨 Modern UI/UX

- **Glass Morphism**: Beautiful glass effects and blur backgrounds
- **Smooth Animations**: Framer Motion powered interactions
- **Dark/Light Mode**: Theme-aware design system
- **Instagram-like Layout**: Familiar navigation and post structure
- **Image Cropping**: Built-in 4:5 aspect ratio cropping tool

### 🔐 Authentication & Security

- **Clerk Integration**: Secure user authentication
- **Profile Management**: Update display names and profile pictures
- **Rate Limiting**: API protection with Upstash
- **Row Level Security**: Database-level security with Supabase

## 🛠 Tech Stack

### Frontend

- **Next.js 15.5.0** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.0** - Type safety
- **Tailwind CSS 4.0** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **Lucide React** - Icon library

### Backend & Database

- **Supabase** - PostgreSQL database and storage
- **Clerk** - Authentication and user management
- **Upstash** - Redis for rate limiting
- **Sharp.js** - Image processing and optimization

### Development Tools

- **ESLint** - Code linting
- **Turbopack** - Fast bundler
- **Vercel** - Deployment platform

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clerk account
- Upstash account

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vistagram.git
cd vistagram
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Upstash
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

### 4. Database Setup

#### Create Supabase Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  caption TEXT,
  location JSONB,
  tags TEXT[],
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);
```

#### Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket called `posts`
3. Set it to public access
4. Configure CORS if needed

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
vistagram/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── likes/         # Like/unlike endpoints
│   │   ├── posts/         # Post management
│   │   ├── upload/        # Image upload
│   │   └── _lib/          # Shared utilities
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── feed.tsx          # Post feed component
│   ├── post-creator.tsx  # Post creation modal
│   └── profile-section.tsx # User profile
├── lib/                  # Utility libraries
│   ├── supabase-server.ts # Supabase client
│   └── utils.ts          # Helper functions
├── scripts/              # Database scripts
│   └── seed-data.js      # Sample data generation
└── public/               # Static assets
```

## 🎯 Key Features Implementation

### Image Upload Flow

1. **Photo Selection**: Single button for gallery/camera access
2. **Automatic Cropping**: Direct transition to 4:5 aspect ratio cropper
3. **Caption Addition**: Borderless textarea for post captions
4. **Quality Optimization**: Sharp.js processing for optimal image quality

### Responsive Design

- **Mobile**: Bottom navigation, single column layout
- **Desktop**: Left sidebar navigation, 3-column layout with suggestions panel
- **Breakpoint**: 1024px (lg) for responsive switching

### Real-time Interactions

- **Auto-loading**: Intersection Observer for infinite scroll
- **Optimistic Updates**: Immediate UI feedback for likes
- **Live Counts**: Real-time like counts and user previews

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## 🧪 Development Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run seed         # Generate sample data
npm run migrate      # Run database migrations

# Linting
npm run lint         # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Instagram** - Design inspiration
- **Vercel** - Deployment platform
- **Supabase** - Backend infrastructure
- **Clerk** - Authentication solution
- **Tailwind CSS** - Styling framework

## 📞 Support

For support, email support@vistagram.com or create an issue in this repository.

---

Built with ❤️ using Next.js, React, and TypeScript
