"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Pokemon = { name: string; url: string };
type PokemonDetails = { types: { type: { name: string } }[] };
type Generation = {
  id: number;
  name: string;
  roman: string;
  region: string;
  start: number;
  end: number;
};

const generations: Generation[] = [
  { id: 0, name: "Todas", roman: "", region: "Todas as regiões", start: 1, end: 1025 },
  { id: 1, name: "Geração I", roman: "I", region: "Kanto", start: 1, end: 151 },
  { id: 2, name: "Geração II", roman: "II", region: "Johto", start: 152, end: 251 },
  { id: 3, name: "Geração III", roman: "III", region: "Hoenn", start: 252, end: 386 },
  { id: 4, name: "Geração IV", roman: "IV", region: "Sinnoh", start: 387, end: 493 },
  { id: 5, name: "Geração V", roman: "V", region: "Unova", start: 494, end: 649 },
  { id: 6, name: "Geração VI", roman: "VI", region: "Kalos", start: 650, end: 721 },
  { id: 7, name: "Geração VII", roman: "VII", region: "Alola", start: 722, end: 809 },
  { id: 8, name: "Geração VIII", roman: "VIII", region: "Galar", start: 810, end: 905 },
  { id: 9, name: "Geração IX", roman: "IX", region: "Paldea", start: 906, end: 1025 },
];

const POKEMON_PER_PAGE = 24;

const typeStyles: Record<string, string> = {
  normal: "border-zinc-400/30 bg-zinc-400/10 text-zinc-300",
  fire: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  water: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  electric: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  grass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  ice: "border-cyan-300/30 bg-cyan-300/10 text-cyan-200",
  fighting: "border-red-500/30 bg-red-500/10 text-red-300",
  poison: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  ground: "border-amber-600/30 bg-amber-600/10 text-amber-300",
  flying: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  psychic: "border-pink-500/30 bg-pink-500/10 text-pink-300",
  bug: "border-lime-500/30 bg-lime-500/10 text-lime-300",
  rock: "border-stone-400/30 bg-stone-400/10 text-stone-300",
  ghost: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  dragon: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  dark: "border-slate-400/30 bg-slate-400/10 text-slate-300",
  steel: "border-slate-300/30 bg-slate-300/10 text-slate-200",
  fairy: "border-pink-300/30 bg-pink-300/10 text-pink-200",
};

function getPokemonId(url: string) {
  const parts = url.split("/").filter(Boolean);
  return Number(parts.at(-1));
}

