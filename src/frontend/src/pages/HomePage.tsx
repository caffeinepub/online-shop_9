import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageSearch, Star, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "../data/sampleProducts";
import { getShowcaseItems } from "../data/showcaseItems";
import { useCategories, useProducts } from "../hooks/useQueries";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const showcaseItems = getShowcaseItems();

  const { data: categoriesData, isLoading: catLoading } = useCategories();
  const {
    data: productsData,
    isLoading: prodLoading,
    isError,
  } = useProducts(selectedCategory === "all" ? null : selectedCategory);

  // Use sample data when backend returns empty
  const rawProducts = productsData ?? [];
  const products = rawProducts.length > 0 ? rawProducts : SAMPLE_PRODUCTS;
  const categories =
    (categoriesData ?? []).length > 0 ? categoriesData! : SAMPLE_CATEGORIES;

  const displayProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const isLoading = prodLoading || catLoading;

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden grain-overlay">
        <img
          src="/assets/generated/shop-hero-bulbs.dim_1200x500.jpg"
          alt="Магазин лампочек — широкий ассортимент"
          className="w-full h-64 md:h-80 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-tight">
                Лампочки
                <br />
                для каждого
              </h1>
              <p className="mt-3 text-white/80 text-lg max-w-md">
                Все виды лампочек — от классики до умных RGB
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wide Assortment Section */}
      <section className="bg-muted/40 border-b py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="font-display text-2xl md:text-3xl font-bold">
              Широкий ассортимент товаров
            </h2>
          </div>
          <p className="text-muted-foreground mb-7 text-sm md:text-base">
            Самые новые и популярные виды товаров — только лучшее для вас
          </p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
            data-ocid="popular.list"
          >
            {showcaseItems.map((item, i) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="group flex flex-col items-center bg-card rounded-xl overflow-hidden shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                data-ocid={`popular.item.${i + 1}`}
              >
                <div className="relative w-full aspect-square overflow-hidden bg-muted">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className="absolute top-2 left-2 text-[10px] py-0.5 px-1.5 flex items-center gap-1"
                    variant="default"
                  >
                    <Star className="w-2.5 h-2.5" />
                    {item.label}
                  </Badge>
                </div>
                <div className="p-3 w-full text-center">
                  <p className="text-xs text-muted-foreground mb-0.5">
                    {item.tag}
                  </p>
                  <p className="text-sm font-semibold leading-tight line-clamp-2">
                    {item.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Catalog */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h2 className="font-display text-3xl font-bold">Каталог товаров</h2>
        </div>

        {/* Category Tabs */}
        {isLoading ? (
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-full" />
            ))}
          </div>
        ) : (
          <Tabs
            value={selectedCategory}
            onValueChange={setSelectedCategory}
            className="mb-8"
          >
            <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-ocid="catalog.tab.1"
              >
                Все товары
              </TabsTrigger>
              {categories.map((cat, i) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-ocid={`catalog.tab.${i + 2}`}
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
              <ProductSkeleton key={k} />
            ))}
          </div>
        ) : isError ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="catalog.error_state"
          >
            <p className="text-lg">
              Ошибка загрузки товаров. Попробуйте снова.
            </p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div
            className="text-center py-20 text-muted-foreground"
            data-ocid="catalog.empty_state"
          >
            <PackageSearch className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Товары не найдены</p>
            <p className="text-sm mt-1">Попробуйте другую категорию</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {displayProducts.map((product, i) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} index={i + 1} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}

function ProductSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden bg-card shadow-xs">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}
