"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"; // Nuevo import
import { Fish, Ruler, Calendar, Anchor, Loader2, Maximize2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Captura {
    id: number;
    especie: string;
    medida_cm: number;
    senuelo: string;
    fecha: string;
    ruta_imagen: string;
}

export default function BitacoraPage() {
    const [capturas, setCapturas] = useState<Captura[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/historial")
            .then((res) => res.json())
            .then((data) => {
                setCapturas(data);
                setCargando(false);
            })
            .catch((err) => {
                console.error("Error cargando historial:", err);
                setCargando(false);
            });
    }, []);

    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-muted-foreground font-medium">Cargando tus capturas...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 transition-colors duration-500">
            <div className="max-w-6xl mx-auto">

                <header className="mb-12 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground flex items-center justify-center gap-3">
                        <Anchor className="h-10 w-10 text-blue-600" />
                        Bitácora de Pesca
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium max-w-prose">
                        Tu historial personal de capturas y trofeos.
                    </p>
                </header>

                {capturas.length === 0 ? (
                    <Card className="p-12 text-center border-dashed border-2 bg-card/30">
                        <div className="flex flex-col items-center gap-4">
                            <div className="bg-muted p-4 rounded-full">
                                <Fish className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h2 className="text-xl font-semibold">Aún no hay capturas</h2>
                            <p className="text-muted-foreground max-w-sm">
                                Usa el medidor para registrar tu primer pez y aparecerá aquí automáticamente.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {capturas.map((pez) => (
                            <Card key={pez.id} className="group overflow-hidden border-border bg-card/50 backdrop-blur hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

                                {/* DIALOG PARA PANTALLA COMPLETA */}
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative aspect-video overflow-hidden cursor-zoom-in">
                                            <img
                                                src={`http://localhost:8000/uploads/${pez.ruta_imagen}`}
                                                alt={pez.especie}
                                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Maximize2 className="text-white h-8 w-8 drop-shadow-lg" />
                                            </div>

                                            <Badge className="absolute top-3 right-3 bg-blue-600/90 text-white backdrop-blur-md border-none px-3 py-1 z-10">
                                                {pez.medida_cm} cm
                                            </Badge>
                                        </div>
                                    </DialogTrigger>

                                    {/* LA CLAVE ESTÁ AQUÍ: Agregamos max-w-none y w-screen h-screen */}
                                    <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-none bg-black/95 backdrop-blur-md flex items-center justify-center sm:max-w-none rounded-none">

                                        <DialogTitle className="sr-only">Detalle de {pez.especie}</DialogTitle>
                                        <DialogDescription className="sr-only">Vista en pantalla completa</DialogDescription>

                                        {/* Contenedor relativo para que la X de cierre y la info floten bien */}
                                        <div className="relative w-full h-full flex items-center justify-center p-4">

                                            <img
                                                src={`http://localhost:8000/uploads/${pez.ruta_imagen}`}
                                                alt={pez.especie}
                                                className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl transition-all"
                                            />

                                            {/* Etiqueta de información mejorada */}
                                            <div className="absolute bottom-10 bg-zinc-900/90 backdrop-blur-md text-white p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-1 min-w-[200px]">
                                                <p className="text-3xl font-black capitalize tracking-tighter">{pez.especie}</p>
                                                <div className="flex gap-4 text-blue-400 font-bold items-center">
                                                    <span className="flex items-center gap-1.5"><Ruler className="h-5 w-5" /> {pez.medida_cm} cm</span>
                                                    <span className="text-white/20">|</span>
                                                    <span className="flex items-center gap-1.5"><Anchor className="h-5 w-5" /> {pez.senuelo}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                <CardHeader className="p-4 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold text-foreground capitalize">{pez.especie}</h3>
                                        <div className="flex items-center text-xs text-muted-foreground font-medium">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {format(new Date(pez.fecha), "d MMM, yyyy", { locale: es })}
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 pt-0 border-t border-border/50 bg-muted/20">
                                    <div className="flex items-center gap-4 text-sm mt-3">
                                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                                            <Ruler className="h-4 w-4 text-blue-500" />
                                            <span>{pez.medida_cm} cm</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                                            <Anchor className="h-4 w-4 text-cyan-500" />
                                            <span className="truncate max-w-[120px]">{pez.senuelo}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}