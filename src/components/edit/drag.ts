/**
 * Pointer drag used by the edit-mode "Move" handles (mouse and touch).
 * Calls onMove with the pointer position while dragging (also while the page auto-scrolls near the top / bottom edge),
 * then onEnd once when the pointer is released (cancelled = pointer lost, e.g. Esc or a system gesture).
 */
export function startPointerDrag(
  e: React.PointerEvent,
  { onMove, onEnd }: { onMove: (x: number, y: number) => void; onEnd: (cancelled: boolean) => void },
) {
  e.preventDefault();
  e.stopPropagation();
  let x = e.clientX;
  let y = e.clientY;
  const prevSelect = document.body.style.userSelect;
  const prevCursor = document.body.style.cursor;
  document.body.style.userSelect = "none";
  document.body.style.cursor = "grabbing";

  const move = (ev: PointerEvent) => {
    x = ev.clientX;
    y = ev.clientY;
    onMove(x, y);
  };
  // Scroll the page when the pointer is near the top or bottom edge, so items can be moved far.
  const edge = 80;
  const timer = window.setInterval(() => {
    const dy = y < edge ? -(edge - y) / 4 : y > window.innerHeight - edge ? (y - (window.innerHeight - edge)) / 4 : 0;
    if (dy) {
      window.scrollBy(0, dy);
      onMove(x, y);
    }
  }, 16);
  const finish = (cancelled: boolean) => () => {
    window.clearInterval(timer);
    document.body.style.userSelect = prevSelect;
    document.body.style.cursor = prevCursor;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("keydown", esc);
    onEnd(cancelled);
  };
  const up = finish(false);
  const cancel = finish(true);
  const esc = (ev: KeyboardEvent) => ev.key === "Escape" && cancel();
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", cancel);
  window.addEventListener("keydown", esc);
  onMove(x, y);
}

/** Move items [from, to] (inclusive) so they start at position `at` (an index in the list before the move).
 * Returns the new order as old indices, or null when nothing changes. */
export function moveOrder(length: number, from: number, to: number, at: number): number[] | null {
  if (at >= from && at <= to + 1) return null;
  const order = Array.from({ length }, (_, n) => n);
  const moved = order.splice(from, to - from + 1);
  order.splice(at > to ? at - moved.length : at, 0, ...moved);
  return order;
}

/** Small round "drag to move" handle. */
export const MOVE_ICON = "✥";
