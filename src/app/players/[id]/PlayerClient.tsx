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

// Компонент круговой инфографики (Donut Chart)
function WinRateDonut({ winRate }: { winRate: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (winRate / 100) * circumference;

    return (
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className="text-slate-800"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                />
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="url(#gradient)"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-100">{winRate}%</span>
                <span className="text-[9px] uppercase font-bold text-slate-500">Побед</span>
            </div>
        </div>
    );
}

function DefaultAvatar({ name }: { name: string }) {
    const letter = name.trim().charAt(0).toUpperCase() || "?";
    return (
        <div className="w-28 h-28 rounded-3xl bg-slate-800 border-2 border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-4xl shadow-2xl flex-shrink-0">
            {letter}
        </div>
    );
}

export default function PlayerDetailPage() {
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

            // 1. Профиль игрока
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
                    awards (
                        title,
                        icon_url,
                        description
                    )
                `)
                .eq('player_id', playerId);

            if (aData) setAwards(aData as unknown as PlayerAward[]);

            // 3. Игры игрока
            const { data: gData } = await supabase
                .from('game_results')
                .select(`
                    role,
                    win_points,
                    extra_points,
                    total_game_score,
                    game:games (
                        id,
                        winner_team,
                        first_night_killed_id,
                        created_at
                    )
                `)
                .eq('player_id', playerId);

            if (gData) setGameResults(gData as unknown as GameResultRow[]);

            setLoading(false);
        }

        fetchPlayerData();
    }, [playerId]);

    // Расчет детальной статистики
    const stats = useMemo(() => {
        const total = gameResults.length;
        if (total === 0) {
            return {
                totalGames: 0,
                overallWinRate: 0,
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
        let fnKills = 0;

        const roleStats = {
            citizen: { total: 0, wins: 0, winRate: 0 },
            sheriff: { total: 0, wins: 0, winRate: 0 },
            mafia: { total: 0, wins: 0, winRate: 0 },
            don: { total: 0, wins: 0, winRate: 0 },
        };

        gameResults.forEach((row) => {
            const role = (row.role || '').toUpperCase();
            const winnerTeam = (row.game?.winner_team || '').toUpperCase();

            const isRedRole = role === 'CITIZEN' || role === 'RED';
            const isSheriff = role === 'SHERIFF';
            const isMafia = role === 'MAFIA' || role === 'BLACK';
            const isDon = role === 'DON';

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

        // Считаем %
        const calcRate = (w: number, t: number) => (t > 0 ? Math.round((w / t) * 100) : 0);

        roleStats.citizen.winRate = calcRate(roleStats.citizen.wins, roleStats.citizen.total);
        roleStats.sheriff.winRate = calcRate(roleStats.sheriff.wins, roleStats.sheriff.total);
        roleStats.mafia.winRate = calcRate(roleStats.mafia.wins, roleStats.mafia.total);
        roleStats.don.winRate = calcRate(roleStats.don.wins, roleStats.don.total);

        return {
            totalGames: total,
            overallWinRate: Math.round((totalWins / total) * 100),
            firstNightKills: fnKills,
            firstNightKillRate: Math.round((fnKills / total) * 100),
            roles: roleStats,
        };
    }, [gameResults, playerId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm" style={{ background: "#070d14" }}>
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

            {/* ФОНОВЫЕ СВЕЧЕНИЯ */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />

            <Header />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 pt-24 pb-16 relative z-10">

                {/* ШАПКА ПРОФИЛЯ + НАВИГАЦИЯ (ТАБЫ) */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-[#0c1622] p-6 rounded-3xl border border-[#162535]">

                    {/* Аватарка и инфо */}
                    <div className="flex items-center gap-5">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.nickname}
                                width={112}
                                height={112}
                                className="w-28 h-28 rounded-3xl object-cover border-2 border-sky-500/30 flex-shrink-0 shadow-2xl"
                            />
                        ) : (
                            <DefaultAvatar name={profile.nickname} />
                        )}

                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                                {profile.nickname}
                            </h1>
                            {profile.full_name && (
                                <div className="text-sm font-semibold text-sky-400 mt-0.5">
                                    {profile.full_name}
                                </div>
                            )}
                            <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                                {profile.bio || "Описание пока не добавлено."}
                            </p>
                        </div>
                    </div>

                    {/* Табы навигации */}
                    <div className="flex md:flex-col gap-2 w-full md:w-auto self-stretch justify-center">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'info'
                                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-lg shadow-sky-950/50"
                                : "text-slate-400 hover:text-slate-200 bg-[#070d14]"
                                }`}
                        >
                            <span>ℹ️</span> Инфо
                        </button>
                        <button
                            onClick={() => setActiveTab('games')}
                            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'games'
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-950/50"
                                : "text-slate-400 hover:text-slate-200 bg-[#070d14]"
                                }`}
                        >
                            <span>🎲</span> Игры ({stats.totalGames})
                        </button>
                    </div>
                </div>

                {/* Вкладка 1: ИНФО */}
                {activeTab === 'info' && (
                    <div className="flex flex-col gap-6">

                        {/* БЛОК 1: НАГРАДЫ */}
                        <div className="bg-[#0c1622] border border-[#162535] rounded-3xl p-6">
                            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                                <span>🏆</span> Награды и достижения
                            </h2>

                            {awards.length === 0 ? (
                                <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-[#162535] rounded-2xl">
                                    У игрока пока нет полученных наград
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {awards.map((a) => (
                                        <div
                                            key={a.id}
                                            className="bg-[#070d14] border border-[#162535] p-4 rounded-2xl flex flex-col items-center text-center group hover:border-amber-500/40 transition-all"
                                        >
                                            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                                                🏆
                                            </div>
                                            <div className="text-xs font-bold text-slate-200 line-clamp-2">
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

                        {/* БЛОК 2: СТАТИСТИКА / WINRATE */}
                        <div className="bg-[#0c1622] border border-[#162535] rounded-3xl p-6">
                            <h2 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
                                <span>📊</span> Статистика WinRate
                            </h2>

                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Инфографика */}
                                <WinRateDonut winRate={stats.overallWinRate} />

                                {/* Детализация по ролям */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">

                                    <div className="bg-[#070d14] p-3.5 rounded-2xl border border-[#162535] flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="text-xs font-semibold text-slate-300">Мирный</span>
                                        </div>
                                        <span className="text-sm font-extrabold text-slate-100">
                                            {stats.roles.citizen.winRate}%
                                            <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.citizen.wins}/{stats.roles.citizen.total})</span>
                                        </span>
                                    </div>

                                    <div className="bg-[#070d14] p-3.5 rounded-2xl border border-[#162535] flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                                            <span className="text-xs font-semibold text-slate-300">Мафия</span>
                                        </div>
                                        <span className="text-sm font-extrabold text-slate-100">
                                            {stats.roles.mafia.winRate}%
                                            <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.mafia.wins}/{stats.roles.mafia.total})</span>
                                        </span>
                                    </div>

                                    <div className="bg-[#070d14] p-3.5 rounded-2xl border border-[#162535] flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                                            <span className="text-xs font-semibold text-slate-300">Шериф</span>
                                        </div>
                                        <span className="text-sm font-extrabold text-slate-100">
                                            {stats.roles.sheriff.winRate}%
                                            <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.sheriff.wins}/{stats.roles.sheriff.total})</span>
                                        </span>
                                    </div>

                                    <div className="bg-[#070d14] p-3.5 rounded-2xl border border-[#162535] flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                            <span className="text-xs font-semibold text-slate-300">Дон</span>
                                        </div>
                                        <span className="text-sm font-extrabold text-slate-100">
                                            {stats.roles.don.winRate}%
                                            <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.roles.don.wins}/{stats.roles.don.total})</span>
                                        </span>
                                    </div>

                                    <div className="sm:col-span-2 bg-[#070d14] p-3.5 rounded-2xl border border-[#162535] flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <span className="text-sm">💀</span>
                                            <span className="text-xs font-semibold text-slate-300">Смерть в 1-ю ночь</span>
                                        </div>
                                        <span className="text-sm font-extrabold text-rose-400">
                                            {stats.firstNightKillRate}%
                                            <span className="text-[10px] text-slate-500 ml-1 font-normal">({stats.firstNightKills} раз)</span>
                                        </span>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Вкладка 2: ИГРЫ */}
                {activeTab === 'games' && (
                    <div className="bg-[#0c1622] border border-[#162535] rounded-3xl p-6">
                        <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <span>🎲</span> Сыгранные игры
                        </h2>

                        {gameResults.length === 0 ? (
                            <div className="text-xs text-slate-500 py-8 text-center border border-dashed border-[#162535] rounded-2xl">
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

            </main>
        </div>
    );
}