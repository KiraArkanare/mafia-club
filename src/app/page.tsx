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
        <div className="absolute top-0 -right-16 w-[900px] h-[900px] pointer-events-none opacity-60 mix-blend-screen transition-transform duration-700 ease-out group-hover:scale-105 z-0">
            {/* Неоновый градиент на фоне */}
            <div
                className="absolute inset-0 rounded-full blur-3xl opacity-40"
                style={{
                    background: "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(52,211,153,0.15) 50%, transparent 70%)"
                }}
            />

            {/* 3D Наклон и разворот стола по твоим оси с эскиза */}
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    transform: "perspective(1200px) rotateX(38deg) rotateZ(35deg)",
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

function AuthModal({ onClose }: { onClose: () => void }) {
    const [tab, setTab] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleAuth = async () => {
        setErrorMsg("");
        if (tab === "login") {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setErrorMsg(error.message);
            else onClose();
        } else {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) setErrorMsg(error.message);
            else onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0" style={{ background: "rgba(6,10,18,0.8)", backdropFilter: "blur(12px)" }} />
            <div
                className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
                style={{ background: "#0f1923", border: "1px solid #1e3a4a" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-1" style={{ background: "linear-gradient(90deg, #1a6b8a, #0e8c6a)" }} />
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0" }}>
                            {tab === "login" ? "Вход для ведущего" : "Регистрация"}
                        </span>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors text-slate-400 bg-slate-800 hover:text-white"
                        >✕</button>
                    </div>

                    <div className="flex mb-6 gap-1 p-1 rounded-xl" style={{ background: "#0a1520" }}>
                        {(["login", "register"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="flex-1 py-2 rounded-lg text-sm transition-all"
                                style={{
                                    fontFamily: "var(--font-display)",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    color: tab === t ? "#e2e8f0" : "#4a6a7a",
                                    background: tab === t ? "linear-gradient(135deg, #1a4a6b, #0e6655)" : "transparent",
                                }}
                            >
                                {t === "login" ? "Войти" : "Создать"}
                            </button>
                        ))}
                    </div>

                    {errorMsg && <div className="text-red-400 text-xs mb-3 text-center">{errorMsg}</div>}

                    <div className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "#0a1520", border: "1px solid #1e3a4a", color: "#e2e8f0" }}
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "#0a1520", border: "1px solid #1e3a4a", color: "#e2e8f0" }}
                        />
                        <button
                            onClick={handleAuth}
                            className="w-full py-3 mt-1 text-sm rounded-xl transition-opacity hover:opacity-90 font-bold"
                            style={{ background: "linear-gradient(135deg, #1a6b8a, #0e8c6a)", color: "#fff" }}
                        >
                            {tab === "login" ? "Войти" : "Зарегистрироваться"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Home() {
    const [authOpen, setAuthOpen] = useState(false);
    const [playerCount, setPlayerCount] = useState<number>(0);

    useEffect(() => {
        async function loadStats() {
            // Загружаем реальное количество игроков из базы Supabase
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
        <div className="min-h-full" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>

            {/* HEADER */}
            <header
                className="fixed top-0 left-0 right-0 z-40"
                style={{
                    height: "60px",
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
                    <Logo />

                    <nav className="hidden md:flex items-center gap-1">
                        {[
                            { name: "Игроки", href: "/players" },
                            { name: "Рейтинг", href: "/rating" },
                            { name: "Игры", href: "/games" }
                        ].map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="px-4 py-2 text-base font-bold transition-all hover:text-sky-400"
                                style={{ fontFamily: "'Nunito', sans-serif", color: "#94a3b8" }}
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="flex justify-end">
                        <button
                            onClick={() => setAuthOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                            style={{ color: "#6a8a9a", background: "#0f1e2e", border: "1px solid #1e3a4a" }}
                            title="Войти в систему"
                        >
                            <UserIcon />
                        </button>
                    </div>
                </div>
            </header>

            {/* MAIN */}
            <main className="pt-28 min-h-screen flex items-center justify-center px-6 pb-12 relative overflow-hidden group">

                <IsometricBackgroundTable />

                <div
                    className="relative w-full max-w-5xl mx-auto z-10"
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "48px",
                        alignItems: "center",
                    }}
                >
                    {/* LEFT */}
                    <div>
                        <div
                            className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl mb-8"
                            style={{
                                background: "linear-gradient(135deg, rgba(14,140,106,0.15) 0%, rgba(26,107,138,0.15) 100%)",
                                border: "1px solid rgba(52,211,153,0.25)",
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ background: "#34d399", boxShadow: "0 0 8px #34d399, 0 0 20px rgba(52,211,153,0.4)" }}
                                />
                                <span style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "#34d399" }}>
                                    Сезон 1 активен
                                </span>
                            </div>
                            <div style={{ width: "1px", height: "16px", background: "rgba(52,211,153,0.3)" }} />
                            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "#4a8a7a" }}>
                                Идёт набор
                            </span>
                        </div>

                        <h1
                            className="mb-5"
                            style={{
                                fontFamily: "'Montserrat', sans-serif",
                                fontSize: "clamp(2.4rem, 5.2vw, 4.2rem)",
                                fontWeight: 900,
                                lineHeight: 1.05,
                                letterSpacing: "-0.03em",
                                color: "#e2e8f0",
                            }}
                        >
                            Спортивная
                            <br />
                            <span
                                style={{
                                    background: "linear-gradient(95deg, #38bdf8 0%, #34d399 60%, #6ee7b7 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}
                            >
                                Мафия
                            </span>
                        </h1>

                        <p
                            className="mb-10"
                            style={{
                                color: "#4a6a7a",
                                fontSize: "0.95rem",
                                lineHeight: 1.75,
                                maxWidth: "420px",
                            }}
                        >
                            Статистика, рейтинги и архив партий городского клуба Каменск-Шахтинский
                        </p>

                        {/* Карточки метрик */}
                        <div className="flex flex-col gap-3">
                            {STATS.map((s, i) => (
                                <div
                                    key={s.label}
                                    className="flex items-center gap-4 px-5 py-4 rounded-2xl transition-transform hover:-translate-y-0.5"
                                    style={{
                                        background: i === 0 ? "linear-gradient(135deg, rgba(26,107,138,0.18) 0%, rgba(14,140,106,0.12) 100%)" : "#0f1923",
                                        border: i === 0 ? "1px solid rgba(56,189,248,0.2)" : "1px solid #162535",
                                    }}
                                >
                                    <div
                                        className="flex-shrink-0"
                                        style={{
                                            fontFamily: "var(--font-display)",
                                            fontSize: "1.65rem",
                                            fontWeight: 800,
                                            background: i === 0
                                                ? "linear-gradient(90deg, #38bdf8, #34d399)"
                                                : "linear-gradient(90deg, #d0e8f0, #8ab8c8)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            minWidth: "90px",
                                        }}
                                    >
                                        {s.value}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "#c0d8e4" }}>{s.label}</div>
                                        <div style={{ fontSize: "0.72rem", color: "#3a6a7a", marginTop: "2px" }}>{s.sub}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-3 mt-8">
                            <button
                                className="px-6 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-90 font-bold"
                                style={{
                                    background: "linear-gradient(135deg, #1a6b8a, #0e8c6a)",
                                    color: "#fff",
                                }}
                            >
                                Рейтинг игроков
                            </button>
                            <button
                                className="px-6 py-2.5 rounded-xl text-sm transition-colors border border-slate-700 text-slate-400 hover:text-white"
                            >
                                Все партии
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer
                className="px-6 md:px-10 py-5 flex flex-col md:flex-row items-center justify-between gap-3"
                style={{ borderTop: "1px solid #142030" }}
            >
                <Logo />
                <span style={{ fontSize: "0.72rem", color: "#1e3a4a" }}>
                    © 2026 KamenskMafia · Сезон 1
                </span>
            </footer>

            {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
        </div>
    );
}