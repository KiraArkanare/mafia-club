'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

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

// Форматирование: показывает сотые доли (1.25), если они есть, и целые числа без лишних нулей
function formatNumber(num: number): string {
    if (Number.isInteger(num)) return num.toString();
    const fixed = num.toFixed(2);
    return fixed.endsWith('0') ? num.toFixed(1) : fixed;
}

interface DbSeason {
    id: string;
    name: string;
    status: string;
}

interface DbSeries {
    id: string;
    series_number: number;
    season_id: string;
}

interface RawResult {
    player_id: string;
    win_points: number;
    extra_points: number;
    penalty_points: number;
    discipline_penalties: number;
    best_move_points: number;
    compensation_points: number;
    total_game_score: number;
    role: string;
    player: {
        nickname: string;
        avatar_url?: string | null; // Укажите имя колонки из вашей БД (например, avatar_url или avatar)
    } | null;
    game: {
        winner_team: string;
        series_id: string;
        first_night_killed_id: string | null;
    } | null;
}

interface FormattedPlayer {
    rank: number;
    change: number;
    id: string;
    name: string;
    avatarUrl?: string | null;
    score: string;
    extraSum: string;
    penalty: string;
    extraAdd: string;
    ci: string;
    win: string;
    don: string;
    sheriff: string;
    kill: string;
    games: number;
    rawScore: number;
    rawExtraSum: number;
    rawWin: number;
}

const LEGEND_ITEMS = [
    { code: "Баллы", desc: "Сумма баллов (топ-4 серии в общем)" },
    { code: "Σ (+/-)", desc: "Сумма доп. баллов (Допп - Штрафы)" },
    { code: "!", desc: "Дисциплинарные штрафы" },
    { code: "Лх", desc: "Баллы за лучший ход" },
    { code: "Ci", desc: "Компенсационные баллы" },
    { code: "П", desc: "Победы" },
    { code: "Д", desc: "Победы на Доне" },
    { code: "Ш", desc: "Победы на Шерифе" },
    { code: "У", desc: "Убийств в первую ночь" },
];

const QUALIFICATION_LIMIT = 16;

