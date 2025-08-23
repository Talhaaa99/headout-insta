# Seed Data Script

This script generates sample data for the Vistagram app to simulate a populated feed with realistic posts.

## What it creates:

### 8 Sample Users:

- **travel_lover** (Sarah Chen) - Travel and adventure content
- **foodie_adventures** (Marcus Rodriguez) - Food and cooking content
- **art_enthusiast** (Emma Thompson) - Art and creative content
- **tech_geek** (Alex Kim) - Technology and coding content
- **fitness_motivation** (Jordan Smith) - Fitness and health content
- **coffee_addict** (Maya Patel) - Coffee and lifestyle content
- **nature_photographer** (David Wilson) - Nature and photography content
- **bookworm** (Sophie Anderson) - Books and reading content

### 15 Sample Posts:

Each post includes:

- High-quality images from Unsplash (optimized for 4:5 aspect ratio)
- Realistic captions with emojis and hashtags
- Timestamps ranging from 1-15 days ago
- Proper user associations

## How to run:

1. Make sure you have the required environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Run the seed script:
   ```bash
   npm run seed
   ```

## Features:

- **Realistic Content**: Posts mimic real Instagram content with proper captions, hashtags, and emojis
- **Diverse Topics**: Covers travel, food, art, tech, fitness, coffee, nature, and books
- **Proper Timestamps**: Posts are dated from 1-15 days ago to simulate an active feed
- **Profile Pictures**: Each user has a unique profile picture from Unsplash
- **Error Handling**: Script continues even if some operations fail
- **Logging**: Detailed console output for monitoring progress

## Database Schema:

The script creates data that matches your current schema:

- `profiles` table with clerk_user_id, username, display_name, and profile_picture_url
- `posts` table with user_id, image_path, caption, and created_at

## Notes:

- Images are stored as URLs (not uploaded to Supabase storage)
- Clerk user IDs are prefixed with "clerk\_" to avoid conflicts
- The script is idempotent - you can run it multiple times safely
- All images are from Unsplash and are free to use
