'use client';

export function FiberBackground() {
  return (
    <>
      <svg id="fiber-grain" className="hidden">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={3} stitchTiles="stitch"/>
          <feColorMatrix type="saturate" values="0"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.1"/>
          </feComponentTransfer>
        </filter>
      </svg>

      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-40 mix-blend-overlay"
        style={{ filter: 'url(#grain)' }}
      />

      <div
        className="fixed inset-0 z-[-1]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(180, 190, 210, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(180, 190, 210, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 80%)',
        }}
      />

      <div
        className="fixed top-[20%] left-0 w-full h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
          animation: 'thread-scan 8s infinite cubic-bezier(0.4, 0, 0.2, 1)',
          animationDelay: '-1s',
        }}
      />
      <div
        className="fixed top-[50%] left-0 w-full h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
          animation: 'thread-scan 8s infinite cubic-bezier(0.4, 0, 0.2, 1)',
          animationDelay: '-4s',
        }}
      />
      <div
        className="fixed top-[80%] left-0 w-full h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
          animation: 'thread-scan 8s infinite cubic-bezier(0.4, 0, 0.2, 1)',
          animationDelay: '-2s',
        }}
      />
    </>
  );
}
