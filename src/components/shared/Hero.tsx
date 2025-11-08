import { ChartColumn } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section
      className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] -mt-20 -mb-30 flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/obooks.jpg')",
        minHeight: "calc(100vh - 4rem)",
      }}
    >

      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
          Oslo: Estudos simplificados; sem distrações.{" "}
          <span className="bg-gradient-to-br from-blue-300 to-indigo-400 bg-clip-text text-transparent">
            Eficiência.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
          Pratique com questões, revise seus erros e organize seu conhecimento.
          Construído para ser intuitivo e responsivo, proporcionando consistência em qualquer dispositivo.
        </p>

        <Link href="/login">
          <Button radius="full" size="lg" className="mt-16 gap-3">
            <ChartColumn className="size-4" />
            Saiba mais
          </Button>    
        </Link>
      </div>
    </section>
); }