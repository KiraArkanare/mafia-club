'use client';

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

interface AddPlayerModalProps {
    onCloseAction: () => void;
    onSuccessAction?: () => void;
}

export default function AddPlayerModal({ onCloseAction, onSuccessAction }: AddPlayerModalProps) {
    const [nickname, setNickname] = useState("");
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatarFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nickname.trim()) {
            setErrorMsg("Введите никнейм игрока");
            return;
        }

        setLoading(true);
        setErrorMsg("");

        try {
            let avatarUrl = "";

            // 1. Загрузка аватарки в Supabase Storage (если файл выбран)
            if (avatarFile) {
                const fileExt = avatarFile.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(fileName, avatarFile);

                if (uploadError) {
                    throw uploadError;
                }

                // Получение публичного URL
                const { data } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(fileName);

                avatarUrl = data.publicUrl;
            }

            // 2. Сохранение игрока в таблицу
            const { error: dbError } = await supabase
                .from('players')
                .insert([
                    {
                        nickname: nickname.trim(),
                        full_name: fullName.trim() || null,
                        bio: bio.trim() || null,
                        avatar_url: avatarUrl || null
                    }
                ]);

            if (dbError) throw dbError;

            if (onSuccessAction) onSuccessAction();
            onCloseAction();
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg("Ошибка при добавлении игрока");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCloseAction}>
            <div className="fixed inset-0 bg-[#04080e]/85 backdrop-blur-md" />

            <div
                className="relative w-full max-w-md rounded-2xl border bg-[#0b1622] border-slate-800 shadow-2xl overflow-hidden z-10 text-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#08111a]">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">👤</span>
                        <h2 className="text-base font-bold text-slate-100">Добавить нового игрока</h2>
                    </div>
                    <button
                        onClick={onCloseAction}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errorMsg && (
                        <div className="p-3 text-xs rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Никнейм *</label>
                        <input
                            type="text"
                            required
                            placeholder="Например: Г-н 228"
                            value={nickname}
                            onChange={e => setNickname(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#070e17] border border-slate-800 text-slate-100 outline-none focus:border-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Фамилия и Имя</label>
                        <input
                            type="text"
                            placeholder="Иван Иванов"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#070e17] border border-slate-800 text-slate-100 outline-none focus:border-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Краткая информация</label>
                        <textarea
                            rows={3}
                            placeholder="Определяющая фраза или био..."
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl bg-[#070e17] border border-slate-800 text-slate-100 outline-none focus:border-sky-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Аватарка</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCloseAction}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            {loading ? "Сохранение..." : "Добавить"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}