"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AlimentosPage() {
  const [alimentos, setAlimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAlimentos = async () => {
    try {
      const response = await fetch("/api/alimentos");
      const data = await response.json();
      setAlimentos(data);
    } catch (error) {
      console.error("Error cargando alimentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlimentos();
  }, []);

  const handleEliminar = async (idProducto) => {
    const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este alimento?");
    if (!confirmar) return;

    try {
      const response = await fetch(`/api/alimentos/${idProducto}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Alimento eliminado");
        fetchAlimentos();
      } else {
        alert("Hubo un error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8 bg-[#FAF4ED] min-h-screen text-[#3B2523] font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#2D1A1A]">Directorio de Alimentos</h1>
          <Link 
            href="/alimentos/nuevo" 
            className="bg-[#7F1724] text-white px-6 py-2.5 rounded-full hover:bg-[#60111A] transition-colors shadow-sm font-medium text-sm tracking-wide"
          >
            + Nuevo Alimento
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-[#7F1724] font-medium mt-10">Cargando alimentos...</p>
        ) : alimentos.length === 0 ? (
          <div className="bg-[#FFF5F5] text-[#7F1724] p-4 rounded-xl border border-[#FFEAEA] text-center text-sm font-medium shadow-sm">
            No se pudo cargar el listado o no hay alimentos registrados.
          </div>
        ) : (
          <div className="bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border border-[#F0E6D8] p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#F0E6D8]">
              <h2 className="text-sm font-bold text-[#3B2523] tracking-[0.15em] uppercase">Alimentos Activos</h2>
              <div className="bg-[#FAF4ED] text-[#7F1724] px-4 py-1.5 rounded-full text-xs font-bold border border-[#F0E6D8] shadow-sm">
                TOTAL {alimentos.length}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-[#7F1724] font-bold text-xs uppercase tracking-wider border-b border-[#F0E6D8]">ID</th>
                    <th className="p-3 text-[#7F1724] font-bold text-xs uppercase tracking-wider border-b border-[#F0E6D8]">Nombre</th>
                    <th className="p-3 text-[#7F1724] font-bold text-xs uppercase tracking-wider border-b border-[#F0E6D8]">Descripción</th>
                    <th className="p-3 text-[#7F1724] font-bold text-xs uppercase tracking-wider border-b border-[#F0E6D8]">Precio</th>
                    <th className="p-3 text-[#7F1724] font-bold text-xs uppercase tracking-wider border-b border-[#F0E6D8] text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {alimentos.map((alimento) => (
                    <tr key={alimento.idProducto} className="hover:bg-[#FDF8F3] transition-colors group">
                      <td className="p-4 border-b border-[#F0E6D8] text-sm text-[#5A3D3A]">{alimento.idProducto}</td>
                      <td className="p-4 border-b border-[#F0E6D8] font-semibold text-[#3B2523] text-sm">{alimento.nombre}</td>
                      <td className="p-4 border-b border-[#F0E6D8] text-[#5A3D3A] text-sm">{alimento.descripcion}</td>
                      <td className="p-4 border-b border-[#F0E6D8] text-[#3B2523] font-medium text-sm">${alimento.precio}</td>
                      <td className="p-4 border-b border-[#F0E6D8] flex justify-center gap-2">
                        <Link 
                          href={`/alimentos/editar/${alimento.idProducto}`}
                          className="px-4 py-1.5 bg-[#FAF4ED] text-[#7F1724] rounded-full hover:bg-[#F0E6D8] border border-[#F0E6D8] text-xs font-semibold transition-colors shadow-sm"
                        >
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleEliminar(alimento.idProducto)}
                          className="px-4 py-1.5 bg-white text-red-600 rounded-full hover:bg-red-50 border border-red-100 text-xs font-semibold transition-colors shadow-sm"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}