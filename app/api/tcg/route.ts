import { NextResponse } from "next/server";

type TCGCard = {
  id: string;
  localId: string;
  name: string;
  image?: string | null;
};

type TCGCardDetails = TCGCard & {
  rarity?: string;
  illustrator?: string;
  set?: {
    id?: string;
    name?: string;
    releaseDate?: string;
    serie?: {
      id?: string;
      name?: string;
    };
  };
};

function getCardImage(card: TCGCardDetails) {
  if (card.image) {
    const clean = card.image.replace(/\/$/, "");
    if (/\.(png|webp|jpg)$/i.test(clean)) return clean;
    return `${clean}/high.webp`;
  }

  const serieId = card.set?.serie?.id;
  const setId = card.set?.id;
  const localId = card.localId;

  if (serieId && setId && localId) {
    return `https://assets.tcgdex.net/en/${serieId}/${setId}/${localId}/high.png`;
  }

  return null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
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
          const detail = await detailResponse.json();

          return {
            ...card,
            ...detail,
            image: detail.image || card.image || null,
            localId: detail.localId || card.localId,
            set: detail.set || card.set,
          };
        } catch {
          return { ...card };
        }
      })
    );

    const cards = detailedCards.map((card) => ({
      ...card,
      image: getCardImage(card),
    }));

    return NextResponse.json({
      cards,
      total: cards.length,
    });
  } catch (error) {
    console.error("Erro interno ao buscar cartas:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar cartas.", cards: [] },
      { status: 500 }
    );
  }
}
