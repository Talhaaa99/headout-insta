const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Sample data for realistic posts
const sampleUsers = [
  {
    username: "travel_lover",
    displayName: "Sarah Chen",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "foodie_adventures",
    displayName: "Marcus Rodriguez",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "art_enthusiast",
    displayName: "Emma Thompson",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "tech_geek",
    displayName: "Alex Kim",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "fitness_motivation",
    displayName: "Jordan Smith",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "coffee_addict",
    displayName: "Maya Patel",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "nature_photographer",
    displayName: "David Wilson",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
  },
  {
    username: "bookworm",
    displayName: "Sophie Anderson",
    profilePictureUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
  },
];

const samplePosts = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Just finished an amazing hike! The view from the top was absolutely breathtaking. Nature always reminds me how beautiful life is 🌿 #hiking #nature #adventure",
    username: "travel_lover",
    daysAgo: 1,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Fresh pasta from scratch! 🍝 Nothing beats homemade marinara and perfectly al dente noodles. Tonight's dinner was a win! #pasta #homemade #italian #cooking",
    username: "foodie_adventures",
    daysAgo: 2,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1000&fit=crop&crop=center",
    caption:
      "New watercolor piece I'm working on 🎨 Love how the colors blend together. Art is my escape from everything else #watercolor #painting #art #creative",
    username: "art_enthusiast",
    daysAgo: 3,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Clean code is the best code! 💻 Spent the evening refactoring and it feels so satisfying. #coding #programming #cleancode #webdev",
    username: "tech_geek",
    daysAgo: 4,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Morning workout complete! 💪 Started the day right with some cardio and strength training. Energy levels through the roof! #fitness #workout #morningmotivation",
    username: "fitness_motivation",
    daysAgo: 5,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Perfect cappuccino to start the day ☕️ The foam art turned out better than expected! #coffee #cappuccino #morningritual #caffeinated",
    username: "coffee_addict",
    daysAgo: 6,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Golden hour magic in the mountains 🌄 These moments make all the early morning hikes worth it #goldenhour #mountains #photography #nature",
    username: "nature_photographer",
    daysAgo: 7,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Found this gem at the local bookstore! 📚 'Klara and the Sun' by Kazuo Ishiguro. Can't wait to dive in tonight #books #reading #newread #bookstagram",
    username: "bookworm",
    daysAgo: 8,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Peaceful lake vibes this weekend 🏞️ Sometimes you need to disconnect from the digital world and reconnect with nature #lake #peaceful #weekend #digital detox",
    username: "travel_lover",
    daysAgo: 9,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Burger night done right! 🍔 Homemade beef patties, fresh lettuce, and secret sauce. Sometimes simple is best #burger #homemade #comfort food #delicious",
    username: "foodie_adventures",
    daysAgo: 10,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&h=1000&fit=crop&crop=center",
    caption:
      "New sketch pad and charcoal pencils arrived! ✏️ Ready for some serious drawing sessions this week. The possibilities are endless #sketching #charcoal #art #supplies",
    username: "art_enthusiast",
    daysAgo: 11,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Deployed the new feature today! 🚀 Nothing beats the feeling of pushing clean, tested code to production. Time to celebrate! #deployment #coding #success #webdev",
    username: "tech_geek",
    daysAgo: 12,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Post-workout protein smoothie bowl! 🥗 Banana, berries, protein powder, and almond butter. The perfect recovery fuel #smoothiebowl #postworkout #protein #healthy",
    username: "fitness_motivation",
    daysAgo: 13,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Sunday coffee and planning session ☕️ Nothing like a good espresso while organizing the week ahead. Productivity meets relaxation #espresso #planning #sunday #productive",
    username: "coffee_addict",
    daysAgo: 14,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=1000&fit=crop&crop=center",
    caption:
      "Misty morning in the forest 🌲 The early bird catches the best lighting for photography. Nature never fails to inspire #forest #mist #photography #earlybird",
    username: "nature_photographer",
    daysAgo: 15,
  },
];

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedData() {
  console.log("Starting seed data generation...");

  try {
    // First, create user profiles
    console.log("Creating user profiles...");
    const userProfiles = [];

    for (const user of sampleUsers) {
      // Try to get existing profile first
      let { data: profile, error: getError } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_user_id", `clerk_${user.username}`)
        .single();

      if (getError || !profile) {
        // Create new profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            clerk_user_id: `clerk_${user.username}`,
            username: user.username,
            display_name: user.displayName,
            profile_picture_url: user.profilePictureUrl,
          })
          .select()
          .single();

        if (createError) {
          console.error(
            `Error creating profile for ${user.username}:`,
            createError
          );
          continue;
        }
        profile = newProfile;
        console.log(`Created profile for ${user.username}`);
      } else {
        // Update existing profile with new data
        const { data: updatedProfile, error: updateError } = await supabase
          .from("profiles")
          .update({
            username: user.username,
            display_name: user.displayName,
            profile_picture_url: user.profilePictureUrl,
          })
          .eq("clerk_user_id", `clerk_${user.username}`)
          .select()
          .single();

        if (updateError) {
          console.error(
            `Error updating profile for ${user.username}:`,
            updateError
          );
          profile = profile; // Keep the old profile
        } else {
          profile = updatedProfile;
        }
        console.log(`Updated existing profile for ${user.username}`);
      }

      userProfiles.push(profile);
    }

    // Clear existing posts first
    console.log("Clearing existing posts...");
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all posts

    if (deleteError) {
      console.error("Error clearing posts:", deleteError);
    } else {
      console.log("Cleared existing posts");
    }

    // Then, create posts
    console.log("Creating posts...");
    for (const post of samplePosts) {
      const userProfile = userProfiles.find(
        (p) => p.username === post.username
      );
      if (!userProfile) {
        console.error(`User profile not found for ${post.username}`);
        continue;
      }

      // Calculate timestamp
      const timestamp = new Date();
      timestamp.setDate(timestamp.getDate() - post.daysAgo);

      // Create post
      const { data: createdPost, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: userProfile.id,
          image_path: post.imageUrl,
          caption: post.caption,
          created_at: timestamp.toISOString(),
        })
        .select()
        .single();

      if (postError) {
        console.error(`Error creating post for ${post.username}:`, postError);
        continue;
      }

      console.log(
        `Created post for ${post.username}: "${post.caption.substring(
          0,
          50
        )}..."`
      );
    }

    console.log("Seed data generation completed successfully!");
    console.log(
      `Created ${userProfiles.length} user profiles and ${samplePosts.length} posts`
    );
  } catch (error) {
    console.error("Error during seed data generation:", error);
  }
}

// Run the seed function
seedData();
