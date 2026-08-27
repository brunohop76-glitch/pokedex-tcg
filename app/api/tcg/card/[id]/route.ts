import { NextResponse } from "next/server";

function normalizeImage(image?: string | null) {
  if (!image) return null;
  const clean = image.replace(/\/$/, "");
  if (/\.(png|webp|jpg|jpeg)$/i.test(clean)) return clean;
  return `${clean}/high.webp`;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(id)}`, {
      next: { revalidate: 900 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Carta não encontrada." }, { status: 404 });
    }

    const card = await response.json();
    return NextResponse.json({
      card: {
        ...card,
        image: normalizeImage(card.image),
        set: card.set
          ? { ...card.set, logo: normalizeImage(card.set.logo), symbol: normalizeImage(card.set.symbol) }
          : null,
      },
    });
  } catch (error) {
    console.error("Erro ao consultar carta TCG:", error);
    return NextResponse.json({ error: "Erro interno ao consultar a carta." }, { status: 500 });
  }
}
