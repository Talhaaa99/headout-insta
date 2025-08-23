# Database Schema for Vistagram

## Tables

### 1. `profiles` table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  username TEXT,
  display_name TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `posts` table

```sql
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
```

### 3. `likes` table

```sql
CREATE TABLE likes (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);
```

### 4. `comments` table

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Storage Buckets

### `posts` bucket

- For storing uploaded images
- Public access for signed URLs

## Row Level Security (RLS)

Enable RLS on all tables and create appropriate policies for:

- Users can only see public posts
- Users can only like/unlike posts
- Users can only delete their own posts

## API Endpoints

1. `POST /api/upload` - Upload image and create post
2. `GET /api/posts` - Get paginated posts feed
3. `POST /api/likes` - Like a post
4. `DELETE /api/likes` - Unlike a post
5. `GET /api/posts/[id]/image` - Get signed URL for image
6. `POST /api/share` - Track share events
7. `POST /api/profile/sync` - Sync user profile

## Frontend Expectations

The frontend expects these data structures:

### Post Object

```typescript
interface Post {
  id: string;
  caption: string | null;
  image_path: string;
  created_at: string;
  user_id: string;
  viewer_liked?: boolean;
  like_count?: number;
  profiles?: {
    username: string;
  };
}
```

### API Response

```typescript
interface ApiResponse {
  items: Post[];
  nextCursor: string | null;
}
```
