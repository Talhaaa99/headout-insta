const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log("Running database migration...");

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "migrate-add-display-name.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Migration SQL:");
    console.log(migrationSQL);
    console.log("\nExecuting migration...");

    // Execute the migration
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      console.error("Migration failed:", error);

      // If RPC method doesn't exist, try direct SQL execution
      console.log("Trying alternative migration method...");

      // Split the SQL into individual statements
      const statements = migrationSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        console.log(`Executing: ${statement}`);
        const { error: stmtError } = await supabase.rpc("exec_sql", {
          sql: statement,
        });
        if (stmtError) {
          console.error(`Statement failed: ${stmtError.message}`);
        } else {
          console.log("Statement executed successfully");
        }
      }
    } else {
      console.log("Migration completed successfully!");
    }
  } catch (error) {
    console.error("Error during migration:", error);

    // Fallback: Try to add the column directly
    console.log("Trying direct column addition...");
    try {
      const { error: alterError } = await supabase
        .from("profiles")
        .select("*")
        .limit(1);

      if (alterError) {
        console.error("Cannot access profiles table:", alterError);
      } else {
        console.log(
          "Profiles table is accessible. You may need to run the migration manually in your Supabase dashboard."
        );
        console.log("SQL to run:");
        console.log(
          "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name TEXT;"
        );
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }
  }
}

// Run the migration
runMigration();
