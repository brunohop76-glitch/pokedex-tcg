"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Pokemon = { name: string; url: string };
type Card = { id: string; name?: string; localId?: string; image?: string; rarity?: string; set?: { name?: string } };

function idFromUrl(url: string) {
  return Number(url.split("/").filter(Boolean).at(-1));
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);

  useEffect(() => {
    if (!query) { setPokemon([]); setCards([]); setLoadingPokemon(false); setLoadingCards(false); return; }
    const controller = new AbortController();
    const term = normalize(query).replace(/^#/, "");
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0", { signal: controller.signal, cache: "force-cache" })
      .then((r) => r.json())
      .then((data) => setPokemon((data.results ?? []).filter((p: Pokemon) => normalize(p.name).includes(term) || String(idFromUrl(p.url)) === term).slice(0, 60)))
      .catch(() => setPokemon([]))
      .finally(() => { if (!controller.signal.aborted) setLoadingPokemon(false); });
    fetch(`/api/tcg?name=${encodeURIComponent(query)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setCards(data.cards ?? []))
      .catch(() => setCards([]))
      .finally(() => { if (!controller.signal.aborted) setLoadingCards(false); });
    return () => controller.abort();
  }, [query]);

  const pokemonCount = useMemo(() => pokemon.length, [pokemon]);

  return (
    <main className="min-h-screen bg-[#dfe5c9] text-[#17362c]">
      <header className="border-b-4 border-[#081c15] bg-[#102d23] px-6 py-5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-sm font-black tracking-[0.2em]">⚡ POKÉDEX D'MELO</Link>
          <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-[#f5c94a]">Voltar para a Pokédex</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#28704d]">Search / Nexus Database</p>
          <h1 className="mt-2 text-4xl font-black md:text-6xl">Resultados para <span className="text-[#d71920]">“{query || ""}”</span></h1>
          <p className="mt-3 text-sm text-[#52655e]">Pokémon e cartas TCG encontrados na base de dados.</p>
        </div>

        <section className="mb-14">
          <div className="mb-5 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#28704d]">Pokédex</p><h2 className="text-2xl font-black">Pokémon</h2></div><span className="text-[10px] font-bold uppercase tracking-widest text-[#758078]">{loadingPokemon ? "Consultando..." : `${pokemonCount} encontrados`}</span></div>
          {loadingPokemon ? <div className="rounded-2xl border border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Consultando a Pokédex...</div> : pokemon.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">{pokemon.map((p) => { const id = idFromUrl(p.url); return <Link href={`/pokemon/${id}`} key={id} className="rounded-2xl border border-[#71816f]/60 bg-[#f7f2d8] p-4 transition hover:-translate-y-1 hover:border-[#d71920]"><img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} alt="" className="mx-auto h-28 w-28 object-contain"/><p className="mt-2 text-center text-sm font-black capitalize">{p.name.replace(/-/g, " ")}</p><p className="mt-1 text-center font-mono text-[9px] font-bold text-[#758078]">#{String(id).padStart(4, "0")}</p></Link>; })}</div> : <div className="rounded-2xl border border-dashed border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Nenhum Pokémon encontrado.</div>}
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d71920]">Trading Card Game</p><h2 className="text-2xl font-black">Cartas TCG</h2></div><span className="text-[10px] font-bold uppercase tracking-widest text-[#758078]">{loadingCards ? "Consultando..." : `${cards.length} encontradas`}</span></div>
          {loadingCards ? <div className="rounded-2xl border border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Consultando cartas TCG...</div> : cards.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">{cards.map((card) => <article key={card.id} className="rounded-2xl border border-[#71816f]/60 bg-[#f7f2d8] p-3"><div className="flex min-h-52 items-center justify-center rounded-xl bg-black/5">{card.image ? <img src={`${card.image}/high.webp`} alt={card.name ?? "Carta Pokémon"} className="max-h-52 object-contain"/> : <span className="text-xs text-[#758078]">Sem imagem</span>}</div><h3 className="mt-3 truncate text-xs font-black">{card.name ?? "Carta TCG"}</h3><p className="mt-1 truncate text-[8px] uppercase tracking-wider text-[#758078]">{[card.set?.name, card.rarity].filter(Boolean).join(" • ") || "Carta Pokémon TCG"}</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Nenhuma carta TCG encontrada.</div>}
        </section>
      </div>
    </main>
  );
}
