import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollManager = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    // The target section may not be mounted yet (e.g. lazy route just unmounted,
    // or Index is still rendering), so retry briefly instead of a single attempt.
    let attempts = 0;
    const tryScroll = () => {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      attempts += 1;
      if (attempts < 20) window.setTimeout(tryScroll, 50);
    };
    tryScroll();
  }, [pathname, hash]);

  return null;
};

export default ScrollManager;
