export type CosmeticCategory = "skin" | "trail" | "grid" | "deathFx" | "berserkFx";

export type CosmeticId = string;

export type EquippedCosmetics = {
  skin: CosmeticId;
  trail: CosmeticId;
  grid: CosmeticId;
  deathFx: CosmeticId;
  berserkFx: CosmeticId;
};

export type CosmeticRarity = "common" | "rare" | "epic";

export type CosmeticItem = {
  id: CosmeticId;
  category: CosmeticCategory;
  nameKey: string;
  descKey: string;
  rarity: CosmeticRarity;
  /** Drift credits — 0 = starter / free */
  price: number;
  /** Preview swatch gradient stops */
  preview: [string, string];
  /** Default unlocked for local showcase. */
  defaultUnlocked?: boolean;
};

export const COSMETIC_CATALOG: CosmeticItem[] = [
  {
    id: "skin.default",
    category: "skin",
    nameKey: "skinDefault",
    descKey: "skinDefaultDesc",
    rarity: "common",
    price: 0,
    preview: ["#0563bb", "#38bdf8"],
    defaultUnlocked: true,
  },
  {
    id: "skin.neonBlue",
    category: "skin",
    nameKey: "skinNeonBlue",
    descKey: "skinNeonBlueDesc",
    rarity: "common",
    price: 0,
    preview: ["#0ea5e9", "#67e8f9"],
    defaultUnlocked: true,
  },
  {
    id: "skin.synthPink",
    category: "skin",
    nameKey: "skinSynthPink",
    descKey: "skinSynthPinkDesc",
    rarity: "rare",
    price: 0,
    preview: ["#db2777", "#f9a8d4"],
    defaultUnlocked: true,
  },
  {
    id: "skin.voidBlack",
    category: "skin",
    nameKey: "skinVoidBlack",
    descKey: "skinVoidBlackDesc",
    rarity: "epic",
    price: 420,
    preview: ["#0f172a", "#475569"],
  },
  {
    id: "trail.default",
    category: "trail",
    nameKey: "trailDefault",
    descKey: "trailDefaultDesc",
    rarity: "common",
    price: 0,
    preview: ["#3b82f6", "#1d4ed8"],
    defaultUnlocked: true,
  },
  {
    id: "trail.lightning",
    category: "trail",
    nameKey: "trailLightning",
    descKey: "trailLightningDesc",
    rarity: "rare",
    price: 0,
    preview: ["#22d3ee", "#e0f2fe"],
    defaultUnlocked: true,
  },
  {
    id: "trail.vapor",
    category: "trail",
    nameKey: "trailVapor",
    descKey: "trailVaporDesc",
    rarity: "epic",
    price: 380,
    preview: ["#a78bfa", "#f0abfc"],
  },
  {
    id: "grid.default",
    category: "grid",
    nameKey: "gridDefault",
    descKey: "gridDefaultDesc",
    rarity: "common",
    price: 0,
    preview: ["#1e3a5f", "#5a8cc8"],
    defaultUnlocked: true,
  },
  {
    id: "grid.synthwave",
    category: "grid",
    nameKey: "gridSynthwave",
    descKey: "gridSynthwaveDesc",
    rarity: "rare",
    price: 0,
    preview: ["#701a75", "#f472b6"],
    defaultUnlocked: true,
  },
  {
    id: "grid.matrix",
    category: "grid",
    nameKey: "gridMatrix",
    descKey: "gridMatrixDesc",
    rarity: "epic",
    price: 290,
    preview: ["#052e16", "#4ade80"],
  },
  {
    id: "death.default",
    category: "deathFx",
    nameKey: "deathDefault",
    descKey: "deathDefaultDesc",
    rarity: "common",
    price: 0,
    preview: ["#f97316", "#fb7185"],
    defaultUnlocked: true,
  },
  {
    id: "death.glitch",
    category: "deathFx",
    nameKey: "deathGlitch",
    descKey: "deathGlitchDesc",
    rarity: "epic",
    price: 350,
    preview: ["#a855f7", "#22d3ee"],
  },
  {
    id: "berserk.default",
    category: "berserkFx",
    nameKey: "berserkDefault",
    descKey: "berserkDefaultDesc",
    rarity: "common",
    price: 0,
    preview: ["#dc2626", "#fb7185"],
    defaultUnlocked: true,
  },
  {
    id: "berserk.overload",
    category: "berserkFx",
    nameKey: "berserkOverload",
    descKey: "berserkOverloadDesc",
    rarity: "epic",
    price: 0,
    preview: ["#7c3aed", "#f472b6"],
    defaultUnlocked: true,
  },
];

