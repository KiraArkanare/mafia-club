'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import AddPlayerModal from "@/components/AddPlayerModal";
import { supabase } from "@/lib/supabase";

interface Player {
    id: string;
    nickname: string;
    avatar_url?: string | null;
    created_at?: string;
}

interface PlayerStats {
    totalGames: number;
    wins: number;
    winRate: number;
}

function SearchIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

function DefaultAvatar({ name }: { name: string }) {
    const letter = name.trim().charAt(0).toUpperCase() || "?";
    return (
        <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-sky-400 text-xl shadow-inner">
            {letter}
        </div>
    );
}

export default function PlayersPage() {
    const { isAdmin } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [players, setPlayers] = useState<Player[]>([]);
    const [statsMap, setStatsMap] = useState<Record<string, PlayerStats>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Загрузка игроков и расчет базовой статистики
    useEffect(() => {
        async function fetchPlayersData() {
            setLoading(true);

            // 1. Загружаем всех игроков
            const { data: playersData, error: playersError } = await supabase
                .from('players')
                .select('*')
                .order('nickname', { ascending: true });

            if (playersError) {
                console.error("Ошибка загрузки игроков:", playersError);
                setLoading(false);
                return;
            }

            setPlayers(playersData || []);

            // 2. Загружаем результаты всех игр для подсчета игр и % побед
            const { data: resultsData } = await supabase
                .from('game_players')
                .select('player_id, is_winner');

            if (resultsData) {
                const calculatedStats: Record<string, PlayerStats> = {};

                resultsData.forEach((row) => {
                    const pId = row.player_id;
                    if (!calculatedStats[pId]) {
                        calculatedStats[pId] = { totalGames: 0, wins: 0, winRate: 0 };
                    }
                    calculatedStats[pId].totalGames += 1;
                    if (row.is_winner) {
                        calculatedStats[pId].wins += 1;
                    }
                });

                // Вычисляем процент побед
                Object.keys(calculatedStats).forEach((pId) => {
                    const st = calculatedStats[pId];
                    st.winRate = st.totalGames > 0 ? Math.round((st.wins / st.totalGames) * 100) : 0;
                });

                setStatsMap(calculatedStats);
            }

            setLoading(false);
        }

        fetchPlayersData();
    }, []);

    // Фильтрация игроков по строке поиска
    const filteredPlayers = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return players;
        return players.filter((p) => p.nickname.toLowerCase().includes(query));
    }, [players, searchQuery]);

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#070d14" }}>

            {/* ФОНОВЫЕ СВЕЧЕНИЯ */}
            <div
                className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />

            <Header />

            <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-24 pb-16 relative z-10">

                {/* ЗАГОЛОВОК И ЭЛЕМЕНТЫ УПРАВЛЕНИЯ */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-100 tracking-tight">
                            Игроки клуба
                        </h1>
                        <p className="text-xs md:text-sm text-slate-400 mt-1">
                            Всего участников: <span className="text-sky-400 font-bold">{players.length}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Поле поиска */}
                        <div className="relative flex-1 md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <SearchIcon />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск игрока..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[#0f1e2e] border border-[#1e3a4a] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-all"
                            />
                        </div>

                        {/* Кнопка админа */}
                        {isAdmin && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-lg shadow-emerald-950/40 hover:scale-105"
                                style={{
                                    background: "linear-gradient(135deg, #10b981, #059669)",
                                    color: "#022c22"
                                }}
                            >
                                <span>+</span> Добавить
                            </button>
                        )}
                    </div>
                </div>

                {/* СОСТОЯНИЕ ЗАГРУЗКИ */}
                {loading ? (
                    <div className="text-center py-20 text-slate-500 text-sm">
                        Загрузка списка игроков...
                    </div>
                ) : filteredPlayers.length === 0 ? (
                    /* НИЧЕГО НЕ НАЙДЕНО */
                    <div className="text-center py-16 bg-[#0c1622] rounded-2xl border border-[#162535]">
                        <div className="text-3xl mb-2">🕵️‍♂️</div>
                        <div className="text-slate-300 font-bold mb-1">Игроки не найдены</div>
                        <div className="text-xs text-slate-500">Попробуйте изменить поисковый запрос</div>
                    </div>
                ) : (
                    /* СЕТКА КАРТОЧЕК ИГРОКОВ */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredPlayers.map((player) => {
                            const pStats = statsMap[player.id] || { totalGames: 0, wins: 0, winRate: 0 };

                            return (
                                <Link
                                    key={player.id}
                                    href={`/players/${player.id}`}
                                    className="group relative bg-[#0c1622] hover:bg-[#0f1e2e] border border-[#162535] hover:border-sky-500/40 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between"
                                >
                                    <div className="flex items-center gap-3.5 mb-4">
                                        {/* Аватарка */}
                                        <div className="relative flex-shrink-0">
                                            {player.avatar_url ? (
                                                <Image
                                                    src={player.avatar_url}
                                                    alt={player.nickname}
                                                    width={56}
                                                    height={56}
                                                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700/60"
                                                />
                                            ) : (
                                                <DefaultAvatar name={player.nickname} />
                                            )}
                                        </div>

                                        {/* Никнейм */}
                                        <div className="min-w-0 flex-1">
                                            <div className="text-slate-200 font-bold text-base group-hover:text-sky-400 transition-colors truncate">
                                                {player.nickname}
                                            </div>
                                            <div className="text-[11px] text-slate-500 mt-0.5">
                                                Профиль игрока
                                            </div>
                                        </div>
                                    </div>

                                    {/* Метрики игрока */}
                                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#162535]">
                                        <div className="bg-[#070d14] p-2 rounded-xl text-center">
                                            <div className="text-[10px] text-slate-500 uppercase font-semibold">Игр</div>
                                            <div className="text-sm font-extrabold text-slate-200 mt-0.5">
                                                {pStats.totalGames}
                                            </div>
                                        </div>

                                        <div className="bg-[#070d14] p-2 rounded-xl text-center">
                                            <div className="text-[10px] text-slate-500 uppercase font-semibold">% Побед</div>
                                            <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                                                {pStats.winRate}%
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

            </main>

            {/* Модалка добавления */}
            {isAddModalOpen && (
                <AddPlayerModal onCloseAction={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
}