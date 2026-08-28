'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

function UserIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    );
}

/* Интерактивный неоновый стол мафии */
function MafiaTableGraphic() {
    const [hoveredRole, setHoveredRole] = useState<string | null>(null);

    return (
        <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center">
            {/* Фоновый неоновый градиент */}
            <div
                className="absolute inset-0 rounded-full opacity-30 blur-3xl pointer-events-none"
                style={{
                    background: "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(52,211,153,0.15) 60%, transparent 70%)"
                }}
            />

            {/* Основная SVG графика */}
            <svg viewBox="0 0 420 420" fill="none" className="w-full h-full relative z-10">
                <defs>
                    <filter id="glow-strong">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>

                {/* Внешняя орбита */}
                <circle cx="210" cy="210" r="180" stroke="#1e3a4a" strokeWidth="1" strokeDasharray="6 8" opacity="0.4" />
                <circle cx="210" cy="210" r="150" stroke="url(#cyanGrad)" strokeWidth="1.5" opacity="0.25" />

                {/* Игровой стол */}
                <circle cx="210" cy="210" r="120" fill="#0b131e" stroke="#1e2d3d" strokeWidth="2" />
                <circle cx="210" cy="210" r="110" stroke="#162535" strokeWidth="1" strokeDasharray="3 3" />

                {/* Центральный чип клуба */}
                <circle cx="210" cy="210" r="42" fill="#070d14" stroke="url(#cyanGrad)" strokeWidth="2" filter="url(#glow-strong)" />
                <text x="210" y="217" textAnchor="middle" fontSize="20" fill="#fff" fontFamily="var(--font-display)" fontWeight="900">
                    КМ
                </text>

                {/* 10 Слотов игроков вокруг стола */}
                {Array.from({ length: 10 }).map((_, i) => {
                    const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                    const r = 120;
                    const cx = 210 + Math.cos(angle) * r;
                    const cy = 210 + Math.sin(angle) * r;
                    const isMafia = [0, 3, 7].includes(i);
                    const isSheriff = i === 5;
                    const roleName = isSheriff ? "Шериф" : isMafia ? "Мафия" : "Мирный";
                    const color = isMafia ? "#f43f5e" : isSheriff ? "#38bdf8" : "#34d399";

                    return (
                        <g
                            key={i}
                            className="cursor-pointer transition-transform duration-200"
                            onMouseEnter={() => setHoveredRole(roleName)}
                            onMouseLeave={() => setHoveredRole(null)}
                        >
                            <line x1="210" y1="210" x2={cx} y2={cy} stroke={color} strokeWidth="1" opacity="0.15" />
                            <circle cx={cx} cy={cy} r="15" fill="#0d1722" stroke={color} strokeWidth="2" />
                            <circle cx={cx} cy={cy} r="5" fill={color} filter="url(#glow-strong)" />
                            <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="800" fontFamily="sans-serif">
                                {i + 1}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Динамическая плашка с ролью */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-[#0f1923]/90 backdrop-blur-md border border-slate-800 text-xs text-center z-20 pointer-events-none transition-all">
                {hoveredRole ? (
                    <span>Роль слота: <strong className="text-sky-400">{hoveredRole}</strong></span>
                ) : (
                    <span className="text-slate-400">Наведи на слот игрока</span>
                )}
            </div>
        </div>
    );
}

function Logo() {
    return (
        <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex-shrink-0">
                <Image
                    src="/logo.png"
                    alt="Каменск Мафия"
                    width={32}
                    height={32}
                    className="object-contain"
                    priority
                />
            </div>
            <div style={{ fontFamily: "var(--font-display)", lineHeight: 1 }}>
                <span className="font-extrabold tracking-tight text-sm text-slate-100">КАМЕНСК</span>
                <span
                    className="font-black tracking-tight text-sm ml-1"
                    style={{
                        background: "linear-gradient(90deg, #38bdf8, #34d399)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    МАФИЯ
                </span>
            </div>
        </div>
    );
}

export default function Home() {
    const [playerCount, setPlayerCount] = useState<number>(0);

    useEffect(() => {
        async function loadStats() {
            const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
            if (count !== null) setPlayerCount(count);
        }
        loadStats();
    }, []);

    const STATS = [
        { label: "Игроков в сезоне", value: playerCount.toString(), sub: "зарегистрировано" },
        { label: "Сыграно партий", value: "0", sub: "с начала сезона" },
        { label: "Побед мирных", value: "0%", sub: "vs 0% мафии" },
    ];

    return (
        <div className="min-h-full overflow-x-hidden" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>

            {/* HEADER */}
            <header
                className="fixed top-0 left-0 right-0 z-40"
                style={{
                    height: "64px",
                    background: "rgba(7,13,20,0.85)",
                    borderBottom: "1px solid #142030",
                    backdropFilter: "blur(16px)",
                }}
            >
                <div className="h-full px-6 md:px-10 flex items-center justify-between max-w-7xl mx-auto">
                    <Logo />

                    <nav className="hidden md:flex items-center gap-2">
                        {["Игроки", "Рейтинг", "Игры"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="px-4 py-2 text-xs rounded-xl transition-all hover:text-sky-400"
                                style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#6a8a9a" }}
                            >
                                {link}
                            </a>
                        ))}
                    </nav>

                    <button
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all text-slate-400 hover:text-white"
                        style={{ background: "#0f1e2e", border: "1px solid #1e3a4a" }}
                        title="Войти в систему"
                    >
                        <UserIcon />
                    </button>
                </div>
            </header>

            {/* MAIN */}
            <main className="pt-24 min-h-screen flex items-center justify-center px-6 pb-12">
                <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-7 z-10">
                        <div
                            className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl mb-6"
                            style={{
                                background: "linear-gradient(135deg, rgba(14,140,106,0.15) 0%, rgba(26,107,138,0.15) 100%)",
                                border: "1px solid rgba(52,211,153,0.25)",
                            }}
                        >
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span style={{ fontFamily: "var(--font-display)", fontSize: "0.75rem", fontWeight: 800 }} className="text-emerald-400 uppercase tracking-wider">
                                Сезон 1 активен
                            </span>
                        </div>

                        <h1
                            className="mb-6 uppercase"
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)",
                                fontWeight: 900,
                                lineHeight: 1.1,
                                letterSpacing: "-0.03em",
                                color: "#f1f5f9",
                            }}
                        >
                            Спортивная
                            <br />
                            <span
                                style={{
                                    background: "linear-gradient(95deg, #38bdf8 0%, #34d399 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Мафия
                            </span>
                        </h1>

                        <p className="mb-8 text-slate-400 text-sm md:text-base max-w-lg leading-relaxed">
                            Интеллектуальный клуб Каменска-Шахтинского. Полная статистика партий, рейтинги игроков и аналитика турниров.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                            {STATS.map((s, i) => (
                                <div
                                    key={s.label}
                                    className="p-4 rounded-2xl transition-all"
                                    style={{
                                        background: i === 0 ? "linear-gradient(135deg, rgba(26,107,138,0.2) 0%, rgba(14,140,106,0.15) 100%)" : "#0d1520",
                                        border: i === 0 ? "1px solid rgba(56,189,248,0.3)" : "1px solid #162332",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "1.5rem",
                                            fontWeight: 800,
                                        }}
                                        className="text-sky-400 mb-1"
                                    >
                                        {s.value}
                                    </div>
                                    <div className="text-xs font-semibold text-slate-200">{s.label}</div>
                                    <div className="text-[10px] text-slate-500">{s.sub}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                className="px-7 py-3.5 rounded-xl text-xs transition-transform hover:scale-105 font-extrabold uppercase tracking-wider"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    background: "linear-gradient(135deg, #38bdf8 0%, #0e8c6a 100%)",
                                    color: "#fff",
                                    boxShadow: "0 4px 20px rgba(56,189,248,0.25)"
                                }}
                            >
                                Рейтинг игроков
                            </button>
                            <button
                                className="px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700 text-slate-300 hover:bg-slate-800"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                Архив партий
                            </button>
                        </div>
                    </div>

                    {/* RIGHT GRAPHIC */}
                    <div className="lg:col-span-5 flex justify-center items-center relative">
                        <MafiaTableGraphic />
                    </div>

                </div>
            </main>

        </div>
    );
}