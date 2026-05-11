"use client";

import { useEffect, useState } from "react";

// Formato moneda
function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));
}

export default function CombosPage() {

  const [combos, setCombos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    foto: "",
  });

  // =========================
  // OBTENER COMBOS
  // =========================
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

  // =========================
  // OBTENER PRODUCTOS
  // =========================
  const obtenerProductos = async () => {

    try {

      const response = await fetch("/api/productos");

      const data = await response.json();

      setProductos(Array.isArray(data) ? data : []);

    } catch (error) {

      console.log("Error al obtener productos:", error);

    }
  };

  useEffect(() => {

    obtenerCombos();
    obtenerProductos();

  }, []);

  // =========================
  // INPUTS
  // =========================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // SUBIR IMAGEN
  // =========================
  const handleFileChange = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      alert("Selecciona una imagen válida");
      return;
    }

    setUploading(true);

    const formData = new FormData();

    formData.append("file", file);

    try {

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir imagen");
      }

      const data = await response.json();

      setForm((prev) => ({
        ...prev,
        foto: data.url,
      }));

    } catch (error) {

      console.log(error);

      alert("Error al subir imagen");

    } finally {

      setUploading(false);

    }
  };

  // =========================
  // GUARDAR COMBO
  // =========================
  const guardarCombo = async (e) => {

    e.preventDefault();

    if (uploading) {

      alert("Espera a que termine la subida");
      return;
    }

    if (seleccionados.length === 0) {

      alert("Selecciona al menos un producto");
      return;
    }

    setSaving(true);

    try {

      const response = await fetch("/api/combos", {

        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          ...form,
          productos: seleccionados,
        }),
      });

      if (!response.ok) {

        alert("Error al guardar combo");
        return;
      }

      alert("Combo guardado");

      // Reset
      setForm({
        nombre: "",
        descripcion: "",
        precio: "",
        foto: "",
      });

      setSeleccionados([]);

      obtenerCombos();

    } catch (error) {

      console.log(error);

    } finally {

      setSaving(false);

    }
  };

  // =========================
  // ESTILO INPUTS
  // =========================
  const inputClass =
    "w-full rounded-lg border border-[#d9c8bc] px-3 py-2 outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728] bg-white text-[#3D2B1F] placeholder:text-gray-300";

  return (

    <main className="flex-1 bg-[#f6f3ef] pt-32 pb-14 px-4 sm:px-8 min-h-screen">

      <section className="max-w-6xl mx-auto">

        {/* HEADER */}
        <header className="mb-8">

          <p className="uppercase tracking-[0.3em] text-xs text-[#7A5A43] mb-2">
            Panel administrativo
          </p>

          <h1 className="text-3xl sm:text-4xl font-semibold text-[#3D2B1F]">
            Módulo de Combos
          </h1>

        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">

          {/* FORMULARIO */}
          <article className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-6 h-fit">

            <h2 className="text-xl font-semibold text-[#3D2B1F] mb-6">
              Registrar Nuevo Combo
            </h2>

            <form onSubmit={guardarCombo} className="space-y-4">

              {/* NOMBRE */}
              <div>

                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                  Nombre del Combo
                </label>

                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Combo Familiar"
                  className={inputClass}
                  required
                />

              </div>

              {/* PRECIO */}
              <div>

                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                  Precio
                </label>

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

              {/* FOTO */}
              <div>

                <label className="block text-sm font-medium text-[#3D2B1F] mb-2">
                  Foto del Combo
                </label>

                {form.foto && (

                  <div className="mb-3 w-32 h-32 rounded-lg overflow-hidden border">

                    <img
                      src={form.foto}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                  </div>
                )}

                <label className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-full border text-sm transition ${
                  uploading
                    ? "bg-gray-100 text-gray-400 border-gray-200"
                    : "border-[#B83728] text-[#B83728] hover:bg-[#fff0ee]"
                }`}>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                  />

                  {uploading ? "Subiendo..." : "Seleccionar Imagen"}

                </label>

              </div>

              {/* DESCRIPCIÓN */}
              <div>

                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                  Descripción
                </label>

                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="¿Qué incluye?"
                  className={`${inputClass} resize-none`}
                  required
                />

              </div>

              {/* PRODUCTOS */}
<div>

  <label className="block text-sm font-medium text-[#3D2B1F] mb-4">
    Selecciona productos para el combo
  </label>

  {/* ================= ALIMENTOS ================= */}
  <div className="mb-6">

    <h3 className="text-lg font-semibold text-[#B83728] mb-3">
      Alimentos
    </h3>

    <div className="grid gap-3 max-h-52 overflow-y-auto border border-[#d9c8bc] rounded-xl p-4 bg-white">

      {productos.filter(
        (producto) => producto.tipo === "ALIMENTO"
      ).length === 0 ? (

        <p className="text-sm text-gray-500">
          No hay alimentos registrados
        </p>

      ) : (

        productos
          .filter((producto) => producto.tipo === "ALIMENTO")
          .map((producto) => (

            <label
              key={producto.idProducto}
              className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-[#fff7f5]"
            >

              <div>

                <p className="font-medium text-[#3D2B1F]">
                  {producto.nombre}
                </p>

                <p className="text-xs text-gray-500">
                  {formatPrice(producto.precio)}
                </p>

              </div>

              <input
                type="checkbox"

                checked={seleccionados.some(
                  (p) => p.idProducto === producto.idProducto
                )}

                onChange={(e) => {

                  if (e.target.checked) {

                    setSeleccionados([
                      ...seleccionados,
                      {
                        idProducto: producto.idProducto,
                        cantidad: 1,
                      },
                    ]);

                  } else {

                    setSeleccionados(
                      seleccionados.filter(
                        (p) =>
                          p.idProducto !== producto.idProducto
                      )
                    );
                  }
                }}
              />

            </label>
          ))
      )}

    </div>

  </div>

  {/* ================= BEBIDAS ================= */}
  <div>

    <h3 className="text-lg font-semibold text-[#B83728] mb-3">
      Bebidas
    </h3>

    <div className="grid gap-3 max-h-52 overflow-y-auto border border-[#d9c8bc] rounded-xl p-4 bg-white">

      {productos.filter(
        (producto) => producto.tipo === "BEBIDA"
      ).length === 0 ? (

        <p className="text-sm text-gray-500">
          No hay bebidas registradas
        </p>

      ) : (

        productos
          .filter((producto) => producto.tipo === "BEBIDA")
          .map((producto) => (

            <label
              key={producto.idProducto}
              className="flex items-center justify-between border rounded-lg px-3 py-2 hover:bg-[#fff7f5]"
            >

              <div>

                <p className="font-medium text-[#3D2B1F]">
                  {producto.nombre}
                </p>

                <p className="text-xs text-gray-500">
                  {formatPrice(producto.precio)}
                </p>

              </div>

              <input
                type="checkbox"

                checked={seleccionados.some(
                  (p) => p.idProducto === producto.idProducto
                )}

                onChange={(e) => {

                  if (e.target.checked) {

                    setSeleccionados([
                      ...seleccionados,
                      {
                        idProducto: producto.idProducto,
                        cantidad: 1,
                      },
                    ]);

                  } else {

                    setSeleccionados(
                      seleccionados.filter(
                        (p) =>
                          p.idProducto !== producto.idProducto
                      )
                    );
                  }
                }}
              />

            </label>
          ))
      )}

    </div>

  </div>

</div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full sm:w-auto mt-4 rounded-full bg-[#B83728] text-white px-8 py-2.5 text-sm uppercase tracking-[0.15em] hover:bg-[#7f2118] transition disabled:opacity-60"
              >

                {saving ? "Guardando..." : "Guardar Combo"}

              </button>

            </form>

          </article>

          {/* LISTADO */}
          <article>

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-semibold text-[#3D2B1F]">
                Combos Activos
              </h2>

            </div>

            {loading ? (

              <p className="text-[#7A5A43]">
                Cargando combos...
              </p>

            ) : (

              <div className="grid sm:grid-cols-2 gap-4">

                {combos.length === 0 ? (

                  <p className="text-[#7A5A43] col-span-2 text-center py-10 border border-dashed border-[#d9c8bc] rounded-2xl">
                    No hay combos registrados
                  </p>

                ) : (

                  combos.map((combo) => (

                    <div
                      key={combo.idCombo}
                      className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] overflow-hidden"
                    >

                      <img
                        src={combo.foto || "/Logo.png"}
                        alt={combo.nombre}
                        className="h-40 w-full object-cover"
                      />

                      <div className="p-4">

                        <div className="flex justify-between items-start mb-1">

                          <h3 className="font-bold text-[#3D2B1F]">
                            {combo.nombre}
                          </h3>

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