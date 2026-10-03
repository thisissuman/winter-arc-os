import "server-only";
import { requireAccount } from "@/lib/auth/session";
import { maskHabits } from "./domain";
import type { HabitData } from "./types";
export async function loadHabits(
  start: string,
  end: string,
): Promise<HabitData> {
  const { supabase, userId, preferences } = await requireAccount();
  // Definitions/schedule versions are small; logs are date-bounded and fully paginated.
  async function definitions() {
    const result = [];
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("habits")
        .select("id,name,active_from,archived_from,revision")
        .eq("user_id", userId)
        .order("created_at")
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Could not load habits.");
      result.push(...data);
      if (data.length < 500)
        return maskHabits(result, preferences.privacy_mode);
      offset += 500;
    }
  }
  async function schedules() {
    const result = [];
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("habit_schedules")
        .select("habit_id,weekdays,effective_from,effective_until")
        .eq("user_id", userId)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Could not load schedules.");
      result.push(...data);
      if (data.length < 500) return result;
      offset += 500;
    }
  }
  async function logs() {
    const result = [];
    let offset = 0;
    for (;;) {
      const { data, error } = await supabase
        .from("habit_logs")
        .select("habit_id,business_date,completed,revision")
        .eq("user_id", userId)
        .gte("business_date", start)
        .lte("business_date", end)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Could not load completions.");
      result.push(...data);
      if (data.length < 500) return result;
      offset += 500;
    }
  }
  const [habits, versions, entries] = await Promise.all([
    definitions(),
    schedules(),
    logs(),
  ]);
  return { habits, schedules: versions, logs: entries };
}
