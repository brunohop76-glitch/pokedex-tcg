const fs = require("fs");
const path = require("path");

const file = path.join(
  process.cwd(),
  "app",
  "pokemon",
  "[id]",
  "page.tsx"
);

if (!fs.existsSync(file)) {
  throw new Error(`Arquivo não encontrado: ${file}`);
}

let code = fs.readFileSync(file, "utf8");

const start = code.indexOf("async function getTCGCards(");
const end = code.indexOf("\nfunction getPokemonIdFromUrl", start);

if (start === -1 || end === -1) {
  throw new Error("Não encontrei a função getTCGCards.");
}

const newFunction = `async function getTCGCards(
  pokedexNumber: number,
  pokemonName: string
): Promise<TCGCard[]> {
  try {
    type CardBrief = {
      id: string;
      name: string;
      localId?: string;
      image?: string;
    };

    const sources: CardBrief[] = [];

    // 1) Busca principal pelo número nacional da Pokédex.
    try {
      const response = await fetch(
        "https://api.tcgdex.net/v2/en/dex-ids/" + pokedexNumber,
        { cache: "no-store" }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data?.cards)) {
          sources.push(...data.cards);
        }
      }
    } catch (error) {
      console.error("TCGdex dex-id falhou:", error);
    }

    // 2) Busca complementar pelo nome para pegar variantes/especiais.
    try {
      const response = await fetch(
        "https://api.tcgdex.net/v2/en/cards?name=" +
          encodeURIComponent(pokemonName),
        { cache: "no-store" }
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          sources.push(...data);
        }
      }
    } catch (error) {
      console.error("TCGdex name search falhou:", error);
    }

    const unique = Array.from(
      new Map(
        sources
          .filter((card) => card?.id && card?.name)
          .map((card) => [card.id, card])
      ).values()
    );

    if (unique.length === 0) {
      return [];
    }

    // Busca os detalhes individuais. A TCGdex disponibiliza a URL
    // correta da imagem a partir do objeto completo da carta.
    const result: TCGCard[] = [];
    const selected = unique.slice(0, 100);

    for (let index = 0; index < selected.length; index += 10) {
      const batch = selected.slice(index, index + 10);

      const details = await Promise.all(
        batch.map(async (brief) => {
          try {
            const response = await fetch(
              "https://api.tcgdex.net/v2/en/cards/" +
                encodeURIComponent(brief.id),
              { cache: "no-store" }
            );

            if (!response.ok) {
              return null;
            }

            return await response.json();
          } catch {
            return null;
          }
        })
      );

      for (const detail of details) {
        if (!detail?.id || !detail?.name || !detail?.image) {
          continue;
        }

        // TCGdex documenta high/png como imagem de alta qualidade.
        const imageBase = String(detail.image).replace(/\\/$/, "");
        const imageUrl = imageBase + "/high.png";

        result.push({
          id: String(detail.id),
          name: String(detail.name),
          number: String(
            detail.localId ??
              detail.id.split("-").pop() ??
              "?"
          ),
          artist:
            detail.illustrator ||
            detail.artist ||
            undefined,
          rarity: detail.rarity || undefined,
          set: {
            name:
              detail.set?.name ||
              "Coleção TCG",
            releaseDate:
              detail.set?.releaseDate ||
              "",
          },
          images: {
            small: imageBase + "/low.webp",
            large: imageUrl,
          },
        });
      }
    }

    // Remove duplicados e garante que só entram cartas com imagem válida.
    return Array.from(
      new Map(
        result
          .filter((card) => card.images.large)
          .map((card) => [card.id, card])
      ).values()
    );
  } catch (error) {
    console.error("Erro geral TCGdex:", error);
    return [];
  }
}
`;

code = code.slice(0, start) + newFunction + code.slice(end);

fs.writeFileSync(file, code, "utf8");

console.log("✓ Busca TCGdex corrigida.");
console.log("✓ Detalhes individuais das cartas ativados.");
console.log("✓ Imagens high/png ativadas.");
console.log("✓ Cartas sem imagem são removidas.");
console.log("✓ Até 100 cartas podem ser carregadas.");
