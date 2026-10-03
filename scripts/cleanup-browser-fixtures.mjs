/** Narrow cleanup for interrupted disposable-account browser runs; never personal users. */
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
nextEnv.loadEnvConfig(process.cwd());
const [since, mode] = process.argv.slice(2);
if (!since || !Number.isFinite(Date.parse(since)) || ![undefined,"--apply"].includes(mode)) throw new Error("Supply an ISO timestamp and optionally --apply.");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url || new URL(url).hostname !== "trdizdsjivorkffjjywe.supabase.co" || process.env.SUPABASE_URL !== url || !process.env.SUPABASE_SECRET_KEY) throw new Error("Matching development project required.");
const client = createClient(url, process.env.SUPABASE_SECRET_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
const candidates=[];
for(let page=1;;page++) {
 const {data,error}=await client.auth.admin.listUsers({page,perPage:100});
 if(error) throw new Error("Fixture inspection failed.");
 candidates.push(...data.users.filter(u => /^winterarc\.simple\.[0-9a-f-]+@example\.test$/.test(u.email??"") && u.user_metadata.display_name === "Simple habit fixture" && Date.parse(u.created_at)>=Date.parse(since)));
 if(data.users.length<100) break;
}
console.log(`${candidates.length} matching disposable accounts ${mode?"to clean":"(inspection only)"}.`);
if(mode) for(const user of candidates) { const {error}=await client.auth.admin.deleteUser(user.id); if(error) throw new Error("Fixture cleanup failed."); }
if(mode) console.log("Fixture cleanup complete.");
