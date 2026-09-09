'use client';

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabase";

const basePath = process.env.NODE_ENV === 'production' ? '/mafia-club' : '';

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

interface PlayerSlot {
    slot: number;
    playerId: string;
    name: string;
    role: string;
    totalScore: number;
    totalScoreFormatted: string;
    extra: string;
    disc: string;
}

interface PlayerGameRecord {
    id: string;
    gameNumber: number;
    seriesNumber: number;
    date: string;
    winner: string;
    referee: string;
    comment: string;
    playerRole: string;
    playerScore: number;
    firstNightKilledId?: string | null;
    players: PlayerSlot[];
}

interface DbGameResult {
    player_id: string;
    slot_number: number;
    role: string;
    win_points: number;
    extra_points: number;
    best_move_points: number;
    compensation_points: number;
    penalty_points: number;
    discipline_penalties: number;
    total_game_score?: number;
    player: { nickname: string } | null;
}

interface DbGame {
    id: string;
    game_number: number;
    winner_team: string;
    comments: string | null;
    first_night_killed_id: string | null;
    series: { series_number: number; date: string } | null;
    results: DbGameResult[];
}

const GAMES_PER_PAGE = 5;

function formatNumber(num: number): string {
    if (Number.isInteger(num)) return num.toString();
    const fixed = num.toFixed(2);
    return fixed.endsWith('0') ? num.toFixed(1) : fixed;
}

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

function RoleIcon({ role }: { role: string }) {
    const normalizedRole = role.toLowerCase();
    if (normalizedRole === 'citizen') return null;

    const iconPaths: Record<string, string> = {
        sheriff: `${basePath}/roles/sheriff.png`,
        don: `${basePath}/roles/don.png`,
        mafia: `${basePath}/roles/mafia.png`,
    };

    const src = iconPaths[normalizedRole];
    if (!src) return null;

    return (
        <div className="w-5 h-5 relative mx-auto flex items-center justify-center">
            <Image
                src={src}
                alt={normalizedRole}
                width={20}
                height={20}
                className="object-contain"
                unoptimized
            />
        </div>
    );
}

function getRoleLabel(role: string): string {
    const normalized = role.toLowerCase();
    switch (normalized) {
        case 'citizen':
        case 'red':
            return 'Мирный';
        case 'sheriff':
            return 'Шериф';
        case 'mafia':
        case 'black':
            return 'Мафия';
        case 'don':
            return 'Дон';
        default:
            return role;
    }
}

