'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import AddGameModal from "@/components/AddGameModal";
import { supabase } from "@/lib/supabase";

function ChevronDownIcon({ isOpen }: { isOpen?: boolean }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-sky-400" : "text-slate-500"}`}
        >
            <polyline points="6 9 12 15 18 9" />
        </svg>
    );
}

function RoleIcon({ role }: { role: 'citizen' | 'mafia' | 'don' | 'sheriff' }) {
    if (role === 'citizen') return null;

    const iconPaths = {
        sheriff: '/roles/sheriff.png',
        don: '/roles/don.png',
        mafia: '/roles/mafia.png',
    };

    return (
        <div className="w-5 h-5 relative mx-auto flex items-center justify-center">
            <Image
                src={iconPaths[role]}
                alt={role}
                width={20}
                height={20}
                className="object-contain"
            />
        </div>
    );
}

interface PlayerSlot {
    slot: number;
    name: string;
    role: 'citizen' | 'mafia' | 'don' | 'sheriff';
    score: string;
    extra: string;
}

interface GameRecord {
    id: string; // UUID игры из Supabase
    gameNumber: number;
    seriesNumber: number;
    date: string;
    winner: 'civilians' | 'mafia';
    referee: string;
    comment: string;
    players: PlayerSlot[];
}

interface DbGameResult {
    slot_number: number;
    role: 'citizen' | 'mafia' | 'don' | 'sheriff';
    win_points: number;
    extra_points: number;
    best_move_points: number;
    compensation_points: number;
    player: { nickname: string } | null;
}

interface DbGame {
    id: string;
    game_number: number;
    winner_team: 'civilians' | 'mafia';
    comments: string | null;
    series: { series_number: number; date: string } | null;
    results: DbGameResult[];
}
const ITEMS_PER_PAGE = 11;

