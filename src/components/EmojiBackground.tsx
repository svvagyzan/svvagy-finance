import React from 'react';

export default function EmojiBackground() {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
    <text x="5" y="22" font-size="12">💵</text>
    <text x="35" y="22" font-size="12">🪙</text>
    <text x="20" y="52" font-size="12">💸</text>
    <text x="50" y="52" font-size="12">💳</text>
  </svg>`;

  const encodedSvg = encodeURIComponent(svgString);

  return (
    <div
      className="fixed inset-0 -z-10 bg-zinc-950 pointer-events-none select-none opacity-20"
      style={{
        backgroundImage: `url("data:image/svg+xml,${encodedSvg}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '45px 45px',
      }}
    />
  );
}