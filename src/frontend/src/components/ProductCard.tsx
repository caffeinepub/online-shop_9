import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";
import { SAMPLE_IMAGES } from "../data/sampleProducts";
import {
  formatInCurrency,
  getCurrencyInfo,
  useCurrency,
} from "../hooks/useCurrency";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.productId === product.id);
  const { currencyInfo } = useCurrency();

  // product.price is in kopecks (RUB base). Convert to USD then to user currency.
  const RUB_RATE = getCurrencyInfo("RUB").rateToUsd; // 91.5
  const priceUsd = Number(product.price) / 100 / RUB_RATE;
  const displayPrice = formatInCurrency(priceUsd, currencyInfo);

  // Resolve image: use sample fallback for sample products
  const imageSrc = product.imageId
    ? undefined // real image hash — handled via storage
    : (SAMPLE_IMAGES[product.id] ?? null);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageId: product.imageId,
      imageSrc: imageSrc ?? undefined,
    });
    toast.success("Добавлено в корзину", {
      description: product.name,
    });
  }

  return (
    <article
      className="product-card group flex flex-col bg-card rounded-lg overflow-hidden shadow-product hover:shadow-product-hover transition-shadow duration-300"
      data-ocid={`product.item.${index}`}
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-square bg-muted">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={product.name}
              className="product-card-img w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm font-medium">
                Нет в наличии
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <Badge variant="outline" className="self-start text-xs">
            {product.category}
          </Badge>
          <h3 className="font-display font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="font-display font-bold text-lg text-foreground">
              {displayPrice}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.inStock || inCart}
              className="shrink-0 gap-1.5"
              data-ocid="product.primary_button"
            >
              <ShoppingCart className="w-4 h-4" />
              {inCart ? "В корзине" : "В корзину"}
            </Button>
          </div>
        </div>
      </Link>
    </article>
  );
}
