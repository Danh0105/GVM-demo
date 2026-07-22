import { useEffect, useState } from "react";
import { useStore } from "@store";

export const useRateLimitCountdown = () => {
    const rateLimitUntil = useStore(state => state.rateLimitUntil);
    const [remaining, setRemaining] = useState(0);

    useEffect(() => {
        const update = () => {
            setRemaining(
                rateLimitUntil
                    ? Math.max(
                          0,
                          Math.ceil((rateLimitUntil - Date.now()) / 1000),
                      )
                    : 0,
            );
        };

        update();
        const timer = window.setInterval(update, 1000);

        return () => window.clearInterval(timer);
    }, [rateLimitUntil]);

    return remaining;
};
