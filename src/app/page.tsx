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

/* Изометрический фоновый стол мафии */
function IsometricBackgroundTable() {
    return (
        <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-[650px] h-[650px] pointer-events-none opacity-40 mix-blend-screen transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-3">
            {/* Неоновое фоновое свечение */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-30"
                style={{
                    background: "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.15) 50%, transparent 70%)"
                }}
            />

            {/* 3D Изометрическая проекция */}
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    transform: "perspective(1000px) rotateX(60deg) rotateZ(-20deg)",
                    transformStyle: "preserve-3d"
                }}
            >
                <svg viewBox="0 0 500 500" fill="none" className="w-full h-full">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                    </defs>

                    {/* Внешние сетчатые кольца */}
                    <circle cx="250" cy="250" r="230" stroke="#1e2d3d" strokeWidth="1.5" strokeDasharray="8 8" />
                    <circle cx="250" cy="250" r="190" stroke="url(#grad)" strokeWidth="1.5" opacity="0.3" filter="url(#glow)" />

                    {/* Контур стола */}
                    <circle cx="250" cy="250" r="150" fill="#0b131e" stroke="#1e3a4a" strokeWidth="2" />
                    <circle cx="250" cy="250" r="135" stroke="#142332" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Центр */}
                    <circle cx="250" cy="250" r="50" fill="#070d14" stroke="url(#grad)" strokeWidth="2" filter="url(#glow)" />

                    {/* 10 Слотов вокруг стола */}
                    {Array.from({ length: 10 }).map((_, i) => {
                        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                        const r = 150;
                        const cx = 250 + Math.cos(angle) * r;
                        const cy = 250 + Math.sin(angle) * r;
                        const isMafia = [0, 3, 7].includes(i);
                        const isSheriff = i === 5;
                        const color = isMafia ? "#f43f5e" : isSheriff ? "#38bdf8" : "#34d399";

                        return (
                            <g key={i}>
                                <line x1="250" y1="250" x2={cx} y2={cy} stroke={color} strokeWidth="1" opacity="0.2" />
                                <circle cx={cx} cy={cy} r="16" fill="#09121c" stroke={color} strokeWidth="2" />
                                <circle cx={cx} cy={cy} r="6" fill={color} filter="url(#glow)" />
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
}

function Logo() {
    return (
        <div className="flex items-center gap-2.5">
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
            <div className="flex items-center font-bold tracking-tight text-sm">
                <span className="text-slate-100">КАМЕНСК</span>
                <span
                    className="ml-1 font-extrabold"
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
        <div className="min-h-screen bg-[#070d14] text-slate-100 font-sans relative overflow-hidden group">

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#070d14]/80 backdrop-blur-md border-b border-slate-800/80">
                <div className="h-full px-6 md:px-10 flex items-center justify-between max-w-7xl mx-auto">
                    <Logo />

                    <nav className="hidden md:flex items-center gap-6">
                        {["Игроки", "Рейтинг", "Игры"].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-xs font-semibold text-slate-400 hover:text-sky-400 transition-colors"
                            >
                                {link}
                            </a>
                        ))}
                    </nav>

                    <button
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white bg-[#0d1622] border border-slate-800 hover:border-slate-700 transition-all"
                        title="Войти в систему"
                    >
                        <UserIcon />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-32 pb-16 px-6 relative z-10 max-w-7xl mx-auto flex items-center min-h-[calc(100vh-80px)]">
                <div className="max-w-2xl">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Сезон 1 активен
                    </div>

                    {/* СТИЛЬНЫЙ ЗАГОЛОВОК (Unbounded применен строго к нему) */}
                    <h1
                        className="mb-6 uppercase leading-none tracking-tight font-black"
                        style={{
                            fontFamily: "'Unbounded', sans-serif",
                            fontSize: "clamp(2.4rem, 5vw, 4.2rem)"
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

                    {/* Карточки статистики */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                        {STATS.map((s, i) => (
                            <div
                                key={s.label}
                                className={`p-4 rounded-2xl border transition-all ${i === 0
                                        ? "bg-sky-500/10 border-sky-500/30"
                                        : "bg-[#0d1520] border-slate-800/80"
                                    }`}
                            >
                                <div className="text-2xl font-black text-sky-400 mb-0.5">
                                    {s.value}
                                </div>
                                <div className="text-xs font-semibold text-slate-200">{s.label}</div>
                                <div className="text-[10px] text-slate-500">{s.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* Кнопки */}
                    <div className="flex flex-wrap gap-4">
                        <button className="px-7 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white bg-gradient-to-r from-sky-400 to-emerald-500 hover:opacity-95 shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02]">
                            Рейтинг игроков
                        </button>
                        <button className="px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 border border-slate-800 hover:bg-slate-800/50 transition-colors">
                            Архив партий
                        </button>
                    </div>

                </div>
            </main>

            {/* ИЗОМЕТРИЧЕСКИЙ ФОН СПРАВА */}
            <IsometricBackgroundTable />

        </div>
    );
}