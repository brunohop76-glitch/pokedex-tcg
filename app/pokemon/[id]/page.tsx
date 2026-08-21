type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string } }[];
  sprites: {
    other: { "official-artwork": { front_default: string | null } };
  };
};

type TCGCardBrief = {
  id: string;
  localId?: string;
  name: string;
  image?: string | null;
};

type TCGCard = TCGCardBrief & {
  rarity?: string;
  illustrator?: string;
  set?: {
    id?: string;
    name?: string;
    serie?: { id?: string; name?: string };
  };
};

type EvolutionDetail = {
  item: { name: string } | null;
  trigger: { name: string };
  min_level: number | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  time_of_day: string;
  held_item: { name: string } | null;
  known_move: { name: string } | null;
  location: { name: string } | null;
  trade_species: { name: string } | null;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
};

type EvolutionLink = {
  species: { name: string; url: string };
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionLink[];
};

async function getPokemon(id: string): Promise<Pokemon> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Pokémon não encontrado");
  return response.json();
}

async function getPokemonSpecies(id: number) {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, { cache: "no-store" });
  return response.ok ? response.json() : null;
}

async function getEvolutionChain(id: number): Promise<EvolutionLink | null> {
  try {
    const species = await getPokemonSpecies(id);
    const url = species?.evolution_chain?.url;
    if (!url) return null;
    const response = await fetch(url, { cache: "no-store" });
    return response.ok ? (await response.json()).chain : null;
  } catch {
    return null;
  }
}

function getPokemonIdFromUrl(url: string) {
  const parts = url.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

function formatName(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getEvolutionCondition(details: EvolutionDetail[]) {
  const detail = details?.[0];
  if (!detail) return "Evolução";
  if (detail.trigger?.name === "level-up" && detail.min_level) return `Nível ${detail.min_level}`;
  if (detail.item?.name) return formatName(detail.item.name);
  if (detail.trigger?.name === "trade") return "Troca";
  if (detail.min_happiness) return `Felicidade ${detail.min_happiness}+`;
  if (detail.min_affection) return `Afeto ${detail.min_affection}+`;
  if (detail.min_beauty) return `Beleza ${detail.min_beauty}+`;
  if (detail.time_of_day) return detail.time_of_day === "day" ? "Durante o dia" : "Durante a noite";
  if (detail.known_move?.name) return `Conhecer ${formatName(detail.known_move.name)}`;
  if (detail.held_item?.name) return `Segurando ${formatName(detail.held_item.name)}`;
  if (detail.location?.name) return `Local: ${formatName(detail.location.name)}`;
  if (detail.needs_overworld_rain) return "Durante chuva";
  if (detail.turn_upside_down) return "Virando o console";
  return formatName(detail.trigger?.name || "Evolução");
}

function flattenEvolutionChain(
  link: EvolutionLink,
  result: Array<{ name: string; id: number; image: string | null; details: EvolutionDetail[] }> = []
) {
  result.push({
    name: link.species.name,
    id: getPokemonIdFromUrl(link.species.url),
    image: null,
    details: link.evolution_details || [],
  });
  for (const next of link.evolves_to || []) flattenEvolutionChain(next, result);
  return result;
}

function getReliableCardImage(card: TCGCard) {
  const serieId = card.set?.serie?.id;
  const setId = card.set?.id;
  const localId = card.localId;

  if (serieId && setId && localId) {
    return `https://assets.tcgdex.net/en/${serieId}/${setId}/${localId}/high.png`;
  }

  if (card.image) {
    const clean = card.image.replace(/\/$/, "");
    if (/\.(png|webp|jpg)$/i.test(clean)) return clean;
    return `${clean}/high.png`;
  }

  return null;
}

async function getTCGCards(pokedexNumber: number, pokemonName: string): Promise<TCGCard[]> {
  const base = "https://api.tcgdex.net/v2/en";
  let briefs: TCGCardBrief[] = [];

  try {
    const response = await fetch(`${base}/dex-ids/${pokedexNumber}`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      briefs = Array.isArray(data) ? data : data.cards || [];
    }
  } catch (error) {
    console.error("Erro na busca por Pokédex TCGdex:", error);
  }

  if (briefs.length === 0) {
    try {
      const name = encodeURIComponent(pokemonName);
      const response = await fetch(
        `${base}/cards?category=Pokemon&name=${name}&pagination:itemsPerPage=100`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const data = await response.json();
        briefs = Array.isArray(data) ? data : data.cards || [];
      }
    } catch (error) {
      console.error("Erro na busca por nome TCGdex:", error);
    }
  }

  const unique = Array.from(
    new Map(
      briefs
        .filter((card) => card?.id && card?.name)
        .map((card) => [card.id, card])
    ).values()
  ).slice(0, 100);

  const detailed = await Promise.all(
    unique.map(async (card): Promise<TCGCard | null> => {
      try {
        const response = await fetch(`${base}/cards/${encodeURIComponent(card.id)}`, {
          cache: "no-store",
        });

        if (!response.ok) return card;

        const full = await response.json();
        return {
          ...card,
          ...full,
          image: full.image || card.image || null,
          localId: full.localId || card.localId,
          set: full.set || card.set,
        };
      } catch (error) {
        console.error("Erro ao carregar carta:", card.id, error);
        return card;
      }
    })
  );

  return detailed
    .filter((card): card is TCGCard => Boolean(card))
    .map((card) => ({ ...card, image: getReliableCardImage(card) }))
    .filter((card) => Boolean(card.image));
}

async function getEvolutionPokemon(name: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, { cache: "no-store" });
    if (!response.ok) return { id: 0, image: null };
    const data = await response.json();
    return {
      id: data.id,
      image: data.sprites?.other?.["official-artwork"]?.front_default ?? null,
    };
  } catch {
    return { id: 0, image: null };
  }
}

