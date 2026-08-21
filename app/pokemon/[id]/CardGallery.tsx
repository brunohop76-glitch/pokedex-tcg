"use client";

import { useState, type MouseEvent } from "react";

type Card = {
  id: string;
  localId?: string;
  name: string;
  image?: string | null;
  rarity?: string;
  illustrator?: string;
  set?: { name?: string };
};

export default function CardGallery({ cards }: { cards: Card[] }) {
  const [selected, setSelected] = useState<Card | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  function handleMove(event: MouseEvent<HTMLElement>, id: string) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setHoveredId(id);
    setRotation({
      x: -((y / rect.height) - 0.5) * 12,
      y: ((x / rect.width) - 0.5) * 12,
    });
  }

  function resetRotation() {
    setHoveredId(null);
    setRotation({ x: 0, y: 0 });
  }

  return (
    <>
      <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {cards.map((card) => {
          if (!card.image) return null;
          const isHovered = hoveredId === card.id;

          return (
            <article
              key={card.id}
              onMouseMove={(event) => handleMove(event, card.id)}
              onMouseLeave={resetRotation}
              onClick={() => setSelected(card)}
              className="tcg-card-3d group relative cursor-pointer overflow-visible rounded-2xl bg-white text-zinc-900 shadow-xl"
              style={{
                transform: isHovered
                  ? `perspective(900px) translateY(-16px) scale(1.045) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                  : "perspective(900px) translateY(0) scale(1) rotateX(0deg) rotateY(0deg)",
                zIndex: isHovered ? 50 : 1,
              }}
            >
              <div className="relative overflow-hidden rounded-t-2xl bg-zinc-100 p-2">
                <img
                  src={card.image}
                  alt={card.name}
                  loading="lazy"
                  className="block w-full rounded-lg transition duration-300 group-hover:scale-[1.025]"
                />

                <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-br from-white/35 via-transparent to-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-white opacity-0 shadow-[0_8px_25px_rgba(0,0,0,.35)] transition-all duration-300 group-hover:scale-105 group-hover:opacity-100">
                  VER CARTA ↗
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-black">{card.name}</h4>
                <p className="mt-2 text-xs font-semibold text-zinc-500">
                  {card.set?.name || "Coleção TCG"}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 font-bold">
                    #{card.localId || card.id.split("-").slice(1).join("-")}
                  </span>
                  {card.rarity && (
                    <span className="text-right font-semibold text-zinc-500">
                      {card.rarity}
                    </span>
                  )}
                </div>

                {card.illustrator && (
                  <p className="mt-3 text-xs text-zinc-400">
                    Artista: {card.illustrator}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {selected?.image && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative flex max-h-[95vh] max-w-5xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute -right-4 -top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-red-600 text-2xl font-black text-white shadow-xl transition hover:scale-110 hover:bg-red-500"
              aria-label="Fechar carta"
            >
              ×
            </button>

            <div className="rounded-2xl bg-white p-2 shadow-[0_30px_100px_rgba(0,0,0,.7)]">
              <img
                src={selected.image}
                alt={selected.name}
                className="max-h-[88vh] max-w-[90vw] rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
