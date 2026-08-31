import { GroupPool, Bill } from "./types";
import { INITIAL_PERSONAS } from "./zklogin";

export const INITIAL_GROUP_POOLS: GroupPool[] = [
  {
    id: "pool_apu_hackers_01",
    name: "APU Web3 Hackers & Dinner Tab",
    creator: INITIAL_PERSONAS[0].address, // Alice
    clubTreasury: INITIAL_PERSONAS[4].address, // Eva (Club Treasury)
    clubFeeBps: 250, // 2.5% Club dues
    totalExpenses: 284.50,
    totalSettled: 194.50,
    treasuryBalance: 6.80,
    isActive: true,
    members: [
      {
        address: INITIAL_PERSONAS[0].address,
        name: INITIAL_PERSONAS[0].name,
        avatar: INITIAL_PERSONAS[0].avatar,
        netBalance: 120.0, // Alice covered expenses, owed money
      },
      {
        address: INITIAL_PERSONAS[1].address,
        name: INITIAL_PERSONAS[1].name,
        avatar: INITIAL_PERSONAS[1].avatar,
        netBalance: -45.0, // Bob owes
      },
      {
        address: INITIAL_PERSONAS[2].address,
        name: INITIAL_PERSONAS[2].name,
        avatar: INITIAL_PERSONAS[2].avatar,
        netBalance: -75.0, // Charlie owes
      },
    ],
    bills: [
      {
        id: "bill_mamak_dinner_001",
        poolId: "pool_apu_hackers_01",
        title: "Post-Hackathon Mamak Supper (Table #07)",
        category: "Dining",
        totalAmount: 60.0,
        payerAddress: INITIAL_PERSONAS[0].address, // Alice paid
        payerName: "Alice Tan",
        memberCount: 3,
        amountPerMember: 20.0,
        clubDueAmount: 0.50, // 2.5% of 20
        repaidCount: 1, // Alice covered her own, Bob owes, Charlie paid
        isFullySettled: false,
        createdAt: Date.now() - 3600 * 1000 * 2,
        items: [
          { id: "i1", name: "3x Nasi Lemak Ayam Goreng", price: 36.0, assignedTo: [INITIAL_PERSONAS[0].address, INITIAL_PERSONAS[1].address, INITIAL_PERSONAS[2].address] },
          { id: "i2", name: "3x Teh Tarik Kaw", price: 12.0, assignedTo: [INITIAL_PERSONAS[0].address, INITIAL_PERSONAS[1].address, INITIAL_PERSONAS[2].address] },
          { id: "i3", name: "2x Roti Canai Banjir", price: 12.0, assignedTo: [INITIAL_PERSONAS[0].address, INITIAL_PERSONAS[1].address, INITIAL_PERSONAS[2].address] },
        ],
        splitMembers: [
          {
            address: INITIAL_PERSONAS[0].address,
            name: "Alice Tan (Payer)",
            avatar: "👩🏻‍💻",
            amount: 20.0,
            dues: 0.50,
            status: "paid",
            paidTxDigest: "0x89f2...a41c",
            paidAt: Date.now() - 7200000,
          },
          {
            address: INITIAL_PERSONAS[1].address,
            name: "Bob Lee",
            avatar: "👨🏻‍🎓",
            amount: 20.0,
            dues: 0.50,
            status: "pending",
          },
          {
            address: INITIAL_PERSONAS[2].address,
            name: "Charlie Wong",
            avatar: "🧑🏽‍💻",
            amount: 20.0,
            dues: 0.50,
            status: "paid",
            paidTxDigest: "0x3e11...b902",
            paidAt: Date.now() - 3600000,
          },
        ],
      },
      {
        id: "bill_cloud_infra_002",
        poolId: "pool_apu_hackers_01",
        title: "Testnet Node RPC & Cloud Infra",
        category: "Hackathon Supplies",
        totalAmount: 90.0,
        payerAddress: INITIAL_PERSONAS[0].address,
        payerName: "Alice Tan",
        memberCount: 3,
        amountPerMember: 30.0,
        clubDueAmount: 0.75,
        repaidCount: 1,
        isFullySettled: false,
        createdAt: Date.now() - 86400 * 1000,
        items: [
          { id: "i4", name: "Dedicated Fullnode VPS (1 mo)", price: 60.0, assignedTo: [INITIAL_PERSONAS[0].address, INITIAL_PERSONAS[1].address, INITIAL_PERSONAS[2].address] },
          { id: "i5", name: "Domain & SSL Certificates", price: 30.0, assignedTo: [INITIAL_PERSONAS[0].address, INITIAL_PERSONAS[1].address, INITIAL_PERSONAS[2].address] },
        ],
        splitMembers: [
          {
            address: INITIAL_PERSONAS[0].address,
            name: "Alice Tan (Payer)",
            avatar: "👩🏻‍💻",
            amount: 30.0,
            dues: 0.75,
            status: "paid",
          },
          {
            address: INITIAL_PERSONAS[1].address,
            name: "Bob Lee",
            avatar: "👨🏻‍🎓",
            amount: 30.0,
            dues: 0.75,
            status: "pending",
          },
          {
            address: INITIAL_PERSONAS[2].address,
            name: "Charlie Wong",
            avatar: "🧑🏽‍💻",
            amount: 30.0,
            dues: 0.75,
            status: "pending",
          },
        ],
      },
    ],
  },
];
