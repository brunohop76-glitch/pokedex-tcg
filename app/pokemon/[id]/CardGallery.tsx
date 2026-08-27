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

type Point = { x: number; y: number };

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
      x: -((y / rect.height) - 0.5) * 10,
      y: ((x / rect.width) - 0.5) * 10,
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
    const percentX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    setModalRotation({
      x: -((percentY / 100) - 0.5) * 16,
      y: ((percentX / 100) - 0.5) * 16,
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

  const holoAngle = shine.x * 1.8 + shine.y * 0.7;
  const holoHue = Math.round(180 + shine.x * 1.1 + shine.y * 0.35);

  return (
    <>
      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cards.map((card) => {
          if (!card.image) return null;
          const isHovered = hoveredId === card.id;
          const cardNumber = card.localId || card.id.split("-").slice(1).join("-");

          return (
            <article
              key={card.id}
              onMouseMove={(event) => handleMove(event, card.id)}
              onMouseLeave={resetRotation}
              onClick={() => setSelected(card)}
              className="group relative cursor-pointer overflow-visible rounded-2xl border-2 border-[#c7cbb5] bg-[#f7f2d8] p-2 text-[#17362c]"
              style={{
                transform: isHovered
                  ? `perspective(900px) translateY(-10px) scale(1.025) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
                  : "perspective(900px) translateY(0) scale(1) rotateX(0deg) rotateY(0deg)",
                zIndex: isHovered ? 50 : 1,
                transition: "transform 180ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out",
                boxShadow: isHovered
                  ? "0 24px 45px rgba(16,45,35,.28)"
                  : "4px 5px 0 rgba(23,54,44,.12)",
              }}
            >
              <div className="relative overflow-hidden rounded-xl border border-[#d4d8c2] bg-[#ecefd2] p-1.5">
                <img
                  src={card.image}
                  alt={card.name}
                  loading="lazy"
                  className="block w-full rounded-lg transition duration-300 group-hover:scale-[1.025]"
                />
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/45 via-transparent to-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-lg border border-white/40 bg-[#102d23]/90 px-2 py-2 text-center font-mono text-[8px] font-black uppercase tracking-widest text-white opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                  VER CARTA ↗
                </div>
              </div>

              <div className="px-1 pb-1 pt-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="min-w-0 truncate text-sm font-black leading-tight" title={card.name}>{card.name}</h4>
                  <span className="shrink-0 font-mono text-[7px] font-black text-[#28704d]">#{cardNumber}</span>
                </div>
                <p className="mt-1 truncate text-[9px] font-bold uppercase tracking-wide text-[#71816f]" title={card.set?.name || "Coleção TCG"}>{card.set?.name || "Coleção TCG"}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="rounded-full border border-[#bfc6ae] bg-[#fffceb] px-2 py-1 font-mono text-[7px] font-black uppercase tracking-wide text-[#52655e]">TCG</span>
                  {card.rarity && <span className="truncate text-right text-[8px] font-bold text-[#758078]" title={card.rarity}>{card.rarity}</span>}
                </div>
                {card.illustrator && <p className="mt-2 truncate text-[7px] font-medium text-[#9aa397]" title={card.illustrator}>ARTISTA: {card.illustrator}</p>}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,0,.16),transparent_42%)]" aria-hidden="true" />

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
              className="absolute -right-2 -top-2 z-40 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-red-600 text-2xl font-black text-white shadow-[0_8px_30px_rgba(0,0,0,.5)] transition hover:scale-110 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white sm:-right-4 sm:-top-4"
              aria-label="Fechar carta"
            >
              ×
            </button>

            <div
              className="relative rounded-[22px] bg-white p-2 shadow-[0_35px_100px_rgba(0,0,0,.75)]"
              style={{
                transform: `rotateX(${modalRotation.x}deg) rotateY(${modalRotation.y}deg) scale(1.01)`,
                transition: "transform 90ms ease-out",
              }}
            >
              <div className="relative overflow-hidden rounded-[16px]">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="relative z-10 block max-h-[88vh] max-w-[88vw] rounded-[16px] object-contain sm:max-h-[90vh] sm:max-w-[80vw]"
                />

                <div
                  className="pointer-events-none absolute inset-0 z-20 mix-blend-screen opacity-80"
                  style={{
                    background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,.9) 0%, rgba(255,255,255,.28) 7%, hsla(${holoHue},100%,70%,.24) 18%, transparent 48%)`,
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 z-20 mix-blend-color-dodge opacity-35"
                  style={{
                    background: `linear-gradient(${holoAngle}deg, transparent 18%, rgba(255,0,90,.38) 34%, rgba(0,220,255,.38) 45%, rgba(255,240,0,.34) 55%, transparent 72%)`,
                    transform: `translateX(${(shine.x - 50) * 0.45}px) translateY(${(shine.y - 50) * 0.25}px)`,
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 z-20 opacity-20"
                  style={{
                    background: `repeating-linear-gradient(${90 + modalRotation.y * 4}deg, transparent 0px, transparent 18px, rgba(255,255,255,.45) 20px, transparent 22px, transparent 42px)`,
                    mixBlendMode: "screen",
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 z-30 rounded-[16px]"
                  style={{
                    boxShadow: `inset 0 0 35px rgba(255,255,255,.18), inset 0 0 10px hsla(${holoHue},100%,70%,.25)`,
                  }}
                />
              </div>
            </div>
          </div>

          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/45 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 backdrop-blur-md">
            Mova o mouse • Efeito holográfico • ESC ou × para fechar
          </p>
        </div>
      )}
    </>
  );
}
