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

// Тестовые данные с запасом для проверки скролла
const MOCK_PLAYERS = [
    { rank: 1, name: "Mr. White", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 18 },
    { rank: 2, name: "Sherlock", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 17 },
    { rank: 3, name: "Vega", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 16 },
    { rank: 4, name: "Joker", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 12 },
    { rank: 5, name: "Neo", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 10 },
    { rank: 6, name: "Trinity", avatar: "", score: "5.2", extraSum: "2.5", extraAdd: "2.5", penalty: "0", ci: "0", win: "2", don: "1", sheriff: "0", kill: "1", games: 8 },
    { rank: 7, name: "Morpheus", avatar: "", score: "4.8", extraSum: "1.5", extraAdd: "1.5", penalty: "0", ci: "0", win: "2", don: "0", sheriff: "1", kill: "0", games: 6 },
    { rank: 8, name: "Agent Smith", avatar: "", score: "4.1", extraSum: "1.0", extraAdd: "1.0", penalty: "0.5", ci: "0", win: "1", don: "1", sheriff: "0", kill: "0", games: 5 },
    { rank: 9, name: "Cypher", avatar: "", score: "3.5", extraSum: "0.5", extraAdd: "0.5", penalty: "1.0", ci: "0", win: "1", don: "0", sheriff: "0", kill: "0", games: 3 },
    { rank: 10, name: "Oracle", avatar: "", score: "2.0", extraSum: "0.0", extraAdd: "0.0", penalty: "0", ci: "0", win: "0", don: "0", sheriff: "0", kill: "0", games: 2 },
];

const LEGEND_ITEMS = [
    { code: "Баллы", desc: "Основной игровой счет" },
    { code: "Σ (+/-)", desc: "Сумма доп. баллов" },
    { code: "!", desc: "Дисциплинарные штрафы" },
    { code: "Лх", desc: "Баллы за лучший ход" },
    { code: "Ci", desc: "Коэффициент ценности" },
    { code: "П", desc: "Победы" },
    { code: "Д", desc: "Победы на Доне" },
    { code: "Ш", desc: "Победы на Шерифе" },
    { code: "У", desc: "Угаданные тройки мафии" },
];

