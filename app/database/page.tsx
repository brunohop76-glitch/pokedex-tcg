"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SetItem = { id: string; name: string; total?: number; official?: number };

const generations = [
  { name: "Geração I", region: "Kanto", count: 151 }, { name: "Geração II", region: "Johto", count: 100 }, { name: "Geração III", region: "Hoenn", count: 135 }, { name: "Geração IV", region: "Sinnoh", count: 107 }, { name: "Geração V", region: "Unova", count: 156 }, { name: "Geração VI", region: "Kalos", count: 72 }, { name: "Geração VII", region: "Alola", count: 88 }, { name: "Geração VIII", region: "Galar", count: 96 }, { name: "Geração IX", region: "Paldea", count: 120 },
];
const types = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];

export default function DatabasePage() {
  const [sets, setSets] = useState<SetItem[]>([]);
  const [loadingSets, setLoadingSets] = useState(true);
  useEffect(() => { const c = new AbortController(); fetch("/api/tcg/catalog?mode=sets", { signal: c.signal }).then(r => r.json()).then(d => setSets(d.sets ?? [])).catch(() => setSets([])).finally(() => { if (!c.signal.aborted) setLoadingSets(false); }); return () => c.abort(); }, []);
  const totalCards = useMemo(() => sets.reduce((sum, set) => sum + Number(set.total || 0), 0), [sets]);
  const maxGeneration = Math.max(...generations.map(g => g.count));

  return (
    <main className="min-h-screen bg-[#dfe5c9] text-[#17362c]">
      <header className="sticky top-0 z-50 border-b-4 border-[#081c15] bg-[#102d23] text-white shadow-[0_4px_0_#6f796b]">
        <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Voltar para a Pokédex"><span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#f7f2d8] bg-[#d71920] text-lg shadow-[3px_3px_0_#071b14]">⚡</span><span><strong className="block font-mono text-sm tracking-[.18em]">POKÉDEX</strong><small className="font-mono text-[7px] uppercase tracking-[.25em] text-[#a9c0ad]">D'Melo / Pokémon Database</small></span></Link>
          <nav className="hidden gap-7 font-mono text-[10px] font-black uppercase tracking-widest md:flex"><Link href="/">Pokédex</Link><Link href="/geracoes">Gerações</Link><Link href="/catalogo">Catálogo</Link><Link href="/database" className="text-[#f5c94a]">Database</Link><Link href="/tcg">TCG</Link></nav>
          <Link href="/" className="rounded-full border border-[#f5c94a]/30 px-3 py-2 font-mono text-[8px] font-black uppercase tracking-widest text-[#f5c94a]">← Voltar</Link>
        </div>
      </header>

      <section id="database-hero-final" className="database-hero border-b-4 border-[#17362c] bg-[#e7edc9]">
        <div className="mx-auto flex min-h-[350px] max-w-7xl items-center px-5 py-10 md:px-8">
          <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
            <div className="min-w-0 text-left">
              <p className="mb-4 font-mono text-[9px] font-black uppercase tracking-[.34em] text-[#d71920]">05 // Pokémon Database</p>
              <h1 className="whitespace-nowrap font-black text-[clamp(3.2rem,6vw,5.8rem)] leading-[.9] tracking-[-.055em] text-[#102d23] [text-shadow:5px_6px_0_#b8c2aa]">Pokémon <span className="text-[#d71920]">Database.</span></h1>
              <p className="mt-5 max-w-[680px] text-sm leading-6 text-[#52655e]">Um painel central para acompanhar o tamanho da Pokédex D'Melo, gerações, tipos e universo TCG.</p>
            </div>
            <div className="database-status-final mx-auto flex h-[82px] w-full max-w-[280px] flex-col justify-center gap-1.5 rounded-[10px] border-2 border-[#71816f] bg-[#f7f2d8] px-5 font-mono text-[9px] font-black uppercase tracking-[.12em] text-[#17362c] shadow-[5px_5px_0_#71816f] lg:mx-0 lg:ml-auto">
              <span className="pl-2 text-[#28704d]">SYSTEM STATUS</span>
              <strong className="pl-2">ONLINE / INDEXED</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-6 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[["1.025", "Pokémon catalogados", "POKÉDEX"], ["9", "Gerações indexadas", "REGIONS"], ["18", "Tipos disponíveis", "TYPES"], [loadingSets ? "..." : String(sets.length), "Coleções TCG", "TCG NEXUS"]].map(([value,label,code]) => <div key={code} className="rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-5 shadow-[5px_5px_0_rgba(23,54,44,.18)]"><p className="font-mono text-[8px] font-black uppercase tracking-[.25em] text-[#d71920]">{code}</p><p className="mt-2 text-4xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs font-bold text-[#71816f]">{label}</p></div>)}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
          <section className="rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-5 shadow-[5px_5px_0_rgba(23,54,44,.15)]"><div className="flex items-end justify-between border-b border-[#71816f]/30 pb-4"><div><p className="font-mono text-[8px] font-black uppercase tracking-[.25em] text-[#28704d]">Pokédex / distribuição</p><h2 className="text-2xl font-black">Pokémon por geração.</h2></div><span className="font-mono text-[8px] font-black uppercase text-[#71816f]">1025 TOTAL</span></div><div className="mt-5 space-y-3">{generations.map(g => <div key={g.name} className="grid grid-cols-[92px_1fr_42px] items-center gap-3"><div><p className="font-mono text-[8px] font-black uppercase">{g.name}</p><p className="text-[9px] uppercase text-[#71816f]">{g.region}</p></div><div className="h-3 overflow-hidden rounded-full border border-[#b8c2aa] bg-[#e4e9d0]"><div className="h-full rounded-full bg-[#17362c]" style={{width:`${g.count/maxGeneration*100}%`}} /></div><strong className="text-right font-mono text-[9px]">{g.count}</strong></div>)}</div></section>
          <section className="rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-5 shadow-[5px_5px_0_rgba(23,54,44,.15)]"><p className="font-mono text-[8px] font-black uppercase tracking-[.25em] text-[#d71920]">Pokédex / taxonomy</p><h2 className="mt-1 text-2xl font-black">18 tipos.</h2><div className="mt-5 grid grid-cols-3 gap-2">{types.map(type => <span key={type} className="rounded-lg border border-[#b8c2aa] bg-[#fffceb] px-2 py-2 font-mono text-[7px] font-black uppercase tracking-wider text-[#52655e]">{type}</span>)}</div><div className="mt-6 border-t border-[#71816f]/30 pt-4"><p className="font-mono text-[8px] font-black uppercase tracking-[.2em] text-[#28704d]">Coverage</p><p className="mt-1 text-sm font-bold">Todas as regiões da Pokédex estão disponíveis para consulta.</p></div></section>
        </div>
        <section className="mt-5 rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-5 shadow-[5px_5px_0_rgba(23,54,44,.15)]"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[8px] font-black uppercase tracking-[.25em] text-[#d71920]">TCG / index overview</p><h2 className="text-2xl font-black">Universo TCG.</h2></div><span className="font-mono text-[8px] font-black uppercase text-[#71816f]">{loadingSets ? "CONSULTANDO" : `${sets.length} COLEÇÕES INDEXADAS`}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-[#b8c2aa] bg-[#fffceb] p-4"><p className="font-mono text-[7px] font-black uppercase text-[#28704d]">Coleções</p><p className="mt-2 text-3xl font-black">{loadingSets ? "…" : sets.length}</p></div><div className="rounded-lg border border-[#b8c2aa] bg-[#fffceb] p-4"><p className="font-mono text-[7px] font-black uppercase text-[#28704d]">Cartas indexadas</p><p className="mt-2 text-3xl font-black">{loadingSets ? "…" : totalCards.toLocaleString("pt-BR")}</p></div><div className="rounded-lg border border-[#b8c2aa] bg-[#fffceb] p-4"><p className="font-mono text-[7px] font-black uppercase text-[#28704d]">Catálogo</p><Link href="/tcg" className="mt-2 inline-block text-sm font-black text-[#d71920] hover:underline">Abrir catálogo TCG ↗</Link></div></div></section>
      </section>
    </main>
  );
}
