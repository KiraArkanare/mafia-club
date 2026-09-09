'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModal";

function UserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

function MenuIcon({ isOpen }: { isOpen: boolean }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isOpen ? (
                <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </>
            ) : (
                <>
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                </>
            )}
        </svg>
    );
}

function Logo() {
    const basePath = process.env.NODE_ENV === 'production' ? '/mafia-club' : '';

    return (
        <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                    src={`${basePath}/logo.png`}
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                <div className="h-full px-4 md:px-10 flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr]">
                    {/* Левая часть - Логотип */}
                    <Logo />

                    {/* Центр - Десктопная навигация */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname === `${link.href}/`;
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

                    {/* Правая часть - Авторизация + Кнопка мобильного меню */}
                    <div className="flex justify-end items-center gap-2 md:gap-3">
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

                        {/* Кнопка гамбургер-меню для мобилок */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="w-9 h-9 md:hidden rounded-xl flex items-center justify-center transition-all text-slate-300 bg-[#0f1e2e] border border-[#1e3a4a]"
                            aria-label="Открыть меню"
                        >
                            <MenuIcon isOpen={mobileMenuOpen} />
                        </button>
                    </div>
                </div>

                {/* Выпадающее мобильное меню */}
                {mobileMenuOpen && (
                    <div
                        className="md:hidden flex flex-col px-4 py-4 gap-2 border-b transition-all"
                        style={{
                            background: "rgba(7,13,20,0.98)",
                            borderColor: "#142030",
                            backdropFilter: "blur(20px)",
                        }}
                    >
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || pathname === `${link.href}/`;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive
                                            ? "text-emerald-400 bg-emerald-950/30 border border-emerald-500/20"
                                            : "text-slate-300 hover:text-white bg-[#0f1e2e]/50"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </header>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </>
    );
}