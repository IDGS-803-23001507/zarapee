"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUser, FaShoppingCart } from "react-icons/fa";

function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = false;
  const user = {
    nombre: "Juan Pérez",
    correo: "juan@email.com",
    rol: "",
    carritoCantidad: 2,
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/bebidas", label: "Bebidas" },
    { href: "/productos", label: "Productos" },
    { href: "/contactos", label: "Contactos" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (pathname !== "/") {
        setScrolled(true);
        return;
      }

      const slider = document.querySelector(".slider");

      if (!slider) {
        setScrolled(true);
        return;
      }

      const trigger = slider.offsetHeight - 80;
      setScrolled(window.scrollY > trigger);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <nav
      className={`fixed w-full z-20 top-0 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md border-b border-gray-100"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="w-full flex items-center justify-between p-4 pl-10 pr-10 lg:pl-26 lg:pr-24 gap-6">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/Logo.png"
            alt="Logo El Zarape"
            width={72}
            height={72}
            className={`h-14 w-14 lg:h-18 lg:w-18 transition-all duration-300 ${
              scrolled ? "invert-0" : "invert brightness-0"
            }`}
          />
          <span
            className={`font-lobster-custom tracking-[0.1em] text-[1.6rem] lg:text-[1.9rem] ${
              scrolled ? "text-amber-950" : "text-gray-100"
            }`}
          >
            El Zarape
          </span>
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-end gap-10 pl-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative transition-all duration-300 group text-sm font-medium tracking-[0.2em] uppercase ${
                scrolled ? "text-[#3D2B1F]" : "text-white"
              } ${scrolled ? "hover:text-[#D97706]" : "hover:text-stone-200"}`}
            >
              {link.label}
              <span
                className={`absolute left-0 -bottom-2 w-0 h-[3px] transition-all duration-300 group-hover:w-full rounded-full ${
                  scrolled ? "bg-[#D97706]" : "bg-white"
                }`}
              ></span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4 relative">
          {user.rol === "Cliente" && (
            <Link href="/pedidos" className="relative text-gray-600">
              <FaShoppingCart className="text-lg" />
              {user.carritoCantidad > 0 && (
                <span className="absolute -top-2 -right-2 px-2 py-1 text-[8px] text-white bg-red-600 rounded-full">
                  {user.carritoCantidad}
                </span>
              )}
            </Link>
          )}

          {isLoggedIn ? (
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="w-8 h-8 rounded-full bg-white flex items-center justify-center"
            >
              <FaUser className="text-gray-600 text-lg" />
            </button>
          ) : (
            <Link href="/login">
              <button className="relative rounded-full inline-flex items-center justify-center px-6 lg:px-8 py-3 overflow-hidden font-medium transition-all bg-[#B83728] hover:bg-[#632119] group border border-[#B83728] hover:border-[#632119]">
                <span className="w-0 h-0 rounded bg-[#632119] absolute top-0 left-0 ease-out duration-500 transition-all group-hover:w-full group-hover:h-full -z-1"></span>
                <span className="relative w-full text-left text-white transition-colors duration-300 ease-in-out group-hover:text-white uppercase tracking-[0.15em] text-sm">
                  Registrarse
                </span>
              </button>
            </Link>
          )}

          {isLoggedIn && userOpen && (
            <div className="absolute right-0 mt-10 w-44 bg-white border rounded shadow-lg">
              <div className="px-4 py-3 border-b">
                <p className="text-xs font-bold uppercase">Cliente</p>
                <p className="text-sm">{user.nombre}</p>
                <p className="text-xs">{user.correo}</p>
              </div>
              <Link href="/cuenta" className="block px-4 py-2 hover:bg-gray-100">
                Cuenta
              </Link>
              <Link
                href="/logout"
                className="block px-4 py-2 hover:bg-red-100 text-red-600"
              >
                Cerrar sesión
              </Link>
            </div>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            ☰
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden px-6 pb-4 bg-white border-t border-gray-100">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2 text-[#3D2B1F]">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
