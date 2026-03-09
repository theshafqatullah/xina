"use client";

import { motion } from "framer-motion";
import {
  Copy,
  Layers,
  Minus,
  Move,
  Plus,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useMemo, useState } from "react";

type CanvasCard = {
  id: string;
  title: string;
  note: string;
  x: number;
  y: number;
  w: number;
  h: number;
  hue: number;
};

const seedCards: CanvasCard[] = [
  {
    id: "card-1",
    title: "Landing Hero",
    note: "Large CTA + trust badges",
    x: 80,
    y: 80,
    w: 260,
    h: 170,
    hue: 20,
  },
  {
    id: "card-2",
    title: "Feature Cluster",
    note: "Three-column benefit set",
    x: 390,
    y: 210,
    w: 260,
    h: 170,
    hue: 190,
  },
  {
    id: "card-3",
    title: "Pricing Rail",
    note: "Plan cards with contrast CTA",
    x: 210,
    y: 440,
    w: 260,
    h: 170,
    hue: 138,
  },
];

export default function Home() {
  const [cards, setCards] = useState<CanvasCard[]>(seedCards);
  const [selectedId, setSelectedId] = useState<string>(seedCards[0].id);
  const [zoom, setZoom] = useState<number>(100);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedId),
    [cards, selectedId],
  );

  const addCard = () => {
    const nextIndex = cards.length + 1;
    const id = `card-${Date.now()}`;
    const newCard: CanvasCard = {
      id,
      title: `Frame ${nextIndex}`,
      note: "Quick concept block",
      x: 120 + (nextIndex % 3) * 120,
      y: 120 + (nextIndex % 4) * 100,
      w: 260,
      h: 170,
      hue: (nextIndex * 43) % 360,
    };
    setCards((prev) => [...prev, newCard]);
    setSelectedId(id);
  };

  const duplicateSelected = () => {
    if (!selectedCard) {
      return;
    }

    const duplicate: CanvasCard = {
      ...selectedCard,
      id: `card-${Date.now()}`,
      x: selectedCard.x + 34,
      y: selectedCard.y + 34,
      title: `${selectedCard.title} Copy`,
    };
    setCards((prev) => [...prev, duplicate]);
    setSelectedId(duplicate.id);
  };

  const deleteSelected = () => {
    if (!selectedCard || cards.length === 1) {
      return;
    }

    setCards((prev) => {
      const next = prev.filter((card) => card.id !== selectedCard.id);
      setSelectedId(next[0].id);
      return next;
    });
  };

  const nudgeSelected = (dx: number, dy: number) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === selectedId
          ? { ...card, x: Math.max(20, card.x + dx), y: Math.max(20, card.y + dy) }
          : card,
      ),
    );
  };

  return (
    <div className="editor-shell min-h-screen p-3 text-[#17181a] md:p-6">
      <motion.div
        className="editor-frame mx-auto flex h-[calc(100vh-1.5rem)] max-w-[1500px] flex-col overflow-hidden rounded-3xl md:h-[calc(100vh-3rem)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <header className="editor-topbar flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-3 md:px-5">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[#101114] text-white shadow-lg shadow-black/20">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-black/45">
                Xina Canvas
              </p>
              <h1 className="text-base font-semibold md:text-lg">Project: Clean Motion UI</h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="editor-btn" onClick={addCard} type="button">
              <Plus size={15} />
              Add Card
            </button>
            <button className="editor-btn" onClick={duplicateSelected} type="button">
              <Copy size={14} />
              Duplicate
            </button>
            <button className="editor-btn editor-btn-danger" onClick={deleteSelected} type="button">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 grid-cols-[230px_minmax(0,1fr)_260px] md:grid">
          <aside className="editor-panel hidden border-r border-black/10 p-3 md:block">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Layers size={14} /> Layers
              </h2>
              <span className="rounded-full bg-black/5 px-2 py-1 text-[11px] font-medium text-black/55">
                {cards.length}
              </span>
            </div>
            <div className="space-y-2">
              {cards.map((card, index) => {
                const active = card.id === selectedId;
                return (
                  <button
                    key={card.id}
                    className={`layer-item ${active ? "is-active" : ""}`}
                    onClick={() => setSelectedId(card.id)}
                    type="button"
                  >
                    <span className="font-mono text-[11px] text-black/45">{index + 1}</span>
                    <span className="truncate text-left text-[13px] font-medium">{card.title}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="relative min-h-[55vh] overflow-auto p-3 md:p-5">
            <div className="canvas-grid relative h-[1200px] min-w-[900px] overflow-hidden rounded-3xl border border-black/10 bg-[#f9fafb]">
              <motion.div
                className="absolute inset-0"
                animate={{ scale: zoom / 100 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ transformOrigin: "0 0" }}
              >
                {cards.map((card, index) => {
                  const active = card.id === selectedId;
                  return (
                    <motion.button
                      key={card.id}
                      type="button"
                      className={`canvas-card ${active ? "is-selected" : ""}`}
                      style={{
                        left: card.x,
                        top: card.y,
                        width: card.w,
                        height: card.h,
                        ["--card-hue" as string]: card.hue,
                      }}
                      initial={{ opacity: 0, y: 20, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => setSelectedId(card.id)}
                    >
                      <div className="card-chip">{card.title}</div>
                      <p className="card-note">{card.note}</p>
                      <span className="card-meta">{Math.round(card.w)} x {Math.round(card.h)}</span>
                    </motion.button>
                  );
                })}
              </motion.div>

              <div className="zoom-controls">
                <button className="zoom-btn" onClick={() => setZoom((z) => Math.max(50, z - 10))} type="button">
                  <ZoomOut size={14} />
                </button>
                <p className="min-w-[48px] text-center font-mono text-xs text-black/65">{zoom}%</p>
                <button className="zoom-btn" onClick={() => setZoom((z) => Math.min(175, z + 10))} type="button">
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>
          </main>

          <aside className="editor-panel hidden border-l border-black/10 p-3 md:block">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Settings2 size={14} /> Properties
            </h2>
            {selectedCard ? (
              <div className="space-y-3 text-[13px]">
                <div className="property-card">
                  <p className="property-k">Selection</p>
                  <p className="property-v">{selectedCard.title}</p>
                </div>
                <div className="property-card">
                  <p className="property-k">Position</p>
                  <div className="mt-1 flex gap-2">
                    <button className="editor-btn flex-1 justify-center" onClick={() => nudgeSelected(-10, 0)} type="button">
                      <Minus size={13} /> X
                    </button>
                    <button className="editor-btn flex-1 justify-center" onClick={() => nudgeSelected(10, 0)} type="button">
                      <Plus size={13} /> X
                    </button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="editor-btn flex-1 justify-center" onClick={() => nudgeSelected(0, -10)} type="button">
                      <Minus size={13} /> Y
                    </button>
                    <button className="editor-btn flex-1 justify-center" onClick={() => nudgeSelected(0, 10)} type="button">
                      <Plus size={13} /> Y
                    </button>
                  </div>
                </div>
                <div className="property-card">
                  <p className="property-k">Style Tokens</p>
                  <div className="mt-2 flex items-center justify-between text-black/65">
                    <span className="inline-flex items-center gap-1">
                      <Square size={11} /> Radius
                    </span>
                    <strong>24</strong>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-black/65">
                    <span className="inline-flex items-center gap-1">
                      <Move size={11} /> Shadow
                    </span>
                    <strong>Soft</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </motion.div>
    </div>
  );
}
