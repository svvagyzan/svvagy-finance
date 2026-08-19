import React from 'react';

export default function EmojiBackground() {
  const emojis = ['💵', '🪙', '💸', '💳'];
  const items = Array.from({ length: 400 });

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950 pointer-events-none select-none opacity-15">
      <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-4 p-2 text-xs sm:text-sm leading-none text-center">
        {items.map((_, i) => (
          <span key={i}>{emojis[i % emojis.length]}</span>
        ))}
      </div>
    </div>
  );
}