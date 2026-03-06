export interface ShowcaseItem {
  id: string;
  name: string;
  label: string;
  img: string;
  tag: string;
}

export const DEFAULT_SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "s1",
    name: "Лампа накаливания",
    label: "Классика",
    img: "/assets/generated/bulb-incandescent.dim_400x400.jpg",
    tag: "Лампочки",
  },
  {
    id: "s2",
    name: "LED лампа",
    label: "Хит продаж",
    img: "/assets/generated/bulb-led.dim_400x400.jpg",
    tag: "Лампочки",
  },
  {
    id: "s3",
    name: "Энергосберегающая КЛЛ",
    label: "Экономия",
    img: "/assets/generated/bulb-cfl.dim_400x400.jpg",
    tag: "Лампочки",
  },
  {
    id: "s4",
    name: "Галогенная лампа",
    label: "Яркий свет",
    img: "/assets/generated/bulb-halogen.dim_400x400.jpg",
    tag: "Лампочки",
  },
  {
    id: "s5",
    name: "Ретро лампа Эдисона G125",
    label: "Декор",
    img: "/assets/generated/bulb-vintage-globe.dim_400x400.jpg",
    tag: "Лампочки",
  },
  {
    id: "s6",
    name: "Умная RGB лампа",
    label: "Новинка",
    img: "/assets/generated/bulb-smart-rgb.dim_400x400.jpg",
    tag: "Лампочки",
  },
];

const STORAGE_KEY = "showcase_items";

export function getShowcaseItems(): ShowcaseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ShowcaseItem[];
    }
  } catch {
    // ignore
  }
  return DEFAULT_SHOWCASE_ITEMS;
}

export function saveShowcaseItems(items: ShowcaseItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
