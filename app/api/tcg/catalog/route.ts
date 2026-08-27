import { NextResponse } from "next/server";

type SetBrief = {
  id: string;
  name: string;
  logo?: string | null;
  symbol?: string | null;
  cardCount?: { total?: number; official?: number };
  releaseDate?: string;
  serie?: { id?: string; name?: string };
};

type CardBrief = {
  id: string;
  localId: string;
  name: string;
  image?: string | null;
};

function normalizeImage(image?: string | null) {
  if (!image) return null;
  const clean = image.replace(/\/$/, "");
  if (/\.(png|webp|jpg|jpeg)$/i.test(clean)) return clean;
  return `${clean}/high.webp`;
}

async function fetchSets() {
  const response = await fetch("https://api.tcgdex.net/v2/en/sets", {
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error("sets");
  return (await response.json()) as SetBrief[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "sets") {
      const sets = await fetchSets();
      return NextResponse.json({
        sets: sets.map((set) => ({
          id: set.id,
          name: set.name,
          logo: normalizeImage(set.logo),
          symbol: normalizeImage(set.symbol),
          total: set.cardCount?.total ?? 0,
          official: set.cardCount?.official ?? 0,
          releaseDate: set.releaseDate ?? "",
          serie: set.serie?.name ?? "",
        })),
      });
    }

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(36, Math.max(12, Number(searchParams.get("limit")) || 24));
    const name = searchParams.get("name")?.trim();
    const setId = searchParams.get("set")?.trim();
    const rarity = searchParams.get("rarity")?.trim();
    const category = searchParams.get("category")?.trim();
    const sort = searchParams.get("sort") || "releaseDate";
    const order = searchParams.get("order") === "DESC" ? "DESC" : "ASC";

    const query = new URLSearchParams();
    if (name) query.set("name", name);
    if (setId) query.set("set.id", setId);
    if (rarity) query.set("rarity", rarity);
    if (category) query.set("category", category);
    query.set("sort:field", sort);
    query.set("sort:order", order);
    query.set("pagination:page", String(page));
    query.set("pagination:itemsPerPage", String(limit));

    const response = await fetch(`https://api.tcgdex.net/v2/en/cards?${query.toString()}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Não foi possível consultar o catálogo TCG.", cards: [] }, { status: 502 });
    }

    const briefs = (await response.json()) as CardBrief[];
    const sets = await fetchSets();
    const setMap = new Map(sets.map((set) => [set.id, set]));

    const cards = briefs.map((card) => {
      const cardSetId = card.id.split("-")[0];
      const set = setMap.get(cardSetId);
      return {
        id: card.id,
        localId: card.localId,
        name: card.name,
        image: normalizeImage(card.image),
        set: { id: cardSetId, name: set?.name ?? "Coleção TCG" },
        serie: set?.serie?.name ?? "",
      };
    });

    return NextResponse.json({
      cards,
      page,
      limit,
      hasMore: briefs.length === limit,
    });
  } catch (error) {
    console.error("Erro no catálogo TCG:", error);
    return NextResponse.json({ error: "Erro interno no catálogo TCG.", cards: [] }, { status: 500 });
  }
}
