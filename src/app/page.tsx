"use client";

import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

// Definimos la estructura de un mensaje para TypeScript
interface Mensaje {
  role: string;
  content: string;
}

export default function AsistentePesca() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: "¡Hola! Soy tu asistente de pesca deportiva. Muéstrame tu señuelo a la cámara o hazme una pregunta." }
  ]);
  const [inputUsuario, setInputUsuario] = useState("");
  const [senueloActual, setSenueloActual] = useState("Ninguno");
  const [cargando, setCargando] = useState(false);

  // Estado para controlar si mostramos la cámara en vivo
  const [mostrarCamara, setMostrarCamara] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);

  // --- AUTO-SCROLL ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, cargando]);

  // --- FUNCIÓN DE SUBIDA COMÚN ---
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
          { role: "assistant", content: `📸 ¡Listo! He detectado un ${data.detected}. ¿En qué te puedo ayudar con él?` }
        ]);
      } else {
        setSenueloActual("No detectado");
        alert(data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setSenueloActual("Error de conexión");
    }
  };

  // --- CAPTURA DESDE WEBCAM EN VIVO ---
  const capturarFoto = async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setMostrarCamara(false); // Ocultamos la cámara inmediatamente

    // Convertimos la imagen de Base64 a un objeto File (para que FastAPI la acepte)
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], "captura-webcam.jpg", { type: "image/jpeg" });

    await procesarImagen(file);
  };

  // --- CAPTURA DESDE ARCHIVO (Fallback) ---
  const escanearArchivo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await procesarImagen(file);

    if (event.target) {
      event.target.value = '';
    }
  };

  // --- ENVÍO DE CHAT AL LLM ---
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
        body: JSON.stringify({ messages: historialActualizado }),
      });

      const data = await response.json();
      setMensajes((prev) => [...prev, { role: data.role, content: data.content }]);
    } catch (error) {
      console.error("Error en el chat:", error);
      setMensajes((prev) => [...prev, { role: "assistant", content: "Error al conectar con el servidor local." }]);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans relative">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[85vh]">

        {/* MODAL DE LA CÁMARA (Se superpone cuando mostrarCamara es true) */}
        {mostrarCamara && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-4 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center">
              <h2 className="text-lg font-bold mb-4 text-gray-800">Muestra tu señuelo</h2>

              <div className="rounded-lg overflow-hidden border-4 border-blue-500 w-full bg-black">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: "user",
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                  }}
                  className="w-full object-cover"
                />
              </div>

              <div className="flex gap-4 mt-6 w-full">
                <button
                  onClick={() => setMostrarCamara(false)}
                  className="flex-1 bg-red-100 text-red-700 py-3 rounded-lg font-bold hover:bg-red-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={capturarFoto}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700"
                >
                  📸 Tomar Foto
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CABECERA */}
        <div className="bg-blue-800 text-white p-4 flex justify-between items-center z-10">
          <h1 className="text-xl font-bold">🎣 Asistente de Pesca AI</h1>
          <div className="text-sm bg-blue-900 px-3 py-1 rounded-full border border-blue-700 shadow-inner">
            Señuelo: <span className="font-bold text-green-400">{senueloActual}</span>
          </div>
        </div>

        {/* ÁREA DE MENSAJES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {mensajes.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none shadow-md'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {cargando && (
            <div className="text-gray-400 text-sm italic animate-pulse">El asistente está analizando...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ZONA DE CONTROLES */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={enviarMensaje} className="flex gap-2 items-center">

            {/* BOTÓN DE WEBCAM EN VIVO (Principal) */}
            <button
              type="button"
              onClick={() => setMostrarCamara(true)}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-md transition-transform active:scale-95 flex-shrink-0"
              title="Abrir Cámara en Vivo"
            >
              📷
            </button>

            {/* INPUT OCULTO Y BOTÓN DE SUBIR ARCHIVO (Secundario/Fallback) */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={escanearArchivo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-lg transition-colors flex-shrink-0"
              title="Subir foto desde la galería"
            >
              📎
            </button>

            {/* INPUT DE TEXTO */}
            <input
              type="text"
              value={inputUsuario}
              onChange={(e) => setInputUsuario(e.target.value)}
              placeholder="Pregúntame sobre el señuelo..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black shadow-inner"
              disabled={cargando}
            />

            {/* BOTÓN DE ENVIAR */}
            <button
              type="submit"
              disabled={cargando || !inputUsuario.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all flex-shrink-0"
            >
              Enviar
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}