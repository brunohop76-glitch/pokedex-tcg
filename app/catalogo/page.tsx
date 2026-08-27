"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Pokemon = { name: string; url: string };
type Generation = { id: string; label: string; region: string; start: number; end: number };

const generations: Generation[] = [
  { id: "all", label: "Todas", region: "Todas as regiões", start: 1, end: 1025 },
  { id: "1", label: "Geração I", region: "Kanto", start: 1, end: 151 },
  { id: "2", label: "Geração II", region: "Johto", start: 152, end: 251 },
  { id: "3", label: "Geração III", region: "Hoenn", start: 252, end: 386 },
  { id: "4", label: "Geração IV", region: "Sinnoh", start: 387, end: 493 },
  { id: "5", label: "Geração V", region: "Unova", start: 494, end: 649 },
  { id: "6", label: "Geração VI", region: "Kalos", start: 650, end: 721 },
  { id: "7", label: "Geração VII", region: "Alola", start: 722, end: 809 },
  { id: "8", label: "Geração VIII", region: "Galar", start: 810, end: 905 },
  { id: "9", label: "Geração IX", region: "Paldea", start: 906, end: 1025 },
];

const types = ["Todos", "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];
const perPage = 24;

function pokemonId(url: string) { return Number(url.split("/").filter(Boolean).at(-1)); }
function prettyName(name: string) { return name.replace(/-/g, " "); }
function artwork(id: number) { return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`; }
function regionFor(id: number) { return generations.find((g) => id >= g.start && id <= g.end)?.region ?? ""; }

export default function CatalogoPage() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [typeNames, setTypeNames] = useState<Record<string, Set<string>>>({});
  const [search, setSearch] = useState("");
  const [generation, setGeneration] = useState("all");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sort, setSort] = useState("number-asc");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeLoading, setTypeLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0", { signal: controller.signal, cache: "force-cache" })
      .then((r) => r.json())
      .then((data) => setPokemon(data.results ?? []))
      .catch(() => setPokemon([]))
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const missing = selectedTypes.filter((type) => !typeNames[type]);
    if (!missing.length) return;
    const controller = new AbortController();
    setTypeLoading(true);
    Promise.all(missing.map(async (type) => {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`, { signal: controller.signal, cache: "force-cache" });
      if (!response.ok) throw new Error("type");
      const data = await response.json();
      return [type, new Set((data.pokemon ?? []).map((entry: { pokemon: Pokemon }) => entry.pokemon.name))] as const;
    })).then((entries) => setTypeNames((current) => ({ ...current, ...Object.fromEntries(entries) }))).catch(() => undefined).finally(() => { if (!controller.signal.aborted) setTypeLoading(false); });
    return () => controller.abort();
  }, [selectedTypes, typeNames]);

  const filtered = useMemo(() => {
    const gen = generations.find((item) => item.id === generation) ?? generations[0];
    const term = search.trim().toLowerCase().replace(/^#/, "");
    const activeTypes = selectedTypes.filter((item) => item !== "Todos");
    return pokemon.filter((item) => {
      const id = pokemonId(item.url);
      const matchesSearch = !term || item.name.includes(term) || String(id) === term || String(id).includes(term);
      const matchesGeneration = id >= gen.start && id <= gen.end;
      const matchesTypes = activeTypes.length === 0 || activeTypes.every((type) => typeNames[type]?.has(item.name));
      return matchesSearch && matchesGeneration && matchesTypes;
    }).sort((a, b) => {
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      if (sort === "name-desc") return b.name.localeCompare(a.name);
      if (sort === "number-desc") return pokemonId(b.url) - pokemonId(a.url);
      return pokemonId(a.url) - pokemonId(b.url);
    });
  }, [pokemon, generation, typeNames, search, selectedTypes, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const currentGeneration = generations.find((g) => g.id === generation) ?? generations[0];

  useEffect(() => { setPage(1); }, [search, generation, selectedTypes, sort]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  function toggleType(item: string) {
    if (item === "Todos") { setSelectedTypes([]); return; }
    setSelectedTypes((current) => current.includes(item) ? current.filter((type) => type !== item) : [...current, item]);
  }

  function clearFilters() {
    setSearch(""); setGeneration("all"); setSelectedTypes([]); setSort("number-asc"); setPage(1);
  }

  function goTo(target: number) {
    setPage(Math.max(1, Math.min(totalPages, target)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#dfe5c9] text-[#17362c]">
      <header className="sticky top-0 z-50 border-b-4 border-[#081c15] bg-[#102d23] text-white shadow-[0_4px_0_#6f796b]">
        <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Voltar para a Pokédex"><span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#f7f2d8] bg-[#d71920] text-lg shadow-[3px_3px_0_#071b14]">⚡</span><span><strong className="block font-mono text-sm tracking-[.18em]">POKÉDEX</strong><small className="font-mono text-[7px] uppercase tracking-[.25em] text-[#a9c0ad]">D'Melo / Nexus Database</small></span></Link>
          <nav className="hidden gap-7 font-mono text-[10px] font-black uppercase tracking-widest md:flex"><Link href="/">Pokédex</Link><Link href="/#generations">Gerações</Link><Link href="/catalogo" className="text-[#f5c94a]">Catálogo</Link><Link href="/#tcg">TCG</Link></nav>
          <Link href="/" className="rounded-full border border-[#f5c94a]/30 px-3 py-2 font-mono text-[8px] font-black uppercase tracking-widest text-[#f5c94a]">← Voltar</Link>
        </div>
      </header>

      <section className="border-b-4 border-[#17362c] bg-[#e7edc9] px-5 py-7 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-mono text-[9px] font-black uppercase tracking-[.32em] text-[#0b9f78]">02 // Database Index</p><h1 className="mt-1 text-5xl font-black leading-none tracking-[-.055em] text-[#102d23] drop-shadow-[3px_4px_0_#b8c2aa] md:text-6xl">Catálogo <span className="text-[#d71920]">Pokémon.</span></h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#52655e]">Explore os 1025 Pokémon por geração, tipo, nome ou número. Encontre uma espécie e abra sua ficha.</p></div><div className="w-fit shrink-0 rounded border border-[#71816f] bg-[#f7f2d8] px-4 py-3 font-mono text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0_#71816f]"><span className="text-[#0b9f78]">NEXUS STATUS</span><br />{loading ? "SINCRONIZANDO" : "1025 REGISTROS ONLINE"}</div></div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-5 md:px-8">
        <div className="rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-4 shadow-[5px_5px_0_rgba(23,54,44,.18)] md:p-5">
          <div className="grid gap-3 lg:grid-cols-[2fr_1fr_1fr]"><label><span className="mb-1.5 block font-mono text-[8px] font-black uppercase tracking-[.2em] text-[#28704d]">Pesquisar</span><div className="flex h-11 items-center overflow-hidden rounded border-2 border-[#17362c] bg-[#fffbea]"><span className="px-3 text-[#d71920]">⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou número..." className="w-full bg-transparent px-2 text-sm font-bold outline-none"/><button type="button" onClick={() => setSearch("")} className="px-3 font-mono text-[8px] font-black uppercase text-[#71816f]">Limpar</button></div></label><label><span className="mb-1.5 block font-mono text-[8px] font-black uppercase tracking-[.2em] text-[#28704d]">Geração</span><select value={generation} onChange={(e) => setGeneration(e.target.value)} className="h-11 w-full rounded border-2 border-[#71816f] bg-[#fffbea] px-3 text-sm font-bold outline-none">{generations.map((g) => <option key={g.id} value={g.id}>{g.label} — {g.region}</option>)}</select></label><label><span className="mb-1.5 block font-mono text-[8px] font-black uppercase tracking-[.2em] text-[#28704d]">Ordenar</span><select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 w-full rounded border-2 border-[#71816f] bg-[#fffbea] px-3 text-sm font-bold outline-none"><option value="number-asc">Número ↑</option><option value="number-desc">Número ↓</option><option value="name-asc">Nome A–Z</option><option value="name-desc">Nome Z–A</option></select></label></div>
          <div className="mt-4 border-t border-[#71816f]/25 pt-3"><div className="mb-2 flex items-center justify-between gap-3"><span className="font-mono text-[8px] font-black uppercase tracking-[.2em] text-[#28704d]">Tipo <span className="text-[#71816f]">• {selectedTypes.length ? `${selectedTypes.length} selecionado(s)` : "todos"}</span></span>{typeLoading && <span className="font-mono text-[8px] font-black uppercase text-[#d71920]">Sincronizando...</span>}</div><div className="flex gap-2 overflow-x-auto pb-1">{types.map((item) => { const active = item === "Todos" ? selectedTypes.length === 0 : selectedTypes.includes(item); return <button key={item} type="button" onClick={() => toggleType(item)} className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[8px] font-black uppercase tracking-wider transition ${active ? "border-[#d71920] bg-[#d71920] text-white shadow-[2px_2px_0_#8d1116]" : "border-[#71816f]/60 bg-[#fffbea] text-[#52655e] hover:border-[#0b9f78]"}`}>{item}</button>; })}</div></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#71816f]/20 pt-3"><div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-black uppercase tracking-widest text-[#71816f]"><span className="text-[#17362c]">{loading ? "Consultando..." : `${filtered.length} resultado${filtered.length === 1 ? "" : "s"}`}</span><span>•</span><span>{currentGeneration.region}</span></div><button type="button" onClick={clearFilters} className="rounded border border-[#17362c] bg-[#17362c] px-3 py-2 font-mono text-[8px] font-black uppercase tracking-widest text-white transition hover:border-[#d71920] hover:bg-[#d71920]">Limpar todos os filtros</button></div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-b-2 border-[#17362c] pb-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[8px] font-black uppercase tracking-[.25em] text-[#0b9f78]">Database / {currentGeneration.region}</p><h2 className="mt-1 text-2xl font-black tracking-tight">Pokémon catalogados.</h2></div><div className="flex items-center gap-3"><span className="rounded-full border border-[#71816f]/50 bg-[#f7f2d8] px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider">{loading ? "Consultando..." : `${filtered.length} registros`}</span><span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#71816f]">Página {safePage}/{totalPages}</span></div></div>

        {loading ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{Array.from({ length: 12 }, (_, i) => <div key={i} className="h-72 animate-pulse rounded-xl border-2 border-[#71816f]/30 bg-[#f7f2d8]/60" />)}</div> : visible.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{visible.map((item) => { const id = pokemonId(item.url); return <Link key={id} href={`/pokemon/${id}`} className="group relative overflow-hidden rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-3 shadow-[3px_4px_0_rgba(23,54,44,.18)] transition duration-200 hover:-translate-y-1 hover:border-[#0b9f78] hover:shadow-[5px_7px_0_rgba(23,54,44,.23)]"><div className="flex items-center justify-between font-mono text-[7px] font-black uppercase text-[#71816f]"><span>#{String(id).padStart(4,"0")}</span><span>{regionFor(id)}</span></div><div className="mt-2 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-[#17362c]/10 bg-[#e7edc9] bg-[radial-gradient(circle_at_center,rgba(11,159,120,.12),transparent_62%)]"><img src={artwork(id)} alt={prettyName(item.name)} loading="lazy" className="h-[88%] w-[88%] object-contain drop-shadow-[0_7px_3px_rgba(23,54,44,.18)] transition duration-200 group-hover:scale-110 group-hover:-translate-y-1"/></div><div className="mt-3 flex items-center justify-between gap-2"><h3 className="truncate text-sm font-black capitalize text-[#123d30]">{prettyName(item.name)}</h3><span className="shrink-0 font-mono text-[7px] font-black text-[#0b9f78]">↗</span></div></Link>; })}</div> : <div className="mt-5 rounded-xl border-2 border-dashed border-[#71816f] bg-[#f7f2d8] p-14 text-center"><p className="font-black">Nenhum Pokémon encontrado.</p><p className="mt-2 text-sm text-[#71816f]">Tente outro nome, número, geração ou combinação de tipos.</p><button type="button" onClick={clearFilters} className="mt-4 rounded border-2 border-[#17362c] bg-[#17362c] px-4 py-2 font-mono text-[9px] font-black uppercase tracking-widest text-white">Limpar filtros</button></div>}

        {!loading && totalPages > 1 && <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pb-8"><button type="button" disabled={safePage === 1} onClick={() => goTo(1)} className="rounded border-2 border-[#17362c] bg-[#f7f2d8] px-3 py-2 font-mono text-[9px] font-black uppercase transition hover:bg-[#17362c] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">« Primeiro</button><button type="button" disabled={safePage === 1} onClick={() => goTo(safePage - 1)} className="rounded border-2 border-[#17362c] bg-[#f7f2d8] px-3 py-2 font-mono text-[9px] font-black uppercase transition hover:bg-[#17362c] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">← Anterior</button><div className="rounded border-2 border-[#d71920] bg-[#d71920] px-4 py-2 font-mono text-[9px] font-black text-white">{safePage} / {totalPages}</div><button type="button" disabled={safePage === totalPages} onClick={() => goTo(safePage + 1)} className="rounded border-2 border-[#17362c] bg-[#f7f2d8] px-3 py-2 font-mono text-[9px] font-black uppercase transition hover:bg-[#17362c] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">Próxima →</button><button type="button" disabled={safePage === totalPages} onClick={() => goTo(totalPages)} className="rounded border-2 border-[#17362c] bg-[#f7f2d8] px-3 py-2 font-mono text-[9px] font-black uppercase transition hover:bg-[#17362c] hover:text-white disabled:cursor-not-allowed disabled:opacity-35">Última »</button></div>}
      </section>
    </main>
  );
}
