import { createSupabaseAdminClient } from "../lib/supabase/admin";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choose<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toDateInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

async function ensureProfile({
  email,
  password,
  full_name,
  role
}: {
  email: string;
  password: string;
  full_name: string;
  role: "viewer" | "analyst" | "admin";
}): Promise<string> {
  const supabase = createSupabaseAdminClient();

  let userId: string;

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

  if (authError || !authData?.user?.id) {
    // Best-effort: if auth user already exists, fall back to profile id.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (!existingProfile?.id) {
      throw authError ?? new Error("Failed to create admin user");
    }
    userId = existingProfile.id;
  } else {
    userId = authData.user.id;
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email,
    full_name,
    role,
    status: "active"
  });

  if (profileError) throw profileError;

  return userId;
}

async function seedTransactions({ userIds }: { userIds: string[] }) {
  const supabase = createSupabaseAdminClient();

  const categories = [
    "Salaries",
    "Software",
    "Marketing",
    "Revenue",
    "Consulting",
    "Office",
    "Travel"
  ];

  const incomeCategories = ["Salaries", "Revenue"];
  const expenseCategories = ["Software", "Marketing", "Consulting", "Office", "Travel"];

  const now = new Date();
  const txs: Array<any> = [];

  for (let i = 0; i < 50; i++) {
    const isIncome = Math.random() < 0.45;
    const type = isIncome ? "income" : "expense";
    const category = isIncome ? choose(incomeCategories) : choose(expenseCategories);

    const monthOffset = randInt(0, 5); // last 6 months
    const base = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const day = randInt(1, 28);
    const date = new Date(base.getFullYear(), base.getMonth(), day);

    const amountRaw = isIncome ? randInt(5000, 60000) : randInt(100, 25000);
    const amount = amountRaw + Math.random();

    const notesOptions = [
      "Monthly activity",
      "Recurring item",
      "One-off adjustment",
      "Vendor payment",
      "Client payout",
      "Office ops"
    ];
    const notes = choose(notesOptions);

    txs.push({
      amount: amount.toFixed(2),
      type,
      category: category || choose(categories),
      date: toDateInput(date),
      notes,
      created_by: choose(userIds),
      deleted_at: null
    });
  }

  const { error } = await supabase.from("transactions").insert(txs);
  if (error) throw error;
}

async function main() {
  const adminEmail = "admin@demo.com";
  const analystEmail = "analyst@demo.com";
  const viewerEmail = "viewer@demo.com";

  console.log("Seeding demo users...");

  const adminId = await ensureProfile({
    email: adminEmail,
    password: "Admin@1234",
    full_name: "Admin Demo",
    role: "admin"
  });

  const analystId = await ensureProfile({
    email: analystEmail,
    password: "Analyst@1234",
    full_name: "Analyst Demo",
    role: "analyst"
  });

  const viewerId = await ensureProfile({
    email: viewerEmail,
    password: "Viewer@1234",
    full_name: "Viewer Demo",
    role: "viewer"
  });

  console.log("Seeding transactions...");
  await seedTransactions({ userIds: [adminId, analystId, viewerId] });

  console.log("Done.");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });

