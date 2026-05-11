"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoAlimentoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    foto: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/alimentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Alimento guardado con éxito");
        router.push("/alimentos");
      }
    } catch (error) {
      alert("Hubo un error al guardar");
    }
  };

  return (
    <div className="p-8 bg-[#FAF4ED] min-h-screen text-[#3B2523] font-sans">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-[#2D1A1A] mb-8 text-center">Registro de Alimento</h1>
        
        <div className="bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F0E6D8]">
          <div className="flex justify-between items-center mb-8 border-b border-[#F0E6D8] pb-4">
            <h2 className="text-sm font-bold text-[#3B2523] tracking-[0.15em] uppercase">Registro</h2>
            <span className="text-xs font-bold text-[#A89F91] tracking-widest uppercase">Formulario</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-xs font-bold text-[#5A3D3A] tracking-wider uppercase mb-2">Nombre</label>
              <input
                type="text"
                required
                value={formData.nombre}
                className="w-full p-3 bg-[#FDF8F3] border border-[#F0E6D8] rounded-lg text-sm text-[#3B2523] focus:outline-none focus:border-[#7F1724] focus:ring-1 focus:ring-[#7F1724] transition-all"
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#5A3D3A] tracking-wider uppercase mb-2">Descripción</label>
              <textarea
                value={formData.descripcion}
                className="w-full p-3 bg-[#FDF8F3] border border-[#F0E6D8] rounded-lg text-sm text-[#3B2523] min-h-[100px] focus:outline-none focus:border-[#7F1724] focus:ring-1 focus:ring-[#7F1724] transition-all"
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#5A3D3A] tracking-wider uppercase mb-2">Precio</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.precio}
                className="w-full p-3 bg-[#FDF8F3] border border-[#F0E6D8] rounded-lg text-sm text-[#3B2523] focus:outline-none focus:border-[#7F1724] focus:ring-1 focus:ring-[#7F1724] transition-all"
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit"
                className="bg-[#7F1724] text-white py-2.5 px-8 rounded-full font-medium text-sm tracking-wide hover:bg-[#60111A] transition-colors shadow-sm"
              >
                Guardar
              </button>
              <button 
                type="button"
                onClick={() => setFormData({ nombre: "", descripcion: "", precio: "", foto: "" })}
                className="bg-white border border-[#F0E6D8] text-[#5A3D3A] py-2.5 px-8 rounded-full font-medium text-sm tracking-wide hover:bg-[#FDF8F3] transition-colors"
              >
                Limpiar
              </button>
              <button 
                type="button"
                onClick={() => router.back()}
                className="bg-white border border-[#F0E6D8] text-[#5A3D3A] py-2.5 px-8 rounded-full font-medium text-sm tracking-wide hover:bg-[#FDF8F3] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}