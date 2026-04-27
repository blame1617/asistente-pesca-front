"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, Ruler, MessageSquare, Sun, Moon, Anchor, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function Navbar() {
    const pathname = usePathname();
    const { setTheme, theme } = useTheme();

    const links = [
        { name: "Asistente", href: "/", icon: MessageSquare },
        { name: "Medidor", href: "/medidor", icon: Ruler },
        { name: "Bitácora", href: "/bitacora", icon: Anchor },
        { name: "Nudos", href: "/nudos", icon: BookOpen }, // <-- Nueva sección de la Academia
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

                {/* ACCIONES (MODO OSCURO) */}
                <div className="flex items-center gap-2">
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
                </div>
            </div>
        </nav>
    );
}