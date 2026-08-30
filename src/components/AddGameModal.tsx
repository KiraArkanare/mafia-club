'use client';

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface AddGameModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

interface PlayerRow {
    slot: number;
    nickname: string;
    role: 'citizen' | 'mafia' | 'don' | 'sheriff';
    score: string;
    extraScore: string;
    ciScore: string;
    penalty: string;
    discPenalty: string;
}

interface DbPlayer {
    id: string;
    nickname: string;
}

interface SeriesItem {
    id: string;
    series_number: number;
}

export default function AddGameModal({ onClose, onSuccess }: AddGameModalProps) {
    const [winner, setWinner] = useState<'civilians' | 'mafia'>('civilians');
    const [referee, setReferee] = useState("");
    const [gameNumber, setGameNumber] = useState<number>(1);
    const [comment, setComment] = useState("");

    // Данные из БД
    const [dbPlayers, setDbPlayers] = useState<DbPlayer[]>([]);
    const [seriesList, setSeriesList] = useState<SeriesItem[]>([]);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>('');

    // Состояния загрузки и ошибок
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Рассадка на 10 слотов
    const [players, setPlayers] = useState<PlayerRow[]>(
        Array.from({ length: 10 }, (_, i) => ({
            slot: i + 1,
            nickname: "",
            role: "citizen",
            score: "1.3",
            extraScore: "0.0",
            ciScore: "0.0",
            penalty: "0.0",
            discPenalty: "0.0"
        }))
    );

    // Первоубиенный и ЛХ
    const [firstKilledSlot, setFirstKilledSlot] = useState<number | null>(null);
    const [bestMove, setBestMove] = useState<[string, string, string]>(["", "", ""]);

    // Загрузка списков игроков и серий из БД
    useEffect(() => {
        async function loadInitialData() {
            // Загружаем зарегистрированных игроков
            const { data: playersData } = await supabase.from('players').select('id, nickname');
            if (playersData) setDbPlayers(playersData);

            // Загружаем доступные серии
            const { data: seriesData } = await supabase
                .from('series')
                .select('id, series_number')
                .order('series_number', { ascending: true });

            if (seriesData && seriesData.length > 0) {
                setSeriesList(seriesData);
                setSelectedSeriesId(seriesData[0].id);
            }
        }
        loadInitialData();
    }, []);

    // Расчет очков за победу/поражение при изменении победителя
    const handleWinnerChange = (newWinner: 'civilians' | 'mafia') => {
        setWinner(newWinner);
        setPlayers(prev => prev.map(p => {
            const isRedRole = p.role === 'citizen' || p.role === 'sheriff';
            const isCivWin = newWinner === 'civilians';
            const isWin = (isCivWin && isRedRole) || (!isCivWin && !isRedRole);
            return { ...p, score: isWin ? "1.3" : "0.3" };
        }));
    };

    // Изменение роли игрока
    const handleRoleChange = (slot: number, newRole: 'citizen' | 'mafia' | 'don' | 'sheriff') => {
        setPlayers(prev => prev.map(p => {
            if (p.slot !== slot) return p;
            const isRed = newRole === 'citizen' || newRole === 'sheriff';
            const isCivWin = winner === 'civilians';
            const isWin = (isCivWin && isRed) || (!isCivWin && !isRed);
            return { ...p, role: newRole, score: isWin ? "1.3" : "0.3" };
        }));
    };

    const updatePlayer = (slot: number, field: keyof PlayerRow, value: string) => {
        setPlayers(prev => prev.map(p => p.slot === slot ? { ...p, [field]: value } : p));
    };

    // Авто-расчет доп. балла за ЛХ
    const calculateBestMoveBonus = () => {
        if (!firstKilledSlot) return "0.0";
        const fkPlayer = players.find(p => p.slot === firstKilledSlot);
        if (!fkPlayer || (fkPlayer.role !== 'citizen' && fkPlayer.role !== 'sheriff')) return "0.0";

        const guessedBlacks = bestMove.filter(slotStr => {
            const num = parseInt(slotStr);
            const target = players.find(p => p.slot === num);
            return target && (target.role === 'mafia' || target.role === 'don');
        }).length;

        if (guessedBlacks === 2) return "0.5";
        if (guessedBlacks === 3) return "0.7";
        return "0.0";
    };

    const bestMoveBonus = calculateBestMoveBonus();

    // Отправка формы в Supabase
    const handleSubmit = async () => {
        try {
            setErrorMsg('');
            setLoading(true);

            if (!selectedSeriesId) {
                throw new Error("Не найдена серия. Пожалуйста, добавьте серию в базу данных.");
            }

            // Проверка: заполнены ли никнеймы во всех 10 слотах
            const emptySlot = players.find(p => !p.nickname.trim());
            if (emptySlot) {
                throw new Error(`Укажите никнейм игрока для слота №${emptySlot.slot}`);
            }

            // Определяем ID первоубиенного игрока в БД
            let firstKilledPlayerId: string | null = null;
            if (firstKilledSlot) {
                const fkNickname = players.find(p => p.slot === firstKilledSlot)?.nickname.trim();
                const found = dbPlayers.find(p => p.nickname.toLowerCase() === fkNickname?.toLowerCase());
                if (found) firstKilledPlayerId = found.id;
            }

            // Преобразуем значение из формы ('civilians' / 'red' -> 'RED', 'mafia' / 'black' -> 'BLACK')
            const formattedWinner = winner === 'civilians' ? 'RED' : 'BLACK';

            // 1. Создаем запись в таблице `games`
            const { data: gameData, error: gameError } = await supabase
                .from('games')
                .insert([{
                    series_id: selectedSeriesId,
                    game_number: Number(gameNumber),
                    winner_team: formattedWinner,
                    first_night_killed_id: firstKilledPlayerId,
                    comments: referee ? `Судья: ${referee}. ${comment}` : comment
                }])
                .select()
                .single();

            if (gameError) throw gameError;

            // 2. Формируем массив записей результатов для `game_results`
            const resultsToInsert = players.map(p => {
                const playerInDb = dbPlayers.find(dbP => dbP.nickname.toLowerCase() === p.nickname.trim().toLowerCase());

                if (!playerInDb) {
                    throw new Error(`Игрок "${p.nickname}" не найден в базе данных. Добавьте его перед созданием игры.`);
                }

                const winPts = parseFloat(p.score) || 0;
                const extraPts = parseFloat(p.extraScore) || 0;
                const penaltyPts = parseFloat(p.penalty) || 0;
                const discPenaltyPts = parseFloat(p.discPenalty) || 0;
                const ciPts = parseFloat(p.ciScore) || 0;
                const bmPts = (p.slot === firstKilledSlot) ? parseFloat(bestMoveBonus) : 0;


                return {
                    game_id: gameData.id,
                    player_id: playerInDb.id,
                    slot_number: p.slot,
                    role: p.role.toUpperCase(),
                    win_points: winPts,
                    extra_points: extraPts,
                    penalty_points: penaltyPts,
                    discipline_penalties: discPenaltyPts,
                    best_move_points: bmPts,
                    compensation_points: ciPts,
                };
            });

            // 3. Записываем результаты в `game_results`
            const { error: resultsError } = await supabase
                .from('game_results')
                .insert(resultsToInsert);

            if (resultsError) throw resultsError;

            if (onSuccess) onSuccess();
            onClose();

        } catch (err: unknown) {
            console.error("Детали ошибки сохранения:", err);
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else if (typeof err === 'object' && err !== null && 'message' in err) {
                setErrorMsg(String((err as { message: unknown }).message));
            } else {
                setErrorMsg("Произошла неизвестная ошибка при сохранении протокола.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto" onClick={onClose}>
            <div className="fixed inset-0 bg-[#04080e]/85 backdrop-blur-md" />

            <div
                className="relative w-full max-w-4xl rounded-2xl border bg-[#0b1622] border-slate-800 shadow-2xl overflow-hidden my-auto z-10 text-slate-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Шапка модалки */}
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#08111a]">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✚</span>
                        <h2 className="text-base font-bold text-slate-100">Внесение новой протокольной игры</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Форма */}
                <div className="p-4 md:p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">

                    {errorMsg && (
                        <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-semibold">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    {/* ВЕРХНЯЯ СЕКЦИЯ: Исход игры, Серия, Игра № и Ведущий */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#070e17] border border-slate-800/60">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Серия</label>
                            <select
                                value={selectedSeriesId}
                                onChange={e => setSelectedSeriesId(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0a1520] border border-slate-800 text-slate-200 outline-none focus:border-sky-500 font-bold"
                            >
                                {seriesList.map(s => (
                                    <option key={s.id} value={s.id}>Серия №{s.series_number}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Номер игры в серии</label>
                            <input
                                type="number"
                                min="1"
                                value={gameNumber}
                                onChange={e => setGameNumber(Number(e.target.value))}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0a1520] border border-slate-800 text-slate-200 outline-none focus:border-sky-500 font-bold"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Победившая команда</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleWinnerChange('civilians')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${winner === 'civilians'
                                        ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.2)]"
                                        : "bg-slate-900 border-slate-800 text-slate-400"
                                        }`}
                                >
                                    🔴 Мирные
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleWinnerChange('mafia')}
                                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${winner === 'mafia'
                                        ? "bg-sky-950/80 border-sky-500 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                                        : "bg-slate-900 border-slate-800 text-slate-400"
                                        }`}
                                >
                                    ⚫ Черные
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Судья / Ведущий</label>
                            <input
                                type="text"
                                placeholder="Ник ведущего"
                                value={referee}
                                onChange={e => setReferee(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl bg-[#0a1520] border border-slate-800 text-slate-200 outline-none focus:border-sky-500"
                            />
                        </div>
                    </div>

                    {/* ТАБЛИЦА РАССАДКИ И РОЛЕЙ */}
                    <div>
                        <h3 className="text-xs font-bold text-slate-300 tracking-wider mb-3">
                            Рассадка игроков и Результаты
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#070e17]">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                                        <th className="py-2.5 px-3 w-10 text-center font-bold">№</th>
                                        <th className="py-2.5 px-3 font-bold">Игрок</th>
                                        <th className="py-2.5 px-3 w-32 font-bold">Роль</th>
                                        <th className="py-2.5 px-2 w-16 text-center font-bold">Балл</th>
                                        <th className="py-2.5 px-2 w-16 text-center font-bold">Допп</th>
                                        <th className="py-2.5 px-2 w-16 text-center font-bold">Ci</th>
                                        <th className="py-2.5 px-2 w-16 text-center font-bold text-rose-400">Штраф</th>
                                        <th className="py-2.5 px-2 w-14 text-center font-bold text-amber-400">! (Дисц)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                    {players.map((p) => (
                                        <tr key={p.slot} className="hover:bg-slate-800/20">
                                            <td className="py-2 px-3 text-center font-bold text-slate-400">{p.slot}</td>
                                            <td className="py-2 px-3">
                                                <input
                                                    type="text"
                                                    list="players-list"
                                                    placeholder={`Игрок #${p.slot}`}
                                                    value={p.nickname}
                                                    onChange={e => updatePlayer(p.slot, 'nickname', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[#0a1520] border border-slate-800 text-slate-100 outline-none focus:border-sky-500"
                                                />
                                            </td>
                                            <td className="py-2 px-3">
                                                <select
                                                    value={p.role}
                                                    onChange={e => handleRoleChange(p.slot, e.target.value as PlayerRow['role'])}
                                                    className={`w-full px-2 py-1.5 text-xs rounded-lg bg-[#0a1520] border outline-none font-semibold ${p.role === 'sheriff' ? 'text-amber-400 border-amber-500/40' :
                                                            p.role === 'don' ? 'text-sky-400 border-sky-500/40' :
                                                                p.role === 'mafia' ? 'text-rose-400 border-rose-500/40' : 'text-slate-300 border-slate-800'
                                                        }`}
                                                >
                                                    <option value="citizen">🔴 Мирный</option>
                                                    <option value="sheriff">⭐ Шериф</option>
                                                    <option value="mafia">🔫 Мафия</option>
                                                    <option value="don">🎩 Дон</option>
                                                </select>
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="text"
                                                    value={p.score}
                                                    onChange={e => updatePlayer(p.slot, 'score', e.target.value)}
                                                    className="w-full text-center py-1.5 rounded-lg bg-[#0a1520] border border-slate-800 font-mono font-bold text-slate-200"
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="text"
                                                    value={p.extraScore}
                                                    onChange={e => updatePlayer(p.slot, 'extraScore', e.target.value)}
                                                    className="w-full text-center py-1.5 rounded-lg bg-[#0a1520] border border-slate-800 font-mono text-emerald-400 font-semibold"
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="text"
                                                    value={p.ciScore}
                                                    onChange={e => updatePlayer(p.slot, 'ciScore', e.target.value)}
                                                    className="w-full text-center py-1.5 rounded-lg bg-[#0a1520] border border-slate-800 font-mono text-sky-400"
                                                />
                                            </td>
                                            <td className="py-2 px-2">
                                                <input
                                                    type="text"
                                                    value={p.penalty}
                                                    onChange={e => updatePlayer(p.slot, 'penalty', e.target.value)}
                                                    className="w-full text-center py-1.5 rounded-lg bg-[#0a1520] border border-slate-800 font-mono text-rose-400"
                                                />
                                            </td>
                                            <td className="py-2 px-1.5">
                                                <input
                                                    type="text"
                                                    value={p.discPenalty}
                                                    onChange={e => updatePlayer(p.slot, 'discPenalty', e.target.value)}
                                                    className="w-full text-center py-1.5 rounded-lg bg-[#0a1520] border border-slate-800 font-mono text-amber-400"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <datalist id="players-list">
                                {dbPlayers.map(p => (
                                    <option key={p.id} value={p.nickname} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {/* ПЕРВОУБИЕННЫЙ И ЛУЧШИЙ ХОД */}
                    <div className="p-4 rounded-xl bg-[#070e17] border border-slate-800/60 space-y-4">
                        <h4 className="text-xs font-bold text-slate-300 tracking-wider">
                            Первоубиенный игрок и Лучший ход (ЛХ)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Слот первоубиенного</label>
                                <select
                                    value={firstKilledSlot ?? ""}
                                    onChange={e => setFirstKilledSlot(e.target.value ? Number(e.target.value) : null)}
                                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#0a1520] border border-slate-800 text-slate-200 outline-none"
                                >
                                    <option value="">Не выбрано</option>
                                    {players.map(p => (
                                        <option key={p.slot} value={p.slot}>
                                            Слот #{p.slot} {p.nickname ? `(${p.nickname})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1">Версия ЛХ (3 цифры)</label>
                                <div className="flex gap-2">
                                    {[0, 1, 2].map((idx) => (
                                        <input
                                            key={idx}
                                            type="number"
                                            min="1"
                                            max="10"
                                            placeholder={`№${idx + 1}`}
                                            value={bestMove[idx]}
                                            onChange={e => {
                                                const newBm = [...bestMove] as [string, string, string];
                                                newBm[idx] = e.target.value;
                                                setBestMove(newBm);
                                            }}
                                            className="w-full text-center py-2 text-xs rounded-xl bg-[#0a1520] border border-slate-800 text-slate-100 font-bold outline-none focus:border-emerald-500"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="p-3 rounded-xl bg-[#0a1520] border border-slate-800/80 flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-400">Балл ЛХ:</span>
                                <span className="text-sm font-extrabold font-mono text-emerald-400">
                                    +{bestMoveBonus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* КОММЕНТАРИИ К ИГРЕ */}
                    <div>
                        <label className="block text-xs font-bold text-slate-300 tracking-wider mb-2">
                            Комментарии к игре
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Опишите ключевые моменты партии..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="w-full px-3 py-2.5 text-xs rounded-xl bg-[#070e17] border border-slate-800 text-slate-200 outline-none focus:border-sky-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Подвал формы */}
                <div className="px-6 py-4 border-t border-slate-800/80 bg-[#08111a] flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? "Сохранение..." : "Сохранить протокол"}
                    </button>
                </div>
            </div>
        </div>
    );
}