// scripts/seed-pests.mjs
import clientPromise from '../src/lib/mongo.js';

const PESTS = [
  "Rhinoceros beetle",
  "Red palm weevil",
  "Coconut mite",
  "Black-headed caterpillar",
  "Mealybug",
  "Scale insects",
  "Leaf spot",
  "Bud rot (Phytophthora)",
  "Root wilt",
  "Termites"
];

(async () => {
  try {
    const db = (await clientPromise).db();
    const col = db.collection('pests');

    for (const name of PESTS) {
      await col.updateOne({ name }, { $setOnInsert: { name } }, { upsert: true });
    }

    const count = await col.countDocuments();
    console.log(`✅ Seed complete. pests collection count: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
})();
