'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Player {
    id: string;
    nickname: string;
    total_score?: number;
    games_played?: number;
    wins?: number;
}

export default function Home() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaderboard() {
            // Получаем список игроков
            const { data, error } = await supabase
                .from('players')
                .select('*');

            if (error) {
                console.error('Ошибка загрузки:', error);
            } else {
                // Добавляем тестовые значения баллов (пока нет сыгранных игр)
                const formattedData = (data || []).map((player) => ({
                    ...player,
                    total_score: player.total_score || 0,
                    games_played: player.games_played || 0,
                    wins: player.wins || 0,
                }));

                // Сортируем по баллам
                formattedData.sort((a, b) => (b.total_score || 0) - (a.total_score || 0));
                setPlayers(formattedData);
            }
            setLoading(false);
        }

        fetchLeaderboard();
    }, []);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Шапка */}
                <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-red-500 tracking-wide">🎭 Клуб Мафии Каменск</h1>
                        <p className="text-sm text-slate-400 mt-1">Сезонный рейтинг игроков</p>
                    </div>
                </div>

                {/* Таблица */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-4 sm:p-6 border-b border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Турнирная таблица</h2>
                        <span className="text-xs bg-red-950/60 text-red-400 border border-red-800/50 px-3 py-1 rounded-full">
                            Летний Сезон
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-400">Загрузка рейтинга...</div>
                    ) : players.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">Нет игроков в базе.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="py-3 px-4 w-12 text-center">#</th>
                                        <th className="py-3 px-4">Игрок</th>
                                        <th className="py-3 px-4 text-center">Игры</th>
                                        <th className="py-3 px-4 text-center">Победы</th>
                                        <th className="py-3 px-4 text-right">Очки</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {players.map((player, index) => (
                                        <tr key={player.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-4 px-4 text-center font-bold text-slate-400">
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                                            </td>
                                            <td className="py-4 px-4 font-semibold text-white">{player.nickname}</td>
                                            <td className="py-4 px-4 text-center text-slate-300">{player.games_played}</td>
                                            <td className="py-4 px-4 text-center text-slate-300">{player.wins}</td>
                                            <td className="py-4 px-4 text-right font-bold text-red-400">{player.total_score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}