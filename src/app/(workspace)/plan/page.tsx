import { CalendarCheck2, Target } from "lucide-react";
import { DestinationRow } from "@/components/presentation/surfaces";
import { PageHeader } from "@/components/tracking/page-header";

export const metadata = { title: "Plan" };
const links = [
  { href: "/tasks", title: "Weekly tasks", description: "Plan seven days, update status, reorder, and carry unfinished work.", icon: CalendarCheck2 },
  { href: "/goals", title: "Goals", description: "Follow manual, milestone, or measured progress toward longer outcomes.", icon: Target },
];
export default function PlanPage() {
  return <><PageHeader title="Plan" description="Turn longer outcomes into work you can see and adjust." /><div className="mt-5 grid gap-3 md:grid-cols-2">{links.map((destination) => <DestinationRow key={destination.href} {...destination} />)}</div></>;
}
