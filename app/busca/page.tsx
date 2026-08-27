"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Pokemon = { name: string; url: string };
type Card = { id: string; name?: string; localId?: string; image?: string; rarity?: string; set?: { id?: string; name?: string } };

function idFromUrl(url: string) {
  return Number(url.split("/").filter(Boolean).at(-1));
}

function normalize(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getSeriesFromSetId(setId = "") {
  const value = setId.toLowerCase();
  if (value.startsWith("mcd")) return "mcd";
  if (value.startsWith("base")) return "base";
  if (value.startsWith("gym")) return "gym";
  if (value.startsWith("neo")) return "neo";
  if (value.startsWith("ex")) return "ex";
  if (value.startsWith("dp")) return "dp";
  if (value.startsWith("pl")) return "pl";
  if (value.startsWith("hgss")) return "hgss";
  if (value.startsWith("bw")) return "bw";
  if (value.startsWith("xy")) return "xy";
  if (value.startsWith("sm")) return "sm";
  if (value.startsWith("swsh")) return "swsh";
  if (value.startsWith("sv")) return "sv";
  if (value.startsWith("det")) return "det";
  if (value.startsWith("cel")) return "cel";
  return value.replace(/[0-9].*$/, "") || value;
}

function getCardImageCandidates(card: Card) {
  const candidates: string[] = [];
  if (card.image) {
    candidates.push(`${card.image}/high.webp`, `${card.image}/high.png`, `${card.image}/low.webp`, `${card.image}/low.png`);
  }
  const setId = card.set?.id;
  const localId = card.localId;
  if (setId && localId) {
    const series = getSeriesFromSetId(setId);
    const base = `https://assets.tcgdex.net/en/${series}/${setId}/${localId}`;
    candidates.push(`${base}/high.webp`, `${base}/high.png`, `${base}/low.webp`, `${base}/low.png`);
  }
  return Array.from(new Set(candidates));
}

function CardImage({ card }: { card: Card }) {
  const candidates = useMemo(() => getCardImageCandidates(card), [card]);
  const [index, setIndex] = useState(0);
  const src = candidates[index];

  useEffect(() => setIndex(0), [card.id]);

  if (!src) return <span className="text-xs text-[#758078]">Imagem indisponível</span>;

  return (
    <img
      src={src}
      alt={card.name ?? "Carta Pokémon"}
      className="max-h-56 object-contain transition group-hover:scale-[1.02]"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

export default function SearchPage() {
  const params = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loadingPokemon, setLoadingPokemon] = useState(true);
  const [loadingCards, setLoadingCards] = useState(true);
  const [cardFilter, setCardFilter] = useState("all");

  useEffect(() => {
    if (!query) {
      setPokemon([]); setCards([]); setLoadingPokemon(false); setLoadingCards(false); return;
    }
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

  const rarities = useMemo(() => Array.from(new Set(cards.map((card) => card.rarity).filter(Boolean) as string[])).sort(), [cards]);
  const filteredCards = useMemo(() => cardFilter === "all" ? cards : cards.filter((card) => card.rarity === cardFilter), [cards, cardFilter]);

  return (
    <main className="min-h-screen bg-[#dfe5c9] text-[#17362c]">
      <header className="border-b-4 border-[#081c15] bg-[#102d23] px-6 py-4 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link href="/" className="text-sm font-black tracking-[0.2em]">⚡ POKÉDEX D'MELO</Link>
          <Link href="/" className="rounded-full border border-white/15 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-[#f5c94a] transition hover:bg-white/10">← Voltar para a Pokédex</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="mb-10 border-b border-[#17362c]/20 pb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#28704d]">Search / Nexus Database</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Resultados para <span className="text-[#d71920]">“{query}”</span></h1>
          <p className="mt-3 text-sm text-[#52655e]">Pokémon e cartas TCG encontrados na base de dados.</p>
        </div>

        <section className="mb-14">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#28704d]">Pokédex</p><h2 className="text-2xl font-black">Pokémon</h2></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#758078]">{loadingPokemon ? "Consultando..." : `${pokemon.length} encontrados`}</span>
          </div>
          {loadingPokemon ? <div className="rounded-2xl border border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Consultando a Pokédex...</div> : pokemon.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">{pokemon.map((p) => { const id = idFromUrl(p.url); return <Link href={`/pokemon/${id}`} key={id} className="group rounded-2xl border border-[#71816f]/60 bg-[#f7f2d8] p-4 transition hover:-translate-y-1 hover:border-[#d71920] hover:shadow-lg"><div className="flex items-center justify-between font-mono text-[8px] font-bold text-[#758078]"><span>#{String(id).padStart(4, "0")}</span><span>POKÉMON</span></div><img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} alt="" className="mx-auto mt-3 h-28 w-28 object-contain transition group-hover:scale-105"/><p className="mt-2 text-center text-sm font-black capitalize">{p.name.replace(/-/g, " ")}</p></Link>; })}</div> : <div className="rounded-2xl border border-dashed border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Nenhum Pokémon encontrado.</div>}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-[9px] font-black uppercase tracking-[0.25em] text-[#d71920]">Trading Card Game</p><h2 className="text-2xl font-black">Cartas TCG</h2></div>
            <div className="flex max-w-full flex-wrap items-center gap-2">
              <button type="button" onClick={() => setCardFilter("all")} className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition ${cardFilter === "all" ? "border-[#d71920] bg-[#d71920] text-white" : "border-[#71816f]/50 bg-[#f7f2d8] text-[#52655e]"}`}>Todas</button>
              {rarities.slice(0, 6).map((rarity) => <button key={rarity} type="button" onClick={() => setCardFilter(rarity)} className={`rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-widest transition ${cardFilter === rarity ? "border-[#d71920] bg-[#d71920] text-white" : "border-[#71816f]/50 bg-[#f7f2d8] text-[#52655e]"}`}>{rarity}</button>)}
            </div>
          </div>
          <div className="mb-4 flex justify-end text-[10px] font-bold uppercase tracking-widest text-[#758078]">{loadingCards ? "Consultando..." : `${filteredCards.length} cartas exibidas`}</div>
          {loadingCards ? <div className="rounded-2xl border border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Consultando cartas TCG...</div> : filteredCards.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">{filteredCards.map((card) => <article key={card.id} className="group overflow-hidden rounded-2xl border border-[#71816f]/60 bg-[#f7f2d8] p-3 transition hover:-translate-y-1 hover:border-[#d71920] hover:shadow-lg"><div className="flex min-h-56 items-center justify-center rounded-xl bg-black/5 p-2"><CardImage card={card} /></div><h3 className="mt-3 truncate text-xs font-black">{card.name ?? "Carta TCG"}</h3><p className="mt-1 truncate text-[8px] uppercase tracking-wider text-[#758078]">{[card.set?.name, card.rarity].filter(Boolean).join(" • ") || "Carta Pokémon TCG"}</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-[#71816f] bg-[#f7f2d8] p-8 text-sm">Nenhuma carta TCG encontrada.</div>}
        </section>
      </div>
    </main>
  );
}
