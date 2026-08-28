"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function typeLabel(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "name" in value) return String((value as { name?: string }).name ?? "");
  return "";
}

export default function TCGCardPage({ params }: { params: Promise<{ id: string }> }) {
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;
    params.then(({ id }) => fetch(`/api/tcg/card/${encodeURIComponent(id)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Carta não encontrada");
        return response.json();
      })
      .then((data) => { if (active) setCard(data.card); })
      .catch(() => { if (active) setError("Não foi possível carregar esta carta."); })
      .finally(() => { if (active) setLoading(false); }));
    return () => { active = false; };
  }, [params]);

  function moveCard(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    setRotation({ x: -((event.clientY - rect.top) / rect.height - .5) * 10, y: ((event.clientX - rect.left) / rect.width - .5) * 10 });
  }

  const types = Array.isArray(card?.types) ? card.types.map(typeLabel).filter(Boolean) : [];
  const attacks = Array.isArray(card?.attacks) ? card.attacks : [];
  const weaknesses = Array.isArray(card?.weaknesses) ? card.weaknesses : [];
  const resistances = Array.isArray(card?.resistances) ? card.resistances : [];

  return (
    <main id="tcg-card-detail" className="min-h-screen bg-[#dfe5c9] text-[#17362c]">
      <header className="border-b-4 border-[#081c15] bg-[#102d23] text-white shadow-[0_4px_0_#6f796b]">
        <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
          <Link href="/tcg" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#f7f2d8] bg-[#d71920] text-lg shadow-[3px_3px_0_#071b14]">⚡</span><span><strong className="block font-mono text-sm tracking-[.18em]">POKÉDEX</strong><small className="font-mono text-[7px] uppercase tracking-[.25em] text-[#a9c0ad]">D'Melo / TCG Database</small></span></Link>
          <Link href="/tcg" className="rounded-full border border-[#f5c94a]/30 px-3 py-2 font-mono text-[8px] font-black uppercase tracking-widest text-[#f5c94a]">← Catálogo TCG</Link>
        </div>
      </header>

      <section className="tcg-card-hero border-b-4 border-[#17362c] bg-[#e7edc9] px-5 py-8 md:px-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[9px] font-black uppercase tracking-[.32em] text-[#d71920]">04 // TCG Card Database</p>
          {loading ? <div className="mt-3 h-14 w-80 animate-pulse rounded bg-[#cfd7b9]" /> : <h1 className="mt-1 text-5xl font-black leading-none tracking-[-.055em] text-[#102d23] md:text-6xl">Ficha da <span className="text-[#d71920]">Carta.</span></h1>}
        </div>
      </section>

      <section className="tcg-card-layout mx-auto grid max-w-7xl gap-8 px-5 py-8 md:px-8 lg:grid-cols-[minmax(340px,460px)_1fr] lg:items-start lg:gap-10">
        {loading ? <div className="mx-auto aspect-[2.5/3.5] w-full max-w-[390px] animate-pulse rounded-2xl border-2 border-[#71816f] bg-[#f7f2d8]" /> : error ? <div className="rounded-xl border-2 border-dashed border-[#71816f] bg-[#f7f2d8] p-8"><h2 className="text-2xl font-black">Carta não encontrada.</h2><Link href="/tcg" className="mt-5 inline-block rounded border-2 border-[#17362c] bg-[#102d23] px-4 py-3 font-mono text-[9px] font-black uppercase text-white">Voltar ao catálogo</Link></div> : <div className="tcg-card-visual mx-auto w-full max-w-[410px]" style={{ perspective: "1200px" }}><div onMouseMove={moveCard} onMouseLeave={() => setRotation({ x: 0, y: 0 })} className="tcg-card-shell relative overflow-hidden rounded-[20px] border-4 border-[#f7f2d8] bg-white shadow-[12px_16px_0_rgba(23,54,44,.28),0_25px_60px_rgba(0,0,0,.25)]" style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, transition: "transform 120ms ease-out" }}><img src={card.image} alt={card.name} className="block w-full" /><div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-35" style={{ background: "linear-gradient(125deg, transparent 25%, rgba(255,255,255,.55) 43%, rgba(0,220,255,.22) 50%, rgba(255,0,100,.2) 58%, transparent 72%)" }} /></div><div className="tcg-card-caption mt-4"><span>TCG CARD // VERIFIED</span><span>Mova o mouse para interagir</span></div></div>}

        {!loading && !error && <div className="tcg-card-info rounded-2xl border-2 border-[#71816f] bg-[#f7f2d8] p-5 shadow-[6px_6px_0_rgba(23,54,44,.16)] md:p-7">
          <div className="tcg-card-heading">
            <p className="font-mono text-[9px] font-black uppercase tracking-[.25em] text-[#d71920]">{card.set?.name ?? "Coleção TCG"} • #{card.localId ?? card.id}</p>
            <h2 className="mt-2 text-4xl font-black tracking-tight">{card.name}</h2>
          </div>
          <div className="tcg-card-tags mt-4 flex flex-wrap gap-2">{types.map((type: string) => <span key={type} className="rounded-full border border-[#71816f] bg-[#fffceb] px-3 py-1.5 font-mono text-[8px] font-black uppercase">{type}</span>)}{card.rarity && <span className="rounded-full border border-[#d71920] bg-[#d71920] px-3 py-1.5 font-mono text-[8px] font-black uppercase text-white">{card.rarity}</span>}</div>
          <div className="tcg-card-stats mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["HP", card.hp || "—"],["Estágio", card.stage || "—"],["Artista", card.illustrator || "—"],["Categoria", card.category || "—"]].map(([label, value]) => <div key={label} className="rounded border border-[#71816f]/50 bg-[#fffceb] p-3"><p className="font-mono text-[7px] font-black uppercase tracking-widest text-[#28704d]">{label}</p><p className="mt-1 text-sm font-black">{value}</p></div>)}</div>
          {card.description && <div className="tcg-card-description mt-6 border-t border-[#71816f]/30 pt-5"><p className="font-mono text-[8px] font-black uppercase tracking-widest text-[#28704d]">Descrição</p><p className="mt-2 text-sm leading-6 text-[#52655e]">{card.description}</p></div>}
          {attacks.length > 0 && <div className="tcg-card-attacks mt-6 border-t border-[#71816f]/30 pt-5"><p className="font-mono text-[8px] font-black uppercase tracking-widest text-[#d71920]">Ataques</p><div className="mt-3 space-y-3">{attacks.map((attack: any, index: number) => <div key={`${attack.name}-${index}`} className="rounded border border-[#71816f]/50 bg-[#fffceb] p-4"><div className="flex items-center justify-between gap-3"><strong>{attack.name}</strong>{attack.damage && <span className="font-mono text-xs font-black">{attack.damage}</span>}</div>{attack.effect && <p className="mt-1 text-xs leading-5 text-[#52655e]">{attack.effect}</p>}</div>)}</div></div>}
          <div className="tcg-card-footer-stats mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded border border-[#71816f]/50 bg-[#fffceb] p-3"><p className="font-mono text-[7px] font-black uppercase text-[#28704d]">Fraqueza</p><p className="mt-1 text-sm font-bold">{weaknesses.map((item: any) => `${typeLabel(item.type)} ${item.value ?? ""}`).join(", ") || "—"}</p></div><div className="rounded border border-[#71816f]/50 bg-[#fffceb] p-3"><p className="font-mono text-[7px] font-black uppercase text-[#28704d]">Resistência</p><p className="mt-1 text-sm font-bold">{resistances.map((item: any) => `${typeLabel(item.type)} ${item.value ?? ""}`).join(", ") || "—"}</p></div><div className="rounded border border-[#71816f]/50 bg-[#fffceb] p-3"><p className="font-mono text-[7px] font-black uppercase text-[#28704d]">Recuo</p><p className="mt-1 text-sm font-bold">{Array.isArray(card.retreat) ? card.retreat.length : card.retreat ?? "—"}</p></div></div>
          <Link href="/tcg" className="tcg-back-button mt-7 inline-flex rounded border-2 border-[#17362c] bg-[#102d23] px-5 py-3 font-mono text-[9px] font-black uppercase tracking-widest text-white transition hover:-translate-y-0.5">← Voltar para o catálogo</Link>
        </div>}
      </section>
    </main>
  );
}
