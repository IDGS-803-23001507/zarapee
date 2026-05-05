"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";

function Navbar() {
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

    useEffect(() => {
        const handleScroll = () => {
            const slider = document.querySelector(".slider");

            if (!slider) return;

            const trigger = slider.offsetHeight - 80;

            if (window.scrollY > trigger) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (

        <nav className={`fixed w-full z-20 top-0 transition-all duration-300 ${scrolled
            ? "bg-white shadow-md border-b border-gray-100"
            : "bg-transparent border-transparent"}`}>

            <div className="w-full flex items-center justify-between p-4 pl-26 pr-24 gap-6">

                <Link href="/" className="flex items-center space-x-3">
                    <img src="/Logo.png" className={`h-18 w-18 transition-all duration-300 
                                        ${scrolled ? "invert-0" : "invert brightness-0"}`} alt="Logo" />


                    <span className={`font-lobster-custom tracking-[0.1em] text-[1.9rem]
                                    ${scrolled ? "text-amber-950" : "text-gray-100"}`}>
                        El Zarape
                    </span>

                </Link>

                <div className="hidden md:flex flex-1 justify-end pr-8 pl-6 w-full">

                    {/* <div className="relative w-[310px]">

                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm focus:text-green-500" />

                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            className={`w-full py-2.5 pl-11 pr-4 text-sm text-stone-700 
                                     ${scrolled ? "bg-white" : "bg-white"}
                                    border border-stone-300 rounded-full 
                                    shadow-sm
                                    focus:ring-2 focus:ring-green-500 focus:border-green-500 
                                    outline-none transition-all duration-200
                                    placeholder:text-stone-400`}
                        />

                    </div> */}

                </div>

                <div className="hidden md:flex flex-1 items-center gap-10 pl-8">

                <Link
                        href="/"
                        className={`relative transition-all duration-300 group
                            text-sm font-medium tracking-[0.2em] uppercase
                            ${scrolled ? "text-[#3D2B1F]" : "text-white"}
                            ${scrolled ? "hover:text-[#D97706]" : "hover:text-stone-200"}`}>

                        Home
                    
                        <span className={`absolute left-0 -bottom-2 w-0 h-[3px] transition-all duration-300 group-hover:w-full rounded-full
                            ${scrolled ? "bg-[#D97706]" : "bg-white"}`}
                        ></span>
                    </Link>

                    <Link
                        href="/productos"
                        className={`relative transition-all duration-300 group
                            text-sm font-medium tracking-[0.2em] uppercase
                            ${scrolled ? "text-[#3D2B1F]" : "text-white"}
                            ${scrolled ? "hover:text-[#D97706]" : "hover:text-stone-200"}`}>

                        Productos

                        <span className={`absolute left-0 -bottom-2 w-0 h-[3px] transition-all duration-300 group-hover:w-full rounded-full
                            ${scrolled ? "bg-[#D97706]" : "bg-white"}`}
                        ></span>
                    </Link>
                    <Link
                        href="/Contactos"
                        className={`relative transition-all duration-300 group
                            text-sm font-medium tracking-[0.2em] uppercase
                            ${scrolled ? "text-[#3D2B1F]" : "text-white"}
                            ${scrolled ? "hover:text-[#D97706]" : "hover:text-stone-200"}`}>

                        Contactos
                        
                        <span className={`absolute left-0 -bottom-2 w-0 h-[3px] transition-all duration-300 group-hover:w-full rounded-full
                            ${scrolled ? "bg-[#D97706]" : "bg-white"}`}
                        ></span>
                    </Link>

                </div>

                <div className="flex items-center gap-4 relative">

                    {user.rol === "Cliente" && (
                        <Link href="/pedidos" className="relative text-gray-600">

                            <FaShoppingCart className="text-lg" />

                            {/*  {user.carritoCantidad > 0 && (
                                <span className="absolute -top-2 -right-2 px-2 py-1 text-[8px] text-white bg-red-600 rounded-full">
                                    .
                                </span>
                            )} */}

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
                            <button className="relative rounded-full inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium transition-all bg-[#B83728] rounded hover:bg-[#632119] group border border-[#B83728] hover:border-[#632119]">
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

                            <Link href="/logout" className="block px-4 py-2 hover:bg-red-100 text-red-600">
                                Cerrar sesión
                            </Link>
                        </div>
                    )}

                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden"
                    >
                        ☰
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="md:hidden px-4 pb-4">
                    <Link href="/" className="block py-2">Home</Link>
                    <Link href="/productos" className="block py-2">Productos</Link>
                </div>
            )}
        </nav>
    );
}

export default Navbar