export default function RatingPage() {
    const [seasons, setSeasons] = useState<DbSeason[]>([]);
    const [seriesList, setSeriesList] = useState<DbSeries[]>([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
    const [selectedSeriesId, setSelectedSeriesId] = useState<string>("all");

    const [isSeasonOpen, setIsSeasonOpen] = useState(false);
    const [isSeriesOpen, setIsSeriesOpen] = useState(false);

    const [rawResults, setRawResults] = useState<RawResult[]>([]);
    const [loading, setLoading] = useState(true);

    const loadSeasonData = useCallback(async (seasonId: string) => {
        const { data: sData } = await supabase
            .from('series')
            .select('id, series_number, season_id')
            .eq('season_id', seasonId)
            .order('series_number', { ascending: true });

        if (sData) setSeriesList(sData);

        const { data: rData } = await supabase
            .from('game_results')
            .select(`
                player_id,
                win_points,
                extra_points,
                penalty_points,
                discipline_penalties,
                best_move_points,
                compensation_points,
                total_game_score,
                role,
                player:players(nickname, avatar_url),
                game:games!inner(
                    winner_team,
                    series_id,
                    first_night_killed_id,
                    series:series!inner(season_id)
                )
            `)
            .eq('game.series.season_id', seasonId);

        if (rData) {
            setRawResults(rData as unknown as RawResult[]);
        } else {
            setRawResults([]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        const initLoad = async () => {
            const { data, error } = await supabase
                .from('seasons')
                .select('id, name, status')
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Ошибка загрузки сезонов:", error);
                setLoading(false);
                return;
            }

            if (data && data.length > 0) {
                setSeasons(data);
                const active = data.find(s => s.status === 'ACTIVE') || data[0];
                setSelectedSeasonId(active.id);
                await loadSeasonData(active.id);
            } else {
                setLoading(false);
            }
        };

        initLoad();
    }, [loadSeasonData]);

    const handleSelectSeason = (seasonId: string) => {
        setLoading(true);
        setSelectedSeasonId(seasonId);
        setSelectedSeriesId("all");
        setIsSeasonOpen(false);
        loadSeasonData(seasonId);
    };

    const playersRating = useMemo(() => {
        if (rawResults.length === 0) return [];

        const filteredResults = selectedSeriesId === "all"
            ? rawResults
            : rawResults.filter(r => r.game?.series_id === selectedSeriesId);

        const playerMap: Record<string, {
            name: string;
            avatarUrl: string | null;
            games: number;
            seriesScores: Record<string, number>;
            allGamesTotalScore: number;
            extraSum: number;
            discPenalties: number;
            bestMove: number;
            ci: number;
            wins: number;
            donWins: number;
            sheriffWins: number;
            kills: number;
        }> = {};

        filteredResults.forEach((r) => {
            const pId = r.player_id;
            const pName = r.player?.nickname || 'Неизвестный';
            const pAvatar = r.player?.avatar_url || null;
            const seriesId = r.game?.series_id || 'unknown';

            if (!playerMap[pId]) {
                playerMap[pId] = {
                    name: pName,
                    avatarUrl: pAvatar,
                    games: 0,
                    seriesScores: {},
                    allGamesTotalScore: 0,
                    extraSum: 0,
                    discPenalties: 0,
                    bestMove: 0,
                    ci: 0,
                    wins: 0,
                    donWins: 0,
                    sheriffWins: 0,
                    kills: 0,
                };
            }

            const p = playerMap[pId];
            p.games += 1;

            const winPts = Number(r.win_points || 0);
            const extraPts = Number(r.extra_points || 0);
            const bmPts = Number(r.best_move_points || 0);
            const ciPts = Number(r.compensation_points || 0);
            const penPts = Number(r.penalty_points || 0);
            const discPts = Number(r.discipline_penalties || 0);

            // Итоговый балл за игру
            const gameTotal = r.total_game_score !== undefined && r.total_game_score !== null
                ? Number(r.total_game_score)
                : (winPts + extraPts + bmPts + ciPts - penPts - discPts);

            p.allGamesTotalScore += gameTotal;
            p.seriesScores[seriesId] = (p.seriesScores[seriesId] || 0) + gameTotal;

            // 1. Σ (+/-) = чисто Допп балл - Обычный штраф
            p.extraSum += (extraPts - penPts);

            // 2. ! = Дисциплинарные штрафы
            p.discPenalties += discPts;

            p.bestMove += bmPts;
            p.ci += ciPts;

            // 3. У (Убийства) = проверяем совпадение с first_night_killed_id
            if (r.game?.first_night_killed_id && r.game.first_night_killed_id === pId) {
                p.kills += 1;
            }

            // 4. Победы
            const normRole = (r.role || '').toUpperCase();
            const normWinner = (r.game?.winner_team || '').toUpperCase();

            const isRedRole = normRole === 'CITIZEN' || normRole === 'SHERIFF';
            const isBlackRole = normRole === 'MAFIA' || normRole === 'DON';

            const isRedWin = normWinner === 'RED' || normWinner === 'CIVILIANS';
            const isBlackWin = normWinner === 'BLACK' || normWinner === 'MAFIA';

            const isWin = (isRedRole && isRedWin) || (isBlackRole && isBlackWin);

            if (isWin) {
                p.wins += 1;
                if (normRole === 'DON') p.donWins += 1;
                if (normRole === 'SHERIFF') p.sheriffWins += 1;
            }
        });

        const resultList: FormattedPlayer[] = Object.entries(playerMap).map(([pId, p]) => {
            let finalScore = 0;

            if (selectedSeriesId === "all") {
                const sortedSeriesSums = Object.values(p.seriesScores).sort((a, b) => b - a);
                const best4Series = sortedSeriesSums.slice(0, 4);
                finalScore = best4Series.reduce((acc, curr) => acc + curr, 0);
            } else {
                finalScore = p.allGamesTotalScore;
            }

            return {
                rank: 0,
                change: 0,
                id: pId,
                name: p.name,
                avatarUrl: p.avatarUrl,
                score: formatNumber(finalScore),
                extraSum: formatNumber(p.extraSum),
                penalty: formatNumber(p.discPenalties),
                extraAdd: formatNumber(p.bestMove),
                ci: formatNumber(p.ci),
                win: p.wins.toString(),
                don: p.donWins.toString(),
                sheriff: p.sheriffWins.toString(),
                kill: p.kills.toString(),
                games: p.games,
                rawScore: finalScore,
                rawExtraSum: p.extraSum,
                rawWin: p.wins
            };
        });

        resultList.sort((a, b) => {
            if (b.rawScore !== a.rawScore) return b.rawScore - a.rawScore;
            if (b.rawExtraSum !== a.rawExtraSum) return b.rawExtraSum - a.rawExtraSum;
            return b.rawWin - a.rawWin;
        });

        return resultList.map((p, idx) => ({ ...p, rank: idx + 1 }));
    }, [rawResults, selectedSeriesId]);

    const currentSeasonObj = seasons.find(s => s.id === selectedSeasonId);
    const seasonLabel = currentSeasonObj
        ? `${currentSeasonObj.name}${currentSeasonObj.status === 'ACTIVE' ? ' (Активен)' : ''}`
        : "Выбор сезона";

    const seriesLabel = selectedSeriesId === "all"
        ? "Общий рейтинг"
        : `Серия ${seriesList.find(s => s.id === selectedSeriesId)?.series_number || ''}`;

    return (
        <div className="min-h-screen flex flex-col relative overflow-y-scroll" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>
            <div
                className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />
            <div
                className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, rgba(56,189,248,0.1) 70%, transparent 100%)" }}
            />

            <Header />

            <main className="pt-20 md:pt-24 pb-12 px-4 md:px-8 max-w-6xl mx-auto w-full flex-1 relative z-10">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5 px-1">
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
                            <span>{seasonLabel}</span>
                            <ChevronDownIcon isOpen={isSeasonOpen} />
                        </button>

                        {isSeasonOpen && (
                            <div
                                className="absolute left-0 mt-2 w-52 rounded-xl border py-1 z-30 shadow-2xl"
                                style={{
                                    background: "#0d1a29",
                                    borderColor: "rgba(52,211,153,0.3)",
                                    backdropFilter: "blur(12px)"
                                }}
                            >
                                {seasons.map((s) => {
                                    const label = `${s.name}${s.status === 'ACTIVE' ? ' (Активен)' : ''}`;
                                    const isSelected = selectedSeasonId === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => handleSelectSeason(s.id)}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${isSelected ? "text-emerald-400 bg-emerald-950/30" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                                }`}
                                        >
                                            <span>{label}</span>
                                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

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
                            <span>{seriesLabel}</span>
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
                                <button
                                    onClick={() => {
                                        setSelectedSeriesId("all");
                                        setIsSeriesOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${selectedSeriesId === "all" ? "text-sky-400 bg-sky-950/30" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                        }`}
                                >
                                    <span>Общий рейтинг</span>
                                    {selectedSeriesId === "all" && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                                </button>

                                {seriesList.map((s) => {
                                    const label = `Серия ${s.series_number}`;
                                    const isSelected = selectedSeriesId === s.id;
                                    return (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setSelectedSeriesId(s.id);
                                                setIsSeriesOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-between ${isSelected ? "text-sky-400 bg-sky-950/30" : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                                                }`}
                                        >
                                            <span>{label}</span>
                                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    className="rounded-2xl border overflow-hidden mb-6"
                    style={{
                        background: "linear-gradient(145deg, rgba(13,22,33,0.95) 0%, rgba(8,16,25,0.98) 100%)",
                        borderColor: "rgba(52,211,153,0.2)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                    }}
                >
                    <div className="overflow-x-auto max-h-[520px] overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse table-fixed">
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

                            <thead className="sticky top-0 z-20" style={{ background: "#0b1522" }}>
                                <tr className="text-slate-400 text-xs border-b border-slate-800">
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">Место</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">Игрок</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center text-slate-100">Баллы</th>
                                    <th colSpan={3} className="py-1 font-bold text-center border-b border-slate-800 text-slate-300">
                                        Допп баллы
                                    </th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">Ci</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center text-emerald-400">П</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">Д</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">Ш</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">У</th>
                                    <th rowSpan={2} className="py-2.5 font-bold text-center">Игры</th>
                                </tr>
                                <tr className="text-[10px] text-slate-400 font-mono border-b border-slate-800">
                                    <th className="py-1 text-center">Σ (+/-)</th>
                                    <th className="py-1 text-center text-rose-400">!</th>
                                    <th className="py-1 text-center">Лх</th>
                                </tr>
                            </thead>

                            <tbody className="text-xs md:text-sm divide-y divide-slate-800/40">
                                {loading ? (
                                    <tr>
                                        <td colSpan={12} className="py-12 text-center text-xs text-slate-500 font-semibold animate-pulse">
                                            Загрузка результатов из базы данных...
                                        </td>
                                    </tr>
                                ) : playersRating.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="py-12 text-center text-xs text-slate-400">
                                            В этой категории пока нет сыгранных игр.
                                        </td>
                                    </tr>
                                ) : (
                                    playersRating.map((player, index) => {
                                        const isGeneralView = selectedSeriesId === "all";
                                        const isQualified = player.games >= QUALIFICATION_LIMIT;
                                        const prevQualified = index > 0 ? playersRating[index - 1].games >= QUALIFICATION_LIMIT : true;
                                        const showDivider = isGeneralView && !isQualified && prevQualified;

                                        return (
                                            <React.Fragment key={player.id}>
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

                                                <tr className="group hover:bg-slate-800/30 transition-colors">
                                                    <td className="py-2.5 text-center font-bold relative">
                                                        <span className={
                                                            player.rank === 1 ? "text-amber-400" :
                                                                player.rank === 2 ? "text-slate-300" :
                                                                    player.rank === 3 ? "text-amber-600" :
                                                                        player.rank <= 5 ? "text-emerald-400" : "text-slate-500"
                                                        }>
                                                            {player.rank}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="flex items-center justify-start gap-2.5">
                                                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-[11px] font-semibold text-slate-300 flex-shrink-0 overflow-hidden">
                                                                {player.avatarUrl ? (
                                                                    <img
                                                                        src={player.avatarUrl}
                                                                        alt={player.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    player.name[0]
                                                                )}
                                                            </div>
                                                            <span className="font-semibold text-slate-200 group-hover:text-sky-400 transition-colors truncate">
                                                                {player.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2.5 text-center font-bold text-slate-100">{player.score}</td>
                                                    <td className="py-2.5 text-center text-slate-300 font-mono text-xs">{player.extraSum}</td>
                                                    <td className="py-2.5 text-center text-rose-400 font-mono text-xs font-semibold">{player.penalty}</td>
                                                    <td className="py-2.5 text-center text-slate-300 font-mono text-xs">{player.extraAdd}</td>
                                                    <td className="py-2.5 text-center text-slate-400 font-mono text-xs">{player.ci}</td>
                                                    <td className="py-2.5 text-center text-emerald-400 font-semibold">{player.win}</td>
                                                    <td className="py-2.5 text-center text-slate-300 text-xs">{player.don}</td>
                                                    <td className="py-2.5 text-center text-slate-300 text-xs">{player.sheriff}</td>
                                                    <td className="py-2.5 text-center text-slate-300 text-xs">{player.kill}</td>
                                                    <td className="py-2.5 text-center font-bold text-slate-200">{player.games}</td>
                                                </tr>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div
                    className="rounded-2xl p-4 md:p-5"
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