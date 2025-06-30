"use client";
import Image from "next/image";
import Link from "next/link";
import Authentication from "./_components/Authentication";
import { Button } from "@/components/ui/button";
import { auth } from "@/configs/firebaseConfig";
import ProfileAvatar from "./_components/ProfileAvatar";
import { useAuthContext } from "./provider";
import { Orbitron } from "next/font/google";
import MagicButton from "@/components/ui/MagicButton";

const orbitron = Orbitron({ subsets: ["latin"], weight: "600" });

export default function Home() {
  const user = useAuthContext();

  return (
    <main className={`min-h-screen bg-gradient-to-br from-black via-gray-950 to-black text-white ${orbitron.className} relative overflow-hidden`}>
      {/* Darker background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[50%] w-[60vw] h-[60vw] -translate-x-1/2 bg-gradient-to-r from-cyan-500/20 via-purple-600/20 to-fuchsia-500/20 opacity-20 rounded-full blur-[120px] animate-pulse animate-duration-[4s]" />
        <div className="absolute bottom-[-10%] left-[10%] w-[30vw] h-[30vw] bg-gradient-to-tr from-fuchsia-500/15 to-amber-400/15 opacity-10 rounded-full blur-[90px] animate-blob animate-duration-[6s]" />
        
        {/* Darker grid overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0xMCAwdjIwTTAgMTBoMjAiIHN0cm9rZT0icmdiYSgyMzYsNzIsMTUzLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-5 pointer-events-none" />
      </div>

      {/* Glowing header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-purple-900/50 backdrop-blur-md bg-black/30 relative glow-border">
        <Image src="/logo.svg" alt="Novira Logo" width={120} height={40} className="filter drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] hover:drop-shadow-[0_0_12px_rgba(236,72,153,0.8)] transition-all" />
        {!user?.user?.email ? (
          <Authentication>
            <button className="flex items-center gap-2 text-sm font-medium text-cyan-400 hover:text-fuchsia-400 group transition-all">
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4z"/>
              </svg>
              <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-fuchsia-500 transition-all">
                Begin Journey
              </span>
            </button>
          </Authentication>
        ) : (
          <ProfileAvatar />
        )}
      </header>

      {/* Main content with enhanced animations */}
      <section className="flex flex-col items-center justify-center text-center min-h-[80vh] px-6 relative">
        <h1 className="text-6xl md:text-7xl font-bold tracking-widest uppercase relative">
          <span className="relative inline-block">
            Novira
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 animate-pulse animate-duration-[2s]"></span>
          </span>
          <span className="bg-gradient-to-br from-cyan-400 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent ml-4 transition-all">
            AI
          </span>
        </h1>
        
        <p className="mt-4 text-neutral-400 tracking-wide text-lg md:text-xl font-extralight max-w-2xl animate-fade-in">
          Convert wireframes, code, and dreams into futuristic web realities — instantly.
        </p>
        
        <MagicButton
          title="Launch Portal"
          position="right"
          otherClasses="mt-8"
          handleClick={() => window.location.href = '/dashboard'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          }
        />
      </section>
    </main>
  );
}