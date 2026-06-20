"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface NetworkContextType {
    isOnline: boolean;
    toggleNetwork: () => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
    // Empezamos en modo offline por defecto (Modo local/supervivencia)
    const [isOnline, setIsOnline] = useState(false);

    // Al cargar la app, revisamos si el usuario había dejado guardado un modo
    useEffect(() => {
        const savedState = localStorage.getItem("pesca_is_online");
        if (savedState !== null) {
            setIsOnline(savedState === "true");
        }
    }, []);

    const toggleNetwork = () => {
        setIsOnline((prev) => {
            const newState = !prev;
            localStorage.setItem("pesca_is_online", String(newState));
            return newState;
        });
    };

    return (
        <NetworkContext.Provider value={{ isOnline, toggleNetwork }}>
            {children}
        </NetworkContext.Provider>
    );
}

// Hook personalizado para usar el contexto fácilmente en cualquier componente
export function useNetwork() {
    const context = useContext(NetworkContext);
    if (context === undefined) {
        throw new Error("useNetwork debe usarse dentro de un NetworkProvider");
    }
    return context;
}