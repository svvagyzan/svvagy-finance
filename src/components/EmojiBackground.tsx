import React from 'react';

export default function EmojiBackground() {
  const emojis = ['💵', '🪙', '💸', '💳'];
  const items = Array.from({ length: 1500 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950 pointer-events-none select-none opacity-20">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(22px,1fr))] gap-1 p-1 text-[11px] leading-none text-center">
        {items.map((_, i) => (
          <span key={i}>{emojis[i % emojis.length]}</span>
        ))}
      </div>
    </div>
  );
}