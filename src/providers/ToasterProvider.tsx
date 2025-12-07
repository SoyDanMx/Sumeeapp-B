"use client";

import { Toaster } from "sonner";

export const ToasterProvider = () => {
    return (
        <Toaster
            position="top-center"
            richColors
            closeButton
            theme="light"
            toastOptions={{
                style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    color: '#1a1a1a',
                    fontSize: '0.95rem',
                },
            }}
        />
    );
};
