'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthModal({ onClose }: { onClose: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const handleAuth = async () => {
        setErrorMsg("");
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            setErrorMsg("Неверный email или пароль");
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0" style={{ background: "rgba(6,10,18,0.8)", backdropFilter: "blur(12px)" }} />
            <div
                className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
                style={{ background: "#0f1923", border: "1px solid #1e3a4a" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="h-1" style={{ background: "linear-gradient(90deg, #1a6b8a, #0e8c6a)" }} />
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <span style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "#e2e8f0" }}>
                            Вход для ведущего
                        </span>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors text-slate-400 bg-slate-800 hover:text-white"
                        >✕</button>
                    </div>

                    {errorMsg && <div className="text-red-400 text-xs mb-3 text-center">{errorMsg}</div>}

                    <div className="flex flex-col gap-3">
                        <input
                            type="email"
                            placeholder="Email админа"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "#0a1520", border: "1px solid #1e3a4a", color: "#e2e8f0" }}
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                            style={{ background: "#0a1520", border: "1px solid #1e3a4a", color: "#e2e8f0" }}
                        />
                        <button
                            onClick={handleAuth}
                            className="w-full py-3 mt-1 text-sm rounded-xl transition-opacity hover:opacity-90 font-bold"
                            style={{ background: "linear-gradient(135deg, #1a6b8a, #0e8c6a)", color: "#fff" }}
                        >
                            Войти в систему
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}