import Feed from "@/components/feed";
import PostComposer from "@/components/post-composer";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <SignedIn>
        <PostComposer />
        <Feed />
      </SignedIn>
      <SignedOut>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Welcome to Vistagram</h1>
          <p className="text-muted-foreground">
            Sign in to start sharing your photos and see what others are
            posting.
          </p>
        </div>
      </SignedOut>
    </main>
  );
}
