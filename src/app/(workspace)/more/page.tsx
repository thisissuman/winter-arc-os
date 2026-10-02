import { Flag, NotebookPen, Settings2 } from "lucide-react";
import { DestinationRow } from "@/components/presentation/surfaces";
import { PageHeader } from "@/components/tracking/page-header";

export const metadata = { title: "More" };
const links = [
  { href: "/reflection", title: "Reflection", description: "Write weekly reviews and monthly reflections beside your statistics.", icon: NotebookPen },
  { href: "/challenges", title: "Challenges", description: "Manage your active and past challenge periods.", icon: Flag },
  { href: "/settings", title: "Settings", description: "Update your account, appearance, and tracking preferences.", icon: Settings2 },
];
export default function MorePage() {
  return <><PageHeader title="More" description="Your reviews, challenges, and settings." /><div className="mt-5 grid gap-3 md:grid-cols-2">{links.map((destination) => <DestinationRow key={destination.href} {...destination} />)}</div></>;
}
