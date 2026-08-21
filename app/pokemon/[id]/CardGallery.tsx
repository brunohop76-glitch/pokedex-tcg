"use client";

import { useEffect, useState, type MouseEvent } from "react";

type Card = {
  id: string;
  localId?: string;
  name: string;
  image?: string | null;
  rarity?: string;
  illustrator?: string;
  set?: { name?: string };
};

type Point = {
  x: number;
  y: number;
};

export default function CardGallery({ cards }: { cards: Card[] }) {
  const [selected, setSelected] = useState<Card | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [modalRotation, setModalRotation] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState<Point>({ x: 50, y: 50 });

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

  function handleModalMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;

    setModalRotation({
      x: -((percentY / 100) - 0.5) * 14,
      y: ((percentX / 100) - 0.5) * 14,
    });
    setShine({ x: percentX, y: percentY });
  }

  function resetModalEffect() {
    setModalRotation({ x: 0, y: 0 });
    setShine({ x: 50, y: 50 });
  }

  function closeModal() {
    setSelected(null);
    resetModalEffect();
  }

  useEffect(() => {
    if (!selected) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeModal();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [selected]);

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
              className="group relative cursor-pointer overflow-visible rounded-2xl bg-white text-zinc-900 shadow-xl"
              style={{
                transform: isHovered
                  ? `perspective(900px) translateY(-16px) scale(1.045) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                  : "perspective(900px) translateY(0) scale(1) rotateX(0deg) rotateY(0deg)",
                zIndex: isHovered ? 50 : 1,
                transition: "transform 180ms ease-out, box-shadow 180ms ease-out",
                boxShadow: isHovered
                  ? "0 28px 55px rgba(0,0,0,.32)"
                  : "0 12px 25px rgba(0,0,0,.14)",
              }}
            >
              <div className="relative overflow-hidden rounded-t-2xl bg-zinc-100 p-2">
                <img
                  src={card.image}
                  alt={card.name}
                  loading="lazy"
                  className="block w-full rounded-lg transition duration-300 group-hover:scale-[1.025]"
                />

                <div className="pointer-events-none absolute inset-0 rounded-t-2xl bg-gradient-to-br from-white/40 via-transparent to-black/25 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-xl sm:p-6"
          onClick={closeModal}
        >
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,.14),transparent_42%)]"
            aria-hidden="true"
          />

          <div
            className="relative flex max-h-[96vh] max-w-[95vw] items-center justify-center"
            onClick={(event) => event.stopPropagation()}
            onMouseMove={handleModalMove}
            onMouseLeave={resetModalEffect}
            style={{ perspective: "1400px" }}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute -right-2 -top-2 z-30 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-red-600 text-2xl font-black text-white shadow-[0_8px_30px_rgba(0,0,0,.5)] transition hover:scale-110 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white sm:-right-4 sm:-top-4"
              aria-label="Fechar carta"
            >
              ×
            </button>

            <div
              className="relative rounded-[20px] bg-white p-2 shadow-[0_35px_100px_rgba(0,0,0,.75)]"
              style={{
                transform: `rotateX(${modalRotation.x}deg) rotateY(${modalRotation.y}deg) scale(1.01)`,
                transition: "transform 120ms ease-out",
              }}
            >
              <div className="relative overflow-hidden rounded-[14px]">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="block max-h-[88vh] max-w-[88vw] rounded-[14px] object-contain sm:max-h-[90vh] sm:max-w-[80vw]"
                />

                <div
                  className="pointer-events-none absolute inset-0 mix-blend-screen opacity-70"
                  style={{
                    background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.22) 8%, rgba(255,0,80,.12) 22%, transparent 48%)`,
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 opacity-30"
                  style={{
                    background: `linear-gradient(${110 + modalRotation.y * 3}deg, transparent 25%, rgba(255,255,255,.55) 48%, transparent 62%)`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-md">
            Mova o mouse • ESC ou × para fechar
          </p>
        </div>
      )}
    </>
  );
}
