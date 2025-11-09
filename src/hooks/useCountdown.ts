import { useEffect, useMemo, useState } from "react";

export interface CountdownValue {
  totalMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function useCountdown(targetIso?: string | null, intervalMs = 1000) {
  const targetDate = useMemo(() => {
    if (!targetIso) return null;
    const date = new Date(targetIso);
    return Number.isNaN(date.getTime()) ? null : date;
  }, [targetIso]);

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!targetDate) return;

    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);

    return () => clearInterval(timer);
  }, [targetDate, intervalMs]);

  return useMemo<CountdownValue>(() => {
    if (!targetDate) {
      return {
        totalMs: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: false,
      };
    }

    const diff = targetDate.getTime() - now.getTime();
    const totalMs = Math.max(diff, 0);
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMs % (1000 * 60)) / 1000);

    return {
      totalMs,
      hours,
      minutes,
      seconds,
      isExpired: diff <= 0,
    };
  }, [targetDate, now]);
}