const STORAGE_KEY = "neon-drift-cosmetics";

const DEFAULT_EQUIPPED: EquippedCosmetics = {
  skin: "skin.default",
  trail: "trail.default",
  grid: "grid.default",
  deathFx: "death.default",
  berserkFx: "berserk.default",
};

const DEFAULT_UNLOCKED = COSMETIC_CATALOG.filter((c) => c.defaultUnlocked).map((c) => c.id);

export type CosmeticProfile = {
  unlocked: CosmeticId[];
  equipped: EquippedCosmetics;
};

export function defaultCosmeticProfile(): CosmeticProfile {
  return {
    unlocked: [...DEFAULT_UNLOCKED],
    equipped: { ...DEFAULT_EQUIPPED },
  };
}

export function loadCosmeticProfile(): CosmeticProfile {
  if (typeof window === "undefined") return defaultCosmeticProfile();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCosmeticProfile();
    const parsed = JSON.parse(raw) as Partial<CosmeticProfile>;
    const base = defaultCosmeticProfile();
    const unlocked = new Set([...base.unlocked, ...(parsed.unlocked ?? [])]);
    for (const item of COSMETIC_CATALOG) {
      if (item.defaultUnlocked) unlocked.add(item.id);
    }
    const equipped = { ...base.equipped, ...parsed.equipped };
    for (const cat of Object.keys(base.equipped) as (keyof EquippedCosmetics)[]) {
      const id = equipped[cat];
      if (!unlocked.has(id)) equipped[cat] = base.equipped[cat];
    }
    return { unlocked: [...unlocked], equipped };
  } catch {
    return defaultCosmeticProfile();
  }
}

export function saveCosmeticProfile(profile: CosmeticProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function equipCosmetic(profile: CosmeticProfile, id: CosmeticId): CosmeticProfile {
  const item = COSMETIC_CATALOG.find((c) => c.id === id);
  if (!item || !profile.unlocked.includes(id)) return profile;
  const next = {
    ...profile,
    equipped: { ...profile.equipped, [item.category]: id },
  };
  saveCosmeticProfile(next);
  return next;
}

/** Local unlock — caller must ensure pilot is signed in and email-verified. */
export function purchaseCosmetic(profile: CosmeticProfile, id: CosmeticId): CosmeticProfile | null {
  const item = COSMETIC_CATALOG.find((c) => c.id === id);
  if (!item || profile.unlocked.includes(id)) return profile;
  const next = {
    ...profile,
    unlocked: [...profile.unlocked, id],
  };
  saveCosmeticProfile(next);
  return next;
}

export function getCatalogByCategory(category: CosmeticCategory) {
  return COSMETIC_CATALOG.filter((c) => c.category === category);
}

export type SkinPalette = { hull: string; accent: string };
export type TrailPalette = { core: string; glow: number };
export type GridPalette = { r: number; g: number; b: number; alphaMul: number };

export function skinPalette(id: CosmeticId, fallbackPrimary: string, fallbackFg: string): SkinPalette {
  switch (id) {
    case "skin.neonBlue":
      return { hull: "#38bdf8", accent: "#e0f2fe" };
    case "skin.synthPink":
      return { hull: "#f472b6", accent: "#fce7f3" };
    case "skin.voidBlack":
      return { hull: "#1e293b", accent: "#94a3b8" };
    default:
      return { hull: fallbackPrimary, accent: fallbackFg };
  }
}

export function trailPalette(id: CosmeticId, primary: string): TrailPalette {
  switch (id) {
    case "trail.lightning":
      return { core: "#a5f3fc", glow: 1.35 };
    case "trail.vapor":
      return { core: "#c4b5fd", glow: 1.15 };
    default:
      return { core: primary, glow: 1 };
  }
}

export function gridPalette(id: CosmeticId): GridPalette {
  switch (id) {
    case "grid.synthwave":
      return { r: 244, g: 114, b: 182, alphaMul: 1.1 };
    case "grid.matrix":
      return { r: 74, g: 222, b: 128, alphaMul: 1.05 };
    default:
      return { r: 90, g: 140, b: 200, alphaMul: 1 };
  }
}
