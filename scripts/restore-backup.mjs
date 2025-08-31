// scripts/restore-backup.mjs
// Usage:
//   node scripts/restore-backup.mjs /absolute/path/to/backup-2025-08.json
//
// Requires env: MONGODB_URI="mongodb+srv://user:pass@cluster/dbName"

import fs from "node:fs";
import path from "node:path";
import { MongoClient, ObjectId } from "mongodb";

if (!process.env.MONGODB_URI) {
  console.error("❌ Please set MONGODB_URI in your environment.");
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error("❌ Provide path to backup JSON file.");
  process.exit(1);
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const toObjectId = (v) => {
  try {
    return v && typeof v === "string" && v.match(/^[0-9a-fA-F]{24}$/)
      ? new ObjectId(v)
      : v;
  } catch {
    return v;
  }
};

const toDate = (v) => {
  const d = new Date(v);
  return isNaN(d) ? v : d;
};

function normalizeDocs(arr, opts = {}) {
  const { dateFields = [], objectIdFields = ["_id"] } = opts;
  return (arr || []).map((doc) => {
    const copy = { ...doc };

    // Convert known ObjectId string fields
    for (const f of objectIdFields) {
      if (copy[f]) copy[f] = toObjectId(copy[f]);
    }

    // Convert known Date fields
    for (const f of dateFields) {
      if (copy[f]) copy[f] = toDate(copy[f]);
    }

    return copy;
  });
}

async function main() {
  // 1) Read backup JSON
  const raw = fs.readFileSync(path.resolve(file), "utf-8");
  const backup = JSON.parse(raw);

  // Expected shape:
  // {
  //   meta: {...},
  //   updates: [...],
  //   trees: [...],
  //   farmers: [...],
  //   fertilizers: [...],
  //   pests: [...]
  // }

  // 2) Connect
  await client.connect();
  const db = client.db(); // uses DB in your MONGODB_URI

  // 3) OPTIONAL wipe (be careful!)
  // await db.dropDatabase();

  // 4) Prepare collections
  const colFarmers = db.collection("farmers");
  const colFertilizers = db.collection("fertilizers");
  const colPests = db.collection("pests");
  const colTrees = db.collection("trees");
  const colUpdates = db.collection("updates");

  // 5) Create helpful indexes (idempotent)
  await Promise.all([
    colTrees.createIndex({ id: 1 }, { unique: true }),
    colFarmers.createIndex({ username: 1 }, { unique: true }),
    colUpdates.createIndex({ treeId: 1, date: 1 }),
  ]);

  // 6) Insert (use upserts to be re-runnable)
  // Farmers
  for (const f of normalizeDocs(backup.farmers, { objectIdFields: ["_id"] })) {
    await colFarmers.updateOne(
      { _id: f._id ?? new ObjectId() },
      { $set: f },
      { upsert: true }
    );
  }

  // Fertilizers
  for (const name of (backup.fertilizers || []).map((x) => x.name || x)) {
    if (!name) continue;
    await colFertilizers.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }

  // Pests
  for (const name of (backup.pests || []).map((x) => x.name || x)) {
    if (!name) continue;
    await colPests.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
  }

  // Trees (createdAt is a Date; id is "TREE-###")
  for (const t of normalizeDocs(backup.trees, {
    objectIdFields: ["_id"],
    dateFields: ["createdAt"],
  })) {
    // ensure we keep the same id format/string
    await colTrees.updateOne({ id: t.id }, { $set: t }, { upsert: true });
  }

  // Updates
  // - date must remain a "YYYY-MM-DD" string (as in your app)
  // - createdAt is Date
  for (const u of normalizeDocs(backup.updates, {
    objectIdFields: ["_id"],
    dateFields: ["createdAt"],
  })) {
    // Use a deterministic upsert filter to avoid dupes
    const filter = {
      treeId: u.treeId,
      date: u.date, // keep as string
      createdAt: u.createdAt, // Date
      imageUrl: u.imageUrl ?? null,
    };
    await colUpdates.updateOne(filter, { $set: u }, { upsert: true });
  }

  // 7) Report
  const [fc, flc, pc, tc, uc] = await Promise.all([
    colFarmers.countDocuments(),
    colFertilizers.countDocuments(),
    colPests.countDocuments(),
    colTrees.countDocuments(),
    colUpdates.countDocuments(),
  ]);

  console.log("✅ Restore complete.");
  console.log(`farmers: ${fc}, fertilizers: ${flc}, pests: ${pc}, trees: ${tc}, updates: ${uc}`);

  await client.close();
}

main().catch(async (err) => {
  console.error("❌ Restore failed:", err);
  await client.close().catch(() => {});
  process.exit(1);
});
