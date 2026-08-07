import { ActivityItem } from "@/lib/types";

interface RecentActivityCardProps {
  activity: ActivityItem[];
}

export default function RecentActivityCard({
  activity,
}: RecentActivityCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
        RECENT ACTIVITY
      </p>

      <div className="mt-5 space-y-4">

        {activity.map((item) => (
          <div key={item.id}>

            <p className="font-semibold">
              {item.message}
            </p>

            <p className="text-sm text-slate-400">
              {item.time}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}