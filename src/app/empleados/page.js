"use client";

import { useEffect, useMemo, useState } from "react";

const initialForm = {
  idEmpleado: null,
  idUsuario: "",
  idSucursal: "",
  nombre: "",
  apellidoPa: "",
  apellidoMa: "",
  telefono: "",
  fechaNac: "",
};

function EmpleadosPage() {
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  const filteredEmpleados = useMemo(() => {
    const term = filter.trim().toLowerCase();
    if (!term) return empleados;

    return empleados.filter((empleado) => {
      const fullName = `${empleado.nombre} ${empleado.apellidoPa} ${empleado.apellidoMa || ""}`
        .toLowerCase()
        .trim();
      return (
        fullName.includes(term) ||
        String(empleado.idEmpleado).includes(term) ||
        String(empleado.idUsuario).includes(term) ||
        String(empleado.idSucursal).includes(term) ||
        (empleado.email || "").toLowerCase().includes(term) ||
        (empleado.sucursalNombre || "").toLowerCase().includes(term)
      );
    });
  }, [empleados, filter]);

  const loadEmpleados = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/empleados");
      if (!res.ok) {
        throw new Error("No se pudo cargar el listado");
      }
      const data = await res.json();
      setEmpleados(data);
    } catch (err) {
      setError(err.message || "Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmpleados();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (empleado) => {
    setForm({
      idEmpleado: empleado.idEmpleado,
      idUsuario: String(empleado.idUsuario),
      idSucursal: String(empleado.idSucursal),
      nombre: empleado.nombre || "",
      apellidoPa: empleado.apellidoPa || "",
      apellidoMa: empleado.apellidoMa || "",
      telefono: empleado.telefono || "",
      fechaNac: empleado.fechaNac || "",
    });
  };

  const handleCancel = () => {
    setForm(initialForm);
  };

  const handleDelete = async (idEmpleado) => {
    if (!confirm("¿Quieres eliminar este empleado?")) return;

    try {
      setSaving(true);
      setError("");
      const res = await fetch(`/api/empleados/${idEmpleado}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("No se pudo eliminar el empleado");
      }
      await loadEmpleados();
      if (form.idEmpleado === idEmpleado) {
        setForm(initialForm);
      }
    } catch (err) {
      setError(err.message || "Error al eliminar empleado");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      idUsuario: form.idUsuario.trim(),
      idSucursal: form.idSucursal.trim(),
      nombre: form.nombre.trim(),
      apellidoPa: form.apellidoPa.trim(),
      apellidoMa: form.apellidoMa.trim(),
      telefono: form.telefono.trim(),
      fechaNac: form.fechaNac,
    };

    try {
      setSaving(true);
      setError("");

      const isEdit = Boolean(form.idEmpleado);
      const url = isEdit ? `/api/empleados/${form.idEmpleado}` : "/api/empleados";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "No se pudo guardar el empleado");
      }

      await loadEmpleados();
      setForm(initialForm);
    } catch (err) {
      setError(err.message || "Error al guardar empleado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF1E6] px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2b1a12]">
              Directorio
            </h1>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-5 bg-white/90 border border-[#e7d7c7] rounded-2xl shadow-[0_18px_40px_rgba(43,26,18,0.08)] p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-[0.2em] uppercase text-[#4a2c1f]">
                  {form.idEmpleado ? "Editar empleado" : "Registro"}
                </h2>
              </div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#8b6b5d]">
                Formulario
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold">
                  ID Usuario
                  <select
                    name="idUsuario"
                    value={form.idUsuario}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                  >
                    <option value="" disabled>
                      Seleccionar...
                    </option>
                  </select>
                </label>
                <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold">
                  ID Sucursal
                  <select
                    name="idSucursal"
                    value={form.idSucursal}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                  >
                    <option value="" disabled>
                      Seleccionar...
                    </option>
                  </select>
                </label>
              </div>

              <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold block">
                Nombre
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  type="text"
                  required
                  className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold">
                  Apellido paterno
                  <input
                    name="apellidoPa"
                    value={form.apellidoPa}
                    onChange={handleChange}
                    type="text"
                    required
                    className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold">
                  Apellido materno
                  <input
                    name="apellidoMa"
                    value={form.apellidoMa}
                    onChange={handleChange}
                    type="text"
                    className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold">
                  Telefono
                  <input
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    type="tel"
                    required
                    className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                  />
                </label>
                <label className="text-xs uppercase tracking-[0.25em] text-[#6d5a52] font-semibold">
                  Fecha de nacimiento
                  <input
                    name="fechaNac"
                    value={form.fechaNac}
                    onChange={handleChange}
                    type="date"
                    required
                    className="mt-2 w-full rounded-md border border-[#d6d1c7] bg-[#fbf7f2] px-3 py-2 text-sm focus:border-[#8c2f1f] focus:ring-2 focus:ring-[#e6ded4]"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#6f1d1b] px-6 py-2 text-xs uppercase tracking-[0.25em] text-white shadow-lg shadow-[#6f1d1b]/20 transition hover:bg-[#551615] disabled:opacity-60"
                >
                  {saving ? "Guardando..." : form.idEmpleado ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-[#cbb7a8] px-6 py-2 text-xs uppercase tracking-[0.25em] text-[#5b3d2d] transition hover:bg-[#f8f1e7]"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="col-span-12 lg:col-span-7 bg-white/90 border border-[#e7d7c7] rounded-2xl shadow-[0_18px_40px_rgba(43,26,18,0.08)] p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold tracking-[0.2em] uppercase text-[#4a2c1f]">
                  Empleados activos
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#f6eee4] border border-[#e5d6c7] flex items-center justify-center text-[#6f1d1b]">
                  <span className="text-lg">⌕</span>
                </div>
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Buscar empleado..."
                  className="w-full md:w-64 rounded-full border border-[#d6d1c7] bg-[#fbf7f2] px-4 py-2 text-sm focus:border-[#6f1d1b] focus:ring-2 focus:ring-[#e6ded4]"
                />
                <span className="rounded-full border border-[#e5d6c7] bg-[#f6eee4] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#8b6b5d]">
                  Total {empleados.length}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-8">
              {loading ? (
                <div className="text-sm text-[#8b6b5d]">Cargando...</div>
              ) : filteredEmpleados.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#e1d1c2] bg-[#fbf7f2] px-6 py-10 text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-[#f1e7dc] flex items-center justify-center text-2xl text-[#6f1d1b]">
                    ◎
                  </div>
                  <h3 className="text-base font-semibold text-[#2b1a12]">
                    Sin empleados registrados
                  </h3>
                  <p className="mt-2 text-sm text-[#6b4b3d]">
                    Registra el primer colaborador para comenzar a gestionar el equipo.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEmpleados.map((empleado) => (
                    <article
                      key={empleado.idEmpleado}
                      className="rounded-2xl border border-[#eaded0] bg-white/80 p-4 shadow-sm"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-[#8b6b5d]">
                            #{empleado.idEmpleado} - ID Usuario {empleado.idUsuario}
                          </p>
                          <h3 className="text-lg font-semibold text-[#2b1a12]">
                            {empleado.nombre} {empleado.apellidoPa} {empleado.apellidoMa}
                          </h3>
                          <p className="text-sm text-[#6b4b3d]">
                            {empleado.sucursalNombre
                              ? `Sucursal: ${empleado.sucursalNombre}`
                              : `Sucursal ID: ${empleado.idSucursal}`}
                          </p>
                          <p className="text-sm text-[#6b4b3d]">
                            {empleado.email ? `Email: ${empleado.email}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEdit(empleado)}
                            className="rounded-full border border-[#cbb7a8] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#5b3d2d] transition hover:bg-[#f8f1e7]"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(empleado.idEmpleado)}
                            className="rounded-full border border-red-300 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-600 transition hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-[#8b6b5d]">
                        <div>
                          <p className="uppercase tracking-[0.2em]">Telefono</p>
                          <p className="text-sm text-[#5b3d2d]">{empleado.telefono}</p>
                        </div>
                        <div>
                          <p className="uppercase tracking-[0.2em]">Nacimiento</p>
                          <p className="text-sm text-[#5b3d2d]">{empleado.fechaNac}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EmpleadosPage;
