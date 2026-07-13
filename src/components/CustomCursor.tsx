import { useEffect, useState, useCallback } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const CustomCursor = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);
    const springX = useSpring(cursorX, { stiffness: 500, damping: 30, mass: 0.5 });
    const springY = useSpring(cursorY, { stiffness: 500, damping: 30, mass: 0.5 });

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        },
        [cursorX, cursorY, isVisible],
    );

    const handleMouseDown = useCallback(() => setIsClicking(true), []);
    const handleMouseUp = useCallback(() => setIsClicking(false), []);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);

        const handleHoverStart = () => setIsHovering(true);
        const handleHoverEnd = () => setIsHovering(false);

        const interactiveElements = document.querySelectorAll(
            'a, button, input, textarea, select, [role="button"], .cursor-hover',
        );

        interactiveElements.forEach((el) => {
            el.addEventListener("mouseenter", handleHoverStart);
            el.addEventListener("mouseleave", handleHoverEnd);
        });

        const observer = new MutationObserver(() => {
            const newElements = document.querySelectorAll(
                'a, button, input, textarea, select, [role="button"], .cursor-hover',
            );
            newElements.forEach((el) => {
                el.removeEventListener("mouseenter", handleHoverStart);
                el.removeEventListener("mouseleave", handleHoverEnd);
                el.addEventListener("mouseenter", handleHoverStart);
                el.addEventListener("mouseleave", handleHoverEnd);
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            observer.disconnect();
        };
    }, [handleMouseMove, handleMouseDown, handleMouseUp]);

    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
        return null;
    }

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
                style={{ x: springX, y: springY }}
            >
                <motion.div
                    className="relative -translate-x-1/2 -translate-y-1/2"
                    animate={{
                        scale: isClicking ? 0.6 : isHovering ? 1.8 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                    <div
                        className="w-3 h-3 rounded-full bg-white"
                        style={{
                            boxShadow: "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.2)",
                        }}
                    />
                </motion.div>
            </motion.div>
            <motion.div
                className="fixed top-0 left-0 z-[9998] pointer-events-none"
                style={{ x: springX, y: springY }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.2 }}
            >
                <motion.div
                    className="relative -translate-x-1/2 -translate-y-1/2"
                    animate={{
                        scale: isClicking ? 0.8 : isHovering ? 1.3 : 1,
                        borderColor: isHovering
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(255,255,255,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <div className="w-8 h-8 rounded-full border border-white/20" />
                </motion.div>
            </motion.div>
        </>
    );
};

export default CustomCursor;
