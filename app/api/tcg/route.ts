import { NextResponse } from "next/server";

type TCGCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

type TCGCardDetails = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  illustrator?: string;
  set?: {
    id: string;
    name: string;
    releaseDate?: string;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Aceita tanto ?name= quanto ?q= para manter a busca
    // compatível com a Home e com a página completa de resultados.
    const name = searchParams.get("name")?.trim() || searchParams.get("q")?.trim();

    if (!name) {
      return NextResponse.json(
        { error: "Informe o nome do Pokémon.", cards: [] },
        { status: 400 }
      );
    }

    const query = encodeURIComponent(name);
    const url = `https://api.tcgdex.net/v2/en/cards?name=${query}`;

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro ao consultar a TCGdex.", status: response.status, cards: [] },
        { status: 502 }
      );
    }

    const data: TCGCard[] = await response.json();

    const detailedCards: TCGCardDetails[] = await Promise.all(
      data.map(async (card) => {
        try {
          const detailResponse = await fetch(
            `https://api.tcgdex.net/v2/en/cards/${card.id}`,
            { cache: "no-store" }
          );

          if (!detailResponse.ok) return { ...card };
          return await detailResponse.json();
        } catch {
          return { ...card };
        }
      })
    );

    return NextResponse.json({
      cards: detailedCards,
      total: detailedCards.length,
    });
  } catch (error) {
    console.error("Erro interno ao buscar cartas:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar cartas.", cards: [] },
      { status: 500 }
    );
  }
}