export default function GamesPage() {
    const { isAdmin } = useAuth();
    const [games, setGames] = useState<GameRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isAddGameOpen, setIsAddGameOpen] = useState(false);

    // Функция загрузки игр из Supabase оборачивается в useCallback
    const fetchGames = useCallback(async () => {
        const { data, error } = await supabase
            .from('games')
            .select(`
                id,
                game_number,
                winner_team,
                comments,
                series:series!inner(series_number, date),
                results:game_results(
                slot_number,
                role,
                win_points,
                extra_points,
                best_move_points,
                compensation_points,
                player:players(nickname)
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Ошибка загрузки игр:', error);
            setLoading(false);
            return;
        }

        if (data) {
            // Приводим data к строгому типу DbGame[]
            const rawGames = data as unknown as DbGame[];

            const formattedGames: GameRecord[] = rawGames.map((game) => {
                let refName = "—";
                let commText = game.comments || "";

                if (commText.startsWith("Судья:")) {
                    const parts = commText.split(". ");
                    refName = parts[0].replace("Судья: ", "").trim();
                    commText = parts.slice(1).join(". ");
                }

                let formattedDate = "—";
                if (game.series?.date) {
                    const [year, month, day] = game.series.date.split('-');
                    formattedDate = `${day}.${month}.${year}`;
                }

                const sortedPlayers: PlayerSlot[] = (game.results || [])
                    .sort((a, b) => a.slot_number - b.slot_number)
                    .map((r) => {
                        const winPts = Number(r.win_points || 0);
                        const addPts = Number(r.extra_points || 0) + Number(r.best_move_points || 0) + Number(r.compensation_points || 0);

                        return {
                            slot: r.slot_number,
                            name: r.player?.nickname || 'Неизвестный',
                            role: r.role,
                            score: winPts.toFixed(1),
                            extra: addPts.toFixed(1)
                        };
                    });

                return {
                    id: game.id,
                    gameNumber: game.game_number,
                    seriesNumber: game.series?.series_number || 1,
                    date: formattedDate,
                    winner: game.winner_team,
                    referee: refName,
                    comment: commText,
                    players: sortedPlayers
                };
            });

            setGames(formattedGames);
            setExpandedGameId(prev => prev ?? (formattedGames[0]?.id || null));
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (isMounted) {
                await fetchGames();
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [fetchGames]);

    const totalPages = Math.ceil(games.length / ITEMS_PER_PAGE);
    const paginatedGames = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return games.slice(start, start + ITEMS_PER_PAGE);
    }, [games, currentPage]);

    const toggleGame = (id: string) => {
        setExpandedGameId(expandedGameId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-[#070d14] text-slate-200 flex flex-col font-sans overflow-y-scroll">

            {/* ФОНОВЫЕ СВЕЧЕНИЯ */}
            <div
                className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl z-0"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />
            <div
                className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-3xl z-0"
                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, rgba(56,189,248,0.1) 70%, transparent 100%)" }}
            />

            <Header />

            <main className="flex-1 max-w-4xl w-full mx-auto px-4 md:px-8 pt-20 pb-8 flex flex-col justify-between">

                <div>
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 px-1">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight">История игр</h1>
                            <p className="text-xs text-slate-400 mt-1">Архив сыгранных протоколов с подробными результатами</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-xs font-semibold px-3 py-2 rounded-xl border border-sky-500/30 bg-sky-950/40 text-sky-400">
                                Всего игр: {games.length}
                            </div>

                            {isAdmin && (
                                <button
                                    onClick={() => setIsAddGameOpen(true)}
                                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer"
                                    style={{
                                        background: "linear-gradient(135deg, #10b981, #059669)",
                                        color: "#022c22"
                                    }}
                                >
                                    <span>+</span> Добавить игру
                                </button>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-xs text-slate-500 font-semibold animate-pulse">
                            Загрузка списка протоколов из базы данных...
                        </div>
                    ) : games.length === 0 ? (
                        <div className="text-center py-12 rounded-xl border border-slate-800 bg-[#09121c] text-slate-400 text-xs">
                            Игры еще не вносились. Нажмите «+ Добавить игру», чтобы создать первый протокол.
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            {paginatedGames.map((game) => {
                                const isOpen = expandedGameId === game.id;
                                const isCivsWin = game.winner === 'civilians';

                                return (
                                    <div
                                        key={game.id}
                                        className="rounded-xl border transition-all duration-200 overflow-hidden relative"
                                        style={{
                                            background: isOpen ? "#0b1622" : "#09121c",
                                            borderColor: isOpen ? "rgba(56,189,248,0.3)" : "rgba(20,32,48,0.8)",
                                        }}
                                    >
                                        <div
                                            className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isCivsWin ? "bg-emerald-400" : "bg-sky-400"
                                                }`}
                                        />

                                        <button
                                            onClick={() => toggleGame(game.id)}
                                            className="w-full pl-5 pr-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-slate-800/20 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-slate-100">
                                                    Игра #{game.gameNumber} <span className="text-xs text-slate-500 font-normal">(Серия #{game.seriesNumber})</span>
                                                </span>
                                                <span className="text-[11px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800/80">
                                                    {game.date}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`w-2 h-2 rounded-full ${isCivsWin
                                                                ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                                                                : "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                                                            }`}
                                                    />
                                                    <span className={`text-xs font-semibold ${isCivsWin ? "text-emerald-400" : "text-sky-400"}`}>
                                                        {isCivsWin ? "Победа мирных" : "Победа черных"}
                                                    </span>
                                                </div>

                                                <ChevronDownIcon isOpen={isOpen} />
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-5 pb-4 pt-1 border-t border-slate-800/50">
                                                <div className="overflow-x-auto rounded-lg border border-slate-800/80 mb-3 bg-[#070e17]">
                                                    <table className="w-full text-left border-collapse">
                                                        <thead>
                                                            <tr className="text-[11px] text-slate-400 bg-slate-900/60 border-b border-slate-800">
                                                                <th className="py-2 px-3 w-12 text-center font-bold">№</th>
                                                                <th className="py-2 px-3 font-bold">Игрок</th>
                                                                <th className="py-2 px-3 w-16 text-center font-bold">Роль</th>
                                                                <th className="py-2 px-3 w-32 text-right font-bold">Баллы / Допп</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-800/30 text-xs">
                                                            {game.players.map((p) => (
                                                                <tr key={p.slot} className="hover:bg-slate-800/20 transition-colors h-[36px]">
                                                                    <td className="py-1.5 px-3 text-center font-bold text-slate-400 align-middle">
                                                                        {p.slot}
                                                                    </td>
                                                                    <td className="py-1.5 px-3 font-semibold text-slate-200 align-middle">
                                                                        {p.name}
                                                                    </td>
                                                                    <td className="py-1.5 px-3 text-center align-middle">
                                                                        <RoleIcon role={p.role} />
                                                                    </td>
                                                                    <td className="py-1.5 px-3 text-right align-middle">
                                                                        <span className="font-semibold text-slate-200">{p.score}</span>
                                                                        <span className="text-slate-500 mx-1">/</span>
                                                                        <span className="text-emerald-400 font-semibold">+{p.extra}</span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="rounded-lg p-3 bg-[#070e17] border border-slate-800/80 text-xs">
                                                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/60">
                                                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                                                            <span>📝</span> Комментарии ведущего
                                                        </span>
                                                        <span className="text-slate-400">
                                                            Судья: <strong className="text-sky-400 font-semibold">{game.referee}</strong>
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1 text-slate-300">
                                                        <div className="leading-relaxed">
                                                            {game.comment || "Комментарии к партии отсутствуют."}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ПАГИНАЦИЯ */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-8">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-400 disabled:opacity-40 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                            Назад
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${currentPage === page
                                        ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                                        : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-800 bg-slate-900 text-slate-400 disabled:opacity-40 hover:text-slate-200 transition-colors cursor-pointer"
                        >
                            Вперед
                        </button>
                    </div>
                )}

            </main>

            {isAddGameOpen && (
                <AddGameModal
                    onClose={() => setIsAddGameOpen(false)}
                    onSuccess={fetchGames} // Авто-обновление списка игр после успешного создания
                />
            )}
        </div>
    );
}