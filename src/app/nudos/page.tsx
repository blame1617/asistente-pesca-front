"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Anchor, PlayCircle, Info, ChevronRight, BookOpen } from "lucide-react";

const NUDOS_DATA = [
    {
        id: 1,
        nombre: "Nudo Palomar",
        video: "/nudos/palomar.mp4",
        dificultad: "Fácil",
        uso: "Líneas trenzadas (Braid)",
        desc: "Considerado uno de los nudos más fuertes. Es ideal para anzuelos y señuelos cuando usas multifilamento, ya que no se desliza.",
    },
    {
        id: 2,
        nombre: "Nudo Rapala",
        video: "/nudos/rapala.mp4",
        dificultad: "Media",
        uso: "Monofilamento / Fluorocarbono",
        desc: "El estándar para atar señuelos sin contar con destorcedor. Permite mayor movilidad",
    },
];

export default function NudosPage() {
    return (
        <div className="min-h-screen pt-28 pb-12 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 transition-colors duration-500">
            <div className="max-w-6xl mx-auto">

                <header className="mb-12 flex flex-col items-center text-center">
                    <div className="bg-blue-600/10 p-3 rounded-2xl mb-4 border border-blue-600/20 shadow-sm">
                        <BookOpen className="h-10 w-10 text-blue-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
                        Academia de Nudos
                    </h1>
                    <p className="text-muted-foreground mt-4 text-lg font-medium max-w-md">
                        Tutoriales técnicos optimizados para visualización rápida en terreno, 100% offline.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {NUDOS_DATA.map((nudo) => (
                        <Card key={nudo.id} className="overflow-hidden border-border bg-card/50 backdrop-blur shadow-xl">
                            <CardHeader className="p-6 border-b border-border/50 bg-muted/20">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold flex items-center gap-3">
                                        <PlayCircle className="text-blue-500 h-6 w-6" />
                                        {nudo.nombre}
                                    </h2>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {nudo.dificultad}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                {/* Reproductor Nativo de HTML5 para máximo rendimiento offline */}
                                <div className="bg-black aspect-video relative group">
                                    <video
                                        controls
                                        className="w-full h-full object-contain"
                                        src={nudo.video}
                                    />
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
                                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                            Uso recomendado: {nudo.uso}
                                        </p>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {nudo.desc}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}