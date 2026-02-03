"use client";

import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("https://formcarry.com/s/TU_ID_DE_FORMCARRY", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (res.ok) {
        setStatus("success");
        e.currentTarget.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block font-medium text-gray-700">Nombre</label>
      <input
        name="nombre"
        required
        className="w-full p-3 border rounded-lg text-gray-900"
        placeholder="Tu nombre"
      />

      <label className="block font-medium text-gray-700">Email</label>
      <input
        type="email"
        name="email"
        required
        className="w-full p-3 border rounded-lg text-gray-900"
        placeholder="tu@email.com"
      />

      <label className="block font-medium text-gray-700">Mensaje</label>
      <textarea
        name="mensaje"
        required
        rows={5}
        className="w-full p-3 border rounded-lg text-gray-900"
        placeholder="Contame sobre tu proyecto..."
      />

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
      >
        {status === "loading" ? "Enviando..." : "Enviar mensaje"}
      </button>

      {status === "success" && (
        <p className="text-green-600 text-center">✅ Mensaje enviado correctamente</p>
      )}

      {status === "error" && (
        <p className="text-red-600 text-center">❌ Error al enviar. Probá más tarde.</p>
      )}
    </form>
  );
}
