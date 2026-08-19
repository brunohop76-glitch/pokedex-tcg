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

    const name = searchParams.get("name");

    if (!name) {
      return NextResponse.json(
        {
          error: "Informe o nome do Pokémon.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Busca as cartas pelo nome do Pokémon.
     *
     * Exemplo:
     * /api/tcg?name=charmander
     */

    const query = encodeURIComponent(name);

    const url =
      "https://api.tcgdex.net/v2/en/cards?name=" +
      query;

    console.log(
      "Buscando cartas na TCGdex:",
      name
    );

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "TCGdex retornou:",
        response.status
      );

      return NextResponse.json(
        {
          error: "Erro ao consultar a TCGdex.",
          status: response.status,
          cards: [],
        },
        {
          status: 502,
        }
      );
    }

    const data: TCGCard[] = await response.json();

    /*
     * A listagem da TCGdex retorna informações resumidas.
     *
     * Vamos buscar os detalhes de cada carta para
     * obter raridade, artista, coleção etc.
     */

    const detailedCards: TCGCardDetails[] =
      await Promise.all(
        data.map(async (card) => {
          try {
            const detailResponse = await fetch(
              "https://api.tcgdex.net/v2/en/cards/" +
                card.id,
              {
                cache: "no-store",
              }
            );

            if (!detailResponse.ok) {
              return {
                ...card,
              };
            }

            return await detailResponse.json();
          } catch {
            return {
              ...card,
            };
          }
        })
      );

    return NextResponse.json({
      cards: detailedCards,
      total: detailedCards.length,
    });

  } catch (error) {
    console.error(
      "Erro interno na API TCG:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro interno ao buscar cartas.",
        cards: [],
      },
      {
        status: 500,
      }
    );
  }
}