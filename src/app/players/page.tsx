'use client';

import React, { useState } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import AddPlayerModal from "@/components/AddPlayerModal";

export default function PlayersPage() {
    const { isAdmin } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#070d14" }}>

            {/* ФОНОВЫЕ СВЕЧЕНИЯ */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />

            {/* ЕДИНООБРАЗНАЯ ШАПКА */}
            <Header />

            {/* ОСНОВНОЙ КОНТЕНТ ZAГЛУШКИ */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 -mt-10">

                {/* Иконка в стиле мафии */}
                <div
                    className="w-20 h-20 mb-6 rounded-3xl flex items-center justify-center border shadow-2xl transition-transform hover:scale-105"
                    style={{
                        background: "rgba(15,30,46,0.85)",
                        borderColor: "rgba(56,189,248,0.3)",
                        boxShadow: "0 0 30px rgba(56,189,248,0.15)",
                        backdropFilter: "blur(12px)"
                    }}
                >
                    <span className="text-4xl">🕵️‍♂️</span>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 text-xs font-bold mb-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    В разработке
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight mb-3">
                    Раздел «Игроки» скоро откроется
                </h1>

                <p className="text-sm md:text-base text-slate-400 max-w-md leading-relaxed mb-8">
                    Готовим подробную статистику по каждому игроку: профили, игры, процент побед и личные достижения.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="/rating"
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 transition-all hover:scale-105 cursor-pointer shadow-lg shadow-emerald-500/20"
                        style={{ background: "linear-gradient(90deg, #38bdf8, #34d399)" }}
                    >
                        Посмотреть рейтинг
                    </a>

                    <a
                        href="/games"
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border transition-all hover:bg-slate-800/40"
                        style={{ background: "#0f1e2e", borderColor: "#1e3a4a" }}
                    >
                        История игр
                    </a>

                    {/* КНОПКА ВИДНА ТОЛЬКО АДМИНУ */}
                    {isAdmin && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                            style={{
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                color: "#022c22"
                            }}
                        >
                            <span>+</span> Добавить игрока
                        </button>
                    )}
                </div>

            </main>

            {/* Модальное окно добавления игрока */}
            {isAddModalOpen && (
                <AddPlayerModal onCloseAction={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
}