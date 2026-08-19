"use client";

import { useEffect, useState } from "react";

type Pokemon = {
  name: string;
  url: string;
};

export default function Home() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPokemon() {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=24&offset=0"
        );

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

  const filteredPokemon = pokemon.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function getPokemonId(url: string) {
    const parts = url.split("/").filter(Boolean);
    return parts[parts.length - 1];
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] text-zinc-900">
      {/* HEADER */}
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-2xl shadow-lg">
              ⚡
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                POKÉDEX
              </h1>

              <p className="text-xs font-medium text-zinc-500">
                Pokémon TCG Database
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-sm font-semibold md:flex">
            <a href="#" className="text-red-600">
              Pokédex
            </a>

            <a href="#" className="text-zinc-500 hover:text-zinc-900">
              Cartas TCG
            </a>

            <a href="#" className="text-zinc-500 hover:text-zinc-900">
              Sets
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="mb-4 inline-flex rounded-full bg-red-600/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400">
              Pokémon Database
            </span>

            <h2 className="text-4xl font-black tracking-tight md:text-6xl">
              Explore todos os
              <span className="block text-red-500">
                Pokémon.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400 md:text-lg">
              Encontre informações completas sobre cada Pokémon e descubra
              todas as cartas Pokémon TCG relacionadas a ele.
            </p>

            {/* SEARCH */}
            <div className="mt-8 max-w-2xl">
              <div className="flex items-center rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur">
                <span className="px-4 text-xl">🔎</span>

                <input
                  type="text"
                  placeholder="Pesquise por nome do Pokémon..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full bg-transparent px-2 py-3 text-white outline-none placeholder:text-zinc-500"
                />

                <button className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold transition hover:bg-red-500">
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">
              Pokémon disponíveis
            </p>

            <p className="mt-2 text-3xl font-black">
              1025+
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">
              Cartas TCG
            </p>

            <p className="mt-2 text-3xl font-black">
              Milhares
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">
              Integrações
            </p>

            <p className="mt-2 text-3xl font-black">
              PokéAPI + TCG
            </p>
          </div>
        </div>
      </section>

      {/* POKEMON */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Pokédex
            </p>

            <h3 className="mt-1 text-3xl font-black">
              Pokémon
            </h3>
          </div>

          <p className="text-sm text-zinc-500">
            {filteredPokemon.length} encontrados
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="font-semibold text-zinc-500">
              Carregando Pokémon...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredPokemon.map((item) => {
              const id = getPokemonId(item.url);

              return (
                <article
                  key={item.name}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-zinc-100 p-5">
                    <span className="absolute left-3 top-3 text-xs font-bold text-zinc-400">
                      #{id.padStart(4, "0")}
                    </span>

                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                      alt={item.name}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-110"
                    />
                  </div>

                  <div className="p-4">
                    <h4 className="capitalize font-black">
                      {item.name}
                    </h4>

                    <p className="mt-1 text-xs font-medium text-zinc-500">
                      Ver Pokémon
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* TCG SECTION */}
      <section className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-widest text-red-200">
              Pokémon TCG
            </span>

            <h3 className="mt-2 text-3xl font-black md:text-4xl">
              Encontre todas as cartas do seu Pokémon favorito.
            </h3>

            <p className="mt-4 leading-7 text-red-100">
              Cada Pokémon terá uma página própria mostrando suas cartas,
              expansões, raridades, artes e informações do TCG.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-500">
        Pokédex TCG • Projeto desenvolvido com Next.js
      </footer>
    </main>
  );
}