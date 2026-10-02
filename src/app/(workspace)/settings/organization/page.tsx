import Link from "next/link";
import { PageHeader } from "@/components/tracking/page-header";
import { loadOrganization } from "@/features/settings/organization-queries";
import { OrganizationForm } from "@/features/settings/organization-forms";

export const metadata = { title: "Organization settings" };
export default async function OrganizationPage() {
  const { areas, categories } = await loadOrganization();
  return <><PageHeader title="Organization" description="Group trackers and planning by life area and category. Scoring categories have separate weights." actions={<Link href="/settings" className="inline-flex min-h-11 items-center text-sm text-primary underline">All settings</Link>} />
    <p className="mt-5 text-sm leading-6 text-muted-foreground">Names and order are editable. Archiving removes an item from new selections while keeping its linked history. Restore it to use it again.</p>
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <section aria-labelledby="areas-title"><h2 id="areas-title" className="mb-4 text-lg font-medium">Life areas</h2><div className="space-y-4"><OrganizationForm kind="area" areas={[]} />{areas.map(area => <div key={area.id}><p className="mb-2 text-sm text-muted-foreground">{area.name}{area.archived_at ? " · Archived" : ""}</p><OrganizationForm kind="area" record={area} areas={[]} /></div>)}</div></section>
      <section aria-labelledby="categories-title"><h2 id="categories-title" className="mb-4 text-lg font-medium">Categories</h2><div className="space-y-4"><OrganizationForm kind="category" areas={areas.filter(area => !area.archived_at)} />{categories.map(category => <div key={category.id}><p className="mb-2 text-sm text-muted-foreground">{category.name}{category.archived_at ? " · Archived" : ""}</p><OrganizationForm kind="category" record={category} areas={areas.filter(area => !area.archived_at || area.id === category.life_area_id)} /></div>)}</div></section>
    </div>
  </>;
}
