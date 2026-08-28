'use client';

import React, { useState } from "react";
import Image from "next/image";

function ChevronDownIcon({ isOpen }: { isOpen?: boolean }) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
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

// Тестовые данные с динамикой мест (change: >0 - подъем, <0 - спад, 0 - без изменений)
const MOCK_PLAYERS = [
    { rank: 1, change: 1, name: "Mr. White", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 18 },
    { rank: 2, change: -1, name: "Sherlock", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 17 },
    { rank: 3, change: 2, name: "Vega", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 16 },
    { rank: 4, change: 0, name: "Joker", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 12 },
    { rank: 5, change: -2, name: "Neo", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 10 },
    { rank: 6, change: 0, name: "Trinity", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 8 },
    { rank: 7, change: 3, name: "Morpheus", score: "4.8", extraSum: "1.5", extraAdd: "1.5", penalty: "0", ci: "0", win: "2", don: "0", sheriff: "1", kill: "0", games: 6 },
    { rank: 8, change: -1, name: "Agent Smith", score: "4.1", extraSum: "1.0", extraAdd: "1.0", penalty: "0.5", ci: "0", win: "1", don: "1", sheriff: "0", kill: "0", games: 5 },
    { rank: 9, change: 0, name: "Cypher", score: "3.5", extraSum: "0.5", extraAdd: "0.5", penalty: "1.0", ci: "0", win: "1", don: "0", sheriff: "0", kill: "0", games: 3 },
    { rank: 10, change: 0, name: "Oracle", score: "2.0", extraSum: "0.0", extraAdd: "0.0", penalty: "0", ci: "0", win: "0", don: "0", sheriff: "0", kill: "0", games: 2 },
];

const LEGEND_ITEMS = [
    { code: "Баллы", desc: "Общая сумма баллов" },
    { code: "Σ (+/-)", desc: "Сумма доп. баллов" },
    { code: "!", desc: "Дисциплинарные штрафы" },
    { code: "Лх", desc: "Баллы за лучший ход" },
    { code: "Ci", desc: "Компенсационные баллы" },
    { code: "П", desc: "Победы" },
    { code: "Д", desc: "Победы на Доне" },
    { code: "Ш", desc: "Победы на Шерифе" },
    { code: "У", desc: "Убийств в первую ночь" },
];

