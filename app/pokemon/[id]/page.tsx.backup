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

type EvolutionDetail = {
  item: {
    name: string;
  } | null;

  trigger: {
    name: string;
  };

  min_level: number | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;

  time_of_day: string;

  held_item: {
    name: string;
  } | null;

  known_move: {
    name: string;
  } | null;

  location: {
    name: string;
  } | null;

  trade_species: {
    name: string;
  } | null;

  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
};

type EvolutionLink = {
  is_baby: boolean;

  species: {
    name: string;
    url: string;
  };

  evolution_details: EvolutionDetail[];

  evolves_to: EvolutionLink[];
};

type EvolutionChain = {
  id: number;
  chain: EvolutionLink;
};

type EvolutionPokemon = {
  name: string;
  id: number;
  image: string | null;
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

async function getPokemonSpecies(id: number) {
  const response = await fetch(
    "https://pokeapi.co/api/v2/pokemon-species/" + id,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function getEvolutionChain(
  id: number
): Promise<EvolutionChain | null> {
  try {
    const species = await getPokemonSpecies(id);

    if (!species?.evolution_chain?.url) {
      return null;
    }

    const response = await fetch(
      species.evolution_chain.url,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(
      "Erro ao buscar cadeia evolutiva:",
      error
    );

    return null;
  }
}

async function getEvolutionPokemon(
  name: string
): Promise<EvolutionPokemon> {
  try {
    const response = await fetch(
      "https://pokeapi.co/api/v2/pokemon/" + name,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return {
        name,
        id: 0,
        image: null,
      };
    }

    const data = await response.json();

    return {
      name: data.name,
      id: data.id,
      image:
        data.sprites?.other?.["official-artwork"]
          ?.front_default ?? null,
    };
  } catch {
    return {
      name,
      id: 0,
      image: null,
    };
  }
}

async function getTCGCards(
  pokedexNumber: number,
  pokemonName: string
): Promise<TCGCard[]> {
  try {
    const queries = [
      `nationalPokedexNumbers:${pokedexNumber}`,
      `name:${pokemonName}`,
    ];

    for (const search of queries) {
      const query = encodeURIComponent(search);

      const url =
        "https://api.pokemontcg.io/v2/cards?q=" +
        query +
        "&pageSize=250";

      try {
        const response = await fetch(url, {
          cache: "no-store",
        });

        if (!response.ok) {
          console.error(
            "TCG API:",
            response.status
          );

          continue;
        }

        const data = await response.json();

        if (
          data.data &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          return data.data;
        }
      } catch (error) {
        console.error(
          "Erro na busca TCG:",
          error
        );
      }
    }

    return [];
  } catch (error) {
    console.error(
      "Erro geral TCG:",
      error
    );

    return [];
  }
}

function getPokemonIdFromUrl(url: string) {
  const parts = url.split("/").filter(Boolean);

  return Number(parts[parts.length - 1]);
}

function formatName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function formatItemName(name: string) {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

function getEvolutionCondition(
  details: EvolutionDetail[]
) {
  if (!details || details.length === 0) {
    return "Evolução";
  }

  const detail = details[0];

  if (
    detail.trigger?.name === "level-up" &&
    detail.min_level
  ) {
    return `Nível ${detail.min_level}`;
  }

  if (detail.item?.name) {
    return formatItemName(
      detail.item.name
    );
  }

  if (detail.trigger?.name === "trade") {
    if (detail.trade_species?.name) {
      return `Troca por ${formatName(
        detail.trade_species.name
      )}`;
    }

    return "Troca";
  }

  if (detail.min_happiness) {
    return `Felicidade ${detail.min_happiness}+`;
  }

  if (detail.min_affection) {
    return `Afeto ${detail.min_affection}+`;
  }

  if (detail.min_beauty) {
    return `Beleza ${detail.min_beauty}+`;
  }

  if (detail.time_of_day) {
    return `Durante ${
      detail.time_of_day === "day"
        ? "o dia"
        : "a noite"
    }`;
  }

  if (detail.known_move?.name) {
    return `Conhecer ${formatItemName(
      detail.known_move.name
    )}`;
  }

  if (detail.location?.name) {
    return `Local: ${formatItemName(
      detail.location.name
    )}`;
  }

  if (detail.held_item?.name) {
    return `Segurando ${formatItemName(
      detail.held_item.name
    )}`;
  }

  if (detail.needs_overworld_rain) {
    return "Durante chuva";
  }

  if (detail.turn_upside_down) {
    return "Virando o console";
  }

  return formatName(
    detail.trigger?.name || "Evolução"
  );
}

function flattenEvolutionChain(
  link: EvolutionLink,
  currentPokemonId: number,
  result: Array<{
    name: string;
    id: number;
    image: string | null;
    details: EvolutionDetail[];
  }> = []
) {
  const id = getPokemonIdFromUrl(
    link.species.url
  );

  result.push({
    name: link.species.name,
    id,
    image: null,
    details: link.evolution_details || [],
  });

  for (const next of link.evolves_to) {
    flattenEvolutionChain(
      next,
      currentPokemonId,
      result
    );
  }

  return result;
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pokemon = await getPokemon(id);

  const [
    cards,
    evolutionChain,
  ] = await Promise.all([
    getTCGCards(
      pokemon.id,
      pokemon.name
    ),
    getEvolutionChain(pokemon.id),
  ]);

  const image =
    pokemon.sprites.other[
      "official-artwork"
    ].front_default;

  let evolutionData: Array<{
    name: string;
    id: number;
    image: string | null;
    details: EvolutionDetail[];
  }> = [];

  if (evolutionChain) {
    evolutionData =
      flattenEvolutionChain(
        evolutionChain.chain,
        pokemon.id
      );

    const evolutionWithImages =
      await Promise.all(
        evolutionData.map(
          async (evolution) => {
            const data =
              await getEvolutionPokemon(
                evolution.name
              );

            return {
              ...evolution,
              image: data.image,
              id: data.id,
            };
          }
        )
      );

    evolutionData =
      evolutionWithImages;
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] text-zinc-900">

      {/* HEADER */}
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

      {/* POKEMON */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">

          {/* IMAGE */}
          <div className="flex min-h-[420px] items-center justify-center bg-zinc-100 p-10">

            {image && (
              <img
                src={image}
                alt={pokemon.name}
                className="max-h-[400px] w-full object-contain"
              />
            )}

          </div>

          {/* INFORMATION */}
          <div className="p-8 md:p-12">

            <p className="text-sm font-black uppercase tracking-widest text-red-600">
              Pokémon #
              {String(pokemon.id).padStart(
                4,
                "0"
              )}
            </p>

            <h2 className="mt-3 text-5xl font-black capitalize">
              {pokemon.name}
            </h2>

            {/* TYPES */}
            <div className="mt-6 flex flex-wrap gap-2">

              {pokemon.types.map(
                (item) => (
                  <span
                    key={item.type.name}
                    className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold uppercase text-white"
                  >
                    {item.type.name}
                  </span>
                )
              )}

            </div>

            {/* STATS */}
            <div className="mt-8 grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-zinc-100 p-5">

                <p className="text-xs font-bold uppercase text-zinc-500">
                  Altura
                </p>

                <p className="mt-2 text-2xl font-black">
                  {(
                    pokemon.height / 10
                  ).toFixed(1)}{" "}
                  m
                </p>

              </div>

              <div className="rounded-2xl bg-zinc-100 p-5">

                <p className="text-xs font-bold uppercase text-zinc-500">
                  Peso
                </p>

                <p className="mt-2 text-2xl font-black">
                  {(
                    pokemon.weight / 10
                  ).toFixed(1)}{" "}
                  kg
                </p>

              </div>

            </div>

            {/* ABILITIES */}
            <div className="mt-8">

              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Habilidades
              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                {pokemon.abilities.map(
                  (item) => (
                    <span
                      key={
                        item.ability.name
                      }
                      className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold capitalize"
                    >
                      {item.ability.name.replace(
                        "-",
                        " "
                      )}
                    </span>
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* EVOLUTION */}
      <section className="mx-auto max-w-7xl px-6 pb-10">

        <div className="rounded-3xl bg-white p-8 shadow-sm">

          <p className="text-sm font-black uppercase tracking-widest text-red-600">
            Evoluções
          </p>

          <h3 className="mt-2 text-3xl font-black">
            Linha evolutiva
          </h3>

          <p className="mt-3 text-zinc-500">
            Veja como este Pokémon evolui.
          </p>

          {evolutionData.length > 0 ? (

            <div className="mt-8 overflow-x-auto pb-4">

              <div className="flex min-w-max items-center justify-center gap-4">

                {evolutionData.map(
                  (evolution, index) => {

                    const isCurrent =
                      evolution.id ===
                      pokemon.id;

                    return (
                      <div
                        key={`${evolution.name}-${evolution.id}`}
                        className="flex items-center gap-4"
                      >

                        <a
                          href={`/pokemon/${evolution.id}`}
                          className={`group relative w-40 overflow-hidden rounded-2xl border-2 bg-white p-4 text-center transition ${
                            isCurrent
                              ? "border-red-600 shadow-lg"
                              : "border-zinc-200 hover:border-red-400 hover:shadow-md"
                          }`}
                        >

                          {isCurrent && (
                            <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[9px] font-black uppercase text-white">
                              Você está aqui
                            </span>
                          )}

                          <div className="flex h-28 items-center justify-center">

                            {evolution.image && (
                              <img
                                src={
                                  evolution.image
                                }
                                alt={
                                  evolution.name
                                }
                                className="h-full w-full object-contain transition duration-300 group-hover:scale-110"
                              />
                            )}

                          </div>

                          <p className="text-xs font-bold text-zinc-400">
                            #
                            {String(
                              evolution.id
                            ).padStart(
                              4,
                              "0"
                            )}
                          </p>

                          <p className="mt-1 font-black capitalize">
                            {formatName(
                              evolution.name
                            )}
                          </p>

                        </a>

                        {index <
                          evolutionData.length -
                            1 && (
                          <div className="flex flex-col items-center gap-1">

                            <span className="text-2xl font-black text-red-500">
                              →
                            </span>

                            <span className="whitespace-nowrap rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600">

                              {getEvolutionCondition(
                                evolutionData[
                                  index + 1
                                ].details
                              )}

                            </span>

                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          ) : (

            <div className="mt-8 rounded-2xl bg-zinc-100 p-6 text-sm text-zinc-500">
              Este Pokémon não possui uma
              cadeia evolutiva disponível.
            </div>

          )}

        </div>

      </section>

      {/* TCG */}
      <section className="bg-red-600">

        <div className="mx-auto max-w-7xl px-6 py-16 text-white">

          <p className="text-sm font-black uppercase tracking-widest text-red-200">
            Pokémon TCG
          </p>

          <h3 className="mt-2 text-3xl font-black md:text-4xl">
            Cartas de{" "}
            {pokemon.name}
          </h3>

          <p className="mt-3 text-red-100">
            {cards.length} cartas
            encontradas
          </p>

          {cards.length === 0 ? (

            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-8">

              <p className="font-bold">
                Nenhuma carta encontrada.
              </p>

              <p className="mt-2 text-sm text-red-100">
                Não encontramos cartas
                vinculadas a este
                Pokémon.
              </p>

            </div>

          ) : (

            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">

              {cards.map(
                (card) => (

                  <article
                    key={card.id}
                    className="overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-xl transition duration-300 hover:-translate-y-2"
                  >

                    <div className="bg-zinc-100">

                      <img
                        src={
                          card.images
                            .large
                        }
                        alt={
                          card.name
                        }
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
                          #
                          {
                            card.number
                          }
                        </span>

                        {card.rarity && (
                          <span className="text-right font-semibold text-zinc-500">
                            {
                              card.rarity
                            }
                          </span>
                        )}

                      </div>

                      {card.artist && (
                        <p className="mt-3 text-xs text-zinc-400">
                          Artista:{" "}
                          {
                            card.artist
                          }
                        </p>
                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          )}

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-500">
        Pokédex TCG • Projeto
        desenvolvido com
        Next.js
      </footer>

    </main>
  );
}