// Componente para Scroll Reveal - Animaciones al hacer scroll
"use client";

import { useEffect, useRef, ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: "fade" | "slide-up" | "default";
  threshold?: number;
}

export const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  variant = "default",
  threshold = 0.1,
}: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Añadir clase inicial para animación
    element.classList.add("reveal");
    if (variant === "fade") {
      element.classList.add("reveal-fade");
    } else if (variant === "slide-up") {
      element.classList.add("reveal-slide-up");
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Delay opcional antes de mostrar
            setTimeout(() => {
              entry.target.classList.add("reveal-visible");
            }, delay);
            // Una vez visible, dejar de observar
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Trigger un poco antes de que sea completamente visible
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay, variant, threshold]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
};

