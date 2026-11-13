// App icons for the About-page dock. The icon is picked from the tool's name;
// unknown tools fall back to a colored square with the short text.

const box = "flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow sm:h-11 sm:w-11";

/** Adobe-style tile: dark square, two colored letters, thin colored border. */
function Adobe({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <div className={box} style={{ background: bg, boxShadow: `inset 0 0 0 1.5px ${fg}` }}>
      <span className="text-[15px] font-semibold tracking-tight" style={{ color: fg }}>
        {text}
      </span>
    </div>
  );
}

const ICONS: { match: RegExp; render: () => React.ReactNode }[] = [
  { match: /photoshop/i, render: () => <Adobe text="Ps" bg="#001E36" fg="#31A8FF" /> },
  { match: /illustrator/i, render: () => <Adobe text="Ai" bg="#330000" fg="#FF9A00" /> },
  { match: /indesign/i, render: () => <Adobe text="Id" bg="#49021F" fg="#FF3366" /> },
  {
    match: /figma/i,
    render: () => (
      <div className={`${box} bg-white`}>
        <svg viewBox="0 0 38 57" className="h-[58%]" aria-hidden>
          <path d="M19 0H9.5a9.5 9.5 0 0 0 0 19H19z" fill="#F24E1E" />
          <path d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19z" fill="#FF7262" />
          <path d="M19 19H9.5a9.5 9.5 0 0 0 0 19H19z" fill="#A259FF" />
          <circle cx="28.5" cy="28.5" r="9.5" fill="#1ABCFE" />
          <path d="M19 38H9.5a9.5 9.5 0 1 0 9.5 9.5z" fill="#0ACF83" />
        </svg>
      </div>
    ),
  },
  {
    match: /final\s*cut/i,
    render: () => (
      <div className={box} style={{ background: "linear-gradient(160deg,#2b2b2e,#0d0d0f)" }}>
        {/* clapperboard */}
        <svg viewBox="0 0 24 24" className="h-[62%]" aria-hidden>
          <defs>
            <linearGradient id="fcp" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff5f9e" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path d="m3.2 7.6 16.9-4.2.6 2.4-16.9 4.2z" fill="url(#fcp)" />
          <path d="m6.6 6.8 2 2.1M10.6 5.8l2 2.1M14.6 4.8l2 2.1" stroke="#0d0d0f" strokeWidth="1.3" />
          <rect x="3.5" y="10.5" width="17" height="10" rx="1.6" fill="url(#fcp)" />
        </svg>
      </div>
    ),
  },
  {
    match: /canva/i,
    render: () => (
      <div className={box} style={{ background: "linear-gradient(135deg,#00C4CC,#7D2AE8)" }}>
        <svg viewBox="0 0 24 24" className="h-[70%]" aria-hidden>
          <path
            fill="#fff"
            d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM6.962 7.68c.754 0 1.337.549 1.405 1.2.069.583-.171 1.097-.822 1.406-.343.171-.48.172-.549.069-.034-.069 0-.137.069-.206.617-.514.617-.926.548-1.508-.034-.378-.308-.618-.583-.618-1.2 0-2.914 2.674-2.674 4.629.103.754.549 1.646 1.509 1.646.308 0 .65-.103.96-.24.5-.264.799-.47 1.097-.8-.073-.885.704-2.046 1.851-2.046.515 0 .926.205.96.583.068.514-.377.582-.514.582s-.378-.034-.378-.17c-.034-.138.309-.07.275-.378-.035-.206-.24-.274-.446-.274-.72 0-1.131.994-1.029 1.611.035.275.172.549.447.549.205 0 .514-.31.617-.755.068-.308.343-.514.583-.514.102 0 .17.034.205.171v.138c-.034.137-.137.548-.102.651 0 .069.034.171.17.171.092 0 .436-.18.777-.459.117-.59.253-1.298.253-1.357.034-.24.137-.48.617-.48.103 0 .171.034.205.171v.138l-.136.617c.445-.583 1.097-.994 1.508-.994.172 0 .309.102.309.274 0 .103 0 .274-.069.446-.137.377-.309.96-.412 1.474 0 .137.035.274.207.274.171 0 .685-.206 1.096-.754l.007-.004c-.002-.068-.007-.134-.007-.202 0-.411.035-.754.104-.994.068-.274.411-.514.617-.514.103 0 .205.069.205.171 0 .035 0 .103-.034.137-.137.446-.24.857-.24 1.269 0 .24.034.582.102.788 0 .034.035.069.07.069.068 0 .548-.445.89-1.028-.308-.206-.48-.549-.48-.96 0-.72.446-1.097.858-1.097.343 0 .617.24.617.72 0 .308-.103.65-.274.96h.102a.77.77 0 0 0 .584-.24.293.293 0 0 1 .134-.117c.335-.425.83-.74 1.41-.74.48 0 .924.205.959.582.068.515-.378.618-.515.618l-.002-.002c-.138 0-.377-.035-.377-.172 0-.137.309-.068.274-.376-.034-.206-.24-.275-.446-.275-.686 0-1.130.891-1.028 1.611.034.275.171.583.445.583.206 0 .515-.308.652-.754.068-.274.343-.514.583-.514.103 0 .17.034.205.171 0 .069 0 .206-.137.652-.17.308-.171.48-.137.617.034.274.171.48.309.583.034.034.068.102.068.102 0 .069-.034.138-.137.138-.034 0-.068 0-.103-.035-.514-.205-.72-.548-.789-.891-.205.24-.445.377-.72.377-.445 0-.89-.411-.96-.926a1.609 1.609 0 0 1 .075-.649c-.203.13-.422.203-.623.203h-.17c-.447.652-.927 1.098-1.27 1.303a.896.896 0 0 1-.377.104c-.068 0-.171-.035-.205-.104-.095-.152-.156-.392-.193-.667-.481.527-1.145.805-1.453.805-.343 0-.548-.206-.582-.55v-.376c.102-.754.377-1.2.377-1.337a.074.074 0 0 0-.069-.07c-.24 0-1.028.824-1.166 1.373l-.103.445c-.068.309-.377.515-.582.515-.103 0-.172-.035-.206-.172v-.137l.046-.233c-.435.31-.87.508-1.075.508-.308 0-.48-.172-.514-.412-.206.274-.445.412-.754.412-.352 0-.696-.24-.862-.593-.244.275-.523.553-.852.764-.48.309-1.028.549-1.68.549-.582 0-1.097-.309-1.371-.583-.412-.377-.651-.96-.686-1.509-.205-1.68.823-3.840 2.4-4.8.378-.205.755-.343 1.132-.343zm9.77 3.291c-.104 0-.172.172-.172.343 0 .274.137.583.309.755a1.74 1.74 0 0 0 .102-.583c0-.343-.137-.515-.24-.515z"
          />
        </svg>
      </div>
    ),
  },
  {
    match: /capcut/i,
    render: () => (
      <div className={`${box} bg-black`}>
        {/* simplified CapCut mark: two mirrored cut shapes */}
        <svg viewBox="0 0 24 24" className="h-[62%]" aria-hidden fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M4 6.5h16v3.2L12 14 4 9.7z" />
          <path d="M4 17.5h16v-3.2L12 10 4 14.3z" />
        </svg>
      </div>
    ),
  },
];

const FALLBACK = ["#002fff", "#ff6b9a", "#8b5cf6", "#050505", "#ff8a3d", "#2bb3a3"];

export function ToolIcon({ name, short, index }: { name: string; short: string; index: number }) {
  const hit = ICONS.find((x) => x.match.test(name));
  if (hit) return <>{hit.render()}</>;
  return (
    <div className={`${box} text-sm font-semibold text-white`} style={{ background: FALLBACK[index % FALLBACK.length] }}>
      {short}
    </div>
  );
}
