import "dotenv/config";
import mongoose from "mongoose";

import Dealer from "../models/Dealer.js";
import SubDealer from "../models/SubDealer.js";
import Counter from "../models/Counter.js";

const isApplyMode = process.argv.includes("--apply");

const formatDealerCode = (sequence) =>
  `TEJO-DEA-${String(sequence).padStart(4, "0")}`;

const formatSubDealerCode = (dealerSequence, sequence) =>
  `TEJO-SUB-${String(dealerSequence).padStart(4, "0")}-${String(sequence).padStart(3, "0")}`;

const initializeDealerCodes = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing from your environment");
  }

  // Connect to MongoDB FIRST.
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("MongoDB connected");

  // =========================================================
  // DATABASE DIAGNOSTICS
  // =========================================================

  console.log("\n========== DATABASE DIAGNOSTICS ==========");
  console.log("Database name:", mongoose.connection.name);
  console.log("Dealer collection:", Dealer.collection.name);
  console.log("Sub-Dealer collection:", SubDealer.collection.name);

  const dealerCount = await Dealer.collection.countDocuments();
  const subDealerCount = await SubDealer.collection.countDocuments();

  console.log("Dealer records:", dealerCount);
  console.log("Sub-Dealer records:", subDealerCount);

  const existingDealerIds = await Dealer.collection
    .find({}, { projection: { _id: 1 } })
    .toArray();

  console.log(
    "Dealer IDs:",
    existingDealerIds.map((dealer) => dealer._id.toString()),
  );

  // =========================================================
  // READ EXISTING DEALERS AND SUB-DEALERS
  // =========================================================

  const dealers = await Dealer.find({})
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  const subDealers = await SubDealer.find({})
    .sort({ createdAt: 1, _id: 1 })
    .lean();

  // =========================================================
  // VALIDATE SUB-DEALER PARENT DEALERS
  // =========================================================

  const dealerIdSet = new Set(
    dealers.map((dealer) => dealer._id.toString()),
  );

  const invalidSubDealers = subDealers.filter(
    (subDealer) =>
      !subDealer.dealerId ||
      !dealerIdSet.has(subDealer.dealerId.toString()),
  );

  if (invalidSubDealers.length > 0) {
    console.log("\nInvalid Sub-Dealer records:");

    for (const subDealer of invalidSubDealers) {
      console.log({
        id: subDealer._id.toString(),
        businessName: subDealer.businessName,
        dealerId: subDealer.dealerId
          ? subDealer.dealerId.toString()
          : null,
      });
    }

    throw new Error(
      `${invalidSubDealers.length} Sub-Dealer records have missing or invalid parent Dealers. No changes were made.`,
    );
  }

  // =========================================================
  // PREPARE DEALER CODES
  // =========================================================

  const dealerPlans = dealers.map((dealer, index) => ({
    id: dealer._id,
    sequence: index + 1,
    code: formatDealerCode(index + 1),
  }));

  // =========================================================
  // PREPARE SUB-DEALER CODES
  // =========================================================

  const subDealerPlans = [];
  const subDealerCounts = new Map();

  for (const dealerPlan of dealerPlans) {
    const children = subDealers.filter(
      (subDealer) =>
        subDealer.dealerId.toString() ===
        dealerPlan.id.toString(),
    );

    subDealerCounts.set(
      dealerPlan.id.toString(),
      children.length,
    );

    children.forEach((subDealer, index) => {
      const sequence = index + 1;

      subDealerPlans.push({
        id: subDealer._id,
        code: formatSubDealerCode(
          dealerPlan.sequence,
          sequence,
        ),
      });
    });
  }

  // =========================================================
  // PREVIEW
  // =========================================================

  console.log("\n========== INITIALIZATION PREVIEW ==========");

  console.log(`Dealers found: ${dealers.length}`);
  console.log(`Sub-Dealers found: ${subDealers.length}`);

  console.log("\nDealer codes:");

  for (const plan of dealerPlans) {
    const dealer = dealers.find(
      (item) =>
        item._id.toString() === plan.id.toString(),
    );

    console.log(
      `${dealer.businessName}: ${plan.code}`,
    );
  }

  console.log("\nSub-Dealer codes:");

  for (const plan of subDealerPlans) {
    const subDealer = subDealers.find(
      (item) =>
        item._id.toString() === plan.id.toString(),
    );

    console.log(
      `${subDealer.businessName}: ${plan.code}`,
    );
  }

  // =========================================================
  // DRY RUN
  // =========================================================

  if (!isApplyMode) {
    console.log("\nDRY RUN COMPLETE.");
    console.log("No database records were changed.");
    console.log("Review the preview before applying.");

    return;
  }

  // =========================================================
  // APPLY CHANGES
  // =========================================================

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      // -----------------------------------------------------
      // PHASE 1
      // Temporary unique values
      // -----------------------------------------------------

      for (let index = 0; index < dealerPlans.length; index++) {
        const plan = dealerPlans[index];

        await Dealer.collection.updateOne(
          { _id: plan.id },
          {
            $set: {
              dealerCode: `MIGRATING-${plan.id}`,
              dealerSequence: -(index + 1),
            },
          },
          { session },
        );
      }

      for (const plan of subDealerPlans) {
        await SubDealer.collection.updateOne(
          { _id: plan.id },
          {
            $set: {
              subDealerCode: `MIGRATING-${plan.id}`,
            },
          },
          { session },
        );
      }

      // -----------------------------------------------------
      // PHASE 2
      // Final Dealer codes
      // -----------------------------------------------------

      for (const plan of dealerPlans) {
        await Dealer.collection.updateOne(
          { _id: plan.id },
          {
            $set: {
              dealerSequence: plan.sequence,
              dealerCode: plan.code,
            },
          },
          { session },
        );
      }

      // -----------------------------------------------------
      // PHASE 3
      // Final Sub-Dealer codes
      // -----------------------------------------------------

      for (const plan of subDealerPlans) {
        await SubDealer.collection.updateOne(
          { _id: plan.id },
          {
            $set: {
              subDealerCode: plan.code,
            },
          },
          { session },
        );
      }

      // -----------------------------------------------------
      // GLOBAL DEALER COUNTER
      // -----------------------------------------------------

      await Counter.updateOne(
        { scope: "DEALER" },
        {
          $set: {
            sequence: dealers.length,
          },
        },
        {
          upsert: true,
          session,
        },
      );

      // -----------------------------------------------------
      // SUB-DEALER COUNTERS
      // -----------------------------------------------------

      for (const dealerPlan of dealerPlans) {
        const count =
          subDealerCounts.get(
            dealerPlan.id.toString(),
          ) || 0;

        await Counter.updateOne(
          {
            scope: `SUBDEALER:${dealerPlan.id}`,
          },
          {
            $set: {
              sequence: count,
            },
          },
          {
            upsert: true,
            session,
          },
        );
      }
    });

    console.log("\nINITIALIZATION SUCCESSFUL.");
    console.log(
      "Dealer codes updated:",
      dealerPlans.length,
    );
    console.log(
      "Sub-Dealer codes updated:",
      subDealerPlans.length,
    );
    console.log("Counters initialized successfully.");
  } finally {
    await session.endSession();
  }
};

// =========================================================
// RUN SCRIPT
// =========================================================

initializeDealerCodes()
  .catch((error) => {
    console.error(
      "\nINITIALIZATION FAILED:",
      error.message,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });