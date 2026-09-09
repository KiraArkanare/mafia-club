'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

interface PlayerProfile {
    id: string;
    nickname: string;
    full_name?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
}

interface PlayerAward {
    id: string;
    awarded_at: string;
    awards: {
        title: string;
        icon_url?: string | null;
        description?: string | null;
    } | null;
}

interface GameResultRow {
    role: string;
    win_points: number;
    extra_points: number;
    total_game_score: number;
    game: {
        id: string;
        winner_team: string;
        first_night_killed_id: string | null;
        created_at: string;
    } | null;
}

// Двойной кольцевой график: Внешний (Общий WinRate), Внутренний (Разбивка побед по 4 ролям)
function DoubleDonutChart({
    winRate,
    roleWins
}: {
    winRate: number;
    roleWins: { citizen: number; sheriff: number; mafia: number; don: number }
}) {
    // Внешнее кольцо (WinRate)
    const rOuter = 42;
    const cOuter = 2 * Math.PI * rOuter;
    const offsetOuter = cOuter - (winRate / 100) * cOuter;

    // Внутреннее кольцо (Победы по ролям)
    const rInner = 30;
    const cInner = 2 * Math.PI * rInner;
    const totalWins = roleWins.citizen + roleWins.sheriff + roleWins.mafia + roleWins.don;

    // Расчет долей сегментов для внутреннего кольца
    const segments = useMemo(() => {
        if (totalWins === 0) return [];

        const roles = [
            { key: 'citizen', count: roleWins.citizen, color: '#ef4444' }, // Мирный (Red)
            { key: 'sheriff', count: roleWins.sheriff, color: '#38bdf8' }, // Шериф (Sky)
            { key: 'mafia', count: roleWins.mafia, color: '#f8fafc' },   // Мафия (White)
            { key: 'don', count: roleWins.don, color: '#fbbf24' },      // Дон (Amber)
        ];

        let currentOffset = 0;
        return roles.map(role => {
            const pct = role.count / totalWins;
            const dashArray = `${pct * cInner} ${cInner}`;
            const dashOffset = -currentOffset;
            currentOffset += pct * cInner;

            return {
                ...role,
                dashArray,
                dashOffset
            };
        });
    }, [roleWins, totalWins, cInner]);

    return (
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* ВНЕШНЕЕ КОЛЬЦО: Фон */}
                <circle cx="50" cy="50" r={rOuter} strokeWidth="6" className="text-slate-800" stroke="currentColor" fill="transparent" />

                {/* ВНЕШНЕЕ КОЛЬЦО: Значение % WinRate */}
                <circle
                    cx="50"
                    cy="50"
                    r={rOuter}
                    strokeWidth="6"
                    strokeDasharray={cOuter}
                    strokeDashoffset={offsetOuter}
                    strokeLinecap="round"
                    stroke="url(#winrate-gradient)"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                />

                {/* ВНУТРЕННЕЕ КОЛЬЦО: Фон */}
                <circle cx="50" cy="50" r={rInner} strokeWidth="5" className="text-slate-900" stroke="currentColor" fill="transparent" />

                {/* ВНУТРЕННЕЕ КОЛЬЦО: Сегменты ролей */}
                {segments.map(s => (
                    <circle
                        key={s.key}
                        cx="50"
                        cy="50"
                        r={rInner}
                        strokeWidth="5"
                        strokeDasharray={s.dashArray}
                        strokeDashoffset={s.dashOffset}
                        stroke={s.color}
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                    />
                ))}

                <defs>
                    <linearGradient id="winrate-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-100 tracking-tight">{winRate}%</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Побед</span>
            </div>
        </div>
    );
}

function DefaultAvatar({ name }: { name: string }) {
    const letter = name.trim().charAt(0).toUpperCase() || "?";
    return (
        <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-3xl shadow-xl flex-shrink-0">
            {letter}
        </div>
    );
}

export default function PlayerClient() {
    const params = useParams();
    const playerId = params.id as string;

    const [activeTab, setActiveTab] = useState<'info' | 'games'>('info');
    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [awards, setAwards] = useState<PlayerAward[]>([]);
    const [gameResults, setGameResults] = useState<GameResultRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!playerId) return;

        async function fetchPlayerData() {
            setLoading(true);

            // 1. Профиль
            const { data: pData } = await supabase
                .from('players')
                .select('*')
                .eq('id', playerId)
                .single();

            if (pData) setProfile(pData);

            // 2. Награды
            const { data: aData } = await supabase
                .from('player_awards')
                .select(`
                    id,
                    awarded_at,
                    awards ( title, icon_url, description )
                `)
                .eq('player_id', playerId);

            if (aData) setAwards(aData as unknown as PlayerAward[]);

            // 3. Результаты игр
            const { data: gData } = await supabase
                .from('game_results')
                .select(`
                    role, win_points, extra_points, total_game_score,
                    game:games ( id, winner_team, first_night_killed_id, created_at )
                `)
                .eq('player_id', playerId);

            if (gData) setGameResults(gData as unknown as GameResultRow[]);

            setLoading(false);
        }

        fetchPlayerData();
    }, [playerId]);

    // Расчет статистики
    const stats = useMemo(() => {
        const total = gameResults.length;
        if (total === 0) {
            return {
                totalGames: 0,
                avgScore: "0.00",
                overallWinRate: 0,
                redTeamRatio: 0,
                blackTeamRatio: 0,
                firstNightKills: 0,
                firstNightKillRate: 0,
                roles: {
                    citizen: { total: 0, wins: 0, winRate: 0 },
                    sheriff: { total: 0, wins: 0, winRate: 0 },
                    mafia: { total: 0, wins: 0, winRate: 0 },
                    don: { total: 0, wins: 0, winRate: 0 },
                }
            };
        }

        let totalWins = 0;
        let totalScoreSum = 0;
        let redGamesCount = 0;
        let blackGamesCount = 0;
        let fnKills = 0;

        const roleStats = {
            citizen: { total: 0, wins: 0, winRate: 0 },
            sheriff: { total: 0, wins: 0, winRate: 0 },
            mafia: { total: 0, wins: 0, winRate: 0 },
            don: { total: 0, wins: 0, winRate: 0 },
        };

        gameResults.forEach((row) => {
            totalScoreSum += Number(row.total_game_score || 0);

            const role = (row.role || '').toUpperCase();
            const winnerTeam = (row.game?.winner_team || '').toUpperCase();

            const isRedRole = role === 'CITIZEN' || role === 'RED';
            const isSheriff = role === 'SHERIFF';
            const isMafia = role === 'MAFIA' || role === 'BLACK';
            const isDon = role === 'DON';

            if (isRedRole || isSheriff) redGamesCount += 1;
            if (isMafia || isDon) blackGamesCount += 1;

            const isRedWin = winnerTeam === 'RED' || winnerTeam === 'CIVILIANS';
            const isBlackWin = winnerTeam === 'BLACK' || winnerTeam === 'MAFIA';

            const isWin = ((isRedRole || isSheriff) && isRedWin) || ((isMafia || isDon) && isBlackWin);

            if (isWin) totalWins += 1;

            if (row.game?.first_night_killed_id === playerId) {
                fnKills += 1;
            }

            if (isSheriff) {
                roleStats.sheriff.total += 1;
                if (isWin) roleStats.sheriff.wins += 1;
            } else if (isDon) {
                roleStats.don.total += 1;
                if (isWin) roleStats.don.wins += 1;
            } else if (isMafia) {
                roleStats.mafia.total += 1;
                if (isWin) roleStats.mafia.wins += 1;
            } else {
                roleStats.citizen.total += 1;
                if (isWin) roleStats.citizen.wins += 1;
            }
        });

        const calcRate = (w: number, t: number) => (t > 0 ? Math.round((w / t) * 100) : 0);

        roleStats.citizen.winRate = calcRate(roleStats.citizen.wins, roleStats.citizen.total);
        roleStats.sheriff.winRate = calcRate(roleStats.sheriff.wins, roleStats.sheriff.total);
        roleStats.mafia.winRate = calcRate(roleStats.mafia.wins, roleStats.mafia.total);
        roleStats.don.winRate = calcRate(roleStats.don.wins, roleStats.don.total);

        return {
            totalGames: total,
            avgScore: (totalScoreSum / total).toFixed(2),
            overallWinRate: Math.round((totalWins / total) * 100),
            redTeamRatio: Math.round((redGamesCount / total) * 100),
            blackTeamRatio: Math.round((blackGamesCount / total) * 100),
            firstNightKills: fnKills,
            firstNightKillRate: Math.round((fnKills / total) * 100),
            roles: roleStats,
        };
    }, [gameResults, playerId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-500 text-sm" style={{ background: "#070d14" }}>
                Загрузка профиля...
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-300" style={{ background: "#070d14" }}>
                <p className="mb-4">Игрок не найден</p>
                <Link href="/players" className="text-sky-400 underline text-sm">Назад к списку</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#070d14" }}>

            {/* Мягкие фоновые свечения */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />

            <Header />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-16 relative z-10">

                {/* БРАУЗЕРНЫЕ ВКЛАДКИ (TABS) НАД ДАШБОРДОМ */}
                <div className="flex items-center gap-1.5 pl-2 mb-[-1px] z-20 relative">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`px-6 py-2.5 rounded-t-2xl text-xs font-bold transition-all border-t border-x ${activeTab === 'info'
                                ? "bg-[#0c1622] text-sky-400 border-[#162535] border-b-[#0c1622] shadow-lg"
                                : "bg-[#070d14] text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c1622]/50"
                            }`}
                    >
                        Инфо
                    </button>
                    <button
                        onClick={() => setActiveTab('games')}
                        className={`px-6 py-2.5 rounded-t-2xl text-xs font-bold transition-all border-t border-x ${activeTab === 'games'
                                ? "bg-[#0c1622] text-emerald-400 border-[#162535] border-b-[#0c1622] shadow-lg"
                                : "bg-[#070d14] text-slate-400 border-transparent hover:text-slate-200 hover:bg-[#0c1622]/50"
                            }`}
                    >
                        Игры ({stats.totalGames})
                    </button>
                </div>

                {/* ЕДИНЫЙ DASHBOARD КОНТЕЙНЕР */}
                <div className="bg-[#0c1622] border border-[#162535] rounded-b-3xl rounded-tr-3xl p-6 md:p-8 shadow-2xl relative z-10">

                    {/* ВКЛАДКА 1: ИНФО */}
                    {activeTab === 'info' && (
                        <div className="flex flex-col gap-8">

                            {/* ДВУХКОЛОНОЧНАЯ СЕТКА СТАТИСТИКИ */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                                {/* ЛЕВАЯ КОЛОНКА: Визитка + Быстрые цифры */}
                                <div className="lg:col-span-5 flex flex-col gap-6">

                                    {/* Шапка визитки */}
                                    <div className="flex items-start gap-4 pb-6 border-b border-[#162535]">
                                        {profile.avatar_url ? (
                                            <Image
                                                src={profile.avatar_url}
                                                alt={profile.nickname}
                                                width={96}
                                                height={96}
                                                className="w-24 h-24 rounded-2xl object-cover border border-sky-500/30 flex-shrink-0 shadow-xl"
                                            />
                                        ) : (
                                            <DefaultAvatar name={profile.nickname} />
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <h1 className="text-2xl font-black text-slate-100 tracking-tight truncate">
                                                {profile.nickname}
                                            </h1>
                                            {profile.full_name && (
                                                <div className="text-xs font-semibold text-sky-400 mt-0.5 truncate">
                                                    {profile.full_name}
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                                                {profile.bio || "Описание пока не добавлено."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Плашки ключевых показателей */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-[#070d14] p-4 rounded-2xl border border-[#162535]">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Всего игр</div>
                                            <div className="text-2xl font-black text-slate-100 mt-1">{stats.totalGames}</div>
                                        </div>

                                        <div className="bg-[#070d14] p-4 rounded-2xl border border-[#162535]">
                                            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ср. балл за игру</div>
                                            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.avgScore}</div>
                                        </div>
                                    </div>

                                    {/* Распределение по командам (Красная vs Чёрная) */}
                                    <div className="bg-[#070d14] p-4 rounded-2xl border border-[#162535]">
                                        <div className="flex justify-between items-center text-xs font-bold mb-2">
                                            <span className="text-rose-400">Красные ({stats.redTeamRatio}%)</span>
                                            <span className="text-slate-300">Чёрные ({stats.blackTeamRatio}%)</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                                            <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${stats.redTeamRatio}%` }} />
                                            <div className="h-full bg-slate-200 transition-all duration-500" style={{ width: `${stats.blackTeamRatio}%` }} />
                                        </div>
                                    </div>

                                </div>

                                {/* ПРАВАЯ КОЛОНКА: Двойной график и Детализация */}
                                <div className="lg:col-span-7 flex flex-col gap-6">

                                    <div className="text-sm font-bold text-slate-200 tracking-wide pb-2 border-b border-[#162535]">
                                        Статистика WinRate
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#070d14] p-5 rounded-2xl border border-[#162535]">

                                        {/* Двойной кольцевой график */}
                                        <DoubleDonutChart
                                            winRate={stats.overallWinRate}
                                            roleWins={{
                                                citizen: stats.roles.citizen.wins,
                                                sheriff: stats.roles.sheriff.wins,
                                                mafia: stats.roles.mafia.wins,
                                                don: stats.roles.don.wins,
                                            }}
                                        />

                                        {/* Сетка показателей по ролям */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">

                                            <div className="bg-[#0c1622] p-3 rounded-xl border border-[#162535] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-slate-300">Мирный</span>
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-100">
                                                    {stats.roles.citizen.winRate}%
                                                    <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.citizen.wins}/{stats.roles.citizen.total})</span>
                                                </span>
                                            </div>

                                            <div className="bg-[#0c1622] p-3 rounded-xl border border-[#162535] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-100 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-slate-300">Мафия</span>
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-100">
                                                    {stats.roles.mafia.winRate}%
                                                    <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.mafia.wins}/{stats.roles.mafia.total})</span>
                                                </span>
                                            </div>

                                            <div className="bg-[#0c1622] p-3 rounded-xl border border-[#162535] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-slate-300">Шериф</span>
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-100">
                                                    {stats.roles.sheriff.winRate}%
                                                    <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.sheriff.wins}/{stats.roles.sheriff.total})</span>
                                                </span>
                                            </div>

                                            <div className="bg-[#0c1622] p-3 rounded-xl border border-[#162535] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" />
                                                    <span className="text-xs font-semibold text-slate-300">Дон</span>
                                                </div>
                                                <span className="text-xs font-extrabold text-slate-100">
                                                    {stats.roles.don.winRate}%
                                                    <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.don.wins}/{stats.roles.don.total})</span>
                                                </span>
                                            </div>

                                            {/* Первоночь */}
                                            <div className="sm:col-span-2 bg-[#0c1622] p-3 rounded-xl border border-[#162535] flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">💀</span>
                                                    <span className="text-xs font-semibold text-slate-300">Смерть в 1-ю ночь</span>
                                                </div>
                                                <span className="text-xs font-extrabold text-rose-400">
                                                    {stats.firstNightKillRate}%
                                                    <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.firstNightKills} раз)</span>
                                                </span>
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>

                            {/* ОТДЕЛЬНЫЙ РЯД ВНИЗУ: НАГРАДЫ И ДОСТИЖЕНИЯ */}
                            <div className="pt-6 border-t border-[#162535]">
                                <div className="text-sm font-bold text-slate-200 tracking-wide mb-4">
                                    Награды и достижения
                                </div>

                                {awards.length === 0 ? (
                                    <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-[#162535] rounded-2xl bg-[#070d14]">
                                        У игрока пока нет полученных наград
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {awards.map((a) => (
                                            <div
                                                key={a.id}
                                                className="bg-[#070d14] border border-[#162535] p-4 rounded-2xl flex flex-col items-center text-center group hover:border-sky-500/40 transition-all"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-sky-400 text-lg mb-2 font-black">
                                                    ★
                                                </div>
                                                <div className="text-xs font-bold text-slate-200 line-clamp-1">
                                                    {a.awards?.title || "Награда"}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-1">
                                                    {new Date(a.awarded_at).toLocaleDateString("ru-RU")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                    )}

                    {/* ВКЛАДКА 2: ИГРЫ */}
                    {activeTab === 'games' && (
                        <div className="flex flex-col gap-4">
                            <div className="text-sm font-bold text-slate-200 tracking-wide pb-2 border-b border-[#162535]">
                                История сыгранных партий
                            </div>

                            {gameResults.length === 0 ? (
                                <div className="text-xs text-slate-500 py-10 text-center border border-dashed border-[#162535] rounded-2xl bg-[#070d14]">
                                    Данный игрок еще не участвовал в зарегистрированных играх.
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2.5">
                                    {gameResults.map((g, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-[#070d14] border border-[#162535] p-4 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-200">
                                                        Роль: <span className="text-sky-400">{g.role}</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                                        Победители: {g.game?.winner_team || '—'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="text-xs font-extrabold text-emerald-400">
                                                    +{g.total_game_score} баллов
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </main>
        </div>
    );
}