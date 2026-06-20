"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Fish, Ruler, MessageSquare, Sun, Moon, Anchor, BookOpen, MapPin, Cloud, Server, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useNetwork } from "@/components/NetworkProvider";
import { createClient } from "@/utils/supabase/client";

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { setTheme, theme } = useTheme();
    const { isOnline, toggleNetwork } = useNetwork();

    // ESTADO DEL USUARIO
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    // EFECTO PARA ESCUCHAR LA SESIÓN
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };

        checkUser();

        // Escuchamos cambios (login, logout) en tiempo real
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const links = [
        { name: "Asistente", href: "/", icon: MessageSquare },
        { name: "Medidor", href: "/medidor", icon: Ruler },
        { name: "Bitácora", href: "/bitacora", icon: Anchor },
        { name: "Nudos", href: "/nudos", icon: BookOpen },
        { name: "Mapa", href: "/mapa", icon: MapPin },
    ];

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-border bg-card/60 backdrop-blur-md supports-[backdrop-filter]:bg-card/40">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* LOGO */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                        <Fish className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
                        Pesca<span className="text-blue-600">AI</span>
                    </span>
                </Link>

                {/* LINKS DE NAVEGACIÓN */}
                <div className="flex items-center gap-1 sm:gap-4">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;

                        return (
                            <Link key={link.href} href={link.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={`gap-2 rounded-full ${isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "text-muted-foreground"}`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden xs:inline-block">{link.name}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                {/* ACCIONES*/}

                <div className="flex items-center gap-2">
                    {/* BOTÓN MODO ONLINE / OFFLINE */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleNetwork}
                        className={`rounded-full px-3 gap-2 transition-colors ${isOnline
                            ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-400"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                        title={isOnline ? "Modo Cloud Activo" : "Modo Local Activo"}
                    >
                        {isOnline ? (
                            <>
                                <Cloud className="h-4 w-4 animate-pulse" />
                                <span className="hidden sm:inline-block text-xs font-bold">Cloud</span>
                            </>
                        ) : (
                            <>
                                <Server className="h-4 w-4" />
                                <span className="hidden sm:inline-block text-xs font-bold">Local</span>
                            </>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full h-9 w-9 text-muted-foreground"
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Cambiar tema</span>
                    </Button>

                    {/* MENÚ DE USUARIO */}
                    <div className="pl-2 border-l border-border flex items-center gap-2">
                        {user ? (
                            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2">
                                <LogOut className="h-4 w-4" />
                                <span className="hidden lg:inline-block text-xs">Salir</span>
                            </Button>
                        ) : (
                            <Link href="/login">
                                <Button variant="default" size="sm" className="bg-blue-600 text-white hover:bg-blue-700 gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="hidden lg:inline-block text-xs">Acceder</span>
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}