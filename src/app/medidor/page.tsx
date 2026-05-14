'use client';

import { useState, useRef } from 'react';
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

// Componentes de shadcn/ui
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Íconos de Lucide
import { Ruler, Upload, RotateCcw, Moon, Sun, Info, Save, Loader2, ArrowRight } from "lucide-react";

export default function MedidorPeces() {
    const [imagen, setImagen] = useState<string | null>(null);
    const [puntos, setPuntos] = useState<{ x: number; y: number }[]>([]);

    // NUEVOS ESTADOS: OBJETO DE REFERENCIA PERSONALIZADO
    const [nombreReferencia, setNombreReferencia] = useState("Objeto de referencia");
    const [tamanoReferencia, setTamanoReferencia] = useState<number>(10); // Valor por defecto: 10 cm
    const [referenciaBloqueada, setReferenciaBloqueada] = useState(false);

    // ESTADOS PARA EL GUARDADO FINAL
    const [especie, setEspecie] = useState("");
    const [senuelo, setSenuelo] = useState("");
    const [guardando, setGuardando] = useState(false);

    const { setTheme, theme } = useTheme();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const manejarSubidaImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagen(url);
            setPuntos([]);
            setEspecie("");
            setSenuelo("");
            setReferenciaBloqueada(false); // Permite reconfigurar el objeto al subir nueva foto
        }
        if (e.target) {
            e.target.value = '';
        }
    };

    const manejarClicImagen = (e: React.MouseEvent<HTMLDivElement>) => {
        // Obligamos a definir el tamaño de referencia antes de trazar puntos
        if (!referenciaBloqueada) {
            alert("Por favor, confirma el tamaño de tu objeto de referencia antes de marcar los puntos.");
            return;
        }
        if (puntos.length >= 4) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPuntos((prev) => [...prev, { x, y }]);
    };

    const obtenerDistanciaPx = (p1: { x: number, y: number }, p2: { x: number, y: number }) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // MOTOR MATEMÁTICO ACTUALIZADO (Usa la variable tamanoReferencia)
    const calcularResultados = () => {
        if (puntos.length < 4 || tamanoReferencia <= 0) return null;
        const pxObjeto = obtenerDistanciaPx(puntos[0], puntos[1]);
        if (pxObjeto === 0) return null; // Evitar división por cero

        const ratioPxPorCm = pxObjeto / tamanoReferencia;
        const pxPez = obtenerDistanciaPx(puntos[2], puntos[3]);
        const cmPez = pxPez / ratioPxPorCm;

        return {
            ratio: ratioPxPorCm.toFixed(1),
            medidaFinal: cmPez.toFixed(1)
        };
    };

    // INSTRUCCIONES DINÁMICAS BASADAS EN EL NOMBRE DEL OBJETO
    const obtenerInstrucciones = () => {
        if (!imagen) return "Sube una foto para comenzar a medir.";
        if (!referenciaBloqueada) return "Define qué objeto usarás como referencia y su tamaño real en centímetros.";

        const nombreObj = nombreReferencia.trim() || "objeto";
        if (puntos.length === 0) return `Paso 1: Haz clic en un extremo de tu [${nombreObj}].`;
        if (puntos.length === 1) return `Paso 1: Haz clic en el otro extremo de tu [${nombreObj}].`;
        if (puntos.length === 2) return `Paso 2: ¡Calibrado! Ahora haz clic en la BOCA del pez.`;
        if (puntos.length === 3) return `Paso 2: Haz clic en la COLA del pez.`;
        return "¡Medición completada! Completa los datos para guardar en tu bitácora.";
    };

    const resultados = calcularResultados();

    const handleGuardar = async () => {
        if (!resultados || !especie.trim()) {
            alert("Por favor, ingresa al menos el nombre de la especie.");
            return;
        }

        setGuardando(true);
        try {
            const responseImg = await fetch(imagen!);
            const blob = await responseImg.blob();
            const file = new File([blob], "captura_pesca.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("especie", especie);
            formData.append("medida", resultados.medidaFinal);
            formData.append("senuelo", senuelo || "No especificado");
            formData.append("file", file);

            const res = await fetch("http://localhost:8000/guardar-captura", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                router.push("/bitacora");
            } else {
                throw new Error("Error en el servidor");
            }
        } catch (error) {
            console.error("Error guardando:", error);
            alert("No se pudo guardar la captura. ¿Está el backend encendido?");
        } finally {
            setGuardando(false);
        }
    };

    const reiniciarMedicion = () => {
        setPuntos([]);
        setReferenciaBloqueada(false); // Permite cambiar el tamaño si el usuario se equivocó
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 p-4 md:p-8 pt-24 font-sans relative flex items-center justify-center transition-colors duration-500">
            <Card className="w-full max-w-3xl shadow-2xl border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">

                <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card/50 p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-md">
                            <Ruler className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-foreground">Regla Digital</h1>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Calibración por Objeto Dinámico</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="rounded-full"
                        title="Alternar tema"
                    >
                        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
                    </Button>
                </CardHeader>

                <CardContent className="p-4 md:p-6 space-y-6">

                    {/* BANNER DE INSTRUCCIONES */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 shadow-inner transition-colors">
                        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            {obtenerInstrucciones()}
                        </p>
                    </div>

                    <input type="file" accept="image/*" ref={fileInputRef} onChange={manejarSubidaImagen} className="hidden" />

                    {!imagen && (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-12 bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Sube la foto de tu captura</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-sm">Asegúrate de que haya un objeto de tamaño conocido junto al pez.</p>
                        </div>
                    )}

                    {imagen && (
                        <div className="space-y-6">

                            {/* PASO PREVIO: CONFIGURACIÓN DEL OBJETO DE REFERENCIA */}
                            {!referenciaBloqueada ? (
                                <div className="border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl space-y-4 animate-in fade-in duration-300">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] text-white">1</span>
                                        Configura tu calibrador
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1.5 md:col-span-2">
                                            <Label htmlFor="nombreRef" className="text-xs">¿Qué objeto usarás?</Label>
                                            <Input
                                                id="nombreRef"
                                                placeholder="Ej: Botella de agua, Pinza, Cuchillo..."
                                                value={nombreReferencia === "Objeto de referencia" ? "" : nombreReferencia}
                                                onChange={(e) => setNombreReferencia(e.target.value || "Objeto de referencia")}
                                                className="bg-card"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="tamanoRef" className="text-xs">Tamaño Real (cm)</Label>
                                            <Input
                                                id="tamanoRef"
                                                type="number"
                                                step="0.1"
                                                min="0.1"
                                                value={tamanoReferencia}
                                                onChange={(e) => setTamanoReferencia(parseFloat(e.target.value) || 0)}
                                                className="bg-card font-bold text-blue-600 dark:text-blue-400"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                        onClick={() => {
                                            if (tamanoReferencia <= 0) {
                                                alert("El tamaño de referencia debe ser mayor a 0 cm.");
                                                return;
                                            }
                                            setReferenciaBloqueada(true);
                                        }}
                                    >
                                        Confirmar y empezar a medir <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                // Muestra un resumen compacto del objeto bloqueado
                                <div className="flex items-center justify-between border border-border p-3 rounded-lg bg-muted/30 text-xs">
                                    <div>
                                        <span className="text-muted-foreground font-medium">Calibrando con: </span>
                                        <span className="font-bold text-foreground">{nombreReferencia}</span>
                                        <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">({tamanoReferencia} cm)</span>
                                    </div>
                                    <Button variant="link" size="sm" className="h-auto p-0 text-xs text-blue-600" onClick={() => setReferenciaBloqueada(false)}>
                                        Editar calibrador
                                    </Button>
                                </div>
                            )}

                            {/* LIENZO DE LA IMAGEN */}
                            <div className={`border border-border p-2 rounded-xl bg-muted/20 flex justify-center relative overflow-hidden shadow-inner group ${!referenciaBloqueada ? 'opacity-50 pointer-events-none' : ''}`}>
                                <Button size="sm" variant="secondary" className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-md" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="h-4 w-4 mr-2" /> Cambiar foto
                                </Button>

                                <div className="relative inline-block cursor-crosshair" onClick={manejarClicImagen}>
                                    <img src={imagen} alt="Captura" className="max-w-full h-auto max-h-[50vh] rounded shadow-sm select-none" draggable="false" />
                                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none drop-shadow-md">
                                        {puntos.length >= 2 && <line x1={puntos[0].x} y1={puntos[0].y} x2={puntos[1].x} y2={puntos[1].y} stroke="#3b82f6" strokeWidth="3" strokeDasharray="6, 6" strokeLinecap="round" />}
                                        {puntos.length === 4 && <line x1={puntos[2].x} y1={puntos[2].y} x2={puntos[3].x} y2={puntos[3].y} stroke="#ef4444" strokeWidth="3" strokeDasharray="6, 6" strokeLinecap="round" />}
                                    </svg>
                                    {puntos.map((punto, i) => (
                                        <div key={i} className={`absolute w-5 h-5 border-2 border-white dark:border-slate-900 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg ${i < 2 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ left: punto.x, top: punto.y }} />
                                    ))}
                                </div>
                            </div>

                            {/* CAMPOS DE DATOS TRAS MEDICIÓN FINAL */}
                            {resultados && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300 border-t border-border pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="especie">Especie Capturada</Label>
                                        <Input id="especie" placeholder="Ej: Trucha Fario, Corvina..." value={especie} onChange={(e) => setEspecie(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="senuelo">Señuelo / Cebo</Label>
                                        <Input id="senuelo" placeholder="Ej: Spinner Mepps, Chispa..." value={senuelo} onChange={(e) => setSenuelo(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="p-4 bg-muted/30 border-t border-border flex items-center justify-between rounded-b-xl">
                    <div>
                        {resultados ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <p className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Tamaño Estimado</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black text-red-500 dark:text-red-400">{resultados.medidaFinal}</p>
                                    <p className="text-xl font-bold text-red-500/70 dark:text-red-400/70">cm</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic text-sm">Esperando trazo en imagen...</p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={reiniciarMedicion} disabled={puntos.length === 0 && !referenciaBloqueada}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar
                        </Button>

                        {resultados && (
                            <Button onClick={handleGuardar} disabled={guardando} className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                                {guardando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                Guardar en Bitácora
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}