"use client";

import { useState, useEffect } from "react";
import { useNetwork } from "@/components/NetworkProvider";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Fish, Ruler, Calendar, Anchor, Loader2, Maximize2, Trash2, ServerOff, CloudOff } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Captura {
    id: number | string; // Adaptado para soportar SQLite (number) y Supabase (UUID string)
    especie: string;
    medida_cm: number;
    senuelo: string;
    fecha: string;
    ruta_imagen: string;
}

export default function BitacoraPage() {
    const [capturas, setCapturas] = useState<Captura[]>([]);
    const [cargando, setCargando] = useState(true);

    // NUEVOS ESTADOS DE RED Y SESIÓN
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [sesionActiva, setSesionActiva] = useState(false);

    const { isOnline } = useNetwork();
    const supabase = createClient();

    useEffect(() => {
        const cargarDatos = async () => {
            setCargando(true);
            setErrorMsg(null);

            try {
                if (isOnline) {
                    // MODO NUBE (Supabase)
                    const { data: { session } } = await supabase.auth.getSession();

                    if (!session) {
                        setSesionActiva(false);
                        setCapturas([]);
                        setCargando(false);
                        return;
                    }

                    setSesionActiva(true);
                    const { data, error } = await supabase
                        .from('capturas_cloud')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;

                    const capturasFormateadas: Captura[] = data.map(c => ({
                        id: c.id,
                        especie: c.especie,
                        medida_cm: c.medida_cm,
                        senuelo: c.senuelo,
                        fecha: c.created_at,
                        ruta_imagen: c.ruta_imagen || ""
                    }));
                    setCapturas(capturasFormateadas);

                } else {
                    // MODO LOCAL (FastAPI)
                    const res = await fetch("http://localhost:8000/historial");
                    if (!res.ok) throw new Error("No se pudo conectar al servidor local.");

                    const data = await res.json();
                    setCapturas(data);
                }
            } catch (err: any) {
                console.error("Error de red:", err);
                setErrorMsg(isOnline ? "Error conectando a la nube." : "El servidor local (FastAPI) está apagado.");
            } finally {
                setCargando(false);
            }
        };

        cargarDatos();
    }, [isOnline, supabase]);

    // FUNCIÓN DE BORRADO ADAPTADA (HÍBRIDA)
    const eliminarCaptura = async (id: number | string) => {
        if (!window.confirm("¿Estás seguro de que quieres borrar esta captura? Esta acción no se puede deshacer y borrará la foto.")) {
            return;
        }

        try {
            if (isOnline) {
                const { error } = await supabase.from('capturas_cloud').delete().eq('id', id);
                if (error) throw error;
            } else {
                const res = await fetch(`http://localhost:8000/captura/${id}`, {
                    method: "DELETE",
                });
                const data = await res.json();
                if (data.status !== "success") {
                    throw new Error(data.message);
                }
            }

            // Actualizamos la interfaz al instante
            setCapturas(capturas.filter(captura => captura.id !== id));

        } catch (err) {
            console.error("Error al borrar:", err);
            alert("No se pudo conectar con el servidor para borrar la captura.");
        }
    };

    // PANTALLAS DE BLOQUEO (CARGA, SIN SESIÓN Y ERROR DE RED)
    if (cargando) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-muted-foreground font-medium">Cargando tus capturas...</p>
            </div>
        );
    }

    if (isOnline && !sesionActiva) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <CloudOff className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-foreground">Modo Cloud Bloqueado</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    Para ver tu bitácora en la nube y competir en los leaderboards, necesitas iniciar sesión.
                </p>
                <Link href="/login">
                    <Button className="bg-blue-600 text-white hover:bg-blue-700">Acceder a mi cuenta</Button>
                </Link>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
                <ServerOff className="h-16 w-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2 text-foreground">Sin Conexión</h2>
                <p className="text-muted-foreground mb-6 max-w-md">{errorMsg}</p>
                {!isOnline && <p className="text-sm font-mono bg-muted text-foreground p-2 rounded">Asegúrate de correr: fastapi dev main.py</p>}
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-12 px-4 md:px-8 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 transition-colors duration-500">
            <div className="max-w-6xl mx-auto">

                <header className="mb-12 flex flex-col items-center text-center">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground flex items-center justify-center gap-3">
                        <Anchor className="h-10 w-10 text-blue-600" />
                        Mi Bitácora
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium max-w-prose">
                        {isOnline ? "Sincronizada en la nube (Supabase)" : "Almacenamiento Local (SQLite)"}
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

                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="relative aspect-video overflow-hidden cursor-zoom-in bg-muted flex items-center justify-center">
                                            {pez.ruta_imagen ? (
                                                <img
                                                    src={isOnline ? pez.ruta_imagen : `http://localhost:8000/uploads/${pez.ruta_imagen}`}
                                                    alt={pez.especie}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <Fish className="h-12 w-12 text-muted-foreground/30" />
                                            )}

                                            {pez.ruta_imagen && (
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Maximize2 className="text-white h-8 w-8 drop-shadow-lg" />
                                                </div>
                                            )}

                                            <Badge className="absolute top-3 right-3 bg-blue-600/90 text-white backdrop-blur-md border-none px-3 py-1 z-10">
                                                {pez.medida_cm} cm
                                            </Badge>
                                        </div>
                                    </DialogTrigger>

                                    <DialogContent className="max-w-none w-screen h-screen p-0 m-0 border-none bg-black/95 backdrop-blur-md flex items-center justify-center sm:max-w-none rounded-none">
                                        <DialogTitle className="sr-only">Detalle de {pez.especie}</DialogTitle>
                                        <DialogDescription className="sr-only">Vista en pantalla completa</DialogDescription>

                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            {pez.ruta_imagen ? (
                                                <img
                                                    src={isOnline ? pez.ruta_imagen : `http://localhost:8000/uploads/${pez.ruta_imagen}`}
                                                    alt={pez.especie}
                                                    className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl transition-all"
                                                />
                                            ) : (
                                                <Fish className="h-32 w-32 text-white/20" />
                                            )}

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
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center text-xs text-muted-foreground font-medium">
                                                <Calendar className="h-3 w-3 mr-1" />
                                                {format(new Date(pez.fecha), "d MMM, yyyy", { locale: es })}
                                            </div>

                                            <button
                                                onClick={() => eliminarCaptura(pez.id)}
                                                className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-md transition-colors"
                                                title="Borrar captura"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
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