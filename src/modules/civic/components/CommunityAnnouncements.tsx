import { Construction, Droplets, Megaphone, GraduationCap, Leaf, Calendar, type LucideIcon } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface Announcement { title: string; date: string; icon: LucideIcon; color: string }

const ANNOUNCEMENTS: Announcement[] = [
  { title: "Road repair scheduled on Main Village Road", date: "18 Jul 2026", icon: Construction, color: "bg-amber-500/10 text-amber-600" },
  { title: "Water supply maintenance — 6 AM to 10 AM", date: "20 Jul 2026", icon: Droplets, color: "bg-blue-500/10 text-blue-600" },
  { title: "Government awareness program on crop insurance", date: "24 Jul 2026", icon: Megaphone, color: "bg-primary/10 text-primary" },
  { title: "Farmer training camp — organic pest control", date: "28 Jul 2026", icon: GraduationCap, color: "bg-purple-500/10 text-purple-600" },
  { title: "Clean village campaign — volunteers welcome", date: "2 Aug 2026", icon: Leaf, color: "bg-emerald-500/10 text-emerald-600" },
];

const CommunityAnnouncements = () => (
  <Carousel opts={{ align: "start", loop: true }} className="w-full">
    <CarouselContent>
      {ANNOUNCEMENTS.map((a) => (
        <CarouselItem key={a.title} className="sm:basis-1/2 lg:basis-1/3">
          <div className="bg-card rounded-2xl border border-border/50 p-5 h-full flex flex-col gap-3 cursor-hover">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
              <a.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold leading-snug flex-1">{a.title}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {a.date}</p>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <div className="flex justify-end gap-2 mt-4">
      <CarouselPrevious className="static translate-y-0" />
      <CarouselNext className="static translate-y-0" />
    </div>
  </Carousel>
);

export default CommunityAnnouncements;