function DoubleDonutChart({
    winRate,
    roleGames
}: {
    winRate: number;
    roleGames: { citizen: number; sheriff: number; mafia: number; don: number }
}) {
    const rOuter = 42;
    const cOuter = 2 * Math.PI * rOuter;
    const offsetOuter = cOuter - (winRate / 100) * cOuter;

    const rInner = 30;
    const cInner = 2 * Math.PI * rInner;

    const totalGames = roleGames.citizen + roleGames.sheriff + roleGames.mafia + roleGames.don;

    const segments = useMemo(() => {
        if (totalGames === 0) return [];

        const roles = [
            { key: 'citizen', count: roleGames.citizen, color: '#34d399' },
            { key: 'sheriff', count: roleGames.sheriff, color: '#fbbf24' },
            { key: 'mafia', count: roleGames.mafia, color: '#38bdf8' },
            { key: 'don', count: roleGames.don, color: '#c084fc' },
        ];

        const activeRoles = roles.filter(r => r.count > 0);
        const gapSize = activeRoles.length > 1 ? 3 : 0;
        const availableCircumference = cInner - (gapSize * activeRoles.length);

        let currentOffset = 0;
        return roles.map(role => {
            if (role.count === 0) return null;

            const pct = role.count / totalGames;
            const strokeLength = pct * availableCircumference;
            const dashArray = `${strokeLength} ${cInner - strokeLength}`;
            const dashOffset = -currentOffset;

            currentOffset += strokeLength + gapSize;

            return { ...role, dashArray, dashOffset };
        }).filter(Boolean);
    }, [roleGames, totalGames, cInner]);

    return (
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={rOuter} strokeWidth="5" className="text-slate-800/60" stroke="currentColor" fill="transparent" />
                <circle
                    cx="50"
                    cy="50"
                    r={rOuter}
                    strokeWidth="5"
                    strokeDasharray={cOuter}
                    strokeDashoffset={offsetOuter}
                    strokeLinecap="round"
                    stroke="url(#winrate-gradient)"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                />

                <circle cx="50" cy="50" r={rInner} strokeWidth="4" className="text-slate-900/80" stroke="currentColor" fill="transparent" />

                {segments.map((s) => s && (
                    <circle
                        key={s.key}
                        cx="50"
                        cy="50"
                        r={rInner}
                        strokeWidth="4"
                        strokeDasharray={s.dashArray}
                        strokeDashoffset={s.dashOffset}
                        strokeLinecap="round"
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
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-sky-950/40 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-2xl shadow-[0_0_20px_rgba(56,189,248,0.15)] flex-shrink-0">
            {letter}
        </div>
    );
}

export default function PlayerClient() {
    const params = useParams();
    const playerId = params.id as string;

    const [profile, setProfile] = useState<PlayerProfile | null>(null);
    const [awards, setAwards] = useState<PlayerAward[]>([]);
    const [playerGames, setPlayerGames] = useState<PlayerGameRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

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
                    awards ( title, icon_url, description )
                `)
                .eq('player_id', playerId);

            if (aData) setAwards(aData as unknown as PlayerAward[]);

            // 3. Получаем только ID игр, в которых участвовал данный игрок
            const { data: userGameResults } = await supabase
                .from('game_results')
                .select('game_id')
                .eq('player_id', playerId);

            if (userGameResults && userGameResults.length > 0) {
                const gameIds = userGameResults.map(g => g.game_id);

                // Загружаем полные данные протокола для этих игр
                const { data: gamesData } = await supabase
                    .from('games')
                    .select(`
                        id,
                        game_number,
                        winner_team,
                        comments,
                        first_night_killed_id,
                        created_at,
                        series:series!inner(series_number, date),
                        results:game_results(
                            player_id,
                            slot_number,
                            role,
                            win_points,
                            extra_points,
                            best_move_points,
                            compensation_points,
                            penalty_points,
                            discipline_penalties,
                            total_game_score,
                            player:players(nickname)
                        )
                    `)
                    .in('id', gameIds)
                    .order('created_at', { ascending: false });

                if (gamesData) {
                    const rawGames = gamesData as unknown as DbGame[];

                    const formatted: PlayerGameRecord[] = rawGames.map((game) => {
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

                        let currPlayerRole = "—";
                        let currPlayerScore = 0;

                        const sortedPlayers: PlayerSlot[] = (game.results || [])
                            .sort((a, b) => a.slot_number - b.slot_number)
                            .map((r) => {
                                const winPts = Number(r.win_points || 0);
                                const extraPts = Number(r.extra_points || 0);
                                const bmPts = Number(r.best_move_points || 0);
                                const ciPts = Number(r.compensation_points || 0);
                                const penPts = Number(r.penalty_points || 0);
                                const discPts = Number(r.discipline_penalties || 0);

                                const computedTotal = r.total_game_score !== undefined && r.total_game_score !== null
                                    ? Number(r.total_game_score)
                                    : (winPts + extraPts + bmPts + ciPts - penPts - discPts);

                                const netExtra = extraPts + bmPts + ciPts - penPts;
                                const formattedExtra = formatNumber(Math.abs(netExtra));
                                const extraSign = netExtra >= 0 ? '+' : '-';

                                if (r.player_id === playerId) {
                                    currPlayerRole = r.role;
                                    currPlayerScore = computedTotal;
                                }

                                return {
                                    slot: r.slot_number,
                                    playerId: r.player_id,
                                    name: r.player?.nickname || 'Неизвестный',
                                    role: r.role,
                                    totalScore: computedTotal,
                                    totalScoreFormatted: formatNumber(computedTotal),
                                    extra: netExtra === 0 ? '0' : `${extraSign}${formattedExtra}`,
                                    disc: formatNumber(discPts)
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
                            playerRole: currPlayerRole,
                            playerScore: currPlayerScore,
                            firstNightKilledId: game.first_night_killed_id,
                            players: sortedPlayers
                        };
                    });

                    setPlayerGames(formatted);
                }
            }

            setLoading(false);
        }

        fetchPlayerData();
    }, [playerId]);

    // Расчет статистики WinRate и ролей
    const stats = useMemo(() => {
        const total = playerGames.length;
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

        playerGames.forEach((g) => {
            totalScoreSum += g.playerScore;

            const role = (g.playerRole || '').toUpperCase();
            const winnerTeam = (g.winner || '').toUpperCase();

            const isRedRole = role === 'CITIZEN' || role === 'RED';
            const isSheriff = role === 'SHERIFF';
            const isMafia = role === 'MAFIA' || role === 'BLACK';
            const isDon = role === 'DON';

            if (g.firstNightKilledId === playerId) {
                fnKills += 1;
            }

            if (isRedRole || isSheriff) redGamesCount += 1;
            if (isMafia || isDon) blackGamesCount += 1;

            const isRedWin = winnerTeam === 'RED' || winnerTeam === 'CIVILIANS';
            const isBlackWin = winnerTeam === 'BLACK' || winnerTeam === 'MAFIA';

            const isWin = ((isRedRole || isSheriff) && isRedWin) || ((isMafia || isDon) && isBlackWin);

            if (isWin) totalWins += 1;

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
    }, [playerGames, playerId]);

    const totalPages = Math.ceil(playerGames.length / GAMES_PER_PAGE);
    const paginatedGames = useMemo(() => {
        const start = (currentPage - 1) * GAMES_PER_PAGE;
        return playerGames.slice(start, start + GAMES_PER_PAGE);
    }, [playerGames, currentPage]);

    const toggleGame = (id: string) => {
        setExpandedGameId(expandedGameId === id ? null : id);
    };

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
        <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#070d14", fontFamily: "var(--font-body)" }}>

            <div
                className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(52,211,153,0.1) 70%, transparent 100%)" }}
            />
            <div
                className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.4) 0%, rgba(56,189,248,0.1) 70%, transparent 100%)" }}
            />

            <Header />

            <main className="flex-1 max-w-5xl w-full mx-auto px-4 pt-24 pb-20 relative z-10">

                <div
                    className="rounded-2xl p-6 md:p-8 border flex flex-col gap-8"
                    style={{
                        background: "linear-gradient(145deg, rgba(13,22,33,0.95) 0%, rgba(8,16,25,0.98) 100%)",
                        borderColor: "rgba(52,211,153,0.2)",
                        boxShadow: "0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                        backdropFilter: "blur(12px)"
                    }}
                >

                    {/* ВЕРХНИЙ БЛОК: Профиль + WinRate */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-5 flex flex-col gap-5">
                            <div className="flex items-start gap-4 pb-5 border-b border-slate-800/80">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.nickname}
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 rounded-2xl object-cover border border-sky-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)] flex-shrink-0"
                                    />
                                ) : (
                                    <DefaultAvatar name={profile.nickname} />
                                )}

                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl font-black text-slate-100 tracking-tight truncate">
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

                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-[#08111a] px-3.5 py-2.5 rounded-xl border border-slate-800/80">
                                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Всего игр</div>
                                    <div className="text-lg font-black text-slate-100 mt-0.5">{stats.totalGames}</div>
                                </div>

                                <div className="bg-[#08111a] px-3.5 py-2.5 rounded-xl border border-slate-800/80">
                                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Ср. балл за игру</div>
                                    <div className="text-lg font-black text-emerald-400 mt-0.5">{stats.avgScore}</div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-5">
                            <div className="text-xs font-bold text-slate-300 tracking-wide pb-2 border-b border-slate-800/80 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Статистика WinRate
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#08111a] p-4 rounded-xl border border-slate-800/80">
                                <DoubleDonutChart
                                    winRate={stats.overallWinRate}
                                    roleGames={{
                                        citizen: stats.roles.citizen.total,
                                        sheriff: stats.roles.sheriff.total,
                                        mafia: stats.roles.mafia.total,
                                        don: stats.roles.don.total,
                                    }}
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                                    <div className="bg-[#0d1a29] p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#34d399] flex-shrink-0 shadow-[0_0_6px_#34d399]" />
                                            <span className="text-xs font-semibold text-slate-300">Мирный</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-100">
                                            {stats.roles.citizen.winRate}%
                                            <span className="text-[10px] text-slate-400 ml-1 font-normal">({stats.roles.citizen.wins}/{stats.roles.citizen.total})</span>
                                        </span>
                                    </div>

                                    <div className="bg-[#0d1a29] p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] flex-shrink-0 shadow-[0_0_6px_#38bdf8]" />
                                            <span className="text-xs font-semibold text-slate-300">Мафия</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-100">
                                            {stats.roles.mafia.winRate}%
                                            <span className="text-[10px] text-slate-400 ml-1 font-normal">({stats.roles.mafia.wins}/{stats.roles.mafia.total})</span>
                                        </span>
                                    </div>

                                    <div className="bg-[#0d1a29] p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24] flex-shrink-0 shadow-[0_0_6px_#fbbf24]" />
                                            <span className="text-xs font-semibold text-slate-300">Шериф</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-100">
                                            {stats.roles.sheriff.winRate}%
                                            <span className="text-[10px] text-slate-400 ml-1 font-normal">({stats.roles.sheriff.wins}/{stats.roles.sheriff.total})</span>
                                        </span>
                                    </div>

                                    <div className="bg-[#0d1a29] p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc] flex-shrink-0 shadow-[0_0_6px_#c084fc]" />
                                            <span className="text-xs font-semibold text-slate-300">Дон</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-slate-100">
                                            {stats.roles.don.winRate}%
                                            <span className="text-[10px] text-slate-400 ml-1 font-normal">({stats.roles.don.wins}/{stats.roles.don.total})</span>
                                        </span>
                                    </div>

                                    <div className="sm:col-span-2 bg-[#0d1a29] p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs">💀</span>
                                            <span className="text-xs font-semibold text-slate-300">Смерть в 1-ю ночь</span>
                                        </div>
                                        <span className="text-xs font-extrabold text-rose-400">
                                            {stats.firstNightKillRate}%
                                            <span className="text-[10px] text-slate-400 ml-1 font-normal">({stats.firstNightKills} раз)</span>
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#08111a] p-4 rounded-xl border border-slate-800/80">
                                <div className="flex justify-between items-center text-xs font-bold mb-2.5">
                                    <span className="text-emerald-400 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                                        Красные ({stats.redTeamRatio}%)
                                    </span>
                                    <span className="text-sky-400 flex items-center gap-1.5">
                                        Чёрные ({stats.blackTeamRatio}%)
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                                    </span>
                                </div>
                                <div className="w-full h-2.5 rounded-full bg-slate-900 p-0.5 border border-slate-800 flex overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-l-full transition-all duration-700 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                                        style={{ width: `${stats.redTeamRatio}%` }}
                                    />
                                    <div
                                        className="h-full bg-gradient-to-r from-sky-400 to-sky-500 rounded-r-full transition-all duration-700 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                                        style={{ width: `${stats.blackTeamRatio}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* СРЕДНИЙ БЛОК: НАГРАДЫ И ДОСТИЖЕНИЯ */}
                    <div className="pt-4 border-t border-slate-800/80">
                        <div className="text-xs font-bold text-slate-300 tracking-wide mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                            Награды и достижения
                        </div>

                        {awards.length === 0 ? (
                            <div className="text-xs text-slate-500 py-3 px-4 rounded-xl bg-[#08111a] border border-slate-800/80 flex items-center gap-2">
                                <span>🏆</span>
                                <span>У игрока пока нет полученных наград</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                {awards.map((a) => (
                                    <div
                                        key={a.id}
                                        className="bg-[#08111a] border border-slate-800 p-3.5 rounded-xl flex flex-col items-center text-center group hover:border-sky-500/40 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700 flex items-center justify-center text-sky-400 text-base mb-2 font-black shadow-[0_0_10px_rgba(56,189,248,0.15)]">
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

                    {/* НИЖНИЙ БЛОК: ИСТОРИЯ ИГР С ТАБЛИЦЕЙ ПРОТОКОЛА */}
                    <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                История игр ({stats.totalGames})
                            </div>

                            {totalPages > 1 && (
                                <div className="text-[11px] font-semibold text-slate-500">
                                    Страница {currentPage} из {totalPages}
                                </div>
                            )}
                        </div>

                        {playerGames.length === 0 ? (
                            <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-xl bg-[#08111a]/50">
                                Данный игрок еще не участвовал в зарегистрированных играх.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2.5">
                                    {paginatedGames.map((game) => {
                                        const isOpen = expandedGameId === game.id;
                                        const isCivsWin = game.winner === 'RED' || game.winner === 'civilians';

                                        return (
                                            <div
                                                key={game.id}
                                                className="rounded-xl border transition-all duration-200 overflow-hidden relative"
                                                style={{
                                                    background: isOpen ? "#0b1622" : "#08111a",
                                                    borderColor: isOpen ? "rgba(56,189,248,0.3)" : "rgba(20,32,48,0.8)",
                                                }}
                                            >
                                                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isCivsWin ? "bg-emerald-400" : "bg-sky-400"}`} />

                                                <button
                                                    onClick={() => toggleGame(game.id)}
                                                    className="w-full pl-5 pr-4 py-3 flex items-center justify-between gap-4 text-left hover:bg-slate-800/20 transition-colors cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs md:text-sm font-bold text-slate-100">
                                                            Игра #{game.gameNumber} <span className="text-xs text-slate-500 font-normal">(Серия #{game.seriesNumber})</span>
                                                        </span>
                                                        <span className="text-[10px] md:text-[11px] text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800/80">
                                                            {game.date}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {/* Итоговый балл конкретно этого игрока за партию */}
                                                        <div className="text-right">
                                                            <div className={`text-xs font-black ${game.playerScore >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                                                                {formatNumber(game.playerScore)} балла
                                                            </div>
                                                            <div className="text-[10px] text-slate-500">
                                                                Роль: {getRoleLabel(game.playerRole)}
                                                            </div>
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
                                                                        <th className="py-2 px-3 w-44 text-right font-bold">Баллы / Допп / Дисц</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-800/30 text-xs">
                                                                    {game.players.map((p) => {
                                                                        const isCurrentPlayer = p.playerId === playerId;
                                                                        return (
                                                                            <tr
                                                                                key={p.slot}
                                                                                className={`transition-colors h-[36px] ${isCurrentPlayer
                                                                                        ? "bg-sky-950/40 font-bold border-l-2 border-l-sky-400"
                                                                                        : "hover:bg-slate-800/20"
                                                                                    }`}
                                                                            >
                                                                                <td className="py-1.5 px-3 text-center font-bold text-slate-400 align-middle">
                                                                                    {p.slot}
                                                                                </td>
                                                                                <td className={`py-1.5 px-3 align-middle ${isCurrentPlayer ? "text-sky-300" : "text-slate-200"}`}>
                                                                                    {p.name}
                                                                                </td>
                                                                                <td className="py-1.5 px-3 text-center align-middle">
                                                                                    <RoleIcon role={p.role} />
                                                                                </td>
                                                                                <td className="py-1.5 px-3 text-right align-middle">
                                                                                    <span className="font-semibold text-slate-100">{p.totalScoreFormatted}</span>
                                                                                    <span className="text-slate-600 mx-1">/</span>
                                                                                    <span className="text-emerald-400 font-semibold">{p.extra}</span>
                                                                                    <span className="text-slate-600 mx-1">/</span>
                                                                                    <span className="text-amber-400 font-semibold">{p.disc}</span>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
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

                                {/* Пагинация */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 pt-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1.5 rounded-lg bg-[#08111a] border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-sky-500/40 transition-all"
                                        >
                                            Назад
                                        </button>
                                        <div className="flex items-center gap-1 px-2">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${currentPage === page
                                                            ? "bg-sky-500 text-slate-950 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                                                            : "bg-[#08111a] text-slate-400 hover:text-slate-200 border border-slate-800"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1.5 rounded-lg bg-[#08111a] border border-slate-800 text-xs font-bold text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:border-sky-500/40 transition-all"
                                        >
                                            Вперёд
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>

            </main>
        </div>
    );
}