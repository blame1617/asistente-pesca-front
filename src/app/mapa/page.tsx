"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, Waves, Compass, AlertCircle, WifiOff } from "lucide-react";

interface PuntoPesca {
    id: number;
    nombre: string;
    region: string;
    latitud: number;
    longitud: number;
    tipo_agua: string;
    especies_objetivo: string;
    recomendacion_tecnica: string;
}

const REGIONES_CHILE = [
    "Todas",
    "Región de Arica y Parinacota",
    "Región de Tarapacá",
    "Región de Antofagasta",
    "Región de Atacama",
    "Región de Coquimbo",
    "Región de Valparaíso",
    "Región Metropolitana",
    "Región de O'Higgins",
    "Región del Maule",
    "Región de Ñuble",
    "Región del Biobío",
    "Región de La Araucanía",
    "Región de Los Ríos",
    "Región de Los Lagos",
    "Región de Aysén",
    "Región de Magallanes"
];

export default function MapaOfflinePage() {
    const [puntos, setPuntos] = useState<PuntoPesca[]>([]);
    const [cargando, setCargando] = useState(true);
    const [regionSeleccionada, setRegionSeleccionada] = useState("Todas");
    const [busqueda, setBusqueda] = useState("");
    const [modoOffline, setModoOffline] = useState(false);

    // ESTRATEGIA OFFLINE-FIRST: Intentar fetch, si falla, usar caché local
    useEffect(() => {
        const cargarPuntos = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/puntos-pesca");
                if (!res.ok) throw new Error("Servidor no disponible");

                const data = await res.json();
                setPuntos(data);
                // Guardar en caché para uso posterior offline
                localStorage.setItem("pesca_gis_cache", JSON.stringify(data));
                setModoOffline(false);
            } catch (error) {
                console.warn("Sin conexión al backend. Activando modo offline estricto...");
                setModoOffline(true);
                const cache = localStorage.getItem("pesca_gis_cache");
                if (cache) {
                    setPuntos(JSON.parse(cache));
                }
            } finally {
                setCargando(false);
            }
        };

        cargarPuntos();
    }, []);

    // Lógica de filtrado combinada (Región + Término de búsqueda)
    const puntosFiltrados = puntos.filter((punto) => {
        const coincideRegion = regionSeleccionada === "Todas" || punto.region === regionSeleccionada;
        const coincideBusqueda =
            punto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            punto.especies_objetivo.toLowerCase().includes(busqueda.toLowerCase());
        return coincideRegion && coincideBusqueda;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-background dark:to-slate-900 pt-20 pb-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* ENCABEZADO */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <Compass className="h-6 w-6 text-blue-600 dark:text-blue-500 animate-pulse" />
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Atlas GIS de Pesca</h1>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Explora los mejores hotspots de Chile con recomendaciones técnicas autónomas.
                        </p>
                    </div>

                    {/* INDICADOR DE ESTADO DE RED */}
                    {modoOffline && (
                        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-xs font-medium self-start md:self-auto">
                            <WifiOff className="h-4 w-4" />
                            <span>Modo Offline Activo (Caché Local)</span>
                        </div>
                    )}
                </div>

                {/* BARRA DE FILTROS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Búsqueda por texto */}
                    <div className="relative md:col-span-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Buscar por lugar o especie..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="pl-9 bg-card"
                        />
                    </div>

                    {/* Selector de Regiones horizontal con scroll nativo */}
                    <div className="md:col-span-2 flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                        {REGIONES_CHILE.map((region) => (
                            <Button
                                key={region}
                                variant={regionSeleccionada === region ? "default" : "outline"}
                                size="sm"
                                onClick={() => setRegionSeleccionada(region)}
                                className="whitespace-nowrap rounded-full font-medium text-xs h-9"
                            >
                                {region.replace("Región de ", "").replace("Región del ", "")}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* LISTADO GRID DE HOTSPOTS */}
                {cargando ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="h-48 bg-muted/40" />
                        ))}
                    </div>
                ) : puntosFiltrados.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-card/50">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-base font-medium text-foreground">No se encontraron puntos de pesca</p>
                        <p className="text-xs text-muted-foreground mt-1">Intenta cambiar los filtros de búsqueda o seleccionar otra región.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {puntosFiltrados.map((punto) => (
                            <Card key={punto.id} className="border-border shadow-md hover:shadow-lg transition-all bg-card flex flex-col justify-between">

                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <CardTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                {punto.nombre}
                                            </CardTitle>
                                            <p className="text-xs font-medium text-muted-foreground mt-0.5">{punto.region}</p>
                                        </div>

                                        {/* BADGE TIPO DE AGUA */}
                                        <Badge variant={punto.tipo_agua.includes("Mar") ? "default" : "secondary"} className="flex items-center gap-1 text-[10px]">
                                            <Waves className="h-3 w-3" />
                                            {punto.tipo_agua}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-3 pt-0 text-sm flex-1 flex flex-col justify-between">
                                    {/* ESPECIES OBJETIVO */}
                                    <div>
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Especies Objetivo:</span>
                                        <div className="flex flex-wrap gap-1">
                                            {punto.especies_objetivo.split(", ").map((especie, idx) => (
                                                <Badge key={idx} variant="outline" className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900 text-xs">
                                                    {especie}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    {/* RECOMENDACIÓN TÉCNICA */}
                                    <div className="bg-muted/40 p-3 rounded-lg border border-border mt-2">
                                        <span className="text-xs font-bold text-foreground block mb-0.5">Táctica Recomendada:</span>
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            {punto.recomendacion_tecnica}
                                        </p>
                                    </div>

                                    {/* COORDENADAS GPS OFFLINE */}
                                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/60 pt-2.5 mt-1">
                                        <span>Lat: {punto.latitud}</span>
                                        <span>Lon: {punto.longitud}</span>
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