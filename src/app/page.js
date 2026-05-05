"use client";
import { useState } from "react";
import Image from "next/image";

function HomePage() {

  const slides = [
    {
      img: "/home/slider7.jpg",
      title: "! Bienvenido al Zarape ¡",
      desc: "Disfruta de tus comidas tipicas mexicanas y crea momentos inolvidables en familia",
      btn: "Ver menu"
    },
    {
      img: "/home/slider6.jpg",
      title: "Llego el verano",
      desc: "Ven y disfruta de nuestras promociones de verano para el calor",
      btn: "Ver Promociones"
    },
    {
      img: "/home/slider1.jpeg",
      title: "¿Ya tienes cuenta?",
      desc: "Registra tu cuenta para poder hacer pedidos y que no te quedes con hambre",
      btn: "Registrarse"
    },
    {
      img: "/home/slider8.jpg",
      title: "Tacos de carne asada",
      desc: "Tradición mexicana",
      btn: ""
    },
  ];

  const [current, setCurrent] = useState(0);

  const prevSlide = () => {
    setCurrent(current === 0 ? slides.length - 1 : current - 1);
  };

  const nextSlide = () => {
    setCurrent(current === slides.length - 1 ? 0 : current + 1);
  };

  return (
    <>
      <section className="slider">
        <div className="relative w-screen h-[92vh] overflow-hidden">

          <Image
            src={slides[current].img}
            alt="slide"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center px-10 text-white z-10">
            <h1 className="text-5xl md:text-4xl font-serif font-bold text-white tracking-widest uppercase">
              {slides[current].title}
            </h1>

            <p className="text-lg md:text-2xl mt-2 drop-shadow">
              {slides[current].desc}
            </p>

            <button className="relative mt-4 rounded-full inline-flex items-center justify-center px-8 py-3 overflow-hidden font-medium transition-all bg-[#D97706] rounded hover:bg-[#BA6605] group border border-[#D97706] hover:border-[#BA6605]">
              <span className="relative w-full text-left text-white transition-colors duration-300 ease-in-out group-hover:text-white uppercase tracking-[0.15em] text-sm">
                {slides[current].btn}
              </span>
            </button>
          </div>

          <button
            onClick={prevSlide}
            className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full z-10"
          >
            ‹
          </button>

          <button
            onClick={nextSlide}
            className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-full z-10"
          >
            ›
          </button>

          <div className="absolute bottom-5 w-full flex justify-center gap-2 z-10">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${current === index ? "bg-white" : "bg-gray-400"
                  }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">

          <h2 className="text-3xl md:text-4xl border-b-4 border-stone-400 pb-6 font-serif font-bold text-[#1a1a1a] mb-12 tracking-widest uppercase">
            Nosotros
          </h2>

          <div className="text-[1.1rem] text-stone-800 font-light leading-[1.8] tracking-wide text-center">
            <p>
              Somos un restaurante bar ubicado en el Centro de León; fusionamos las raíces
              mexicanas con nuevas ideas; tanto en el diseño arquitectónico como en la
              propuesta gastronómica.
            </p>
            <br></br>
            <p>
              Un lugar para toda la familia en el que puedes disfrutar mientras los más pequeños
              de la casa se divierten en nuestra área infantil.
            </p>
          </div>


          <div className="mt-12 p-1 border border-black inline-block">
            <button className="bg-[#1a1a1a] rounded-md text-white px-8 py-3 flex items-center gap-3 hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm font-medium">
              Reserva aquí
            </button>
          </div>

        </div>
      </section>

      <section className="relative mx-16 mb-14 md:mx-24 py-16 rounded-2xl 
        bg-gradient-to-b from-[#1A1512] to-[#0f0c0a] overflow-hidden">

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-amber-500/10 blur-3xl"></div>
        </div>

        <div className="flex justify-center mb-12">
          <h2 className="text-xl md:text-[2.5rem] font-serif font-bold text-white tracking-[0.2em] uppercase relative">
            Descubre más
            <span className="block w-20 h-[3px] bg-amber-400 mx-auto mt-4 rounded-full"></span>
          </h2>
        </div>

        <div className="flex justify-center items-end gap-8">

          <div className="relative w-[280px] h-[360px] mt-12 overflow-hidden rounded-xl group cursor-pointer
        transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

            <img
              src="/home/card1.jpeg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/60 transition-all duration-300"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border border-amber-400 px-8 py-10 text-center
                opacity-0 scale-90 backdrop-blur-sm
                group-hover:opacity-100 group-hover:scale-100
                transition-all duration-300">

                <p className="text-white text-xl tracking-wide">
                  Promociones
                </p>
              </div>
            </div>
          </div>

          <div className="relative mx-8 w-[340px] h-[440px] overflow-hidden rounded-xl group cursor-pointer
        transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">

            <img
              src="/home/card4.jpg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/70 transition-all duration-300"></div>

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border border-amber-400 px-10 py-12 text-center
                opacity-0 scale-90 backdrop-blur-md
                group-hover:opacity-100 group-hover:scale-100
                transition-all duration-300">

                <p className="text-white text-xl tracking-wide">
                  menú
                </p>
              </div>
            </div>
          </div>

          <div className="relative w-[280px] h-[360px] mt-12 overflow-hidden rounded-xl group cursor-pointer
        transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">

            <img
              src="/home/card5.jpg"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/60 transition-all duration-300"></div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border border-amber-400 px-8 py-10 text-center
                opacity-0 scale-90 backdrop-blur-sm
                group-hover:opacity-100 group-hover:scale-100
                transition-all duration-300">

                <p className="text-white text-xl tracking-wide">
                  Sucursales
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section>
        <div className="relative w-screen h-[92vh] overflow-hidden">

          
          <img
            src="/home/bg_section.jpg"
            alt="bg_section"
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-black/60"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-start px-10 text-white z-10">
              <h1 className="text-5xl md:text-4xl font-serif font-bold text-white tracking-widest uppercase">
                Ya conoces nuestras Sucursales
              </h1>

              <div className="w-1/2">
              <p className="text-lg md:text-2xl mt-2 drop-shadow text-justify">
                El zarape cuenta con diferentes sucursales establecidas en diferentes lugares para que
                puedas venir y disfrutar en familia con Nosotros
              </p>
              <br></br>
              
              <p className="text-lg md:text-2xl mt-2 drop-shadow text-justify">
                Somos uno de los restaures mas reconocidos a nivel mundial por nuestro sazon 
                y nuestra atencion a los clientes
              </p>
              </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage