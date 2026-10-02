import "server-only";
import { requireAccount } from "@/lib/auth/session";
import type { Database } from "@/types/database";
type Table = "life_areas" | "categories";
export async function loadOrganization() {
  const { supabase, userId } = await requireAccount();
  async function read<T extends Table>(table: T): Promise<Database["public"]["Tables"][T]["Row"][]> {
    const rows: Database["public"]["Tables"][T]["Row"][] = [];
    for (let offset = 0;;) {
      // These two tables share all queried owner/order columns; narrow the generic builder.
      const { data, error, count } = await supabase.from(table as "life_areas").select("*", { count: "exact" }).eq("user_id", userId).order("position").order("id").range(offset, offset + 499);
      if (error || !data || count == null) throw new Error("Organization could not be loaded completely. Retry when connected.");
      rows.push(...data as unknown as Database["public"]["Tables"][T]["Row"][]);
      offset += data.length;
      if (offset >= count) return rows;
      if (!data.length) throw new Error("Organization changed while loading. Retry.");
    }
  }
  const [areas, categories] = await Promise.all([read("life_areas"), read("categories")]);
  return { areas, categories };
}
