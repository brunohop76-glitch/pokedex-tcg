import type { ReactNode } from "react";

export default function CatalogoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="catalogo-route">
      {children}
      <style>{`
        /* =========================================================
           CATÁLOGO D'MELO — acabamento visual da rota /catalogo
           Escopo isolado para não alterar Home/Gerações/Busca.
           ========================================================= */
        .catalogo-route main > section:first-of-type {
          min-height: 0 !important;
          height: auto !important;
          border-bottom: 4px solid #17362c !important;
          background:
            linear-gradient(rgba(247,242,216,.96), rgba(223,229,201,.96)),
            linear-gradient(rgba(18,61,48,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(18,61,48,.055) 1px, transparent 1px),
            #dfe5c9 !important;
          background-size: auto, 16px 16px, 16px 16px !important;
        }

        .catalogo-route main > section:first-of-type > div {
          width: min(1180px, calc(100% - 48px)) !important;
          max-width: 1180px !important;
          margin: 0 auto !important;
          padding: 42px 0 38px !important;
        }

        .catalogo-route main > section:first-of-type > div > div {
          display: flex !important;
          width: 100% !important;
          max-width: none !important;
          margin: 0 !important;
          align-items: flex-end !important;
          justify-content: space-between !important;
          gap: 36px !important;
        }

        .catalogo-route main > section:first-of-type > div > div > div:first-child {
          display: block !important;
          width: auto !important;
          max-width: 760px !important;
          margin: 0 !important;
          padding: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
        }

        .catalogo-route main > section:first-of-type h1 {
          margin: 0 !important;
          padding: 0 !important;
          color: #102d23 !important;
          font-family: Arial Black, Arial, Helvetica, sans-serif !important;
          font-size: clamp(3.4rem, 6vw, 5.5rem) !important;
          line-height: .9 !important;
          font-weight: 900 !important;
          letter-spacing: -.06em !important;
          white-space: nowrap !important;
          text-shadow: 3px 4px 0 #b8c2aa !important;
        }

        .catalogo-route main > section:first-of-type h1 span {
          color: #d71920 !important;
        }

        .catalogo-route main > section:first-of-type p {
          max-width: 680px !important;
        }

        .catalogo-route main > section:first-of-type > div > div > div:last-child {
          flex: 0 0 225px !important;
          width: 225px !important;
          min-height: 0 !important;
          align-self: flex-end !important;
          border: 2px solid #71816f !important;
          border-radius: 7px !important;
          background: #f7f2d8 !important;
          box-shadow: 4px 4px 0 #71816f !important;
        }

        .catalogo-route main > section:first-of-type + section {
          position: relative !important;
          z-index: 2 !important;
          margin: 0 auto !important;
          padding: 26px 24px 8px !important;
        }

        .catalogo-route main > section:first-of-type + section > div {
          max-width: 1180px !important;
          margin: 0 auto !important;
          border: 2px solid #71816f !important;
          border-radius: 12px !important;
          background:
            linear-gradient(rgba(247,242,216,.92), rgba(247,242,216,.92)),
            linear-gradient(rgba(23,61,44,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,61,44,.045) 1px, transparent 1px) !important;
          background-size: auto, 10px 10px !important;
          padding: 17px 18px 13px !important;
          box-shadow: 5px 5px 0 rgba(23,54,44,.18) !important;
        }

        .catalogo-route main > section:first-of-type + section label span {
          letter-spacing: .2em !important;
        }

        .catalogo-route main > section:first-of-type + section input,
        .catalogo-route main > section:first-of-type + section select {
          transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease !important;
        }

        .catalogo-route main > section:first-of-type + section input:focus,
        .catalogo-route main > section:first-of-type + section select:focus {
          border-color: #0b9f78 !important;
          box-shadow: 0 0 0 3px rgba(11,159,120,.12) !important;
          outline: none !important;
        }

        .catalogo-route main > section:first-of-type + section > div > div:last-child {
          scrollbar-width: thin;
        }

        .catalogo-route main > section:first-of-type + section > div > div:last-child::-webkit-scrollbar {
          height: 5px;
        }

        .catalogo-route main > section:first-of-type + section > div > div:last-child::-webkit-scrollbar-thumb {
          background: #71816f;
          border-radius: 99px;
        }

        .catalogo-route main > section:first-of-type + section + section {
          padding-top: 12px !important;
        }

        .catalogo-route main > section:first-of-type + section + section > div {
          max-width: 1180px !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        .catalogo-route main > section:first-of-type + section + section article {
          min-height: 0 !important;
          border-radius: 12px !important;
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
        }

        .catalogo-route main > section:first-of-type + section + section article:hover {
          transform: translateY(-7px) !important;
          box-shadow: 7px 9px 0 rgba(23,54,44,.2), 0 14px 24px rgba(23,54,44,.1) !important;
        }

        .catalogo-route main > section:first-of-type + section + section article img {
          transition: transform .22s ease, filter .22s ease !important;
        }

        .catalogo-route main > section:first-of-type + section + section article:hover img {
          transform: scale(1.1) translateY(-3px) !important;
          filter: drop-shadow(0 10px 5px rgba(23,54,44,.2)) !important;
        }

        @media (max-width: 800px) {
          .catalogo-route main > section:first-of-type > div {
            width: min(100% - 28px, 680px) !important;
            padding: 30px 0 !important;
          }

          .catalogo-route main > section:first-of-type > div > div {
            display: block !important;
          }

          .catalogo-route main > section:first-of-type h1 {
            font-size: clamp(2.8rem, 12vw, 4.5rem) !important;
            white-space: normal !important;
          }

          .catalogo-route main > section:first-of-type > div > div > div:last-child {
            width: 100% !important;
            margin-top: 22px !important;
          }

          .catalogo-route main > section:first-of-type + section {
            padding: 18px 14px 6px !important;
          }
        }
      `}</style>
    </div>
  );
}
