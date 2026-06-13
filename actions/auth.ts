"use server";

import { createInsforgeServer } from "@/lib/insforge-server";
import { redirect } from "next/navigation";

export async function signOut() {
  const insforge = await createInsforgeServer();
  await insforge.auth.signOut();
  redirect("/");
}
