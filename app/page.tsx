"use client";

import { useEffect, useMemo, useState } from "react";

type Pokemon = { name: string; url: string };

type PokemonDetails = {
  types: { type: { name: string } }[];
};

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
  return Number(parts[parts.length - 1]);
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

  useEffect(() => {
    async function loadPokemon() {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0");
        if (!response.ok) throw new Error("Erro ao carregar Pokédex");
        const data = await response.json();
        setPokemon(data.results);
      } catch (error) {
        console.error("Erro ao carregar Pokémon:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPokemon();
  }, []);

  const filteredPokemon = useMemo(() => {
    const generation = generations.find((item) => item.id === selectedGeneration);
    const searchTerm = search.toLowerCase().trim();

    return pokemon.filter((item) => {
      const id = getPokemonId(item.url);
      if (searchTerm) {
        return item.name.toLowerCase().includes(searchTerm) || String(id).includes(searchTerm);
      }
      if (!generation) return true;
      return id >= generation.start && id <= generation.end;
    });
  }, [pokemon, search, selectedGeneration]);

  const totalPages = Math.max(1, Math.ceil(filteredPokemon.length / POKEMON_PER_PAGE));
  const paginatedPokemon = filteredPokemon.slice(
    (currentPage - 1) * POKEMON_PER_PAGE,
    currentPage * POKEMON_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGeneration]);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      if (!paginatedPokemon.length) return;
      setDetailsLoading(true);

      const missing = paginatedPokemon.filter((item) => {
        const id = getPokemonId(item.url);
        return !details[id];
      });

      if (!missing.length) {
        setDetailsLoading(false);
        return;
      }

      const results = await Promise.all(
        missing.map(async (item) => {
          const id = getPokemonId(item.url);
          try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            if (!response.ok) return [id, []] as const;
            const data: PokemonDetails = await response.json();
            return [id, data.types.map((entry) => entry.type.name)] as const;
          } catch {
            return [id, []] as const;
          }
        })
      );

      if (!cancelled) {
        setDetails((previous) => ({
          ...previous,
          ...Object.fromEntries(results),
        }));
        setDetailsLoading(false);
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [paginatedPokemon, details]);

  const selected = generations.find((item) => item.id === selectedGeneration) ?? generations[0];

  function changePage(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />
        <div className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050507]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-xl shadow-[0_0_25px_rgba(239,68,68,0.25)]">⚡</div>
            <div>
              <h1 className="text-lg font-black tracking-[0.2em]">POKÉDEX</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">Nexus Database</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest md:flex">
            <a href="/" className="text-red-400">Pokédex</a>
            <a href="#generations" className="text-zinc-500 transition hover:text-cyan-400">Gerações</a>
            <a href="#pokemon" className="text-zinc-500 transition hover:text-cyan-400">Database</a>
            <a href="#tcg" className="text-zinc-500 transition hover:text-cyan-400">TCG</a>
          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 md:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Online</span>
          </div>
        </div>
      </header>

      <section className="relative z-10 overflow-hidden border-b border-white/10 bg-[#070a08]">
        <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(34,197,94,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.25)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07110d] via-transparent to-[#120607]" />
        <div className="absolute right-[-80px] top-[-100px] h-[420px] w-[420px] rounded-full border border-emerald-400/10 opacity-40" />
        <div className="absolute right-[-30px] top-[-50px] h-[320px] w-[320px] rounded-full border border-red-500/10 opacity-50" />

        <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 bg-red-500 shadow-[0_0_12px_#ef4444]" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-red-400">SYSTEM // ONLINE</span>
                <span className="hidden h-px w-24 bg-red-500/30 sm:block" />
                <span className="hidden text-[9px] font-bold uppercase tracking-[0.25em] text-zinc-600 sm:block">NEXUS TERMINAL 01</span>
              </div>

              <div className="mt-6 max-w-3xl">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400">POKÉDEX DATABASE</p>
                <h2 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
                  Seu banco de dados <span className="text-red-500">Pokémon.</span>
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
                  Explore Pokémon, regiões, tipos, evoluções e cartas TCG em uma única central de dados.
                </p>
              </div>

              <div className="mt-7 max-w-3xl">
                <div className="group relative">
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-500/25 via-transparent to-cyan-400/25 opacity-70 blur-md transition duration-300 group-focus-within:opacity-100" />
                  <div className="relative flex items-center rounded-xl border-2 border-[#29493c] bg-[#f4f0d8] p-1.5 shadow-[6px_6px_0_rgba(0,0,0,0.35)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border-r border-[#d6d0b6] text-lg text-red-600">⌕</div>
                    <input
                      type="text"
                      placeholder="Pesquisar Pokémon ou número..."
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setCurrentPage(1);
                      }}
                      className="w-full bg-transparent px-4 py-3 text-sm font-bold text-[#173b31] outline-none placeholder:text-[#718078]"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="mr-1 hidden rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-wider text-[#52655e] hover:bg-black/5 sm:block">Limpar</button>
                    )}
                    <button onClick={() => setCurrentPage(1)} className="rounded-lg bg-[#e52521] px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[3px_3px_0_#8d1715] transition hover:-translate-y-0.5 hover:bg-[#f02d29]">Buscar</button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                  <span>ENTER → pesquisar</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>nome ou número da Pokédex</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-0">
                <div className="pr-7">
                  <p className="text-3xl font-black text-white">1025</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Pokémon</p>
                </div>
                <div className="h-11 w-px bg-white/10" />
                <div className="px-7">
                  <p className="text-3xl font-black text-white">09</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Gerações</p>
                </div>
                <div className="h-11 w-px bg-white/10" />
                <div className="pl-7">
                  <p className="text-3xl font-black text-red-500">TCG</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">Database</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative ml-auto max-w-[310px] overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0b120e]/90 p-5 shadow-[0_0_50px_rgba(16,185,129,0.06)]">
                <div className="absolute right-0 top-0 h-20 w-20 bg-emerald-400/5 blur-2xl" />
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">POKÉDEX SYSTEM</span>
                  <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Ready</span>
                </div>
                <div className="mt-5 space-y-4 font-mono">
                  <div className="flex items-center justify-between"><span className="text-[9px] text-zinc-600">STATUS</span><span className="text-[10px] font-bold text-emerald-400">ONLINE</span></div>
                  <div className="flex items-center justify-between"><span className="text-[9px] text-zinc-600">REGISTROS</span><span className="text-[10px] font-bold text-cyan-400">1,025</span></div>
                  <div className="flex items-center justify-between"><span className="text-[9px] text-zinc-600">REGIÕES</span><span className="text-[10px] font-bold text-white">09</span></div>
                  <div className="flex items-center justify-between"><span className="text-[9px] text-zinc-600">TCG LINK</span><span className="text-[10px] font-bold text-red-400">CONNECTED</span></div>
                </div>
                <div className="mt-5 border-t border-white/10 pt-4 text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-700">NEXUS // DATABASE 01</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="generations" className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">01 // NAVIGATION</span><span className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" /></div>
          <h3 className="mt-4 text-3xl font-black md:text-4xl">Escolha uma <span className="text-red-500">geração</span></h3>
          <p className="mt-2 text-sm text-zinc-500">Acesse rapidamente cada região da Pokédex.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
          {generations.map((generation) => {
            const active = selectedGeneration === generation.id;
            const count = generation.end - generation.start + 1;
            return (
              <button key={generation.id} onClick={() => setSelectedGeneration(generation.id)} className={`group relative min-h-[125px] overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${active ? "border-red-500/60 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.12)]" : "border-white/10 bg-white/[0.025] hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest ${active ? "text-red-400" : "text-zinc-600"}`}>{generation.id === 0 ? "DATABASE" : `GEN ${generation.id}`}</p>
                <p className="mt-2 text-sm font-black">{generation.id === 0 ? "Todas" : `Geração ${generation.roman}`}</p>
                <p className={`mt-1 text-xs ${active ? "text-zinc-300" : "text-zinc-600"}`}>{generation.region}</p>
                <p className={`mt-3 text-[10px] font-bold ${active ? "text-cyan-400" : "text-zinc-500"}`}>{count} REGISTROS</p>
              </button>
            );
          })}
        </div>
      </section>

      <section id="pokemon" className="relative z-10 mx-auto max-w-7xl px-6 pb-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-3"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">02 // DATABASE</span><span className="h-px w-16 bg-red-500/30" /></div>
            <h3 className="mt-3 text-3xl font-black md:text-4xl">{search.trim() ? "Resultados da busca" : selected.id === 0 ? "Todos os Pokémon" : `Pokémon de ${selected.region}`}</h3>
            <p className="mt-2 text-sm text-zinc-500">{search.trim() ? `Pesquisa global por "${search}"` : "Selecione um registro para acessar seus dados."}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3"><p className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">Registros encontrados</p><p className="text-right text-xl font-black text-cyan-400">{filteredPokemon.length}</p></div>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-20 text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-red-500 border-r-cyan-400" /><p className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-500">Sincronizando database...</p></div>
        ) : paginatedPokemon.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-20 text-center"><div className="text-5xl opacity-70">◉</div><h4 className="mt-5 text-xl font-black">Nenhum registro encontrado</h4><p className="mt-2 text-sm text-zinc-500">Tente outro nome ou número da Pokédex.</p><button onClick={() => { setSearch(""); setSelectedGeneration(0); }} className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-400">Limpar filtros</button></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {paginatedPokemon.map((item) => {
                const id = getPokemonId(item.url);
                const types = details[id] ?? [];
                const isLoadingType = detailsLoading && !details[id];

                return (
                  <a key={item.name} href={`/pokemon/${id}`} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] transition duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/0 blur-3xl transition duration-500 group-hover:bg-cyan-500/20" />

                    <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent p-5">
                      <span className="absolute left-3 top-3 z-20 rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[9px] font-black tracking-widest text-zinc-400 backdrop-blur">#{String(id).padStart(4, "0")}</span>
                      <span className="absolute right-3 top-3 z-20 flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Registrado</span>
                      <div className="absolute inset-x-8 bottom-5 h-12 rounded-full bg-red-500/0 blur-2xl transition duration-500 group-hover:bg-red-500/30" />
                      <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`} alt={item.name} loading="lazy" className="relative z-10 h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transition duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]" />
                    </div>

                    <div className="relative border-t border-white/5 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate capitalize font-black">{formatName(item.name)}</h4>
                        <span className="text-cyan-400 opacity-0 transition group-hover:opacity-100">→</span>
                      </div>

                      <div className="mt-3 min-h-[22px]">
                        {isLoadingType ? (
                          <span className="inline-block h-5 w-20 animate-pulse rounded-full bg-white/5" />
                        ) : types.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {types.map((type) => (
                              <span key={type} className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-wider ${typeStyles[type] ?? "border-white/10 bg-white/5 text-zinc-400"}`}>{type}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-700">Tipo indisponível</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">Registro #{String(id).padStart(4, "0")}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-cyan-500/70">Dados →</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
              <button disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)} className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:border-cyan-400/30 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30">← Anterior</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => {
                let page = index + 1;
                if (totalPages > 7) {
                  if (currentPage <= 4) page = index + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + index;
                  else page = currentPage - 3 + index;
                }
                return <button key={page} onClick={() => changePage(page)} className={`h-11 min-w-11 rounded-xl text-xs font-black ${currentPage === page ? "bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.25)]" : "border border-white/10 bg-white/[0.025] text-zinc-500 hover:border-cyan-400/30 hover:text-cyan-400"}`}>{page}</button>;
              })}
              <button disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)} className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:border-cyan-400/30 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30">Próxima →</button>
            </div>
            <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700">Página {currentPage} / {totalPages} • {filteredPokemon.length} registros</p>
          </>
        )}
      </section>

      <section id="tcg" className="relative overflow-hidden border-y border-red-500/10 bg-gradient-to-br from-red-950/30 via-[#08080d] to-cyan-950/20">
        <div className="relative mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-center gap-3"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">03 // TCG DATABASE</span><span className="h-px w-16 bg-red-500/30" /></div>
          <h3 className="mt-5 text-4xl font-black md:text-5xl">Seu Pokémon.<span className="block text-red-500">Suas cartas.</span></h3>
          <p className="mt-5 max-w-2xl leading-7 text-zinc-400">Cada Pokémon possui sua própria página com informações, evoluções e cartas Pokémon TCG relacionadas.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/pokemon/25" className="rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest">Explorar Pikachu →</a>
            <a href="/pokemon/6" className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:border-cyan-400/30 hover:text-cyan-400">Explorar Charizard</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-[#030304] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div><p className="text-sm font-black tracking-[0.2em]">POKÉDEX</p><p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-700">Nexus Database</p></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">Pokémon TCG • Next.js • PokéAPI</p>
        </div>
      </footer>
    </main>
  );
}
