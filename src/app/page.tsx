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

/* Крупная 3D Изометрическая графика на фоне */
function IsometricBackgroundTable() {
    return (
        <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-[950px] h-[950px] pointer-events-none opacity-60 mix-blend-screen transition-transform duration-700 ease-out group-hover:scale-105">
            {/* Неоновый градиент на фоне */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-40"
                style={{
                    background: "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(52,211,153,0.15) 50%, transparent 70%)"
                }}
            />

            {/* 3D Наклон и разворот стола на ~25 градусов */}
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    transform: "perspective(1200px) rotateX(55deg) rotateZ(-25deg)",
                    transformStyle: "preserve-3d"
                }}
            >
                <svg viewBox="0 0 600 600" fill="none" className="w-full h-full">
                    <defs>
                        <filter id="glow-bg">
                            <feGaussianBlur stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <linearGradient id="cyanGradBg" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="100%" stopColor="#34d399" />
                        </linearGradient>
                    </defs>

                    {/* Орбиты */}
                    <circle cx="300" cy="300" r="280" stroke="#1e2d3d" strokeWidth="1.5" strokeDasharray="10 10" />
                    <circle cx="300" cy="300" r="230" stroke="url(#cyanGradBg)" strokeWidth="1.5" opacity="0.4" filter="url(#glow-bg)" />

                    {/* Стол */}
                    <circle cx="300" cy="300" r="170" fill="#0b131e" stroke="#1e3a4a" strokeWidth="2.5" />
                    <circle cx="300" cy="300" r="150" stroke="#142332" strokeWidth="1.5" strokeDasharray="5 5" />

                    {/* Центр */}
                    <circle cx="300" cy="300" r="60" fill="#070d14" stroke="url(#cyanGradBg)" strokeWidth="2.5" filter="url(#glow-bg)" />

                    {/* 10 Слотов */}
                    {Array.from({ length: 10 }).map((_, i) => {
                        const angle = (i / 10) * Math.PI * 2 - Math.PI / 2;
                        const r = 170;
                        const cx = 300 + Math.cos(angle) * r;
                        const cy = 300 + Math.sin(angle) * r;
                        const isMafia = [0, 3, 7].includes(i);
                        const isSheriff = i === 5;
                        const color = isMafia ? "#f43f5e" : isSheriff ? "#38bdf8" : "#34d399";

                        return (
                            <g key={i}>
                                <line x1="300" y1="300" x2={cx} y2={cy} stroke={color} strokeWidth="1.5" opacity="0.25" />
                                <circle cx={cx} cy={cy} r="18" fill="#09121c" stroke={color} strokeWidth="2.5" />
                                <circle cx={cx} cy={cy} r="7" fill={color} filter="url(#glow-bg)" />
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
        { label: "Игроков в сезоне", value: playerCount.toString(), sub: "+10 за неделю" },
        { label: "Сыграно партий", value: "0", sub: "с начала сезона" },
        { label: "Побед мирных", value: "0%", sub: "vs 0% мафии" },
    ];

    return (
        <div className="min-h-screen bg-[#070d14] text-slate-100 font-sans relative overflow-hidden group">

            {/* HEADER */}
            <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#070d14]/80 backdrop-blur-md border-b border-slate-800/60">
                <div className="h-full px-6 md:px-10 flex items-center justify-between max-w-7xl mx-auto">
                    <Logo />

                    <nav className="hidden md:flex items-center gap-8">
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
            <main className="pt-28 pb-16 px-6 relative z-10 max-w-7xl mx-auto flex items-center min-h-[calc(100vh-80px)]">
                <div className="max-w-xl">

                    {/* Badge */}
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-8">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Сезон 1 активен</span>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-400">Идёт набор</span>
                    </div>

                    {/* ИЗНАЧАЛЬНЫЙ ЗАГОЛОВОК С ШРИФТОМ NUNITO */}
                    <h1
                        className="mb-6 leading-tight tracking-tight font-black"
                        style={{
                            fontFamily: "'Nunito', sans-serif",
                            fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)"
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

                    <p className="mb-10 text-slate-400 text-sm md:text-base max-w-md leading-relaxed">
                        Статистика, рейтинги и архив партий городского клуба Каменск-Шахтинский
                    </p>

                    {/* ИЗНАЧАЛЬНАЯ ВЕРТИКАЛЬНАЯ СТАТИСТИКА */}
                    <div className="space-y-3 mb-10 max-w-lg">
                        {STATS.map((s) => (
                            <div
                                key={s.label}
                                className="p-4 px-6 rounded-2xl bg-[#0b131e]/80 border border-slate-800/80 flex items-center gap-8 backdrop-blur-sm"
                            >
                                <div className="text-3xl font-black text-sky-400 min-w-[60px]">
                                    {s.value}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-200">{s.label}</div>
                                    <div className="text-xs text-slate-500">{s.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* КНОПКИ ИЗ ПЕРВОГО СКРИНШОТА */}
                    <div className="flex items-center gap-4">
                        <button className="px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-500 hover:opacity-90 transition-all shadow-lg shadow-teal-500/20">
                            Рейтинг игроков
                        </button>
                        <button className="px-8 py-3.5 rounded-xl text-sm font-bold text-slate-300 border border-slate-800 hover:bg-slate-800/40 transition-colors">
                            Все партии
                        </button>
                    </div>

                </div>
            </main>

            {/* ОГРОМНЫЙ 3D СТОЛ НА ФОНЕ */}
            <IsometricBackgroundTable />

        </div>
    );
}