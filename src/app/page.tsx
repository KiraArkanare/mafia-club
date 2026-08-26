'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Player {
    id: string;
    nickname: string;
    created_at: string;
}

export default function Home() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPlayers() {
            const { data, error } = await supabase.from('players').select('*');
            if (error) {
                console.error('Ошибка загрузки игроков:', error);
            } else {
                setPlayers(data || []);
            }
            setLoading(false);
        }

        fetchPlayers();
    }, []);

    return (
        <main className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-red-500">🎭 Клуб Мафии Каменск</h1>

                <h2 className="text-xl font-semibold mb-4">Список игроков</h2>

                {loading ? (
                    <p className="text-gray-400">Загрузка данных из Supabase...</p>
                ) : players.length === 0 ? (
                    <p className="text-gray-400">Игроки пока не добавлены в базу данных.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {players.map((player) => (
                            <div key={player.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                <p className="font-bold text-lg">{player.nickname}</p>
                                <p className="text-xs text-gray-400">ID: {player.id.slice(0, 8)}...</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
