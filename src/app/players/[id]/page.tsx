import { supabase } from "@/lib/supabase";
import PlayerClient from "./PlayerClient";

export async function generateStaticParams() {
    const { data: players } = await supabase
        .from('players')
        .select('id');

    if (!players || players.length === 0) {
        return [{ id: '1' }];
    }

    return players.map((player) => ({
        id: player.id.toString(),
    }));
}

export default function Page() {
    return <PlayerClient />;
}