export default function RatingPage() {
    const [season, setSeason] = useState("Сезон 1 (Активен)");
    const [series, setSeries] = useState("Общий рейтинг");

    const [isSeasonOpen, setIsSeasonOpen] = useState(false);
    const [isSeriesOpen, setIsSeriesOpen] = useState(false);

    const QUALIFICATION_LIMIT = 16;

    const seasonOptions = ["Сезон 1 (Активен)", "Сезон 2"];
    const seriesOptions = ["Общий рейтинг", "Серия 1", "Серия 2"];

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>

            {/* ФОНОВЫЕ СВЕЧЕНИЯ */}
            <div
                className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />
            <div
                className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, rgba(56,189,248,0.1) 70%, transparent 100%)" }}
            />

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
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-all hover:border-emerald-500/50"
                            style={{ background: "#0f1e2e", border: "1px solid #1e3a4a" }}
                        >
                            На главную
                        </a>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto w-full flex-1 relative z-10">

                {/* ВЕРХНЯЯ ПАНЕЛЬ С СТИЛЬНЫМИ ДРОПДАУНАМИ */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">

                    {/* КАСТОМНЫЙ ДРОПДАУН: СЕЗОН */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsSeasonOpen(!isSeasonOpen);
                                setIsSeriesOpen(false);
                            }}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all cursor-pointer text-emerald-400 font-bold text-sm"
                            style={{
                                background: "rgba(15,30,46,0.85)",
                                borderColor: isSeasonOpen ? "rgba(52,211,153,0.6)" : "rgba(52,211,153,0.25)",
                                boxShadow: "0 0 15px rgba(52,211,153,0.08)",
                                backdropFilter: "blur(8px)"
                            }}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                            <span>{season}</span>
                            <ChevronDownIcon isOpen={isSeasonOpen} />
                        </button>

                        {isSeasonOpen && (
                            <div
                                className="absolute left-0 mt-2 w-48 rounded-xl border py-1 z-30 shadow-2xl"
                                style={{
                                    background: "#0d1a29",
                                    borderColor: "rgba(52,211,153,0.3)",
                                    backdropFilter: "blur(12px)"
                                }}
                            >
                                {seasonOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setSeason(opt);
                                            setIsSeasonOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${season === opt ? "text-emerald-400 bg-emerald-950/30" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                            }`}
                                    >
                                        <span>{opt}</span>
                                        {season === opt && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* КАСТОМНЫЙ ДРОПДАУН: СЕРИЯ */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setIsSeriesOpen(!isSeriesOpen);
                                setIsSeasonOpen(false);
                            }}
                            className="flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all cursor-pointer text-sky-400 font-bold text-sm"
                            style={{
                                background: "rgba(15,30,46,0.85)",
                                borderColor: isSeriesOpen ? "rgba(56,189,248,0.6)" : "rgba(56,189,248,0.25)",
                                boxShadow: "0 0 15px rgba(56,189,248,0.08)",
                                backdropFilter: "blur(8px)"
                            }}
                        >
                            <span>{series}</span>
                            <ChevronDownIcon isOpen={isSeriesOpen} />
                        </button>

                        {isSeriesOpen && (
                            <div
                                className="absolute right-0 mt-2 w-48 rounded-xl border py-1 z-30 shadow-2xl"
                                style={{
                                    background: "#0d1a29",
                                    borderColor: "rgba(56,189,248,0.3)",
                                    backdropFilter: "blur(12px)"
                                }}
                            >
                                {seriesOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setSeries(opt);
                                            setIsSeriesOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${series === opt ? "text-sky-400 bg-sky-950/30" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                            }`}
                                    >
                                        <span>{opt}</span>
                                        {series === opt && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* ГЛАВНАЯ ТАБЛИЦА */}
                <div
                    className="rounded-2xl border overflow-hidden mb-8"
                    style={{
                        background: "linear-gradient(145deg, rgba(13,22,33,0.95) 0%, rgba(8,16,25,0.98) 100%)",
                        borderColor: "rgba(52,211,153,0.2)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                    }}
                >
                    <div className="overflow-x-auto max-h-[520px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse table-fixed">
                            {/* Строгая разметка ширины колонок */}
                            <colgroup>
                                <col className="w-16" />        {/* Место */}
                                <col className="w-48" />        {/* Игрок */}
                                <col className="w-20" />        {/* Баллы */}
                                <col className="w-20" />        {/* Σ (+/-) */}
                                <col className="w-12" />        {/* ! */}
                                <col className="w-16" />        {/* Лх */}
                                <col className="w-14" />        {/* Ci */}
                                <col className="w-12" />        {/* П */}
                                <col className="w-12" />        {/* Д */}
                                <col className="w-12" />        {/* Ш */}
                                <col className="w-12" />        {/* У */}
                                <col className="w-20" />        {/* Игры */}
                            </colgroup>

                            {/* Sticky Заголовок таблицы */}
                            <thead className="sticky top-0 z-20" style={{ background: "#0b1522" }}>
                                <tr className="text-slate-400 text-xs border-b border-slate-800">
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40">Место</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40">Игрок</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center text-slate-100 border-r border-slate-800/40">Баллы</th>
                                    <th colSpan={3} className="py-1.5 font-bold text-center border-b border-r border-slate-800/60 text-slate-300">
                                        Допп баллы
                                    </th>
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40">Ci</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40 text-emerald-400">П</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40">Д</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40">Ш</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center border-r border-slate-800/40">У</th>
                                    <th rowSpan={2} className="py-3 font-bold text-center">Игры</th>
                                </tr>
                                <tr className="text-[10px] text-slate-400 font-mono border-b border-slate-800">
                                    <th className="py-1.5 text-center border-r border-slate-800/40">Σ (+/-)</th>
                                    <th className="py-1.5 text-center border-r border-slate-800/40 text-rose-400">!</th>
                                    <th className="py-1.5 text-center border-r border-slate-800/40">Лх</th>
                                </tr>
                            </thead>

                            <tbody className="text-sm divide-y divide-slate-800/40">
                                {MOCK_PLAYERS.map((player, index) => {
                                    const isQualified = player.games >= QUALIFICATION_LIMIT;
                                    const prevQualified = index > 0 ? MOCK_PLAYERS[index - 1].games >= QUALIFICATION_LIMIT : true;
                                    const showDivider = !isQualified && prevQualified;

                                    return (
                                        <React.Fragment key={player.name}>
                                            {/* Разделитель порога номинаций */}
                                            {showDivider && (
                                                <tr key="divider-row" className="bg-[#08111a] relative z-10">
                                                    <td colSpan={12} className="py-0 px-4">
                                                        <div className="relative flex items-center justify-start py-2 -my-2">
                                                            <div className="w-full border-t border-emerald-500/40" />
                                                            <div className="absolute left-6 px-3 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-[#07131e] border border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                                                                Ном. ({QUALIFICATION_LIMIT} игр)
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}

                                            {/* Строка игрока */}
                                            <tr className="group hover:bg-slate-800/30 transition-colors">
                                                <td className="py-3 text-center font-bold">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <span className={
                                                            player.rank === 1 ? "text-amber-400" :
                                                                player.rank === 2 ? "text-slate-300" :
                                                                    player.rank === 3 ? "text-amber-600" :
                                                                        player.rank <= 5 ? "text-emerald-400" : "text-slate-500"
                                                        }>
                                                            {player.rank}
                                                        </span>

                                                        <span className="text-[10px] font-mono min-w-[16px] text-center">
                                                            {player.change > 0 && (
                                                                <span className="text-emerald-400 font-bold">▲{player.change}</span>
                                                            )}
                                                            {player.change < 0 && (
                                                                <span className="text-rose-400 font-bold">▼{Math.abs(player.change)}</span>
                                                            )}
                                                            {player.change === 0 && (
                                                                <span className="text-slate-600">—</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div className="flex items-center justify-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-semibold text-slate-300 flex-shrink-0">
                                                            {player.name[0]}
                                                        </div>
                                                        <span className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors truncate">
                                                            {player.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3 text-center font-bold text-slate-100">{player.score}</td>

                                                {/* Блок доп баллов */}
                                                <td className="py-3 text-center text-slate-300 font-mono text-xs">{player.extraSum}</td>
                                                <td className="py-3 text-center text-rose-400 font-mono text-xs font-semibold">{player.penalty}</td>
                                                <td className="py-3 text-center text-slate-300 font-mono text-xs">{player.extraAdd}</td>

                                                <td className="py-3 text-center text-slate-400 font-mono text-xs">{player.ci}</td>
                                                <td className="py-3 text-center text-emerald-400 font-semibold">{player.win}</td>
                                                <td className="py-3 text-center text-slate-300 text-xs">{player.don}</td>
                                                <td className="py-3 text-center text-slate-300 text-xs">{player.sheriff}</td>
                                                <td className="py-3 text-center text-slate-300 text-xs">{player.kill}</td>
                                                <td className="py-3 text-center font-bold text-slate-200">{player.games}</td>
                                            </tr>
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* БЛОК АННОТАЦИЙ / ЛЕГЕНДА */}
                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: "rgba(10,19,29,0.7)",
                        border: "1px solid #142435",
                        backdropFilter: "blur(8px)"
                    }}
                >
                    <div className="text-[11px] font-bold tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                        Обозначения в таблице:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2.5 gap-x-6 text-xs">
                        {LEGEND_ITEMS.map((item) => (
                            <div key={item.code} className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-400 min-w-[55px]">
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