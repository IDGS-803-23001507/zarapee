"use client";

import { useEffect, useMemo, useState } from "react";

const INITIAL_FORM = {
  nombre: "",
  descripcion: "",
  foto: "",
  precio: "",
  estatus: true,
};

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(Number(value ?? 0));
}

function getApiErrorMessage(error, fallback) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
async function parseApiResponse(response) {
  const rawText = await response.text();
  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch {
    return null;
  }
}

function normalizeSearchableText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeImageUrl(value) {
  const rawValue = String(value ?? "").trim();
  if (!rawValue) return "";

  const normalized = rawValue.replace(/\\/g, "/");

  if (/fakepath\//i.test(normalized)) return "";
  if (/^(https?:\/\/|data:image\/)/i.test(normalized)) return normalized;
  if (/^(file:|[a-z]:\/)/i.test(normalized)) return "";
  if (normalized.startsWith("/")) return normalized;
  if (normalized.startsWith("uploads/")) return `/${normalized}`;

  return normalized;
}

function normalizeBebidaItem(bebida) {
  if (!bebida || typeof bebida !== "object") return null;

  const parsedPrice = Number(bebida.precio);

  return {
    ...bebida,
    nombre: String(bebida.nombre ?? "").trim(),
    descripcion: String(bebida.descripcion ?? "").trim(),
    foto: normalizeImageUrl(bebida.foto),
    precio: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    estatus: Boolean(bebida.estatus),
  };
}

export default function BebidasPage() {
  const [bebidas, setBebidas] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const fetchBebidasData = async () => {
    const response = await fetch("/api/bebidas", { cache: "no-store" });
    const data = await parseApiResponse(response);

    if (!response.ok) {
      throw new Error(data?.error || "No se pudieron cargar las bebidas.");
    }
    return (Array.isArray(data) ? data : [])
      .map(normalizeBebidaItem)
      .filter(Boolean);
  };

  const filteredBebidas = useMemo(() => {
    const term = normalizeSearchableText(search);
    if (!term) return bebidas;

    return bebidas.filter((bebida) => {
      const nombre = normalizeSearchableText(bebida?.nombre);
      const descripcion = normalizeSearchableText(bebida?.descripcion);
      return nombre.includes(term) || descripcion.includes(term);
    });
  }, [bebidas, search]);

  const previewImageUrl = normalizeImageUrl(form.foto);

  useEffect(() => {
    let isMounted = true;

    const loadInitialBebidas = async () => {
      try {
        const data = await fetchBebidasData();
        if (!isMounted) return;
        setBebidas(data);
      } catch (loadError) {
        if (!isMounted) return;
        setError(getApiErrorMessage(loadError, "Error al cargar bebidas."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialBebidas();
    return () => {
      isMounted = false;
    };
  }, []);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageSelection = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setUploadingImage(true);
    setError("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/uploads/bebidas", {
        method: "POST",
        body: formData,
      });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo subir la imagen.");
      }
      const imageUrl = normalizeImageUrl(data?.fileUrl);

      setForm((prev) => ({
        ...prev,
        foto: imageUrl,
      }));
      setSuccessMessage("Imagen de bebida cargada correctamente.");
    } catch (uploadError) {
      setError(getApiErrorMessage(uploadError, "Error al subir imagen."));
    } finally {
      setUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");
    const isEditing = Boolean(editingId);

    const payload = {
      ...form,
      foto: normalizeImageUrl(form.foto),
      precio: form.precio,
    };

    const endpoint = isEditing ? `/api/bebidas/${editingId}` : "/api/bebidas";
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo guardar la bebida.");
      }

      let refreshedFromApi = false;
      try {
        const updatedBebidas = await fetchBebidasData();
        setBebidas(updatedBebidas);
        refreshedFromApi = true;
      } catch (refreshError) {
        console.warn("No se pudo refrescar listado tras guardar bebida:", refreshError);
      }

      if (!refreshedFromApi) {
        const savedBebida = normalizeBebidaItem(data);
        if (!savedBebida) {
          throw new Error("No se pudo procesar la bebida guardada.");
        }

        setBebidas((prev) => {
          if (isEditing) {
            return prev.map((item) =>
              item.idBebida === savedBebida.idBebida ? savedBebida : item
            );
          }

          const withoutDuplicate = prev.filter(
            (item) => item.idBebida !== savedBebida.idBebida
          );
          return [savedBebida, ...withoutDuplicate];
        });
      }
      resetForm();
      if (!isEditing) {
        setSearch("");
      }
      setSuccessMessage(
        isEditing
          ? "Bebida actualizada correctamente."
          : "Bebida creada correctamente."
      );
    } catch (saveError) {
      setError(getApiErrorMessage(saveError, "Error al guardar bebida."));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (bebida) => {
    setEditingId(bebida.idBebida);
    setForm({
      nombre: bebida.nombre ?? "",
      descripcion: bebida.descripcion ?? "",
      foto: normalizeImageUrl(bebida.foto),
      precio: String(bebida.precio ?? ""),
      estatus: Boolean(bebida.estatus),
    });
    setSuccessMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeactivate = async (idBebida) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/bebidas/${idBebida}`, { method: "DELETE" });
      const data = await parseApiResponse(response);

      if (!response.ok) {
        throw new Error(data?.error || "No se pudo desactivar la bebida.");
      }

      try {
        const updatedBebidas = await fetchBebidasData();
        setBebidas(updatedBebidas);
      } catch (refreshError) {
        console.warn("No se pudo refrescar bebidas tras desactivar:", refreshError);
        setBebidas((prev) =>
          prev.map((item) =>
            item.idBebida === idBebida ? { ...item, estatus: false } : item
          )
        );
      }
      setSuccessMessage("Bebida desactivada correctamente.");
    } catch (deleteError) {
      setError(getApiErrorMessage(deleteError, "Error al desactivar bebida."));
    }
  };

  const handleActivate = async (bebida) => {
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/bebidas/${bebida.idBebida}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: bebida.nombre,
          descripcion: bebida.descripcion,
          foto: normalizeImageUrl(bebida.foto),
          precio: bebida.precio,
          estatus: true,
        }),
      });
      const data = await parseApiResponse(response);
      if (!response.ok) {
        throw new Error(data?.error || "No se pudo activar la bebida.");
      }

      let refreshedFromApi = false;
      try {
        const updatedBebidas = await fetchBebidasData();
        setBebidas(updatedBebidas);
        refreshedFromApi = true;
      } catch (refreshError) {
        console.warn("No se pudo refrescar bebidas tras activar:", refreshError);
      }

      if (!refreshedFromApi) {
        const updatedBebida = normalizeBebidaItem(data);
        if (!updatedBebida) {
          throw new Error("No se pudo procesar la bebida activada.");
        }

        setBebidas((prev) =>
          prev.map((item) =>
            item.idBebida === updatedBebida.idBebida ? updatedBebida : item
          )
        );
      }
      setSuccessMessage("Bebida activada correctamente.");
    } catch (activateError) {
      setError(getApiErrorMessage(activateError, "Error al activar bebida."));
    }
  };

  return (
    <main className="flex-1 bg-[#f6f3ef] pt-30 pb-14 px-4 sm:px-8">
      <section className="max-w-6xl mx-auto">
        <header className="mb-8">
          <p className="uppercase tracking-[0.3em] text-xs text-[#7A5A43] mb-2">
            Panel administrativo
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#3D2B1F]">
            Módulo de Bebidas
          </h1>
          <p className="text-[#5C4A3F] mt-2">
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <article className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-5 sm:p-6">
            <h2 className="text-xl font-semibold text-[#3D2B1F] mb-4">
              {editingId ? "Editar bebida" : "Registrar bebida"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#d9c8bc] px-3 py-2 outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728]"
                  placeholder="Ej. Agua de jamaica"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#d9c8bc] px-3 py-2 outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728]"
                  rows={3}
                  placeholder="Describe la bebida"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                  Foto (opcional)
                </label>
                <input
                  type="text"
                  name="foto"
                  value={form.foto}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#d9c8bc] px-3 py-2 outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728]"
                  placeholder="https://... o /uploads/bebidas/imagen.jpg"
                />
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <label
                    className={`inline-flex items-center px-4 py-2 text-xs uppercase tracking-[0.12em] rounded-full border transition cursor-pointer ${
                      uploadingImage
                        ? "border-zinc-300 text-zinc-500 bg-zinc-100"
                        : "border-[#B83728] text-[#B83728] hover:bg-[#fff0ee]"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelection}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                    {uploadingImage
                      ? "Subiendo imagen..."
                      : "Seleccionar desde tus Documentos"}
                  </label>
                  {form.foto && (
                    <span className="text-xs text-[#6B5041] break-all">{form.foto}</span>
                  )}
                </div>
                {previewImageUrl && (
                  <div className="mt-3">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-[#7A5A43] mb-1">
                      Vista previa
                    </p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImageUrl}
                      alt="Vista previa de bebida"
                      className="h-24 w-24 object-cover rounded-lg border border-[#eadfd6]"
                    />
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-[#3D2B1F] mb-1">
                    Precio (MXN)
                  </label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-[#d9c8bc] px-3 py-2 outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728]"
                    placeholder="0.00"
                    required
                  />
                </div>

                <label className="flex items-center gap-2 text-sm text-[#3D2B1F] mt-6 sm:mt-0">
                  <input
                    type="checkbox"
                    name="estatus"
                    checked={form.estatus}
                    onChange={handleInputChange}
                  />
                  Activa
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || uploadingImage}
                  className="rounded-full bg-[#B83728] text-white px-5 py-2 text-sm uppercase tracking-[0.15em] hover:bg-[#7f2118] transition disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : uploadingImage
                    ? "Subiendo imagen..."
                    : editingId
                    ? "Actualizar bebida"
                    : "Crear bebida"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-full border border-[#B83728] text-[#B83728] px-5 py-2 text-sm uppercase tracking-[0.15em] hover:bg-[#fff0ee] transition"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </article>

          <article className="bg-white rounded-2xl shadow-sm border border-[#eadfd6] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-semibold text-[#3D2B1F]">Listado de bebidas</h2>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre o descripción"
                className="w-full sm:w-72 rounded-lg border border-[#d9c8bc] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#B83728]/30 focus:border-[#B83728]"
              />
            </div>

            {loading ? (
              <p className="text-[#5C4A3F]">Cargando bebidas...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px] text-sm">
                  <thead>
                    <tr className="text-left border-b border-[#eadfd6] text-[#6B5041]">
                      <th className="py-2 pr-2">Bebida</th>
                      <th className="py-2 pr-2">Precio</th>
                      <th className="py-2 pr-2">Estatus</th>
                      <th className="py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBebidas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-[#7A5A43]">
                          No hay bebidas registradas con ese criterio.
                        </td>
                      </tr>
                    ) : (
                      filteredBebidas.map((bebida) => {
                        const bebidaImageUrl = normalizeImageUrl(bebida.foto);
                        const bebidaNombre = bebida.nombre || "Sin nombre";
                        const bebidaDescripcion =
                          bebida.descripcion || "Sin descripción";

                        return (
                          <tr
                            key={bebida.idBebida}
                            className="border-b border-[#f0e7e1] align-top text-[#3D2B1F]"
                          >
                            <td className="py-3 pr-3">
                              <div className="flex gap-3">
                                {bebidaImageUrl ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={bebidaImageUrl}
                                    alt={bebidaNombre}
                                    className="h-12 w-12 object-cover rounded-md border border-[#eadfd6]"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-md border border-dashed border-[#d5c4b8] flex items-center justify-center text-[10px] text-[#8a7567]">
                                    SIN FOTO
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{bebidaNombre}</p>
                                  <p className="text-xs text-[#6B5041] mt-0.5">
                                    {bebidaDescripcion}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 pr-3">{formatPrice(bebida.precio)}</td>
                            <td className="py-3 pr-3">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs ${
                                  bebida.estatus
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-zinc-200 text-zinc-700"
                                }`}
                              >
                                {bebida.estatus ? "Activa" : "Inactiva"}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => handleEdit(bebida)}
                                  className="px-3 py-1.5 rounded-full text-xs border border-[#B83728] text-[#B83728] hover:bg-[#fff0ee]"
                                >
                                  Editar
                                </button>

                                {bebida.estatus ? (
                                  <button
                                    onClick={() => handleDeactivate(bebida.idBebida)}
                                    className="px-3 py-1.5 rounded-full text-xs border border-zinc-400 text-zinc-700 hover:bg-zinc-100"
                                  >
                                    Desactivar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleActivate(bebida)}
                                    className="px-3 py-1.5 rounded-full text-xs border border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                                  >
                                    Activar
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>

        {(error || successMessage) && (
          <div className="mt-5">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm mt-2">
                {successMessage}
              </p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
