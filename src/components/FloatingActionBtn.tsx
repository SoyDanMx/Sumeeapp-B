"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBolt } from "@fortawesome/free-solid-svg-icons";

export const FloatingActionBtn = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Mostrar botón después de scrollear un poco (ej: 300px)
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToForm = () => {
        const formSection = document.getElementById("quick-lead-form");
        if (formSection) {
            formSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToForm}
            className="md:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-full shadow-2xl shadow-orange-500/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center animate-bounce-slow"
            aria-label="Solicitud Rápida"
        >
            <FontAwesomeIcon icon={faBolt} className="text-xl" />
            <span className="ml-2 font-bold text-sm">Solicitar</span>
        </button>
    );
};
