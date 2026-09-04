import { Job } from "./types";

const DAY = 86_400_000;

/**
 * The jobs the demo starts with. Everything after this is created by whoever is
 * using the app; nothing here is regenerated to fill an empty screen.
 */
export const SEED_JOBS: Job[] = [
  {
    id: "job-hrms-leave",
    title: "Employee leave request portal",
    description:
      "We need a simple web portal where our 50 staff can request leave and managers can approve it. " +
      "Calendar view of who is off, email notification when a request is approved, and separate views " +
      "for staff and managers.",
    scope: "software_development",
    tags: ["Next.js", "TypeScript", "PostgreSQL"],
    budgetUsdc: 300,
    companyId: "apex",
    companyName: "Apex Retail Solutions Sdn Bhd",
    escrowStatus: "locked",
    escrowVaultId: "0x43d934e1075274ed5b6e0a9ec57aa03b778a86fe484fc7aae31284a8e3b6980c",
    depositTxDigest: "EC1XXBUHaBwVpEQ1PibvECRgrvKiRNEToAZfgcDM4tUN",
    depositExplorerUrl: "https://suiscan.xyz/testnet/tx/EC1XXBUHaBwVpEQ1PibvECRgrvKiRNEToAZfgcDM4tUN",
    status: "open",
    applications: [],
    clientAssets: [
      { id: "asset-1", name: "Leave_policy_and_requirements.pdf", type: "brief", sizeMb: 2.4, uploadedAt: Date.now() - DAY * 3 },
      { id: "asset-2", name: "Apex_brand_colours_and_logo.zip", type: "brand_asset", sizeMb: 14.8, uploadedAt: Date.now() - DAY * 3 },
      { id: "asset-3", name: "Department_structure.xlsx", type: "document", sizeMb: 1.1, uploadedAt: Date.now() - DAY * 2 },
    ],
    createdAt: Date.now() - DAY * 3,
  },
  {
    id: "job-cafe-video",
    title: "Three short-form video ads for a cafe launch",
    description:
      "Edit three 30-second vertical videos from our raw footage for TikTok and Instagram Reels. " +
      "We need captions, a hook in the first two seconds, and copy suggestions for each post.",
    scope: "digital_marketing",
    tags: ["TikTok", "Instagram Reels", "Video editing"],
    budgetUsdc: 180,
    companyId: "dailybrew",
    companyName: "Daily Brew Artisan Cafe",
    escrowStatus: "locked",
    status: "open",
    applications: [],
    clientAssets: [
      { id: "asset-4", name: "Barista_footage_4K.mp4", type: "raw_video", sizeMb: 68.5, uploadedAt: Date.now() - DAY },
      { id: "asset-5", name: "Store_interior_b_roll.mp4", type: "raw_video", sizeMb: 42.1, uploadedAt: Date.now() - DAY },
      { id: "asset-6", name: "Brand_guidelines.pdf", type: "brand_asset", sizeMb: 3.5, uploadedAt: Date.now() - DAY },
    ],
    createdAt: Date.now() - DAY,
  },
];
