import type { CSSProperties } from 'vue';

type AttrWithClassStyle = {
  class?: unknown;
  style?: unknown;
};

function normalizeClassList(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    return value.split(/\s+/).filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizeClassList(entry));
  }

  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, active]) => Boolean(active))
      .map(([className]) => className);
  }

  return [];
}

export function mergeStyleObjects(
  base?: CSSProperties,
  incoming?: CSSProperties,
): CSSProperties | undefined {
  const merged = {
    ...(base ?? {}),
    ...(incoming ?? {}),
  };

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function mergeAttrObjects<T extends AttrWithClassStyle>(
  base?: T,
  incoming?: T,
): T {
  const mergedClassNames = [
    ...normalizeClassList(base?.class),
    ...normalizeClassList(incoming?.class),
  ];

  const mergedStyle = mergeStyleObjects(
    typeof base?.style === 'object' ? (base.style as CSSProperties) : undefined,
    typeof incoming?.style === 'object' ? (incoming.style as CSSProperties) : undefined,
  );

  return {
    ...(base ?? ({} as T)),
    ...(incoming ?? ({} as T)),
    class: mergedClassNames.length > 0 ? mergedClassNames.join(' ') : undefined,
    style: mergedStyle,
  } as T;
}