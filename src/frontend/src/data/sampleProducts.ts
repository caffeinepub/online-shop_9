import type { Product } from "../backend.d";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "sample-1",
    name: "Беспроводные наушники AiroSound Pro",
    description:
      "Наушники с активным шумоподавлением, временем работы 32 часа и кристально чистым звуком. Поддержка Bluetooth 5.3, складная конструкция, мягкие амбушюры из экокожи.",
    category: "Электроника",
    price: BigInt(1299900),
    inStock: true,
    imageId: undefined,
  },
  {
    id: "sample-2",
    name: "Ноутбук SlimBook Ultra 14",
    description:
      "Тонкий и лёгкий ноутбук с процессором последнего поколения, 16 ГБ RAM и OLED-экраном 14 дюймов. Идеален для работы и творчества.",
    category: "Электроника",
    price: BigInt(8990000),
    inStock: true,
    imageId: undefined,
  },
  {
    id: "sample-3",
    name: "Мужской пиджак «Классик»",
    description:
      "Строгий пиджак из шерстяной смеси с приталенным кроем. Подходит для деловых встреч и выхода в свет. Доступен в размерах 46–54.",
    category: "Одежда",
    price: BigInt(549900),
    inStock: true,
    imageId: undefined,
  },
  {
    id: "sample-4",
    name: "Кашемировый свитер «Уют»",
    description:
      "Мягкий свитер из 100% кашемира с высоким воротником. Согревает в холодные дни, не теряя элегантного вида.",
    category: "Одежда",
    price: BigInt(389900),
    inStock: true,
    imageId: undefined,
  },
  {
    id: "sample-5",
    name: "Керамическая ваза «Норд»",
    description:
      "Минималистичная скандинавская ваза ручной работы. Идеально подходит для сухих цветов и веток. Высота 32 см, матовое покрытие.",
    category: "Дом и сад",
    price: BigInt(289900),
    inStock: true,
    imageId: undefined,
  },
  {
    id: "sample-6",
    name: "Набор для заваривания кофе «Бариста»",
    description:
      "Профессиональный набор: керамический пуровер, стеклянный кувшин 600 мл, деревянная подставка и мерная ложка. Превратите утреннее кофе в ритуал.",
    category: "Дом и сад",
    price: BigInt(189900),
    inStock: false,
    imageId: undefined,
  },
];

export const SAMPLE_IMAGES: Record<string, string> = {
  "sample-1": "/assets/generated/product-headphones.dim_600x600.jpg",
  "sample-2": "/assets/generated/product-laptop.dim_600x600.jpg",
  "sample-3": "/assets/generated/product-blazer.dim_600x600.jpg",
  "sample-4": "/assets/generated/product-sweater.dim_600x600.jpg",
  "sample-5": "/assets/generated/product-vase.dim_600x600.jpg",
  "sample-6": "/assets/generated/product-coffee-set.dim_600x600.jpg",
};

export const SAMPLE_CATEGORIES = ["Электроника", "Одежда", "Дом и сад"];
