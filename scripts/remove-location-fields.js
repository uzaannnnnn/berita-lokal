/* eslint-disable no-console */
const mongoose = require("mongoose");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is required.");
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const newsResult = await db
    .collection("news")
    .updateMany({}, { $unset: { location: "", tags: "", ratings: "", views: "" } });
  const usersResult = await db
    .collection("users")
    .updateMany(
      {},
      {
        $unset: {
          "preferences.location": "",
          preferences: "",
          profession: "",
        },
      }
    );

  console.log("news modified:", newsResult.modifiedCount);
  console.log("users modified:", usersResult.modifiedCount);
}

run()
  .then(() => mongoose.disconnect())
  .catch(async (error) => {
    console.error("migration failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
