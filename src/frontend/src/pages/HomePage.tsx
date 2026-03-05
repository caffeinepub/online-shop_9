import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PackageSearch } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { SAMPLE_CATEGORIES, SAMPLE_PRODUCTS } from "../data/sampleProducts";
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
          src="/assets/generated/shop-hero.dim_1200x500.jpg"
          alt="Магазин — широкий ассортимент товаров"
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
                Качество,
                <br />
                которому доверяют
              </h1>
              <p className="mt-3 text-white/80 text-lg max-w-md">
                Отборные товары для вашего стиля жизни
              </p>
            </motion.div>
          </div>
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
