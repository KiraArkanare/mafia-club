'use client';

import { useState } from "react";
import Image from "next/image";

function ChevronDownIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function Logo() {
    return (
        <a href="/" className="flex items-center gap-2.5">
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
        </a>
    );
}

// Временные данные для демонстрации таблицы
const MOCK_PLAYERS = [
    { rank: 1, name: "Mr. White", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 18 },
    { rank: 2, name: "Sherlock", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 17 },
    { rank: 3, name: "Vega", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 16 },
    { rank: 4, name: "Joker", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 12 },
    { rank: 5, name: "Neo", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 10 },
    { rank: 6, name: "Trinity", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 4 },
];

const LEGEND_ITEMS = [
    { code: "Σ (+/-)", desc: "Сумма всех дополнительных баллов" },
    { code: "!", desc: "Штрафные дисциплинарные баллы" },
    { code: "Лх", desc: "Баллы за лучший ход" },
    { code: "Ci", desc: "Сумма компенсационных баллов" },
    { code: "П", desc: "Победы" },
    { code: "Д", desc: "Победы на Доне" },
    { code: "Ш", desc: "Победы на Шерифе" },
    { code: "У", desc: "Убийств в первую ночь" },
];

export default function RatingPage() {
    const [season, setSeason] = useState("Сезон 1");
    const [series, setSeries] = useState("Серии / Общий");

    const QUALIFICATION_LIMIT = 16;

    return (
        <div className="min-h-screen flex flex-col" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>

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
                <div className="h-full px-6 md:px-10 grid grid-cols-3 items-center">
                    <Logo />

                    <nav className="hidden md:flex items-center justify-center gap-1">
                        {[
                            { name: "Игроки", href: "/players" },
                            { name: "Рейтинг", href: "/rating", active: true },
                            { name: "Игры", href: "/games" }
                        ].map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`px-4 py-2 text-base font-bold transition-all ${link.active ? "text-emerald-400" : "hover:text-sky-400 text-slate-400"
                                    }`}
                                style={{ fontFamily: "'Nunito', sans-serif" }}
                            >
                                {link.name}
                            </a>
                        ))}
                    </nav>

                    <div className="flex justify-end">
                        <a
                            href="/"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                            style={{ background: "#0f1e2e", border: "1px solid #1e3a4a" }}
                        >
                            На главную
                        </a>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full flex-1">

                {/* ФИЛЬТРЫ / ВЫПАДАЮЩИЕ СПИСКИ */}
                <div className="flex items-center justify-between mb-6">
                    <div className="relative">
                        <select
                            value={season}
                            onChange={(e) => setSeason(e.target.value)}
                            className="appearance-none bg-transparent pr-8 py-2 text-emerald-400 font-bold text-lg cursor-pointer outline-none transition-colors hover:text-emerald-300"
                        >
                            <option value="Сезон 1" className="bg-slate-900 text-slate-200">Сезон 1</option>
                            <option value="Сезон 2" className="bg-slate-900 text-slate-200">Сезон 2 (скоро)</option>
                        </select>
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                            <ChevronDownIcon />
                        </span>
                    </div>

                    <div className="relative">
                        <select
                            value={series}
                            onChange={(e) => setSeries(e.target.value)}
                            className="appearance-none bg-transparent pr-8 py-2 text-emerald-400 font-bold text-lg cursor-pointer outline-none transition-colors hover:text-emerald-300"
                        >
                            <option value="Серии / Общий" className="bg-slate-900 text-slate-200">Серии / Общий</option>
                            <option value="Серия A" className="bg-slate-900 text-slate-200">Серия A</option>
                            <option value="Серия B" className="bg-slate-900 text-slate-200">Серия B</option>
                        </select>
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                            <ChevronDownIcon />
                        </span>
                    </div>
                </div>

                {/* ГЛАВНАЯ ТАБЛИЦА */}
                <div
                    className="rounded-2xl p-4 md:p-6 mb-8 overflow-x-auto"
                    style={{
                        background: "linear-gradient(145deg, rgba(15,25,35,0.9) 0%, rgba(10,20,30,0.95) 100%)",
                        border: "1px solid rgba(52,211,153,0.25)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)"
                    }}
                >
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                            <tr className="text-slate-400 text-xs uppercase border-b border-slate-800/80">
                                <th className="pb-4 font-semibold w-16 text-center">Место</th>
                                <th className="pb-4 font-semibold">Игрок</th>
                                <th className="pb-4 font-semibold text-center text-slate-200">Баллы</th>
                                <th className="pb-4 font-semibold text-center border-x border-slate-800/50 px-2" colSpan={3}>
                                    <div>Допп баллы</div>
                                    <div className="flex justify-between text-[10px] text-slate-500 pt-1 tracking-normal font-mono">
                                        <span>Σ (+/-)</span>
                                        <span>!</span>
                                        <span>Лх</span>
                                    </div>
                                </th>
                                <th className="pb-4 font-semibold text-center px-1">Ci</th>
                                <th className="pb-4 font-semibold text-center px-1">П</th>
                                <th className="pb-4 font-semibold text-center px-1">Д</th>
                                <th className="pb-4 font-semibold text-center px-1">Ш</th>
                                <th className="pb-4 font-semibold text-center px-1">У</th>
                                <th className="pb-4 font-semibold text-center">Игры</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {MOCK_PLAYERS.map((player, index) => {
                                const isQualified = player.games >= QUALIFICATION_LIMIT;
                                const prevQualified = index > 0 ? MOCK_PLAYERS[index - 1].games >= QUALIFICATION_LIMIT : true;
                                const showDivider = !isQualified && prevQualified;

                                return (
                                    <tr key={player.name} className="group">
                                        {/* ЛИНИЯ ПОРОГА (ПОЯВЛЯЕТСЯ МЕЖДУ 16+ И МЕНЕЕ 16 ИГР) */}
                                        {showDivider && (
                                            <td colSpan={12} className="py-2">
                                                <div className="relative flex items-center justify-center my-1">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t border-emerald-400/50"></div>
                                                    </div>
                                                    <div className="relative px-3 py-0.5 rounded-full text-[11px] font-bold text-emerald-300 bg-[#0a1520] border border-emerald-400/40">
                                                        Ном ({QUALIFICATION_LIMIT})
                                                    </div>
                                                </div>
                                            </td>
                                        )}

                                        <td className="py-3.5 text-center font-bold">
                                            <span className={
                                                player.rank === 1 ? "text-amber-400" :
                                                    player.rank === 2 ? "text-slate-300" :
                                                        player.rank === 3 ? "text-amber-600" :
                                                            player.rank <= 5 ? "text-emerald-400" : "text-slate-500"
                                            }>
                                                {player.rank}
                                            </span>
                                        </td>
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-400 flex-shrink-0">
                                                    {player.name[0]}
                                                </div>
                                                <span className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors">
                                                    {player.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 text-center font-bold text-slate-100">{player.score}</td>

                                        {/* Блок доп баллов */}
                                        <td className="py-3.5 text-center text-slate-300 font-mono text-xs">{player.extraSum}</td>
                                        <td className="py-3.5 text-center text-rose-400 font-mono text-xs">{player.penalty}</td>
                                        <td className="py-3.5 text-center text-slate-300 font-mono text-xs">{player.extraAdd}</td>

                                        <td className="py-3.5 text-center text-slate-400 font-mono">{player.ci}</td>
                                        <td className="py-3.5 text-center text-emerald-400 font-semibold">{player.win}</td>
                                        <td className="py-3.5 text-center text-slate-300">{player.don}</td>
                                        <td className="py-3.5 text-center text-slate-300">{player.sheriff}</td>
                                        <td className="py-3.5 text-center text-slate-300">{player.kill}</td>
                                        <td className="py-3.5 text-center font-bold text-slate-200">{player.games}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* БЛОК АННОТАЦИЙ / ЛЕГЕНДА */}
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: "#0a131d",
                        border: "1px solid #142435"
                    }}
                >
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Обозначения в таблице:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-xs">
                        {LEGEND_ITEMS.map((item) => (
                            <div key={item.code} className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-400 min-w-[50px]">
                                    {item.code}
                                </span>
                                <span className="text-slate-400">
                                    — {item.desc}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

            </main>
        </div>
    );
}