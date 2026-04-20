"use client";

import { useState, useRef, useEffect } from 'react'; // <-- Agregado useEffect

// Definimos la estructura de un mensaje para TypeScript
interface Mensaje {
  role: string;
  content: string;
}

export default function AsistentePesca() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: "¡Hola! Soy tu asistente de pesca deportiva. Escanea tu señuelo o hazme una pregunta." }
  ]);
  const [inputUsuario, setInputUsuario] = useState("");
  const [senueloActual, setSenueloActual] = useState("Ninguno");
  const [cargando, setCargando] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- INICIO CÓDIGO AUTO-SCROLL ---
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes, cargando]); // Se ejecuta cada vez que cambia el array de mensajes o el estado de carga
  // --- FIN CÓDIGO AUTO-SCROLL ---

  const escanearSenuelo = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // El signo de interrogación protege en caso de que el usuario cancele la subida
    const file = event.target.files?.[0];
    if (!file) return;

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
          { role: "assistant", content: `📸 ¡Listo! He detectado que tienes un ${data.detected}. ¿En qué te puedo ayudar con él?` }
        ]);
      } else {
        setSenueloActual("No detectado");
        alert(data.message);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setSenueloActual("Error de conexión");
    } finally {
      if (event.target) {
        event.target.value = '';
      }
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
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-[85vh]">

        <div className="bg-blue-800 text-white p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🎣 Asistente de Pesca AI</h1>
          <div className="text-sm bg-blue-900 px-3 py-1 rounded-full border border-blue-700">
            Señuelo en mano: <span className="font-bold text-green-400">{senueloActual}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {mensajes.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {cargando && (
            <div className="text-gray-400 text-sm italic">El asistente está escribiendo...</div>
          )}
          {/* DIV INVISIBLE DE ANCLAJE PARA EL SCROLL */}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={enviarMensaje} className="flex gap-2">

            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={fileInputRef}
              onChange={escanearSenuelo}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors flex-shrink-0"
              title="Escanear Señuelo"
            >
              📷
            </button>

            <input
              type="text"
              value={inputUsuario}
              onChange={(e) => setInputUsuario(e.target.value)}
              placeholder="Pregúntame cómo usar tu señuelo..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              disabled={cargando}
            />

            <button
              type="submit"
              disabled={cargando || !inputUsuario.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Enviar
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}