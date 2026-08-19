"use client";

import { useEffect, useMemo, useState } from "react";

type Pokemon = {
  name: string;
  url: string;
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
  {
    id: 0,
    name: "Todas",
    roman: "",
    region: "Todas as regiões",
    start: 1,
    end: 1025,
  },
  {
    id: 1,
    name: "Geração I",
    roman: "I",
    region: "Kanto",
    start: 1,
    end: 151,
  },
  {
    id: 2,
    name: "Geração II",
    roman: "II",
    region: "Johto",
    start: 152,
    end: 251,
  },
  {
    id: 3,
    name: "Geração III",
    roman: "III",
    region: "Hoenn",
    start: 252,
    end: 386,
  },
  {
    id: 4,
    name: "Geração IV",
    roman: "IV",
    region: "Sinnoh",
    start: 387,
    end: 493,
  },
  {
    id: 5,
    name: "Geração V",
    roman: "V",
    region: "Unova",
    start: 494,
    end: 649,
  },
  {
    id: 6,
    name: "Geração VI",
    roman: "VI",
    region: "Kalos",
    start: 650,
    end: 721,
  },
  {
    id: 7,
    name: "Geração VII",
    roman: "VII",
    region: "Alola",
    start: 722,
    end: 809,
  },
  {
    id: 8,
    name: "Geração VIII",
    roman: "VIII",
    region: "Galar",
    start: 810,
    end: 905,
  },
  {
    id: 9,
    name: "Geração IX",
    roman: "IX",
    region: "Paldea",
    start: 906,
    end: 1025,
  },
];

