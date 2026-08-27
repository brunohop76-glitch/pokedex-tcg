"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CardGallery from "../pokemon/[id]/CardGallery";

type SetItem = { id: string; name: string; logo?: string | null; symbol?: string | null; total: number; official: number; releaseDate: string; serie: string };
type Card = { id: string; localId?: string; name: string; image?: string | null; rarity?: string; illustrator?: string; set?: { id?: string; name?: string } };

const rarities = ["Common", "Uncommon", "Rare", "Rare Holo", "Holo Rare", "Double Rare", "Ultra Rare", "Illustration Rare", "Special Illustration Rare", "Hyper Rare", "Amazing Rare", "Shiny Rare", "Shiny Holo Rare", "Promo"];
const categories = ["Todos", "Pokemon", "Trainer", "Energy"];
const perPage = 24;

export default function TCGPage() {
  const [sets, setSets] = useState<SetItem[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [search, setSearch] = useState("");
  const [setId, setSetId] = useState("");
  const [rarity, setRarity] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setsLoading, setSetsLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("q") ?? "");
    setSetId(params.get("set") ?? "");
    setRarity(params.get("rarity") ?? "");
    setCategory(params.get("category") ?? "");
    setSort(params.get("sort") ?? "latest");
    const urlPage = Number(params.get("page"));
    if (urlPage > 0) setPage(urlPage);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/tcg/catalog?mode=sets", { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setSets(data.sets ?? []))
      .catch(() => setSets([]))
      .finally(() => { if (!controller.signal.aborted) setSetsLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(perPage) });
    if (search.trim()) params.set("name", search.trim());
    if (setId) params.set("set", setId);
    if (rarity) params.set("rarity", rarity);
    if (category) params.set("category", category);
    if (sort === "name-asc") { params.set("sort", "name"); params.set("order", "ASC"); }
    if (sort === "name-desc") { params.set("sort", "name"); params.set("order", "DESC"); }
    if (sort === "number") { params.set("sort", "localId"); params.set("order", "ASC"); }

    fetch(`/api/tcg/catalog?${params.toString()}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => { setCards(data.cards ?? []); setHasMore(Boolean(data.hasMore)); })
      .catch(() => { if (!controller.signal.aborted) { setCards([]); setHasMore(false); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    const url = new URL(window.location.href);
    const clean = new URLSearchParams();
    if (search) clean.set("q", search);
    if (setId) clean.set("set", setId);
    if (rarity) clean.set("rarity", rarity);
    if (category) clean.set("category", category);
    if (sort !== "latest") clean.set("sort", sort);
    if (page > 1) clean.set("page", String(page));
    url.search = clean.toString();
    window.history.replaceState(null, "", url.toString());

    return () => controller.abort();
  }, [search, setId, rarity, category, sort, page]);

  const selectedSet = useMemo(() => sets.find((set) => set.id === setId), [sets, setId]);
  const totalText = loading ? "CONSULTANDO CARTAS..." : `${cards.length}${hasMore ? "+" : ""} CARTAS NESTA PÁGINA`;

  function resetFilters() {
    setSearch(""); setSetId(""); setRarity(""); setCategory(""); setSort("latest"); setPage(1);
  }

  function changePage(target: number) {
    if (target < 1 || (target > page && !hasMore)) return;
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen bg-[#dfe5c9] text-[#17362c]">
      <header className="sticky top-0 z-50 border-b-4 border-[#081c15] bg-[#102d23] text-white shadow-[0_4px_0_#6f796b]">
        <div className="mx-auto flex min-h-[70px] max-w-7xl items-center justify-between gap-5 px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Voltar para a Pokédex">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#f7f2d8] bg-[#d71920] text-lg shadow-[3px_3px_0_#071b14]">⚡</span>
            <span><strong className="block font-mono text-sm tracking-[.18em]">POKÉDEX</strong><small className="font-mono text-[7px] uppercase tracking-[.25em] text-[#a9c0ad]">D'Melo / TCG Database</small></span>
          </Link>
          <nav className="hidden gap-7 font-mono text-[10px] font-black uppercase tracking-widest md:flex"><Link href="/">Pokédex</Link><Link href="/catalogo">Catálogo</Link><Link href="/tcg" className="text-[#f5c94a]">TCG</Link></nav>
          <Link href="/" className="rounded-full border border-[#f5c94a]/30 px-3 py-2 font-mono text-[8px] font-black uppercase tracking-widest text-[#f5c94a]">← Voltar</Link>
        </div>
      </header>

      <section className="border-b-4 border-[#17362c] bg-[#e7edc9] px-5 py-7 md:px-8 md:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[.32em] text-[#d71920]">03 // Trading Card Database</p>
            <h1 className="mt-1 text-5xl font-black leading-none tracking-[-.055em] text-[#102d23] drop-shadow-[3px_4px_0_#b8c2aa] md:text-6xl">Catálogo <span className="text-[#d71920]">TCG.</span></h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52655e]">Explore cartas Pokémon, coleções, raridades e eras do TCG em uma biblioteca visual.</p>
          </div>
          <div className="w-fit shrink-0 rounded border border-[#71816f] bg-[#f7f2d8] px-4 py-3 font-mono text-[9px] font-black uppercase tracking-widest shadow-[3px_3px_0_#71816f]"><span className="text-[#d71920]">TCG NEXUS</span><br />{setsLoading ? "CARREGANDO COLEÇÕES" : `${sets.length} COLEÇÕES INDEXADAS`}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-5 md:px-8">
        <div className="rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-4 shadow-[5px_5px_0_rgba(23,54,44,.18)]">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
            <label className="block"><span className="mb-1 block font-mono text-[8px] font-black uppercase tracking-[.22em] text-[#28704d]">Pesquisar carta</span><div className="flex items-center border-2 border-[#17362c] bg-[#fffceb]"><span className="px-3 text-[#d71920]">⌕</span><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nome da carta..." className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm font-bold outline-none"/><button type="button" onClick={() => { setSearch(""); setPage(1); }} className="px-3 font-mono text-[7px] font-black uppercase text-[#758078]">Limpar</button></div></label>
            <label className="block"><span className="mb-1 block font-mono text-[8px] font-black uppercase tracking-[.22em] text-[#28704d]">Coleção</span><select value={setId} onChange={(event) => { setSetId(event.target.value); setPage(1); }} className="w-full border-2 border-[#71816f] bg-[#fffceb] px-3 py-3 text-sm font-bold outline-none"><option value="">Todas as coleções</option>{sets.map((set) => <option key={set.id} value={set.id}>{set.name}</option>)}</select></label>
            <label className="block"><span className="mb-1 block font-mono text-[8px] font-black uppercase tracking-[.22em] text-[#28704d]">Raridade</span><select value={rarity} onChange={(event) => { setRarity(event.target.value); setPage(1); }} className="w-full border-2 border-[#71816f] bg-[#fffceb] px-3 py-3 text-sm font-bold outline-none"><option value="">Todas as raridades</option>{rarities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[#71816f]/30 pt-4 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="mb-2 font-mono text-[8px] font-black uppercase tracking-[.22em] text-[#d71920]">Categoria</p><div className="flex flex-wrap gap-2">{categories.map((item) => { const value = item === "Todos" ? "" : item; return <button key={item} type="button" onClick={() => { setCategory(value); setPage(1); }} className={`rounded-full border px-4 py-2 font-mono text-[8px] font-black uppercase tracking-widest transition ${category === value ? "border-[#d71920] bg-[#d71920] text-white" : "border-[#71816f]/50 bg-[#fffceb] text-[#52655e] hover:-translate-y-0.5"}`}>{item}</button>; })}</div></div>
            <div className="flex items-center gap-3"><label className="min-w-[210px]"><span className="mb-1 block font-mono text-[8px] font-black uppercase tracking-[.22em] text-[#28704d]">Ordenar</span><select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="w-full border-2 border-[#71816f] bg-[#fffceb] px-3 py-2.5 text-xs font-bold outline-none"><option value="latest">Mais recentes</option><option value="number">Número da carta</option><option value="name-asc">Nome A–Z</option><option value="name-desc">Nome Z–A</option></select></label><button type="button" onClick={resetFilters} className="mt-5 border-2 border-[#17362c] bg-[#102d23] px-4 py-2.5 font-mono text-[8px] font-black uppercase tracking-widest text-white transition hover:-translate-y-0.5">Limpar filtros</button></div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border-2 border-[#71816f] bg-[#f7f2d8] p-4 shadow-[5px_5px_0_rgba(23,54,44,.15)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-[8px] font-black uppercase tracking-[.25em] text-[#d71920]">TCG Database / {selectedSet?.name ?? "Todas as coleções"}</p><h2 className="text-2xl font-black">Cartas catalogadas.</h2></div><div className="text-right font-mono text-[8px] font-black uppercase tracking-widest text-[#758078]">{totalText}<br />PÁGINA {page}</div></div>
        </div>

        {loading ? <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{Array.from({ length: 12 }).map((_, index) => <div key={index} className="aspect-[2.5/3.5] animate-pulse rounded-2xl border-2 border-[#71816f]/40 bg-[#f7f2d8]" />)}</div> : cards.length ? <CardGallery cards={cards} /> : <div className="mt-5 rounded-xl border-2 border-dashed border-[#71816f] bg-[#f7f2d8] p-10 text-center"><p className="font-mono text-xs font-black uppercase tracking-widest">Nenhuma carta encontrada</p><p className="mt-2 text-sm text-[#758078]">Tente outro nome, coleção ou raridade.</p></div>}

        <div className="mt-8 flex items-center justify-center gap-2"><button type="button" disabled={page <= 1} onClick={() => changePage(1)} className="rounded border-2 border-[#71816f] bg-[#f7f2d8] px-3 py-2 font-mono text-[8px] font-black uppercase disabled:cursor-not-allowed disabled:opacity-35">« Primeiro</button><button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded border-2 border-[#71816f] bg-[#f7f2d8] px-3 py-2 font-mono text-[8px] font-black uppercase disabled:cursor-not-allowed disabled:opacity-35">← Anterior</button><span className="rounded border-2 border-[#d71920] bg-[#d71920] px-4 py-2 font-mono text-[8px] font-black uppercase text-white">Página {page}</span><button type="button" disabled={!hasMore} onClick={() => changePage(page + 1)} className="rounded border-2 border-[#71816f] bg-[#f7f2d8] px-3 py-2 font-mono text-[8px] font-black uppercase disabled:cursor-not-allowed disabled:opacity-35">Próxima →</button></div>
      </section>
    </main>
  );
}