export default async function PokemonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pokemon = await getPokemon(id);

  const [cards, evolutionChain] = await Promise.all([
    getTCGCards(pokemon.id, pokemon.name),
    getEvolutionChain(pokemon.id),
  ]);

  const image = pokemon.sprites.other["official-artwork"].front_default;

  let evolutionData: Array<{ name: string; id: number; image: string | null; details: EvolutionDetail[] }> = [];

  if (evolutionChain) {
    const base = flattenEvolutionChain(evolutionChain);
    evolutionData = await Promise.all(
      base.map(async (evolution) => {
        const data = await getEvolutionPokemon(evolution.name);
        return { ...evolution, id: data.id || evolution.id, image: data.image };
      })
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f4f4] text-zinc-900">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-2xl shadow-lg">⚡</div>
            <div>
              <h1 className="text-xl font-black">POKÉDEX</h1>
              <p className="text-xs font-medium text-zinc-500">Pokémon TCG Database</p>
            </div>
          </a>
          <a href="/" className="text-sm font-bold text-red-600">← Voltar para Pokédex</a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid overflow-hidden rounded-3xl bg-white shadow-sm md:grid-cols-2">
          <div className="flex min-h-[420px] items-center justify-center bg-zinc-100 p-10">
            {image ? (
              <img src={image} alt={pokemon.name} className="max-h-[400px] w-full object-contain" />
            ) : (
              <span className="font-bold text-zinc-400">Imagem indisponível</span>
            )}
          </div>

          <div className="p-8 md:p-12">
            <p className="text-sm font-black uppercase tracking-widest text-red-600">Pokémon #{String(pokemon.id).padStart(4, "0")}</p>
            <h2 className="mt-3 text-5xl font-black capitalize">{pokemon.name}</h2>

            <div className="mt-6 flex flex-wrap gap-2">
              {pokemon.types.map((item) => (
                <span key={item.type.name} className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold uppercase text-white">{item.type.name}</span>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-zinc-100 p-5">
                <p className="text-xs font-bold uppercase text-zinc-500">Altura</p>
                <p className="mt-2 text-2xl font-black">{(pokemon.height / 10).toFixed(1)} m</p>
              </div>
              <div className="rounded-2xl bg-zinc-100 p-5">
                <p className="text-xs font-bold uppercase text-zinc-500">Peso</p>
                <p className="mt-2 text-2xl font-black">{(pokemon.weight / 10).toFixed(1)} kg</p>
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Habilidades</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {pokemon.abilities.map((item) => (
                  <span key={item.ability.name} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold capitalize">{item.ability.name.replace(/-/g, " ")}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-black uppercase tracking-widest text-red-600">Evoluções</p>
          <h3 className="mt-2 text-3xl font-black">Linha evolutiva</h3>
          <p className="mt-3 text-zinc-500">Veja como este Pokémon evolui.</p>

          {evolutionData.length > 0 ? (
            <div className="mt-8 overflow-x-auto pb-4">
              <div className="flex min-w-max items-center justify-center gap-4">
                {evolutionData.map((evolution, index) => {
                  const isCurrent = evolution.id === pokemon.id;
                  return (
                    <div key={`${evolution.name}-${evolution.id}`} className="flex items-center gap-4">
                      <a href={`/pokemon/${evolution.id}`} className={`group relative w-40 overflow-hidden rounded-2xl border-2 bg-white p-4 text-center transition ${isCurrent ? "border-red-600 shadow-lg" : "border-zinc-200 hover:border-red-400 hover:shadow-md"}`}>
                        {isCurrent && <span className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[9px] font-black uppercase text-white">Você está aqui</span>}
                        <div className="flex h-28 items-center justify-center">
                          {evolution.image ? <img src={evolution.image} alt={evolution.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-110" /> : <span className="text-xs text-zinc-400">Sem imagem</span>}
                        </div>
                        <p className="text-xs font-bold text-zinc-400">#{String(evolution.id).padStart(4, "0")}</p>
                        <p className="mt-1 font-black capitalize">{formatName(evolution.name)}</p>
                      </a>
                      {index < evolutionData.length - 1 && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-2xl font-black text-red-500">→</span>
                          <span className="whitespace-nowrap rounded-full bg-red-50 px-3 py-1 text-[10px] font-bold text-red-600">{getEvolutionCondition(evolutionData[index + 1].details)}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-zinc-100 p-6 text-sm text-zinc-500">Este Pokémon não possui uma cadeia evolutiva disponível.</div>
          )}
        </div>
      </section>

      <section id="tcg" className="bg-red-600">
        <div className="mx-auto max-w-7xl px-6 py-16 text-white">
          <p className="text-sm font-black uppercase tracking-widest text-red-200">Pokémon TCG</p>
          <h3 className="mt-2 text-3xl font-black md:text-4xl">Cartas de {pokemon.name}</h3>
          <p className="mt-3 text-red-100">{cards.length} cartas encontradas</p>

          {cards.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-white/20 bg-white/10 p-8">
              <p className="font-bold">Nenhuma carta encontrada.</p>
              <p className="mt-2 text-sm text-red-100">Não encontramos cartas vinculadas a este Pokémon.</p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {cards.map((card) => {
                if (!card.image) return null;
                return (
                  <article key={card.id} className="group relative overflow-visible rounded-2xl bg-white text-zinc-900 shadow-xl transition duration-300 hover:z-20 hover:-translate-y-4 hover:scale-[1.04] hover:shadow-2xl">
                    <div className="relative overflow-hidden rounded-t-2xl bg-zinc-100 p-2">
                      <img src={card.image} alt={card.name} loading="lazy" className="block w-full rounded-lg transition duration-300 group-hover:scale-[1.02]" />
                      <a
                        href={card.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Ver carta ${card.name}`}
                        className="absolute inset-0 flex items-center justify-center bg-black/0 transition duration-300 group-hover:bg-black/40"
                      >
                        <span className="translate-y-2 rounded-full border border-white/40 bg-red-600 px-5 py-2 text-[10px] font-black tracking-widest text-white opacity-0 shadow-lg transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          VER CARTA ↗
                        </span>
                      </a>
                    </div>
                    <div className="p-4">
                      <h4 className="font-black">{card.name}</h4>
                      <p className="mt-2 text-xs font-semibold text-zinc-500">{card.set?.name || `Coleção ${card.id.split("-")[0]}`}</p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                        <span className="rounded-full bg-zinc-100 px-3 py-1 font-bold">#{card.localId || card.id.split("-").slice(1).join("-")}</span>
                        {card.rarity && <span className="text-right font-semibold text-zinc-500">{card.rarity}</span>}
                      </div>
                      {card.illustrator && <p className="mt-3 text-xs text-zinc-400">Artista: {card.illustrator}</p>}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <footer className="bg-zinc-950 px-6 py-8 text-center text-sm text-zinc-500">Pokédex TCG • Projeto desenvolvido com Next.js</footer>
    </main>
  );
}
