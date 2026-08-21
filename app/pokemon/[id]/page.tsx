import CardGallery from "./CardGallery";

type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  sprites: { other: { "official-artwork": { front_default: string | null } } };
};

type Species = {
  gender_rate: number;
  genera: { genus: string; language: { name: string } }[];
  flavor_text_entries: { flavor_text: string; language: { name: string }; version: { name: string } }[];
  evolution_chain?: { url?: string };
};

type TypeRelation = {
  damage_relations: {
    double_damage_from: { name: string }[];
    half_damage_from: { name: string }[];
    no_damage_from: { name: string }[];
  };
};

type TCGCardBrief = { id: string; localId?: string; name: string; image?: string | null };
type TCGCard = TCGCardBrief & {
  rarity?: string;
  illustrator?: string;
  set?: { id?: string; name?: string; serie?: { id?: string; name?: string } };
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

async function getPokemonSpecies(id: number): Promise<Species | null> {
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, { cache: "no-store" });
  return response.ok ? response.json() : null;
}

async function getTypeRelation(name: string): Promise<TypeRelation | null> {
  const response = await fetch(`https://pokeapi.co/api/v2/type/${name}`, { cache: "no-store" });
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
  if (detail.time_of_day) return detail.time_of_day === "day" ? "Dia" : "Noite";
  if (detail.known_move?.name) return `Mover: ${formatName(detail.known_move.name)}`;
  if (detail.held_item?.name) return `Item: ${formatName(detail.held_item.name)}`;
  if (detail.location?.name) return `Local: ${formatName(detail.location.name)}`;
  if (detail.needs_overworld_rain) return "Chuva";
  if (detail.turn_upside_down) return "Console invertido";
  return formatName(detail.trigger?.name || "Evolução");
}

function flattenEvolutionChain(
  link: EvolutionLink,
  result: Array<{ name: string; id: number; image: string | null; details: EvolutionDetail[] }> = []
) {
  result.push({ name: link.species.name, id: getPokemonIdFromUrl(link.species.url), image: null, details: link.evolution_details || [] });
  for (const next of link.evolves_to || []) flattenEvolutionChain(next, result);
  return result;
}

async function getEvolutionPokemon(name: string) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`, { cache: "no-store" });
    if (!response.ok) return { id: 0, image: null };
    const data = await response.json();
    return { id: data.id, image: data.sprites?.other?.["official-artwork"]?.front_default ?? null };
  } catch {
    return { id: 0, image: null };
  }
}

function getReliableCardImage(card: TCGCard) {
  const serieId = card.set?.serie?.id;
  const setId = card.set?.id;
  const localId = card.localId;
  if (serieId && setId && localId) return `https://assets.tcgdex.net/en/${serieId}/${setId}/${localId}/high.png`;
  if (card.image) {
    const clean = card.image.replace(/\/$/, "");
    return /\.(png|webp|jpg)$/i.test(clean) ? clean : `${clean}/high.png`;
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
  } catch {}
  if (briefs.length === 0) {
    try {
      const response = await fetch(`${base}/cards?category=Pokemon&name=${encodeURIComponent(pokemonName)}&pagination:itemsPerPage=100`, { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        briefs = Array.isArray(data) ? data : data.cards || [];
      }
    } catch {}
  }
  const unique = Array.from(new Map(briefs.filter((card) => card?.id && card?.name).map((card) => [card.id, card])).values()).slice(0, 100);
  const detailed = await Promise.all(unique.map(async (card): Promise<TCGCard | null> => {
    try {
      const response = await fetch(`${base}/cards/${encodeURIComponent(card.id)}`, { cache: "no-store" });
      if (!response.ok) return card;
      const full = await response.json();
      return { ...card, ...full, image: full.image || card.image || null, localId: full.localId || card.localId, set: full.set || card.set };
    } catch {
      return card;
    }
  }));
  return detailed.filter((card): card is TCGCard => Boolean(card)).map((card) => ({ ...card, image: getReliableCardImage(card) })).filter((card) => Boolean(card.image));
}

function typeLabel(name: string) {
  const labels: Record<string, string> = { normal: "Normal", fire: "Fogo", water: "Água", electric: "Elétrico", grass: "Grama", ice: "Gelo", fighting: "Lutador", poison: "Veneno", ground: "Terra", flying: "Voador", psychic: "Psíquico", bug: "Inseto", rock: "Pedra", ghost: "Fantasma", dragon: "Dragão", dark: "Sombrio", steel: "Aço", fairy: "Fada" };
  return labels[name] || formatName(name);
}

