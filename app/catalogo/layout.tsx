import type { ReactNode } from "react";

export default function CatalogoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="catalogo-route">
      {children}
      <style>{`
        .catalogo-route main { overflow-x: hidden !important; }

        /* HERO — compacto e sem sobreposição */
        .catalogo-route main > section:nth-of-type(1) {
          display: block !important;
          min-height: 0 !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 24px !important;
          border-bottom: 4px solid #17362c !important;
          background: linear-gradient(rgba(231,237,201,.94), rgba(223,229,201,.94)), linear-gradient(rgba(18,61,48,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(18,61,48,.055) 1px, transparent 1px), #dfe5c9 !important;
          background-size: auto, 16px 16px, 16px 16px !important;
        }
        .catalogo-route main > section:nth-of-type(1) > div {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) 210px !important;
          align-items: center !important;
          gap: 32px !important;
          width: min(1180px, 100%) !important;
          max-width: 1180px !important;
          min-height: 0 !important;
          height: auto !important;
          margin: 0 auto !important;
          padding: 30px 0 28px !important;
        }
        .catalogo-route main > section:nth-of-type(1) > div > div:first-child {
          display: block !important;
          width: auto !important;
          max-width: 860px !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          align-self: center !important;
        }
        .catalogo-route main > section:nth-of-type(1) > div > div:first-child > p { display:block !important; width:auto !important; max-width:760px !important; margin:0 !important; padding:0 !important; }
        .catalogo-route main > section:nth-of-type(1) > div > div:first-child > p:last-child { margin-top:12px !important; line-height:1.45 !important; }
        .catalogo-route main > section:nth-of-type(1) h1 {
          display:block !important;
          width:auto !important;
          max-width:none !important;
          margin:4px 0 0 !important;
          padding:0 !important;
          color:#102d23 !important;
          font-family:Arial Black, Arial, Helvetica, sans-serif !important;
          font-size:clamp(3rem, 4.7vw, 4.5rem) !important;
          line-height:.94 !important;
          font-weight:900 !important;
          letter-spacing:-.052em !important;
          white-space:nowrap !important;
          text-shadow:3px 4px 0 #b8c2aa !important;
        }
        .catalogo-route main > section:nth-of-type(1) h1 span { color:#d71920 !important; }
        .catalogo-route main > section:nth-of-type(1) > div > div:last-child {
          display:block !important;
          width:210px !important;
          min-width:210px !important;
          min-height:0 !important;
          margin:0 !important;
          align-self:center !important;
          border:2px solid #71816f !important;
          border-radius:7px !important;
          background:#f7f2d8 !important;
          box-shadow:4px 4px 0 #71816f !important;
        }

        /* FILTROS */
        .catalogo-route main > section:nth-of-type(2) { position:relative !important; z-index:2 !important; width:100% !important; max-width:none !important; margin:0 !important; padding:20px 24px 8px !important; background:transparent !important; }
        .catalogo-route main > section:nth-of-type(2) > div { width:min(1180px,100%) !important; max-width:1180px !important; margin:0 auto !important; border:2px solid #71816f !important; border-radius:12px !important; background:#f7f2d8 !important; padding:17px 18px 13px !important; box-shadow:5px 5px 0 rgba(23,54,44,.18) !important; }
        .catalogo-route main > section:nth-of-type(2) input:focus,.catalogo-route main > section:nth-of-type(2) select:focus { border-color:#0b9f78 !important; box-shadow:0 0 0 3px rgba(11,159,120,.12) !important; outline:none !important; }
        .catalogo-route main > section:nth-of-type(2) > div > div:last-child { scrollbar-width:thin; }
        .catalogo-route main > section:nth-of-type(2) > div > div:last-child::-webkit-scrollbar { height:5px; }
        .catalogo-route main > section:nth-of-type(2) > div > div:last-child::-webkit-scrollbar-thumb { background:#71816f; border-radius:99px; }

        /* LISTA */
        .catalogo-route main > section:nth-of-type(3) { width:100% !important; max-width:none !important; margin:0 !important; padding:8px 24px 40px !important; }
        .catalogo-route main > section:nth-of-type(3) > div { max-width:1180px !important; margin-left:auto !important; margin-right:auto !important; }
        .catalogo-route main > section:nth-of-type(3) article { min-height:0 !important; border-radius:12px !important; transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease !important; }
        .catalogo-route main > section:nth-of-type(3) article:hover { transform:translateY(-7px) !important; border-color:#0b9f78 !important; box-shadow:7px 9px 0 rgba(23,54,44,.2),0 14px 24px rgba(23,54,44,.1) !important; }
        .catalogo-route main > section:nth-of-type(3) article img { transition:transform .22s ease,filter .22s ease !important; }
        .catalogo-route main > section:nth-of-type(3) article:hover img { transform:scale(1.1) translateY(-3px) !important; filter:drop-shadow(0 10px 5px rgba(23,54,44,.2)) !important; }

        @media (max-width:1100px) and (min-width:801px) {
          .catalogo-route main > section:nth-of-type(1) > div { grid-template-columns:minmax(0,1fr) 190px !important; gap:22px !important; }
          .catalogo-route main > section:nth-of-type(1) h1 { font-size:clamp(2.8rem,5vw,4rem) !important; }
          .catalogo-route main > section:nth-of-type(1) > div > div:last-child { width:190px !important; min-width:190px !important; }
        }
        @media (max-width:800px) {
          .catalogo-route main > section:nth-of-type(1) { padding:0 14px !important; }
          .catalogo-route main > section:nth-of-type(1) > div { display:block !important; width:100% !important; padding:28px 0 26px !important; }
          .catalogo-route main > section:nth-of-type(1) h1 { font-size:clamp(2.8rem,12vw,4.4rem) !important; white-space:normal !important; }
          .catalogo-route main > section:nth-of-type(1) > div > div:last-child { width:100% !important; min-width:0 !important; margin-top:18px !important; }
          .catalogo-route main > section:nth-of-type(2),.catalogo-route main > section:nth-of-type(3) { padding-left:14px !important; padding-right:14px !important; }
        }
      `}</style>
    </div>
  );
}
