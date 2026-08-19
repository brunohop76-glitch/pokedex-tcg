type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: {
    type: {
      name: string;
    };
  }[];
  abilities: {
    ability: {
      name: string;
    };
  }[];
  sprites: {
    other: {
      "official-artwork": {
        front_default: string | null;
      };
    };
  };
};

type TCGCard = {
  id: string;
  name: string;
  number: string;
  artist?: string;
  rarity?: string;
  set: {
    name: string;
    releaseDate: string;
  };
  images: {
    small: string;
    large: string;
  };
};

async function getPokemon(id: string): Promise<Pokemon> {
  const response = await fetch(
    "https://pokeapi.co/api/v2/pokemon/" + id,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Pokémon não encontrado");
  }

  return response.json();
}

async function getTCGCards(
  pokedexNumber: number
): Promise<TCGCard[]> {
  const query = encodeURIComponent(
    "nationalPokedexNumbers:" + pokedexNumber
  );

  const response = await fetch(
    "https://api.pokemontcg.io/v2/cards?q=" +
      query +
      "&pageSize=250",
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error("Erro ao buscar cartas TCG");
    return [];
  }

  const data = await response.json();

  return data.data ?? [];
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pokemon = await getPokemon(id);
  const cards = await getTCGCards(pokemon.id);

  const image =
    pokemon.sprites.other["official-artwork"].front_default;

  return (
    <main className="min-h-screen bg-[#f4f4f4] text-zinc-900">

      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <a
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-2xl shadow-lg">
              ⚡
            </div>

            <div>
              <h1 className="text-xl font-black">
                POKÉDEX
              </h1>

              <p className="text-xs font-medium text-zinc-500">
                Pokémon TCG Database
              </p>
            </div>
          </a>

          <a
            href="/"
            className="text-sm font-bold text-red-600"
          >
            ← Voltar para Pokédex
          </a>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">

          <div className="flex min-h-[420px] items-center justify-center bg-zinc-100 p-10">

            {image && (
              <img
                src={image}
                alt={pokemon.name}
                className="max-h-[400px] w-full object-contain"
              />
            )}

          </div>

          <div className="p-8 md:p-12">

            <p className="text-sm font-black uppercase tracking-widest text-red-600">
              Pokémon #{String(pokemon.id).padStart(4, "0")}
            </p>

            <h2 className="mt-3 text-5xl font-black capitalize">
              {pokemon.name}
            </h2>

            <div className="mt-6 flex flex-wrap gap-2">

              {pokemon.types.map((item) => (
                <span
                  key={item.type.name}
                  className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold uppercase text-white"
                >
                  {item.type.name}
                </span>
              ))}

            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-zinc-100 p-5">

                <p className="text-xs font-bold uppercase text-zinc-500">
                  Altura
                </p>

                <p className="mt-2 text-2xl font-black">
                  {(pokemon.height / 10).toFixed(1)} m
                </p>

              </div>

              <div className="rounded-2xl bg-zinc-100 p-5">

                <p className="text-xs font-bold uppercase text-zinc-500">
                  Peso
                </p>

                <p className="mt-2 text-2xl font-black">
                  {(pokemon.weight / 10).toFixed(1)} kg
                </p>

              </div>

            </div>

            <div className="mt-8">

              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Habilidades
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                {pokemon.abilities.map((item) => (
                  <span
                    key={item.ability.name}
                    className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold capitalize"
                  >
                    {item.ability.name.replace("-", " ")}
                  </span>
                ))}

              </div>

            </div>

          </div>

        </div>

      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="text-sm font-black uppercase tracking-widest text-red-600">
            Evoluções
          </p>

          <h3 className="mt-2 text-3xl font-black">
            Linha evolutiva
          </h3>

          <p className="mt-3 text-zinc-500">
            Em breve vamos conectar automaticamente toda a cadeia
            evolutiva deste Pokémon.
          </p>

        </div>

      </section>

      <section className="bg-red-600">

        <div className="mx-auto max-w-7xl px-6 py-16 text-white">

          <p className="text-sm font-black uppercase tracking-widest text-red-200">
            Pokémon TCG
          </p>

          <h3 className="mt-2 text-3xl font-black md:text-4xl">
            Cartas de {pokemon.name}
          </h3>

          <p className="mt-3 text-red-100">
            {cards.length} cartas encontradas
          </p>

          {cards.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-8">

              <p className="font-bold">
                Nenhuma carta encontrada.
              </p>

              <p className="mt-2 text-sm text-red-100">
                Não encontramos cartas vinculadas a este Pokémon.
              </p>

            </div>

          ) : (

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

              {cards.map((card) => (

                <article
                  key={card.id}
                  className="overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-xl transition duration-300 hover:-translate-y-2"
                >

                  <div className="bg-zinc-100">

                    <img
                      src={card.images.large}
                      alt={card.name}
                      className="w-full"
                    />

                  </div>

                  <div className="p-4">

                    <h4 className="font-black">
                      {card.name}
                    </h4>

                    <p className="mt-2 text-xs font-semibold text-zinc-500">
                      {card.set.name}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 text-xs">

                      <span className="rounded-full bg-zinc-100 px-3 py-1 font-bold">
                        #{card.number}
                      </span>

                      {card.rarity && (
                        <span className="text-right font-semibold text-zinc-500">
                          {card.rarity}
                        </span>
                      )}

                    </div>

                    {card.artist && (
                      <p className="mt-3 text-xs text-zinc-400">
                        Artista: {card.artist}
                      </p>
                    )}

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

      <footer className="bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-500">
        Pokédex TCG • Projeto desenvolvido com Next.js
      </footer>

    </main>
  );
}
