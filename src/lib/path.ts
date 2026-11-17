// Read/write a nested value by dotted path, e.g. "projects.0.title".

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function getAt(obj: Any, path: string): Any {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setAt(obj: Any, path: string, value: unknown) {
  const keys = path.split(".");
  let o = obj;
  // Missing objects on the way are created (e.g. a setting that was never set before).
  for (const k of keys.slice(0, -1)) o = o[k] ??= {};
  o[keys[keys.length - 1]] = value;
}

export function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/gi, "d")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "project"
  );
}
