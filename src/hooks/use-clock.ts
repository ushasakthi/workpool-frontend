import { useEffect, useState } from 'react';

// the current time, refreshed every `everyMs`, so time-based UI updates on its own
export function useClock(everyMs: number): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), everyMs);
    // stop the timer when the screen goes away
    return () => clearInterval(timer);
  }, [everyMs]);

  return now;
}
