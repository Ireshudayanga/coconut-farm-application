// src/app/api/backup/range/route.js
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import clientPromise from "@/lib/mongo";

function parseDates(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start) || isNaN(end)) throw new Error("Invalid date format");
  // ensure end covers the full day
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

export async function GET(req) {
  try {
    // 🔒 Auth check
    const ownerCookie = cookies().get("owner_token")?.value;
    if (ownerCookie !== "valid") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startStr = searchParams.get("start"); // YYYY-MM-DD
    const endStr = searchParams.get("end");     // YYYY-MM-DD
    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: "Missing ?start=YYYY-MM-DD&end=YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const { start, end } = parseDates(startStr, endStr);
    const db = (await clientPromise).db();

    // Updates filtered by date string (between start & end inclusive)
    const updates = await db
      .collection("updates")
      .find({ date: { $gte: startStr, $lte: endStr } })
      .sort({ date: 1, createdAt: 1 })
      .toArray();

    // Trees created in that date range
    const trees = await db
      .collection("trees")
      .find({ createdAt: { $gte: start, $lte: end } })
      .sort({ createdAt: 1 })
      .toArray();

    // Farmers / fertilizers / pests: full lists
    const farmers = await db.collection("farmers").find().sort({ name: 1 }).toArray();
    const fertilizers = await db.collection("fertilizers").find().sort({ name: 1 }).toArray();
    const pests = await db.collection("pests").find().sort({ name: 1 }).toArray();

    const normalize = (arr) =>
      arr.map((doc) => ({ ...doc, _id: doc._id?.toString() }));

    const payload = {
      meta: {
        start: startStr,
        end: endStr,
        generatedAt: new Date().toISOString(),
      },
      updates: normalize(updates),
      trees: normalize(trees),
      farmers: normalize(farmers),
      fertilizers: normalize(fertilizers),
      pests: normalize(pests),
    };

    return new NextResponse(JSON.stringify(payload), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="backup-${startStr}_to_${endStr}.json"`,
      },
    });
  } catch (err) {
    console.error("Range backup error:", err);
    return NextResponse.json({ error: "Failed to generate backup" }, { status: 500 });
  }
}
