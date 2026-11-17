/**
 * Keep the formatting of the English and Norwegian version of a text the same, line by line.
 * - A whole line that is bold / colored / a size / Title… in one language gets the same look in the other.
 * - A line with the same words in both languages (names, years) is copied exactly, also partly formatted words.
 * - Words formatted inside a line that is translated differently can't be matched, so they stay as they are.
 * Lines are matched by their place, so it only runs when both versions have the same number of lines.
 */

const INLINE = new Set(["B", "STRONG", "I", "EM", "U", "FONT", "SPAN"]);
const BLOCK = new Set(["DIV", "P", "LI"]);
const LIST = new Set(["UL", "OL"]);

/** A line = the nodes between line breaks, in place in the document (so they can be rewrapped). */
type Line = Node[];

function linesOf(root: Node): Line[] {
  const out: Line[] = [];
  let cur: Line = [];
  const end = () => {
    out.push(cur);
    cur = [];
  };
  const walk = (parent: Node) => {
    for (const n of [...parent.childNodes]) {
      if (n.nodeName === "BR") end();
      else if (LIST.has(n.nodeName)) {
        if (cur.length) end();
        walk(n);
      } else if (BLOCK.has(n.nodeName)) {
        if (cur.length) end();
        const hasBlock = [...n.childNodes].some((c) => BLOCK.has(c.nodeName) || LIST.has(c.nodeName));
        if (hasBlock) walk(n);
        else out.push([...n.childNodes]);
      } else cur.push(n);
    }
  };
  walk(root);
  if (cur.length) end();
  return out;
}

const meaningful = (line: Line) => line.filter((n) => !(n.nodeType === 3 && !n.textContent?.trim()));
const isFormat = (n: Node): n is HTMLElement => n.nodeType === 1 && INLINE.has(n.nodeName) && !(n as Element).classList.contains("r");
const textOf = (line: Line) => line.map((n) => n.textContent ?? "").join("").replace(/\s+/g, " ").trim();

/** The formatting wrapped around the whole line, outermost first (shallow copies). */
function wrappersOf(line: Line): HTMLElement[] {
  const chain: HTMLElement[] = [];
  let nodes = meaningful(line);
  while (nodes.length === 1 && isFormat(nodes[0])) {
    chain.push(nodes[0].cloneNode(false) as HTMLElement);
    nodes = meaningful([...nodes[0].childNodes]);
  }
  return chain;
}

/** Take the whole-line formatting off a line; returns its nodes. */
function unwrap(line: Line): Line {
  let nodes = line;
  for (;;) {
    const m = meaningful(nodes);
    if (m.length !== 1 || !isFormat(m[0])) return nodes;
    const el = m[0];
    const inner = [...el.childNodes];
    el.replaceWith(...inner);
    nodes = nodes.flatMap((n) => (n === el ? inner : [n]));
  }
}

function wrap(line: Line, chain: HTMLElement[]) {
  if (!line.length || !chain.length) return;
  const first = line[0];
  const outer = chain[0].cloneNode(false) as HTMLElement;
  let inner = outer;
  for (const w of chain.slice(1)) inner = inner.appendChild(w.cloneNode(false) as HTMLElement);
  first.parentNode!.insertBefore(outer, first);
  for (const n of line) inner.appendChild(n);
}

/** The other language's HTML with this one's line formatting, or null when the lines don't match up. */
export function linkFormat(fromHtml: string, toHtml: string): string | null {
  const from = document.createElement("div");
  const to = document.createElement("div");
  from.innerHTML = fromHtml;
  to.innerHTML = toHtml;
  const a = linesOf(from);
  const b = linesOf(to);
  // Ignore empty lines at the end when counting.
  const count = (ls: Line[]) => {
    let n = ls.length;
    while (n && !textOf(ls[n - 1])) n--;
    return n;
  };
  if (count(a) !== count(b)) return null;
  for (let k = 0; k < count(a); k++) {
    const src = a[k];
    const dst = b[k];
    if (!dst.length) continue;
    if (textOf(src) && textOf(src) === textOf(dst)) {
      // Same words in both languages: copy the line as it is.
      const parent = dst[0].parentNode!;
      for (const n of src) parent.insertBefore(n.cloneNode(true), dst[0]);
      for (const n of dst) n.parentNode?.removeChild(n);
      continue;
    }
    wrap(unwrap(dst), wrappersOf(src));
  }
  return to.innerHTML;
}