export default function RatingPage() {
    const [season, setSeason] = useState("Сезон 1");
    const [series, setSeries] = useState("Общий");

    const QUALIFICATION_LIMIT = 16;

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>

            {/* ФОНОВЫЕ СВЕЧЕНИЯ И СЕТКА */}
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

                {/* ВЕРХНЯЯ ПАНЕЛЬ С КРАСИВЫМИ ПЛАШКАМИ И ФИЛЬТРАМИ */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
                    <div className="flex items-center gap-3">
                        {/* Плашка Выбора Сезона */}
                        <div
                            className="relative flex items-center px-4 py-2 rounded-xl transition-all border"
                            style={{
                                background: "rgba(15,30,46,0.8)",
                                borderColor: "rgba(52,211,153,0.3)",
                                boxShadow: "0 0 15px rgba(52,211,153,0.08)",
                                backdropFilter: "blur(8px)"
                            }}
                        >
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2.5 shadow-[0_0_8px_#34d399]" />
                            <select
                                value={season}
                                onChange={(e) => setSeason(e.target.value)}
                                className="appearance-none bg-transparent pr-7 text-emerald-400 font-bold text-sm cursor-pointer outline-none"
                            >
                                <option value="Сезон 1" className="bg-[#0b131e] text-slate-200">Сезон 1 (Активен)</option>
                                <option value="Сезон 2" className="bg-[#0b131e] text-slate-200">Сезон 2</option>
                            </select>
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-400">
                                <ChevronDownIcon />
                            </span>
                        </div>
                    </div>

                    {/* Плашка Выбора Серии */}
                    <div
                        className="relative flex items-center px-4 py-2 rounded-xl border transition-all"
                        style={{
                            background: "rgba(15,30,46,0.8)",
                            borderColor: "rgba(56,189,248,0.3)",
                            boxShadow: "0 0 15px rgba(56,189,248,0.08)",
                            backdropFilter: "blur(8px)"
                        }}
                    >
                        <select
                            value={series}
                            onChange={(e) => setSeries(e.target.value)}
                            className="appearance-none bg-transparent pr-7 text-sky-400 font-bold text-sm cursor-pointer outline-none"
                        >
                            <option value="Общий" className="bg-[#0b131e] text-slate-200">Общий рейтинг</option>
                            <option value="Серия A" className="bg-[#0b131e] text-slate-200">Серия A</option>
                            <option value="Серия B" className="bg-[#0b131e] text-slate-200">Серия B</option>
                        </select>
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-sky-400">
                            <ChevronDownIcon />
                        </span>
                    </div>
                </div>

                {/* ГЛАВНАЯ ТАБЛИЦА С СКРОЛЛОМ */}
                <div
                    className="rounded-2xl border overflow-hidden mb-8"
                    style={{
                        background: "linear-gradient(145deg, rgba(13,22,33,0.95) 0%, rgba(8,16,25,0.98) 100%)",
                        borderColor: "rgba(52,211,153,0.2)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                    }}
                >
                    <div className="overflow-x-auto max-h-[520px] overflow-y-auto custom-scrollbar">
                        <table className="w-full min-w-[750px] text-left border-collapse">
                            {/* Sticky Заголовок таблицы */}
                            <thead className="sticky top-0 z-20" style={{ background: "#0b1522" }}>
                                <tr className="text-slate-400 text-xs border-b border-slate-800">
                                    <th className="py-4 font-bold w-16 text-center text-slate-400">Место</th>
                                    <th className="py-4 font-bold text-slate-400">Игрок</th>
                                    <th className="py-4 font-bold text-center text-slate-200">Баллы</th>
                                    <th className="py-4 font-bold text-center border-x border-slate-800/60 px-2" colSpan={3}>
                                        <div className="text-slate-300">Допп баллы</div>
                                        <div className="flex justify-between text-[10px] text-slate-500 pt-1 tracking-normal font-mono">
                                            <span>Σ (+/-)</span>
                                            <span>!</span>
                                            <span>Лх</span>
                                        </div>
                                    </th>
                                    <th className="py-4 font-bold text-center px-1">Ci</th>
                                    <th className="py-4 font-bold text-center px-1 text-emerald-400">П</th>
                                    <th className="py-4 font-bold text-center px-1">Д</th>
                                    <th className="py-4 font-bold text-center px-1">Ш</th>
                                    <th className="py-4 font-bold text-center px-1">У</th>
                                    <th className="py-4 font-bold text-center pr-4">Игры</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-800/40">
                                {MOCK_PLAYERS.map((player, index) => {
                                    const isQualified = player.games >= QUALIFICATION_LIMIT;
                                    const prevQualified = index > 0 ? MOCK_PLAYERS[index - 1].games >= QUALIFICATION_LIMIT : true;
                                    const showDivider = !isQualified && prevQualified;

                                    return (
                                        <tr key={player.name} className="group hover:bg-slate-800/30 transition-colors">
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
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-xs font-semibold text-slate-300 flex-shrink-0">
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
                                            <td className="py-3.5 text-center text-rose-400 font-mono text-xs font-semibold">{player.penalty}</td>
                                            <td className="py-3.5 text-center text-slate-300 font-mono text-xs">{player.extraAdd}</td>

                                            <td className="py-3.5 text-center text-slate-400 font-mono text-xs">{player.ci}</td>
                                            <td className="py-3.5 text-center text-emerald-400 font-semibold">{player.win}</td>
                                            <td className="py-3.5 text-center text-slate-300 text-xs">{player.don}</td>
                                            <td className="py-3.5 text-center text-slate-300 text-xs">{player.sheriff}</td>
                                            <td className="py-3.5 text-center text-slate-300 text-xs">{player.kill}</td>
                                            <td className="py-3.5 text-center font-bold text-slate-200 pr-4">{player.games}</td>
                                        </tr>
                                    );

                                    // Отдельная строка для разделителя порога номинаций
                                    const dividerRow = showDivider ? (
                                        <tr key="divider-row" className="bg-[#08111a]">
                                            <td colSpan={12} className="py-2.5 px-4">
                                                <div className="relative flex items-center justify-center">
                                                    <div className="w-full border-t border-emerald-500/40" />
                                                    <div className="absolute px-3 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 bg-[#07131e] border border-emerald-500/50 shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                                                        Номинация ({QUALIFICATION_LIMIT} игр)
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : null;

                                    return (
                                        <>
                                            {dividerRow}
                                            {rowContent}
                                        </>
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