import { NextResponse } from "next/server";

type TCGCard = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

type TCGCardDetails = TCGCard & {
  rarity?: string;
  illustrator?: string;
  category?: string;
  dexId?: number[];
  types?: string[];
  set?: {
    id: string;
    name: string;
    releaseDate?: string;
    logo?: string;
    symbol?: string;
  };
};

const MAX_RESULTS = 24;
const DEFAULT_RESULTS = 12;
const MAX_QUERY_LENGTH = 80;

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

function isDexNumber(value: string) {
  return /^(?:#?0*\d{1,4})$/.test(value.trim());
}

function getDexNumber(value: string) {
  return Number(value.trim().replace(/^#/, ""));
}

function buildCardsUrl(params: URLSearchParams) {
  const url = new URL("https://api.tcgdex.net/v2/en/cards");

  for (const [key, value] of params.entries()) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

async function fetchCardList(params: URLSearchParams) {
  const response = await fetch(buildCardsUrl(params), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`TCGdex retornou ${response.status}`);
  }

  return (await response.json()) as TCGCard[];
}

async function fetchCardDetails(cards: TCGCard[]) {
  return Promise.all(
    cards.map(async (card) => {
      try {
        const response = await fetch(
          `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(card.id)}`,
          { cache: "no-store" }
        );

        if (!response.ok) return card;
        return (await response.json()) as TCGCardDetails;
      } catch {
        return card;
      }
    })
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const rawQuery = searchParams.get("q") ?? searchParams.get("name") ?? "";
    const query = normalizeSearch(rawQuery).slice(0, MAX_QUERY_LENGTH);
    const set = normalizeSearch(searchParams.get("set") ?? "");
    const rarity = normalizeSearch(searchParams.get("rarity") ?? "");
    const type = normalizeSearch(searchParams.get("type") ?? "");

    const requestedLimit = Number(searchParams.get("limit") ?? DEFAULT_RESULTS);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), MAX_RESULTS)
      : DEFAULT_RESULTS;

    const requestedPage = Number(searchParams.get("page") ?? 1);
    const page = Number.isFinite(requestedPage)
      ? Math.max(Math.floor(requestedPage), 1)
      : 1;

    if (!query && !set && !rarity && !type) {
      return NextResponse.json(
        {
          error: "Informe o que deseja pesquisar.",
          cards: [],
          total: 0,
          page: 1,
          limit,
        },
        { status: 400 }
      );
    }

    const baseParams = new URLSearchParams();
    baseParams.set("pagination:page", String(page));
    baseParams.set("pagination:itemsPerPage", String(limit));

    if (set) baseParams.set("set", set);
    if (rarity) baseParams.set("rarity", rarity);
    if (type) baseParams.set("types", type);

    let cards: TCGCard[] = [];
    let searchMode = "filters";

    if (query && isDexNumber(query)) {
      const dexId = getDexNumber(query);

      if (dexId < 1 || dexId > 1025) {
        return NextResponse.json({
          cards: [],
          total: 0,
          page,
          limit,
          searchMode: "dex",
          query,
        });
      }

      baseParams.set("dexId", String(dexId));
      searchMode = "dex";
      cards = await fetchCardList(baseParams);
    } else if (query) {
      baseParams.set("name", query);
      searchMode = "name";
      cards = await fetchCardList(baseParams);

      // Busca tolerante: "charizard vmax" pode não existir literalmente
      // em algumas bases, então tentamos o primeiro termo significativo.
      if (!cards.length) {
        const fallback = query.split(" ").filter(Boolean)[0];
        if (fallback && fallback !== query) {
          baseParams.set("name", fallback);
          cards = await fetchCardList(baseParams);
          searchMode = "name-fallback";
        }
      }
    } else {
      cards = await fetchCardList(baseParams);
    }

    const detailedCards = await fetchCardDetails(cards.slice(0, limit));

    return NextResponse.json({
      cards: detailedCards,
      total: detailedCards.length,
      page,
      limit,
      query,
      searchMode,
      filters: {
        set: set || null,
        rarity: rarity || null,
        type: type || null,
      },
    });
  } catch (error) {
    console.error("Erro interno na busca TCG:", error);

    return NextResponse.json(
      {
        error: "Não foi possível concluir a busca na TCGdex.",
        cards: [],
        total: 0,
      },
      { status: 502 }
    );
  }
}
