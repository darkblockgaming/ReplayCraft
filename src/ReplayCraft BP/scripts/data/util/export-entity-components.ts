export function cloneComponentData(obj: unknown, seen = new WeakSet<object>()): unknown {
    if (obj === null || typeof obj !== "object") return obj;

    if (seen.has(obj as object)) return undefined; // avoid circular reference
    seen.add(obj as object);

    if (Array.isArray(obj)) {
        return obj.map((item) => cloneComponentData(item, seen));
    }

    const cloned: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
        const value = (obj as Record<string, unknown>)[key];
        if (typeof value !== "function") {
            try {
                cloned[key] = cloneComponentData(value, seen);
            } catch {
                // some properties may throw
            }
        }
    }
    return cloned;
}
