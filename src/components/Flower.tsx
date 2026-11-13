/** Five-petal flower that spins when hovered. Color follows the text (currentColor). */
export function Flower({ className = "" }: { className?: string }) {
  return (
    <span className={`group/flower inline-block align-middle ${className}`} aria-hidden>
      <svg
        viewBox="-12 -12 24 24"
        className="h-full w-full transition-transform duration-1000 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/flower:rotate-[360deg]"
      >
        {[0, 72, 144, 216, 288].map((a) => (
          <circle key={a} cx={0} cy={-5.4} r={4.9} fill="currentColor" transform={`rotate(${a})`} />
        ))}
        <circle r={1.8} fill="var(--paper)" />
      </svg>
    </span>
  );
}
