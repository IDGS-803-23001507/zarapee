"use client";

import { useEffect, useState } from "react";

// Función para dar formato de moneda
function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));
}

export default function CombosPage() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // Estado para la subida de imagen

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    foto: "", // Aquí se guardará la URL final de la imagen subida
  });

  const obtenerCombos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/combos");
      const data = await response.json();
      setCombos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Error al obtener combos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerCombos();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // --- LÓGICA DE SUBIDA DE IMAGEN ---
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que sea imagen (opcional pero recomendado)
    if (!file.type.startsWith('image/')) {
      alert('Por favor sube un archivo de imagen válido.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Llamamos a la nueva API de subida (ver Parte 2)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // No enviar headers de Content-Type, el navegador lo hace automáticamente con FormData
      });

      if (!response.ok) throw new Error("Fallo en la subida");

      const data = await response.json();
      
      // Guardamos la URL devuelta por el servidor en el estado del formulario
      setForm((prev) => ({ ...prev, foto: data.url }));
    
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };
  // ----------------------------------

  const guardarCombo = async (e) => {
    e.preventDefault();
    if (uploading) {
        alert("Espera a que termine de subirse la imagen.");
        return;
    }
    setSaving(true);
    try {
      const response = await fetch("/api/combos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Enviamos el formulario, que ya incluye la URL de la foto subida
        body: JSON.stringify({ ...form, productos: [] }),
      });

      if (!response.ok) {
        alert("Error al guardar el combo");
        return;
      }

      // Resetear formulario, incluyendo la imagen de vista previa
      setForm({ nombre: "", descripcion: "", precio: "", foto: "" });
      obtenerCombos();
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  // Clase CSS común para inputs para forzar fondo blanco y quitar gris al escribir
  const inputClass = "w-full rounded-lg border border-[#d9c8bc] px-3 py-2 outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728] bg-white text-[#3D2B1F] placeholder:text-gray-300";

  return (
    <main className="flex-1 bg-[#f6f3ef] pt-32 pb-14 px-4 sm:px-8 min-h-screen">
      <section className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="uppercase tracking-[0.3em] text-xs text-[#7A5A43] mb-2">
            Panel administrativo
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#3D2B1F]">
            Módulo de Combos
          </h1>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
          <article className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-6 h-fit">
            <h2 className="text-xl font-semibold text-[#3D2B1F] mb-6">
              Registrar Nuevo Combo
            </h2>

            <form onSubmit={guardarCombo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">Nombre del Combo</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Combo Familiar"
                  className={inputClass} // Usando la clase unificada
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">Precio (MXN)</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  placeholder="200"
                  className={inputClass}
                  required
                />
              </div>

              {/* --- NUEVO CAMPO DE SUBIDA DE FOTO --- */}
              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">Foto del Combo</label>
                
                {/* Vista previa de la imagen si ya se subió */}
                {form.foto && (
                    <div className="mb-3 relative w-32 h-32 rounded-lg overflow-hidden border border-[#d9c8bc]">
                        <img src={form.foto} alt="Vista previa" className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <label className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-full border text-sm transition ${uploading ? 'bg-gray-100 text-gray-400 border-gray-200' : 'border-[#B83728] text-[#B83728] hover:bg-[#fff0ee]'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden" // Escondemos el input feo por defecto
                            disabled={uploading}
                        />
                        {uploading ? "Subiendo..." : "Seleccionar Imagen"}
                    </label>
                    {uploading && <span className="text-xs text-[#7A5A43]">Procesando archivo...</span>}
                    {form.foto && !uploading && <span className="text-xs text-emerald-600">✓ Imagen lista</span>}
                </div>
              </div>
              {/* ------------------------------------- */}

              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="¿Qué incluye este combo?"
                  className={`${inputClass} resize-none`} // Forzamos fondo blanco también aquí
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full sm:w-auto mt-4 rounded-full bg-[#B83728] text-white px-8 py-2.5 text-sm uppercase tracking-[0.15em] hover:bg-[#7f2118] transition disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar Combo"}
              </button>
            </form>
          </article>

          {/* Listado (Grid de Cards) - Sin cambios, solo para contexto */}
          <article>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#3D2B1F]">Combos Activos</h2>
            </div>

            {loading ? (
              <p className="text-[#7A5A43]">Cargando listado...</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {combos.length === 0 ? (
                  <p className="text-[#7A5A43] col-span-2 text-center py-10 border border-dashed border-[#d9c8bc] rounded-2xl">
                    No hay combos registrados.
                  </p>
                ) : (
                  combos.map((combo) => (
                    <div
                      key={combo.idCombo}
                      className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] overflow-hidden hover:shadow-md transition"
                    >
                      <img
                        src={combo.foto || "/Logo.png"}
                        alt={combo.nombre}
                        className="h-40 w-full object-cover"
                      />
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-[#3D2B1F]">{combo.nombre}</h3>
                          <span className="text-[#B83728] font-bold">
                            {formatPrice(combo.precio)}
                          </span>
                        </div>
                        <p className="text-xs text-[#6B5041] line-clamp-2">
                          {combo.descripcion}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}