function formatName(name: string) {
  return name.replace(/-/g, " ");
}

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [details, setDetails] = useState<Record<number, string[]>>({});
  const [search, setSearch] = useState("");
  const [selectedGeneration, setSelectedGeneration] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const loadedDetailIds = useRef(new Set<number>());

  useEffect(() => {
    const controller = new AbortController();
    async function loadPokemon() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0", { signal: controller.signal, cache: "force-cache" });
        if (!response.ok) throw new Error("Erro ao carregar Pokédex");
        const data = await response.json();
        setPokemon(data.results);
      } catch (error) {
        if ((error as Error).name !== "AbortError") console.error("Erro ao carregar Pokémon:", error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadPokemon();
    return () => controller.abort();
  }, []);

  const filteredPokemon = useMemo(() => {
    const generation = generations[selectedGeneration];
    const searchTerm = search.toLowerCase().trim();
    return pokemon.filter((item) => {
      const id = getPokemonId(item.url);
      if (searchTerm) return item.name.toLowerCase().includes(searchTerm) || String(id).includes(searchTerm);
      return id >= generation.start && id <= generation.end;
    });
  }, [pokemon, search, selectedGeneration]);

  const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE));
  const paginatedPokemon = useMemo(() => {
    const start = (currentPage - 1) * POKEMON_PER_PAGE;
    return filteredPokemon.slice(start, start + POKEMON_PER_PAGE);
  }, [filteredPokemon, currentPage]);
  const pageIds = useMemo(() => paginatedPokemon.map((item) => getPokemonId(item.url)), [paginatedPokemon]);
  const selected = generations[selectedGeneration];

  useEffect(() => { setCurrentPage(1); }, [search, selectedGeneration]);

  useEffect(() => {
    if (!pageIds.length) { setDetailsLoading(false); return; }
    const missingIds = pageIds.filter((id) => !loadedDetailIds.current.has(id));
    if (!missingIds.length) { setDetailsLoading(false); return; }
    const controller = new AbortController();
    setDetailsLoading(true);
    Promise.all(missingIds.map(async (id) => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { signal: controller.signal, cache: "force-cache" });
        if (!response.ok) return [id, []] as const;
        const data: PokemonDetails = await response.json();
        return [id, data.types.map((entry) => entry.type.name)] as const;
      } catch (error) {
        if ((error as Error).name === "AbortError") return [id, []] as const;
        return [id, []] as const;
      }
    })).then((results) => {
      if (controller.signal.aborted) return;
      setDetails((previous) => ({ ...previous, ...Object.fromEntries(results) }));
      missingIds.forEach((id) => loadedDetailIds.current.add(id));
      setDetailsLoading(false);
    });
    return () => controller.abort();
  }, [pageIds]);

  function changePage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen">
      <header>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="/" className="group flex items-center gap-3" aria-label="Ir para o início">
            <div className="relative flex items-center justify-center text-xl">⚡</div>
            <div><h1 className="text-lg font-black tracking-[0.2em]">POKÉDEX</h1><p className="text-[10px] font-semibold uppercase tracking-[0.25em]">Nexus Database</p></div>
          </a>
          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest md:flex" aria-label="Navegação principal">
            <a href="/">Pokédex</a><a href="#generations">Gerações</a><a href="#pokemon">Database</a><a href="#tcg">TCG</a>
          </nav>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 md:flex"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /><span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Online</span></div>
        </div>
      </header>

      <section aria-labelledby="home-title">
        <div className="relative mx-auto max-w-7xl"><div className="grid"><div>
          <h2 id="home-title">POKEDEX D'MELO</h2>
          <div className="mt-7 max-w-3xl"><form className="group relative" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1); }}>
            <div className="relative flex items-center">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border-r border-[#d6d0b6] text-lg text-red-600" aria-hidden="true">⌕</div>
              <input type="search" aria-label="Pesquisar Pokémon ou número" placeholder="Pesquisar Pokémon ou número..." value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent px-4 py-3 outline-none placeholder:text-[#718078]" />
              {search && <button type="button" onClick={() => setSearch("")} className="mr-1 hidden rounded px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#52655e] sm:block">Limpar</button>}
              <button type="submit" className="shrink-0 px-5 py-3">Buscar</button>
            </div>
          </form></div>
        </div></div></div>
      </section>

      <section id="generations" className="relative z-10 border-b border-white/10 py-16"><div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Pokémon Region Select</p><h3 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Gerações <span className="text-red-500">Pokémon.</span></h3></div><p className="max-w-xl text-sm leading-6">Navegue pelas gerações e explore a coleção completa disponível na base de dados.</p></div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">{generations.map((generation) => { const active = selectedGeneration === generation.id; return <button key={generation.id} type="button" onClick={() => setSelectedGeneration(generation.id)} aria-pressed={active} className={`group relative overflow-hidden rounded-2xl border p-5 text-left transition ${active ? "border-red-500/60 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.08)]" : "border-white/10 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/[0.03]"}`}><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">GEN {generation.roman || "ALL"}</span>{active && <span className="text-[9px] font-black uppercase tracking-widest text-red-400">● ACTIVE</span>}</div><p className="mt-3 text-lg font-black">{generation.name}</p><p className="mt-1 text-xs">{generation.region}</p><p className="mt-4 font-mono text-[10px] font-bold text-emerald-400">#{String(generation.start).padStart(4, "0")} — #{String(generation.end).padStart(4, "0")}</p></button>; })}</div>
      </div></section>

      <section id="pokemon" className="relative z-10 py-16"><div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">Database / {selected.region}</p><h3 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Pokémon <span className="text-red-500">catalogados.</span></h3></div><div className="flex items-center gap-3"><div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Página {currentPage} / {totalPages}</div>{detailsLoading && <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Sincronizando...</div>}</div></div>
        {loading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{Array.from({ length: 12 }, (_, index) => <div key={index} className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />)}</div> : paginatedPokemon.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {paginatedPokemon.map((item) => { const id = getPokemonId(item.url); const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`; const pokemonTypes = details[id] ?? []; return (
            <Link key={id} href={`/pokemon/${id}`} aria-label={`Ver detalhes de ${formatName(item.name)}`} className="pokemon-catalog-link group block overflow-hidden rounded-2xl border p-4 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              <article className="pointer-events-none">
                <div className="flex items-center justify-between"><span className="font-mono text-[10px] font-bold text-zinc-600">#{String(id).padStart(4, "0")}</span><span className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{selected.region}</span></div>
                <div className="mt-4 flex items-center justify-center rounded-xl"><img src={image} alt={formatName(item.name)} loading="lazy" decoding="async" className="object-contain" /></div>
                <h4 className="mt-4 truncate text-sm font-black capitalize">{formatName(item.name)}</h4>
                <div className="mt-2 flex flex-wrap gap-1.5">{pokemonTypes.map((type) => <span key={type} className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${typeStyles[type] ?? "border-white/10 bg-white/5 text-zinc-400"}`}>{type}</span>)}</div>
              </article>
            </Link>
          ); })}
        </div> : <div className="rounded-2xl border border-dashed border-[#71816f] bg-[#f7f2d8] p-12 text-center"><p className="font-mono text-lg font-black text-[#17362c]">Nenhum Pokémon encontrado.</p><p className="mt-2 text-sm text-[#687366]">Tente outro nome, número ou limpe a pesquisa.</p></div>}
        {!loading && <div className="mt-10 flex items-center justify-center gap-2"><button type="button" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-30">Anterior</button><button type="button" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 disabled:opacity-30">Próxima</button></div>}
      </div></section>

      <section id="tcg" className="relative z-10 py-16"><div className="mx-auto max-w-7xl px-6"><div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-8 md:p-12"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">Trading Card Game</p><div className="mt-3 flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><h3 className="text-3xl font-black tracking-tight md:text-5xl">TCG <span className="text-red-500">Database.</span></h3><p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-500">Cartas, coleções e informações do universo Pokémon TCG em uma área dedicada.</p></div><div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-right"><p className="text-2xl font-black text-red-400">NEXUS</p><p className="mt-1 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">CARD SYSTEM</p></div></div></div></div></section>
    </main>
  );
}
