"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "¡Hola! Soy tu experto en pesca. Escribe tu duda o usa el botón para escanear un señuelo." }
  ]);
  const [inputText, setInputText] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Agregamos el mensaje del usuario a la UI temporalmente
    setMessages(prev => [...prev, { role: "user", content: inputText }]);
    setInputText("");

    // Aquí luego conectaremos con nuestro backend de FastAPI
  };

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto p-4 bg-gray-50">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 rounded-t-xl shadow-md">
        <h1 className="text-xl font-bold">Asistente de Pesca Local</h1>
        <p className="text-sm text-blue-200">Fase 1 - IA MultiCloud</p>
      </header>

      {/* Área del Chat */}
      <div className="flex-1 overflow-y-auto p-4 bg-white border-x border-gray-200 shadow-sm flex flex-col gap-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${msg.role === "assistant"
                ? "bg-gray-100 text-gray-800 self-start rounded-tl-none"
                : "bg-blue-600 text-white self-end rounded-tr-none"
              }`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      {/* Barra de Input */}
      <div className="bg-white p-3 border border-gray-200 rounded-b-xl shadow-md flex gap-2 items-center">
        {/* Botón para Cámara / Subir Archivo */}
        <button
          className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          title="Escanear Señuelo"
        >
          {/* Ícono de cámara simple usando SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
          </svg>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Pregunta sobre nudos, especies..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-black"
        />

        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Enviar
        </button>
      </div>
    </main>
  );
}