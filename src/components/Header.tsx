'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";
import logoImg from "../../public/logo.png";

function UserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                    src={logoImg}
                    alt="Каменск Мафия"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                />
            </div>
            <div className="flex items-center font-bold tracking-tight text-sm">
                <span className="text-slate-100">Kamensk</span>
                <span
                    className="ml-1 font-extrabold"
                    style={{
                        background: "linear-gradient(90deg, #38bdf8, #34d399)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Mafia
                </span>
            </div>
        </Link>
    );
}

export default function Header() {
    const { isAdmin, signOut } = useAuth();
    const [authOpen, setAuthOpen] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { name: "Игроки", href: "/players" },
        { name: "Рейтинг", href: "/rating" },
        { name: "Игры", href: "/games" },
    ];

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 z-40 h-[60px]"
                style={{
                    background: "rgba(7,13,20,0.92)",
                    borderBottom: "1px solid #142030",
                    backdropFilter: "blur(16px)",
                }}
            >
                <div
                    className="h-full px-6 md:px-10"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        alignItems: "center",
                    }}
                >
                    {/* Левая часть - Логотип */}
                    <Logo />

                    {/* Центр - Навигация */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-4 py-2 text-base font-bold transition-all ${isActive ? "text-emerald-400" : "hover:text-sky-400 text-slate-400"
                                        }`}
                                    style={{ fontFamily: "'Nunito', sans-serif" }}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* БЛОК АВТОРИЗАЦИИ */}
                    <div className="flex justify-end items-center gap-3">
                        {isAdmin ? (
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                                    Админ
                                </span>
                                <button
                                    onClick={signOut}
                                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#0f1e2e] border border-[#1e3a4a] transition-all"
                                >
                                    Выйти
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAuthOpen(true)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                style={{ color: "#6a8a9a", background: "#0f1e2e", border: "1px solid #1e3a4a" }}
                                title="Войти в систему"
                            >
                                <UserIcon />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </>
    );
}