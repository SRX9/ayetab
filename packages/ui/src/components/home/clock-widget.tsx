"use client";

import { useEffect, useState } from "react";

export function ClockWidget() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex h-full flex-col justify-between p-1" data-testid="home-clock">
      <p className="text-[12px] font-medium text-foreground/60">{greeting}</p>
      <div>
        <p className="text-[2.4rem] font-semibold leading-none tracking-tight tabular-nums md:text-[2.75rem]">
          {time}
        </p>
        <p className="mt-1.5 text-[13px] font-medium text-foreground/65">{date}</p>
      </div>
      <p className="text-[12px] font-semibold tracking-tight text-foreground/80">AyeTab</p>
    </div>
  );
}
