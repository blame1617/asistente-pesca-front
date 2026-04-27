"use client";

import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import ReactMarkdown from "react-markdown";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

// Componentes de shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Íconos de Lucide
import { Camera, Paperclip, Send, Fish, User, Bot, X, Moon, Sun } from "lucide-react";

interface Mensaje {
  role: string;
  content: string;
}

export default function AsistentePesca() {
  // 1. Inicializamos vacío para evitar desajustes de hidratación en Next.js
  const router = useRouter();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [inputUsuario, setInputUsuario] = useState("");
  const [senueloActual, setSenueloActual] = useState("Ninguno");
  const [cargando, setCargando] = useState(false);
  const [mostrarCamara, setMostrarCamara] = useState(false);

  // Hook para controlar el modo oscuro
  const { setTheme, theme } = useTheme();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);


  // --- LÓGICA DE MEMORIA DE SESIÓN ---

  // 2. RECUPERAR: Se ejecuta una sola vez al cargar la página
  useEffect(() => {
    // Recuperar Chat
    const historialGuardado = sessionStorage.getItem("pesca_chat_history");
    if (historialGuardado) {
      setMensajes(JSON.parse(historialGuardado));
    } else {
      setMensajes([
        { role: "assistant", content: "¡Hola! Soy tu asistente de pesca deportiva. Muéstrame tu señuelo a la cámara o hazme una pregunta." }
      ]);
    }

    // Recuperar Señuelo (Contexto)
    const senueloGuardado = sessionStorage.getItem("pesca_lure_context");
    if (senueloGuardado) {
      setSenueloActual(senueloGuardado);
    }
  }, []);

  // 3. GUARDAR: Se ejecuta cada vez que 'mensajes' cambia
  useEffect(() => {
    if (mensajes.length > 0) {
      sessionStorage.setItem("pesca_chat_history", JSON.stringify(mensajes));
    }
  }, [mensajes]);

  useEffect(() => {
    if (senueloActual !== "Ninguno") {
      sessionStorage.setItem("pesca_lure_context", senueloActual);
    }
  }, [senueloActual]);

  // -----------------------------------

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, cargando]);

  const procesarImagen = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      setSenueloActual("Analizando...");

      const response = await fetch("http://127.0.0.1:8000/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.status === "success") {
        setSenueloActual(data.detected);
        setMensajes((prev) => [
          ...prev,
          { role: "assistant", content: `📸 ¡Listo! He detectado un **${data.detected}**. ¿En qué te puedo ayudar con él?` }
        ]);
      } else {
        setSenueloActual("No detectado");
        alert(data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setSenueloActual("Error");
    }
  };

  const capturarFoto = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setMostrarCamara(false);

    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "captura-webcam.jpg", { type: "image/jpeg" });

    await procesarImagen(file);
  };

  const escanearArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await procesarImagen(file);

    if (event.target) {
      event.target.value = '';
    }
  };

  const enviarMensaje = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputUsuario.trim()) return;

    const nuevoMensaje = { role: "user", content: inputUsuario };
    const historialActualizado = [...mensajes, nuevoMensaje];

    setMensajes(historialActualizado);
    setInputUsuario("");
    setCargando(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // AQUÍ ESTÁ EL ARREGLO 1: Enviamos el señuelo actual al backend
        body: JSON.stringify({
          messages: historialActualizado,
          senuelo_actual: senueloActual
        }),
      });

      const data = await response.json();
      setMensajes((prev) => [...prev, { role: data.role, content: data.content }]);

      if (data.action === "navigate_nudos") {
        console.log("Agent Action: Redirigiendo a nudos...");
        setTimeout(() => {
          router.push("/nudos");
        }, 2000);
      }

    } catch (error) {
      console.error("Error en el chat:", error);
      setMensajes((prev) => [...prev, { role: "assistant", content: "Error al conectar con el servidor local." }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    // Aquí agregamos el gradiente "Oceánico" para el fondo general
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-background dark:to-slate-900 p-4 md:p-8 font-sans relative flex items-center justify-center transition-colors duration-500">

      {/* MODAL DE LA CÁMARA (A prueba de balas) */}
      {mostrarCamara && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-[100] flex flex-col items-center justify-center p-4">

          <Card className="w-full max-w-lg flex flex-col border-border shadow-2xl bg-card overflow-hidden max-h-[95vh]">

            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-muted/50 flex-shrink-0">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Escáner de Señuelo</h2>
              <Button variant="ghost" size="icon" onClick={() => setMostrarCamara(false)}>
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CardHeader>

            {/* Pantalla de cámara: se adapta al espacio que queda sin deformarse */}
            <div className="bg-black relative aspect-[3/4] sm:aspect-video w-full overflow-hidden flex-1 min-h-[300px]">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "environment" }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>

            {/* ZONA DE BOTONES: La magia está en 'flex-col sm:flex-row' y 'flex-1' */}
            <div className="p-4 flex flex-col sm:flex-row gap-3 flex-shrink-0 border-t border-border bg-card">

              <Button variant="outline" className="flex-1 py-6 text-base order-2 sm:order-1" onClick={() => setMostrarCamara(false)}>
                Cancelar
              </Button>

              <Button className="flex-1 py-6 text-base bg-blue-600 hover:bg-blue-700 text-white shadow-md order-1 sm:order-2" onClick={capturarFoto}>
                <Camera className="mr-2 h-5 w-5" /> Tomar Foto
              </Button>

            </div>
          </Card>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL DEL CHAT */}
      <Card className="w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">

        {/* CABECERA */}
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-md">
              <Fish className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">Asistente de Pesca</h1>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Atento a tus dudas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border shadow-inner text-xs font-medium text-foreground">
              <span className="text-muted-foreground">Contexto:</span>
              <span className={`font-bold ${senueloActual !== "Ninguno" && senueloActual !== "Analizando..." && senueloActual !== "No detectado" ? "text-blue-500" : ""}`}>
                {senueloActual}
              </span>
            </div>

            {/* BOTÓN DE MODO OSCURO */}
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
          </div>
        </CardHeader>

        {/* ÁREA DE MENSAJES */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20">
          {mensajes.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              <Avatar className="h-8 w-8 mt-1 shadow-sm border border-border flex-shrink-0">
                {msg.role === 'user' ? (
                  <AvatarFallback className="bg-blue-600 text-white"><User className="h-4 w-4" /></AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-background text-foreground"><Bot className="h-5 w-5 text-blue-500" /></AvatarFallback>
                )}
              </Avatar>

              {/* AQUÍ ESTÁ EL ARREGLO 2: Se agregó min-w-0 para forzar el límite del 80% */}
              <div className={`max-w-[80%] min-w-0 rounded-2xl px-5 py-3 text-sm shadow-md ${msg.role === 'user'
                ? 'bg-blue-600 dark:bg-blue-700 text-white rounded-tr-sm'
                : 'bg-background border border-border text-foreground rounded-tl-sm'
                }`}>

                {/* Ajustamos el prose para que corte las palabras y solo la tabla tenga scroll interno */}
                <div className={`prose prose-sm max-w-none break-words overflow-hidden prose-table:overflow-x-auto prose-pre:overflow-x-auto ${msg.role === 'user' ? 'text-white prose-p:text-white prose-strong:text-white' : 'dark:prose-invert'}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

              </div>
            </div>
          ))}

          {cargando && (
            <div className="flex gap-3 flex-row">
              <Avatar className="h-8 w-8 mt-1 shadow-sm border border-border">
                <AvatarFallback className="bg-background text-foreground"><Bot className="h-5 w-5 text-blue-500" /></AvatarFallback>
              </Avatar>
              <div className="bg-background border border-border rounded-2xl rounded-tl-sm px-5 py-3 shadow-md flex items-center gap-2">
                <span className="flex gap-1">
                  <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></span>
                  <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                  <span className="h-2 w-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* ZONA DE CONTROLES */}
        <CardFooter className="p-4 bg-card border-t border-border">
          <form onSubmit={enviarMensaje} className="flex w-full items-center gap-2 bg-muted/50 rounded-full p-1 border border-border shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:ring-offset-background transition-all">

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-blue-500 hover:bg-background flex-shrink-0"
              onClick={() => setMostrarCamara(true)}
              title="Abrir Cámara"
            >
              <Camera className="h-5 w-5" />
            </Button>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={escanearArchivo}
              className="hidden"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-blue-500 hover:bg-background flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Subir foto"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <Input
              type="text"
              value={inputUsuario}
              onChange={(e) => setInputUsuario(e.target.value)}
              placeholder="Pregúntale al asistente..."
              className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 shadow-none text-foreground placeholder:text-muted-foreground"
              disabled={cargando}
            />

            <Button
              type="submit"
              disabled={cargando || !inputUsuario.trim()}
              className="rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md flex-shrink-0"
              size="icon"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}