const typeStyles: Record<string, string> = {
  normal: "bg-stone-200 text-stone-800", fire: "bg-orange-500 text-white", water: "bg-sky-500 text-white", electric: "bg-yellow-300 text-zinc-900", grass: "bg-green-500 text-white", ice: "bg-cyan-300 text-zinc-900", fighting: "bg-red-700 text-white", poison: "bg-fuchsia-600 text-white", ground: "bg-amber-600 text-white", flying: "bg-indigo-400 text-white", psychic: "bg-pink-500 text-white", bug: "bg-lime-500 text-zinc-900", rock: "bg-yellow-700 text-white", ghost: "bg-violet-700 text-white", dragon: "bg-indigo-700 text-white", dark: "bg-zinc-800 text-white", steel: "bg-slate-500 text-white", fairy: "bg-pink-300 text-zinc-900",
};

function TypeBadge({ name }: { name: string }) {
  return <span className={`rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-wider ${typeStyles[name] || "bg-zinc-800 text-white"}`}>{typeLabel(name)}</span>;
}

export default async function PokemonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pokemon = await getPokemon(id);
  const [species, cards, evolutionChain, typeRelations] = await Promise.all([
    getPokemonSpecies(pokemon.id),
    getTCGCards(pokemon.id, pokemon.name),
    getEvolutionChain(pokemon.id),
    Promise.all(pokemon.types.map((item) => getTypeRelation(item.type.name))),
  ]);

  const image = pokemon.sprites.other["official-artwork"].front_default;
  const description = species?.flavor_text_entries.find((entry) => entry.language.name === "en")?.flavor_text.replace(/[\n\f]/g, " ") || "Informação descritiva indisponível para este Pokémon.";
  const genus = species?.genera.find((entry) => entry.language.name === "en")?.genus || "Pokémon";
  const genderRate = species?.gender_rate ?? -1;
  const genderText = genderRate === -1 ? "Sem gênero" : genderRate === 0 ? "♂ 100%" : genderRate === 8 ? "♀ 100%" : "♂ 87,5%  •  ♀ 12,5%";

  const weaknessSet = new Set<string>();
  const resistanceSet = new Set<string>();
  const immunitySet = new Set<string>();
  typeRelations.forEach((relation) => {
    relation?.damage_relations.double_damage_from.forEach((item) => weaknessSet.add(item.name));
    relation?.damage_relations.half_damage_from.forEach((item) => resistanceSet.add(item.name));
    relation?.damage_relations.no_damage_from.forEach((item) => immunitySet.add(item.name));
  });
  const weaknesses = Array.from(weaknessSet).filter((name) => !resistanceSet.has(name));
  const resistances = Array.from(resistanceSet).filter((name) => !weaknessSet.has(name));
  const stats = pokemon.stats.map((item) => ({ name: item.stat.name, value: item.base_stat }));
  const maxStat = 180;

  let evolutionData: Array<{ name: string; id: number; image: string | null; details: EvolutionDetail[] }> = [];
  if (evolutionChain) {
    const base = flattenEvolutionChain(evolutionChain);
    evolutionData = await Promise.all(base.map(async (evolution) => {
      const data = await getEvolutionPokemon(evolution.name);
      return { ...evolution, id: data.id || evolution.id, image: data.image };
    }));
  }

  return (
    <main className="min-h-screen bg-[#dfe6c9] text-[#12382d]" style={{ backgroundImage: "linear-gradient(rgba(18,56,45,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(18,56,45,.055) 1px,transparent 1px)", backgroundSize: "8px 8px" }}>
      <header className="sticky top-0 z-40 border-b-4 border-[#173f31] bg-[#062d21] text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-white bg-[#e52521] text-xl shadow-[2px_2px_0_#7d1715]">⚡</div>
            <div><div className="text-lg font-black tracking-widest">POKÉDEX</div><div className="text-[8px] font-bold tracking-[.25em] text-[#9ab2a4]">NEXUS DATABASE</div></div>
          </a>
          <a href="/" className="rounded-md border border-[#3f785f] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#65d991] transition hover:bg-[#0d4b37]">← Voltar</a>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <div className="overflow-hidden rounded-2xl border-[3px] border-[#557565] bg-[#f7f2d8] shadow-[6px_6px_0_#8d9582,0_18px_40px_rgba(18,56,45,.15)]">
          <div className="grid md:grid-cols-[45%_55%]">
            <div className="relative flex min-h-[430px] items-center justify-center overflow-hidden border-b-[3px] border-[#71816f] bg-[#e7edcf] p-6 md:min-h-[610px] md:border-b-0 md:border-r-[3px]" style={{ backgroundImage: "linear-gradient(rgba(23,54,44,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(23,54,44,.06) 1px,transparent 1px)", backgroundSize: "7px 7px" }}>
              <div className="absolute left-5 top-5 rounded-md border-2 border-[#71816f] bg-[#f7f2d8] px-3 py-2 font-mono text-xs font-black shadow-[2px_2px_0_#8d9582]">#{String(pokemon.id).padStart(4, "0")}</div>
              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border-2 border-[#2b9a62] bg-[#dff4d7] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#177345]"><span className="h-2 w-2 rounded-full bg-[#14c979]" /> Registrado</div>
              {image ? <img src={image} alt={pokemon.name} className="relative z-10 max-h-[500px] w-full object-contain drop-shadow-[0_22px_12px_rgba(23,54,44,.24)]" /> : <span className="font-bold text-zinc-400">Imagem indisponível</span>}
              <div className="absolute bottom-5 left-5 font-mono text-[8px] font-bold uppercase tracking-[.2em] text-[#718078]">NEXUS DATABASE // FIRE RED SYSTEM</div>
            </div>

            <div className="p-6 md:p-10">
              <div className="flex items-start justify-between gap-4">
                <div><p className="font-mono text-xs font-black uppercase tracking-[.22em] text-[#e52521]">Pokémon #{String(pokemon.id).padStart(4, "0")}</p><h1 className="mt-2 text-4xl font-black capitalize tracking-tight md:text-6xl">{formatName(pokemon.name)}</h1><p className="mt-2 font-mono text-xs font-bold uppercase tracking-wider text-[#718078]">{genus}</p></div>
                <div className="hidden rounded-lg border-2 border-[#71816f] bg-[#e7edcf] px-3 py-2 text-center md:block"><div className="font-mono text-[8px] font-black uppercase text-[#718078]">Base XP</div><div className="text-lg font-black">{pokemon.base_experience}</div></div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">{pokemon.types.map((item) => <TypeBadge key={item.type.name} name={item.type.name} />)}</div>

              <div className="mt-6 rounded-xl border-2 border-[#71816f] bg-[#e7edcf] p-5 shadow-[3px_3px_0_#8d9582]">
                <p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-[#00a0c8]">Pokédex entry</p>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#36594b]">{description}</p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[["Altura", `${(pokemon.height / 10).toFixed(1)} m"], ["Peso", `${(pokemon.weight / 10).toFixed(1)} kg"], ["Categoria", genus.replace(" Pokémon", "")], ["Sexo", genderText]].map(([label, value]) => (
                  <div key={label} className="rounded-lg border-2 border-[#c5cbb8] bg-[#faf6df] p-3"><p className="text-[9px] font-black uppercase tracking-wider text-[#718078]">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>
                ))}
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div><p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-[#718078]">Habilidades</p><div className="mt-2 flex flex-wrap gap-2">{pokemon.abilities.map((item) => <span key={item.ability.name} className="rounded-md border-2 border-[#71816f] bg-[#f7f2d8] px-3 py-2 text-xs font-black capitalize shadow-[2px_2px_0_#8d9582]">{formatName(item.ability.name)}{item.is_hidden ? " • oculta" : ""}</span>)}</div></div>
                <div><p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-[#718078]">Poderes / movimentos</p><div className="mt-2 flex flex-wrap gap-2">{pokemon.moves.slice(0, 6).map((item) => <span key={item.move.name} className="rounded-md border border-[#bfc8b6] bg-white px-2.5 py-1.5 text-[10px] font-bold capitalize">{formatName(item.move.name)}</span>)}</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 pb-8 md:px-8 lg:grid-cols-[1.2fr_.8fr]">
        <div className="rounded-2xl border-[3px] border-[#71816f] bg-[#f7f2d8] p-6 shadow-[5px_5px_0_#8d9582]">
          <div className="flex items-end justify-between"><div><p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-[#e52521]">02 // Status</p><h2 className="mt-1 text-2xl font-black">Estatísticas base</h2></div><span className="font-mono text-[9px] font-black text-[#718078]">MAX 180</span></div>
          <div className="mt-5 space-y-3">{stats.map((stat) => <div key={stat.name} className="grid grid-cols-[100px_1fr_42px] items-center gap-3"><span className="font-mono text-[9px] font-black uppercase text-[#52665c]">{stat.name === "hp" ? "PS" : stat.name === "attack" ? "Ataque" : stat.name === "defense" ? "Defesa" : stat.name === "special-attack" ? "Atq. Esp." : stat.name === "special-defense" ? "Def. Esp." : "Velocidade"}</span><div className="h-4 overflow-hidden rounded-sm border border-[#71816f] bg-[#d8dfc6]"><div className="h-full bg-[#00a9d6]" style={{ width: `${Math.min(100, (stat.value / maxStat) * 100)}%` }} /></div><span className="text-right font-mono text-xs font-black">{stat.value}</span></div>)}</div>
        </div>

        <div className="rounded-2xl border-[3px] border-[#71816f] bg-[#f7f2d8] p-6 shadow-[5px_5px_0_#8d9582]">
          <p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-[#e52521]">03 // Type chart</p><h2 className="mt-1 text-2xl font-black">Fraquezas e resistências</h2>
          <div className="mt-5"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#a22b25]">Fraquezas</p><div className="flex flex-wrap gap-2">{weaknesses.length ? weaknesses.map((name) => <TypeBadge key={name} name={name} />) : <span className="text-sm text-[#718078]">Nenhuma registrada</span>}</div></div>
          <div className="mt-5"><p className="mb-2 text-[10px] font-black uppercase tracking-wider text-[#177345]">Resistências</p><div className="flex flex-wrap gap-2">{resistances.map((name) => <TypeBadge key={name} name={name} />)}{immunitySet.size > 0 && Array.from(immunitySet).map((name) => <span key={`immune-${name}`} className="rounded-md bg-[#173f31] px-3 py-1 text-[10px] font-black uppercase text-white">Imune: {typeLabel(name)}</span>)}</div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 md:px-8">
        <div className="rounded-2xl border-[3px] border-[#71816f] bg-[#f7f2d8] p-6 shadow-[5px_5px_0_#8d9582]">
          <p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-[#e52521]">04 // Evolution</p><h2 className="mt-1 text-2xl font-black">Linha evolutiva</h2><p className="mt-1 text-sm text-[#718078]">Acompanhe a evolução deste Pokémon.</p>
          {evolutionData.length > 0 ? <div className="mt-6 overflow-x-auto pb-3"><div className="flex min-w-max items-center justify-center gap-4">{evolutionData.map((evolution, index) => <div key={`${evolution.name}-${evolution.id}`} className="flex items-center gap-4"><a href={`/pokemon/${evolution.id}`} className={`group relative w-40 rounded-xl border-2 p-4 text-center transition hover:-translate-y-1 hover:shadow-lg ${evolution.id === pokemon.id ? "border-[#e52521] bg-[#fff7e7] shadow-[3px_3px_0_#a31b18]" : "border-[#71816f] bg-[#e7edcf]"}`}><div className="flex h-28 items-center justify-center">{evolution.image ? <img src={evolution.image} alt={evolution.name} className="h-full w-full object-contain transition group-hover:scale-110" /> : <span className="text-xs text-zinc-400">Sem imagem</span>}</div><p className="font-mono text-[9px] font-bold text-[#718078]">#{String(evolution.id).padStart(4, "0")}</p><p className="mt-1 font-black capitalize">{formatName(evolution.name)}</p>{evolution.id === pokemon.id && <span className="mt-2 inline-block rounded-full bg-[#e52521] px-2 py-1 text-[8px] font-black uppercase text-white">Atual</span>}</a>{index < evolutionData.length - 1 && <div className="text-center"><div className="text-2xl font-black text-[#e52521]">→</div><div className="whitespace-nowrap rounded-full bg-[#e52521]/10 px-2 py-1 font-mono text-[8px] font-black text-[#b3211e]">{getEvolutionCondition(evolutionData[index + 1].details)}</div></div>}</div>)}</div></div> : <div className="mt-5 rounded-xl bg-[#e7edcf] p-5 text-sm text-[#718078]">Este Pokémon não possui uma cadeia evolutiva disponível.</div>}
        </div>
      </section>

      <section id="tcg" className="border-t-4 border-[#173f31] bg-[#e52521]"><div className="mx-auto max-w-7xl px-4 py-12 md:px-8"><p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-red-100">05 // TCG</p><h2 className="mt-1 text-3xl font-black capitalize text-white md:text-4xl">Cartas de {pokemon.name}</h2><p className="mt-2 text-red-100">{cards.length} cartas encontradas</p>{cards.length === 0 ? <div className="mt-6 rounded-xl border border-white/20 bg-white/10 p-6 text-white">Nenhuma carta encontrada.</div> : <div className="mt-8"><CardGallery cards={cards} /></div>}</div></section>

      <footer className="bg-[#062d21] px-6 py-8 text-center font-mono text-[9px] font-bold uppercase tracking-[.2em] text-[#8fa89b]">Pokédex TCG • Nexus Database • Fire Red System</footer>
    </main>
  );
}
