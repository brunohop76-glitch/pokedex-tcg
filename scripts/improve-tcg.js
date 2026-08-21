const fs = require("fs");
const path = require("path");

const file = path.join(process.cwd(), "app", "pokemon", "[id]", "page.tsx");
const backup = file + ".backup";

if (!fs.existsSync(file)) {
  throw new Error(`Arquivo não encontrado: ${file}`);
}

let code = fs.readFileSync(file, "utf8");

const start = code.indexOf("async function getTCGCards(");
const end = code.indexOf("\nfunction getPokemonIdFromUrl", start);

if (start === -1 || end === -1) {
  throw new Error("Não encontrei a função getTCGCards para substituir.");
}

if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, code, "utf8");
}

const newFunction = `async function getTCGCards(
  pokedexNumber: number,
  pokemonName: string
): Promise<TCGCard[]> {
  try {
    // TCGdex usa o ID nacional da Pokédex para encontrar todas as cartas
    // relacionadas ao Pokémon. Isso evita perder cartas quando o banco
    // antigo não possui o nationalPokedexNumber corretamente preenchido.
    const dexResponse = await fetch(
      "https://api.tcgdex.net/v2/en/dex-ids/" + pokedexNumber,
      { cache: "no-store" }
    );

    let briefs: Array<{
      id: string;
      localId?: string;
      name: string;
      image?: string;
    }> = [];

    if (dexResponse.ok) {
      const dexData = await dexResponse.json();
      briefs = Array.isArray(dexData?.cards)
        ? dexData.cards
        : [];
    }

    // Segunda busca por nome para cobrir cartas especiais/variantes que
    // eventualmente não estejam ligadas ao dexId.
    try {
      const nameUrl =
        "https://api.tcgdex.net/v2/en/cards?name=" +
        encodeURIComponent(pokemonName) +
        "&pagination:page=1&pagination:itemsPerPage=100";

      const nameResponse = await fetch(nameUrl, {
        cache: "no-store",
      });

      if (nameResponse.ok) {
        const nameData = await nameResponse.json();
        if (Array.isArray(nameData)) {
          briefs = [...briefs, ...nameData];
        }
      }
    } catch (error) {
      console.error("Busca TCGdex por nome falhou:", error);
    }

    const unique = Array.from(
      new Map(
        briefs
          .filter((card) => card?.id && card?.name)
          .map((card) => [card.id, card])
      ).values()
    );

    if (unique.length === 0) {
      return [];
    }

    // Mostra até 100 cartas sem sobrecarregar a página.
    const selected = unique.slice(0, 100);

    // Descobre o nome das coleções sem precisar buscar os detalhes de cada carta.
    const setIds = Array.from(
      new Set(
        selected
          .map((card) => {
            const separator = card.id.lastIndexOf("-");
            return separator > 0
              ? card.id.slice(0, separator)
              : card.id;
          })
          .filter(Boolean)
      )
    );

    const setNames = new Map<string, string>();

    await Promise.all(
      setIds.map(async (setId) => {
        try {
          const response = await fetch(
            "https://api.tcgdex.net/v2/en/sets/" +
              encodeURIComponent(setId),
            { cache: "no-store" }
          );

          if (response.ok) {
            const data = await response.json();
            if (data?.name) {
              setNames.set(setId, data.name);
            }
          }
        } catch {
          // Se uma coleção falhar, usamos o ID dela como fallback.
        }
      })
    );

    return selected.map((card) => {
      const separator = card.id.lastIndexOf("-");
      const setId =
        separator > 0 ? card.id.slice(0, separator) : card.id;
      const number =
        card.localId ||
        (separator > 0 ? card.id.slice(separator + 1) : "?");
      const imageBase = card.image || "";

      return {
        id: card.id,
        name: card.name,
        number,
        set: {
          name: setNames.get(setId) || setId.toUpperCase(),
          releaseDate: "",
        },
        images: {
          small: imageBase
            ? imageBase + "/low.webp"
            : "",
          large: imageBase
            ? imageBase + "/high.webp"
            : "",
        },
      };
    });
  } catch (error) {
    console.error("Erro geral ao buscar TCGdex:", error);
    return [];
  }
}
`;

code = code.slice(0, start) + newFunction + code.slice(end);

const oldCardClass =
  'className="overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-xl transition duration-300 hover:-translate-y-2"';

const newCardClass =
  'className="tcg-card overflow-hidden rounded-2xl bg-white text-zinc-900 shadow-xl transition duration-300 hover:-translate-y-2"';

if (code.includes(oldCardClass)) {
  code = code.replace(oldCardClass, newCardClass);
}

fs.writeFileSync(file, code, "utf8");

console.log("✓ TCGdex integrado na página do Pokémon.");
console.log("✓ Busca por Pokédex + nome ativada.");
console.log("✓ Até 100 cartas podem ser exibidas.");
console.log("✓ Backup criado em page.tsx.backup");
