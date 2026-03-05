import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ProductChat } from "../components/ProductChat";
import { useCart } from "../context/CartContext";
import { SAMPLE_IMAGES, SAMPLE_PRODUCTS } from "../data/sampleProducts";
import { useProductById } from "../hooks/useQueries";
import { formatPrice } from "../utils/format";

export function ProductPage() {
  const { id } = useParams({ from: "/product/$id" });
  const navigate = useNavigate();
  const { addItem, items } = useCart();

  const { data: fetchedProduct, isLoading, isError } = useProductById(id);

  // Fallback to sample if needed
  const product =
    fetchedProduct ?? SAMPLE_PRODUCTS.find((p) => p.id === id) ?? null;

  const inCart = items.some((i) => i.productId === id);

  const imageSrc = product?.imageId
    ? undefined
    : product
      ? (SAMPLE_IMAGES[product.id] ?? null)
      : null;

  function handleAddToCart() {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageId: product.imageId,
      imageSrc: imageSrc ?? undefined,
    });
    toast.success("Добавлено в корзину", { description: product.name });
  }

  if (isLoading && !product) {
    return (
      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton
            className="aspect-square rounded-lg"
            data-ocid="product.loading_state"
          />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </main>
    );
  }

  if ((isError && !product) || (!isLoading && !product)) {
    return (
      <main
        className="flex-1 container mx-auto px-4 py-20 text-center"
        data-ocid="product.error_state"
      >
        <p className="text-lg text-muted-foreground">Товар не найден.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate({ to: "/" })}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Вернуться в каталог
        </Button>
      </main>
    );
  }

  return (
    <main className="flex-1 container mx-auto px-4 py-10">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        onClick={() => navigate({ to: "/" })}
      >
        <ArrowLeft className="w-4 h-4" />
        Назад в каталог
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid md:grid-cols-2 gap-10 lg:gap-16"
      >
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-muted shadow-product">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product!.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-24 h-24 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <Badge variant="outline" className="self-start">
            {product!.category}
          </Badge>

          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            {product!.name}
          </h1>

          <div className="flex items-center gap-2">
            {product!.inStock ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">
                  В наличии
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Нет в наличии
                </span>
              </>
            )}
          </div>

          <p className="text-muted-foreground leading-relaxed text-base">
            {product!.description}
          </p>

          <div className="py-4 border-t border-border">
            <p className="font-display text-4xl font-bold text-foreground">
              {formatPrice(product!.price)}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!product!.inStock || inCart}
            className="w-full sm:w-auto gap-2 text-base"
            data-ocid="product.primary_button"
          >
            <ShoppingCart className="w-5 h-5" />
            {inCart ? "Уже в корзине" : "В корзину"}
          </Button>
        </div>
      </motion.div>

      {/* Chat with seller */}
      <ProductChat productId={id} />
    </main>
  );
}