const POKEMON_PER_PAGE = 24;

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState("");
  const [selectedGeneration, setSelectedGeneration] =
    useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPokemon() {
      try {
        setLoading(true);

        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0"
        );

        if (!response.ok) {
          throw new Error(
            "Erro ao carregar Pokédex"
          );
        }

        const data = await response.json();

        setPokemon(data.results);
      } catch (error) {
        console.error(
          "Erro ao carregar Pokémon:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, []);

  function getPokemonId(url: string) {
    const parts = url.split("/").filter(Boolean);

    return Number(parts[parts.length - 1]);
  }

  const filteredPokemon = useMemo(() => {
    const generation = generations.find(
      (item) => item.id === selectedGeneration
    );

    const searchTerm = search
      .toLowerCase()
      .trim();

    return pokemon.filter((item) => {
      const id = getPokemonId(item.url);

      if (searchTerm) {
        return (
          item.name
            .toLowerCase()
            .includes(searchTerm) ||
          String(id).includes(searchTerm)
        );
      }

      if (!generation) {
        return true;
      }

      return (
        id >= generation.start &&
        id <= generation.end
      );
    });
  }, [
    pokemon,
    search,
    selectedGeneration,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredPokemon.length /
        POKEMON_PER_PAGE
    )
  );

  const paginatedPokemon =
    filteredPokemon.slice(
      (currentPage - 1) *
        POKEMON_PER_PAGE,
      currentPage *
        POKEMON_PER_PAGE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedGeneration,
  ]);

  function selectGeneration(id: number) {
    setSelectedGeneration(id);
    setCurrentPage(1);
  }

  function changePage(page: number) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const selected =
    generations.find(
      (item) =>
        item.id === selectedGeneration
    ) ?? generations[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">

      {/* BACKGROUND EFFECTS */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />

        <div className="absolute right-[-10%] top-[30%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

        <div className="absolute bottom-[10%] left-[30%] h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[140px]" />

      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050507]/80 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <a
            href="/"
            className="group flex items-center gap-3"
          >

            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/40 bg-red-500/10 text-xl shadow-[0_0_25px_rgba(239,68,68,0.25)] transition group-hover:shadow-[0_0_35px_rgba(239,68,68,0.45)]">
              ⚡
            </div>

            <div>

              <h1 className="text-lg font-black tracking-[0.2em]">
                POKÉDEX
              </h1>

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                Nexus Database
              </p>

            </div>

          </a>

          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest md:flex">

            <a
              href="/"
              className="text-red-400 transition hover:text-red-300"
            >
              Pokédex
            </a>

            <a
              href="#generations"
              className="text-zinc-500 transition hover:text-cyan-400"
            >
              Gerações
            </a>

            <a
              href="#pokemon"
              className="text-zinc-500 transition hover:text-cyan-400"
            >
              Database
            </a>

            <a
              href="#tcg"
              className="text-zinc-500 transition hover:text-cyan-400"
            >
              TCG
            </a>

          </nav>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 md:flex">

            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />

            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Online
            </span>

          </div>

        </div>

      </header>

      {/* HERO */}
      <section className="relative z-10 border-b border-white/5">

        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">

          <div className="max-w-5xl">

            <div className="mb-6 flex items-center gap-3">

              <span className="h-px w-10 bg-red-500 shadow-[0_0_10px_#ef4444]" />

              <span className="text-xs font-black uppercase tracking-[0.35em] text-red-400">
                SYSTEM // ONLINE
              </span>

            </div>

            <h2 className="text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">

              EXPLORE

              <span className="block bg-gradient-to-r from-red-500 via-red-400 to-cyan-400 bg-clip-text text-transparent">
                THE POKÉMON
              </span>

              <span className="block text-white">
                WORLD.
              </span>

            </h2>

            <p className="mt-8 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
              Uma central de dados para explorar os
              1025 Pokémon, suas evoluções e,
              em breve, toda a coleção Pokémon TCG.
            </p>

            {/* SEARCH */}
            <div className="mt-10 max-w-3xl">

              <div className="group relative">

                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-red-500/60 via-purple-500/30 to-cyan-400/60 opacity-70 blur-sm transition group-focus-within:opacity-100" />

                <div className="relative flex items-center rounded-2xl border border-white/10 bg-[#0c0c11]/95 p-2 backdrop-blur-xl">

                  <span className="px-4 text-xl text-cyan-400">
                    ⌕
                  </span>

                  <input
                    type="text"
                    placeholder="Pesquisar Pokémon ou número..."
                    value={search}
                    onChange={(event) => {
                      setSearch(
                        event.target.value
                      );
                      setCurrentPage(1);
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        setCurrentPage(1);
                      }
                    }}
                    className="w-full bg-transparent px-2 py-4 text-sm font-medium text-white outline-none placeholder:text-zinc-600"
                  />

                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setCurrentPage(1);
                      }}
                      className="mr-2 rounded-lg px-3 py-2 text-xs font-bold text-zinc-500 transition hover:bg-white/5 hover:text-white"
                    >
                      LIMPAR
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(1)
                    }
                    className="rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-xs font-black uppercase tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.25)] transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(239,68,68,0.45)]"
                  >
                    Buscar
                  </button>

                </div>

              </div>

              {search.trim() && (
                <p className="mt-3 text-xs font-medium text-cyan-400/70">
                  ◉ BUSCA GLOBAL // 1025 REGISTROS
                </p>
              )}

            </div>

            {/* HERO STATS */}
            <div className="mt-12 flex flex-wrap gap-8">

              <div>
                <p className="text-3xl font-black">
                  1025
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Pokémon
                </p>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div>
                <p className="text-3xl font-black">
                  09
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Gerações
                </p>
              </div>

              <div className="h-10 w-px bg-white/10" />

              <div>
                <p className="text-3xl font-black text-red-500">
                  TCG
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  Database
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* GENERATIONS */}
      <section
        id="generations"
        className="relative z-10 mx-auto max-w-7xl px-6 py-16"
      >

        <div className="mb-8">

          <div className="flex items-center gap-3">

            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
              01 // NAVIGATION
            </span>

            <span className="h-px flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />

          </div>

          <h3 className="mt-4 text-3xl font-black md:text-4xl">
            Escolha uma{" "}
            <span className="text-red-500">
              geração
            </span>
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            Acesse rapidamente cada região da
            Pokédex.
          </p>

        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">

          {generations.map(
            (generation) => {

              const active =
                selectedGeneration ===
                generation.id;

              const count =
                generation.end -
                generation.start +
                1;

              return (
                <button
                  key={generation.id}
                  onClick={() =>
                    selectGeneration(
                      generation.id
                    )
                  }
                  className={`group relative min-h-[125px] overflow-hidden rounded-2xl border p-4 text-left transition duration-300 ${
                    active
                      ? "border-red-500/60 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.12)]"
                      : "border-white/10 bg-white/[0.025] hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/[0.05]"
                  }`}
                >

                  <div
                    className={`absolute right-0 top-0 h-20 w-20 rounded-full blur-2xl ${
                      active
                        ? "bg-red-500/20"
                        : "bg-cyan-500/0 group-hover:bg-cyan-500/10"
                    }`}
                  />

                  <div className="relative">

                    <p
                      className={`text-[9px] font-black uppercase tracking-widest ${
                        active
                          ? "text-red-400"
                          : "text-zinc-600"
                      }`}
                    >
                      {generation.id === 0
                        ? "DATABASE"
                        : `GEN ${generation.id}`}
                    </p>

                    <p className="mt-2 text-sm font-black">
                      {generation.id === 0
                        ? "Todas"
                        : `Geração ${generation.roman}`}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        active
                          ? "text-zinc-300"
                          : "text-zinc-600"
                      }`}
                    >
                      {generation.region}
                    </p>

                    <p
                      className={`mt-3 text-[10px] font-bold ${
                        active
                          ? "text-cyan-400"
                          : "text-zinc-500"
                      }`}
                    >
                      {count} REGISTROS
                    </p>

                  </div>

                </button>
              );
            }
          )}

        </div>

      </section>

      {/* DATABASE */}
      <section
        id="pokemon"
        className="relative z-10 mx-auto max-w-7xl px-6 pb-24"
      >

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
                02 // DATABASE
              </span>

              <span className="h-px w-16 bg-red-500/30" />

            </div>

            <h3 className="mt-3 text-3xl font-black md:text-4xl">

              {search.trim()
                ? "Resultados da busca"
                : selected.id === 0
                ? "Todos os Pokémon"
                : `Pokémon de ${selected.region}`}

            </h3>

            <p className="mt-2 text-sm text-zinc-500">

              {search.trim()
                ? `Pesquisa global por "${search}"`
                : "Selecione um registro para acessar seus dados."}

            </p>

          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">

            <p className="text-right text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Registros encontrados
            </p>

            <p className="text-right text-xl font-black text-cyan-400">
              {filteredPokemon.length}
            </p>

          </div>

        </div>

        {/* LOADING */}
        {loading ? (

          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-20 text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-white/10 border-t-red-500 border-r-cyan-400" />

            <p className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-500">
              Sincronizando database...
            </p>

          </div>

        ) : paginatedPokemon.length ===
          0 ? (

          /* NO RESULTS */
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-20 text-center">

            <div className="text-5xl opacity-70">
              ◉
            </div>

            <h4 className="mt-5 text-xl font-black">
              Nenhum registro encontrado
            </h4>

            <p className="mt-2 text-sm text-zinc-500">
              Tente outro nome ou número da Pokédex.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedGeneration(0);
                setCurrentPage(1);
              }}
              className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-black uppercase tracking-widest text-red-400 transition hover:bg-red-500/20"
            >
              Limpar filtros
            </button>

          </div>

        ) : (

          <>

            {/* POKEMON GRID */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">

              {paginatedPokemon.map(
                (item) => {

                  const id =
                    getPokemonId(
                      item.url
                    );

                  return (
                    <a
                      key={item.name}
                      href={`/pokemon/${id}`}
                      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] transition duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:shadow-[0_15px_50px_rgba(0,0,0,0.5)]"
                    >

                      {/* NEON GLOW */}
                      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/0 blur-3xl transition duration-500 group-hover:bg-cyan-500/20" />

                      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-white/[0.04] to-transparent p-5">

                        <div className="absolute inset-x-8 bottom-5 h-12 rounded-full bg-red-500/0 blur-2xl transition duration-500 group-hover:bg-red-500/30" />

                        <span className="absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/40 px-2 py-1 text-[9px] font-black tracking-widest text-zinc-500 backdrop-blur">
                          #{String(id).padStart(
                            4,
                            "0"
                          )}
                        </span>

                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                          alt={item.name}
                          loading="lazy"
                          className="relative z-10 h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.7)] transition duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]"
                        />

                      </div>

                      <div className="relative border-t border-white/5 p-4">

                        <div className="flex items-center justify-between gap-2">

                          <h4 className="truncate capitalize font-black">
                            {item.name}
                          </h4>

                          <span className="text-cyan-400 opacity-0 transition group-hover:opacity-100">
                            →
                          </span>

                        </div>

                        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                          Access data
                        </p>

                      </div>

                    </a>
                  );
                }
              )}

            </div>

            {/* PAGINATION */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">

              <button
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  changePage(
                    currentPage - 1
                  )
                }
                className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 transition hover:border-cyan-400/30 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                ← Anterior
              </button>

              {Array.from(
                {
                  length: Math.min(
                    totalPages,
                    7
                  ),
                },
                (_, index) => {

                  let page =
                    index + 1;

                  if (
                    totalPages >
                    7
                  ) {

                    if (
                      currentPage <=
                      4
                    ) {
                      page =
                        index + 1;
                    } else if (
                      currentPage >=
                      totalPages - 3
                    ) {
                      page =
                        totalPages -
                        6 +
                        index;
                    } else {
                      page =
                        currentPage -
                        3 +
                        index;
                    }

                  }

                  return (
                    <button
                      key={page}
                      onClick={() =>
                        changePage(
                          page
                        )
                      }
                      className={`h-11 min-w-11 rounded-xl text-xs font-black transition ${
                        currentPage ===
                        page
                          ? "bg-red-600 text-white shadow-[0_0_25px_rgba(239,68,68,0.25)]"
                          : "border border-white/10 bg-white/[0.025] text-zinc-500 hover:border-cyan-400/30 hover:text-cyan-400"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}

              <button
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  changePage(
                    currentPage + 1
                  )
                }
                className="rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 transition hover:border-cyan-400/30 hover:text-cyan-400 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Próxima →
              </button>

            </div>

            <p className="mt-5 text-center text-[10px] font-bold uppercase tracking-widest text-zinc-700">
              Página {currentPage} /{" "}
              {totalPages}
              {" • "}
              {filteredPokemon.length} registros
            </p>

          </>

        )}

      </section>

      {/* TCG */}
      <section
        id="tcg"
        className="relative overflow-hidden border-y border-red-500/10 bg-gradient-to-br from-red-950/30 via-[#08080d] to-cyan-950/20"
      >

        <div className="absolute right-[-10%] top-[-50%] h-[600px] w-[600px] rounded-full bg-red-500/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20">

          <div className="max-w-3xl">

            <div className="flex items-center gap-3">

              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
                03 // TCG DATABASE
              </span>

              <span className="h-px w-16 bg-red-500/30" />

            </div>

            <h3 className="mt-5 text-4xl font-black md:text-5xl">

              Seu Pokémon.

              <span className="block text-red-500">
                Suas cartas.
              </span>

            </h3>

            <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
              Cada Pokémon possui sua própria página
              com informações, evoluções e cartas
              Pokémon TCG relacionadas.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <a
                href="/pokemon/25"
                className="rounded-xl bg-red-600 px-6 py-3 text-xs font-black uppercase tracking-widest shadow-[0_0_25px_rgba(239,68,68,0.2)] transition hover:bg-red-500 hover:shadow-[0_0_35px_rgba(239,68,68,0.35)]"
              >
                Explorar Pikachu →
              </a>

              <a
                href="/pokemon/6"
                className="rounded-xl border border-white/10 bg-white/[0.03] px-6 py-3 text-xs font-black uppercase tracking-widest text-zinc-400 transition hover:border-cyan-400/30 hover:text-cyan-400"
              >
                Explorar Charizard
              </a>

            </div>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#030304] px-6 py-10">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">

          <div>

            <p className="text-sm font-black tracking-[0.2em]">
              POKÉDEX
            </p>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-zinc-700">
              Nexus Database
            </p>

          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-700">
            Pokémon TCG • Next.js • PokéAPI
          </p>

        </div>

      </footer>

    </main>
  );
}