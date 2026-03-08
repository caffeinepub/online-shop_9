import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Edit2,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import {
  CURRENCIES,
  type CurrencyCode,
  formatInCurrency,
  getCurrencyInfo,
} from "../hooks/useCurrency";
import type { UserProduct } from "../hooks/useUserProducts";
import { useUserProducts } from "../hooks/useUserProducts";

const CATEGORIES = ["Электроника", "Одежда", "Дом и сад", "Лампочки", "Прочее"];

const FREE_LIMIT = 10;

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  priceCurrency: CurrencyCode;
  inStock: boolean;
  imageUrl: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "Прочее",
  price: "",
  priceCurrency: "RUB",
  inStock: true,
  imageUrl: "",
};

/** Convert price entered in any currency to kopecks (1 RUB = 100 kopecks) */
function toCopecks(amount: number, currency: CurrencyCode): number {
  const info = getCurrencyInfo(currency);
  // Convert to USD first, then to RUB, then to kopecks
  const usd = amount / info.rateToUsd;
  const rubRate = getCurrencyInfo("RUB").rateToUsd; // 91.5
  const rubles = usd * rubRate;
  return Math.round(rubles * 100);
}

export function MyProductsPage() {
  const { currentUser, isLoggedIn } = useAuth();
  const {
    myProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    productLimit,
    canAddMore,
    isPremium,
  } = useUserProducts(currentUser?.userId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<UserProduct | null>(
    null,
  );
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When opening for edit, populate form
  // biome-ignore lint/correctness/useExhaustiveDependencies: dialogOpen triggers form reset on dialog open
  useEffect(() => {
    if (editingProduct) {
      // Price is stored in kopecks (RUB), show as rubles
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        category: editingProduct.category,
        price: (editingProduct.price / 100).toFixed(2),
        priceCurrency: "RUB",
        inStock: editingProduct.inStock,
        imageUrl: editingProduct.imageUrl ?? "",
      });
      setImagePreview(editingProduct.imageUrl ?? "");
    } else {
      setForm(emptyForm);
      setImagePreview("");
    }
  }, [editingProduct, dialogOpen]);

  function openAdd() {
    setEditingProduct(null);
    setForm(emptyForm);
    setImagePreview("");
    setDialogOpen(true);
  }

  function openEdit(product: UserProduct) {
    setEditingProduct(product);
    setDialogOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      toast.warning("Изображение слишком большое (макс. 500KB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setForm((prev) => ({ ...prev, imageUrl: base64 }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Введите название товара");
      return;
    }
    const priceNum = Number.parseFloat(form.price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      toast.error("Введите корректную цену");
      return;
    }

    setSaving(true);
    await new Promise((r) => setTimeout(r, 200)); // small UX delay

    // Convert price from selected currency to kopecks (RUB base)
    const priceInCents = toCopecks(priceNum, form.priceCurrency);

    if (editingProduct) {
      const result = updateProduct({
        ...editingProduct,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: priceInCents,
        inStock: form.inStock,
        imageUrl: form.imageUrl || undefined,
      });
      if (result.ok) {
        toast.success("Товар обновлён");
        setDialogOpen(false);
      } else {
        toast.error(result.error ?? "Ошибка обновления");
      }
    } else {
      if (!currentUser) return;
      const result = addProduct({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        price: priceInCents,
        inStock: form.inStock,
        imageUrl: form.imageUrl || undefined,
        sellerId: currentUser.userId,
        sellerEmail: currentUser.email,
      });
      if (result.ok) {
        toast.success("Товар добавлен");
        setDialogOpen(false);
      } else {
        toast.error(result.error ?? "Ошибка добавления");
      }
    }

    setSaving(false);
  }

  function handleDelete(id: string, name: string) {
    const result = deleteProduct(id);
    if (result.ok) {
      toast.success(`«${name}» удалён`);
    } else {
      toast.error(result.error ?? "Ошибка удаления");
    }
  }

  if (!isLoggedIn || !currentUser) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="text-center max-w-sm px-4">
          <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-bold mb-2">
            Войдите в аккаунт
          </h2>
          <p className="text-muted-foreground mb-6">
            Войдите в аккаунт чтобы управлять товарами
          </p>
          <Button asChild>
            <Link to="/login">Войти</Link>
          </Button>
        </div>
      </main>
    );
  }

  const usedSlots = myProducts.length;
  const limitDisplay = productLimit ?? FREE_LIMIT;
  const progressPct = productLimit
    ? Math.min((usedSlots / limitDisplay) * 100, 100)
    : 0;

  return (
    <main className="flex-1">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Мои товары</h1>
            <p className="text-muted-foreground mt-1">
              Управляйте вашими объявлениями
            </p>
          </div>
          <Button
            onClick={openAdd}
            disabled={!canAddMore}
            className="gap-2 shrink-0"
            data-ocid="my_products.open_modal_button"
          >
            <Plus className="w-4 h-4" />
            Добавить товар
          </Button>
        </div>

        {/* Quota bar for free users */}
        {!isPremium && (
          <div className="mb-6 p-4 rounded-xl border bg-muted/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Использовано: {usedSlots} из {limitDisplay} товаров
              </span>
              {usedSlots >= limitDisplay && (
                <Link to="/premium">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                  >
                    <Crown className="w-3 h-3" />
                    Купить Премиум
                  </Badge>
                </Link>
              )}
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPct}%`,
                  background:
                    progressPct >= 100
                      ? "oklch(var(--destructive))"
                      : "oklch(var(--primary))",
                }}
              />
            </div>
            {usedSlots >= limitDisplay && (
              <p className="text-xs text-muted-foreground mt-2">
                Лимит достигнут. Перейдите на{" "}
                <Link
                  to="/premium"
                  className="text-primary underline underline-offset-2"
                >
                  Премиум
                </Link>{" "}
                для неограниченного количества товаров.
              </p>
            )}
          </div>
        )}

        {/* Products list */}
        {myProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
            data-ocid="my_products.empty_state"
          >
            <Package className="w-16 h-16 mb-4 text-muted-foreground/30" />
            <h3 className="font-display text-xl font-semibold mb-2">
              Нет товаров
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Добавьте первый товар — он появится в каталоге магазина
            </p>
            <Button
              className="mt-6 gap-2"
              onClick={openAdd}
              data-ocid="my_products.open_modal_button"
            >
              <Plus className="w-4 h-4" />
              Добавить товар
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto rounded-xl border"
            data-ocid="my_products.table"
          >
            <table className="w-full text-sm">
              <thead className="bg-muted/60 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Товар
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Категория
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                    Цена
                  </th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Наличие
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {myProducts.map((product, i) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    data-ocid={`my_products.row.${i + 1}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-md object-cover shrink-0 border"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                            <Package className="w-5 h-5 text-muted-foreground/50" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[180px]">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                            {product.description.slice(0, 50)}
                            {product.description.length > 50 ? "…" : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {(product.price / 100).toLocaleString("ru-RU")} ₽
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <Badge
                        variant={product.inStock ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {product.inStock ? "В наличии" : "Нет"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEdit(product)}
                          data-ocid={`my_products.edit_button.${i + 1}`}
                          aria-label="Редактировать"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(product.id, product.name)}
                          data-ocid={`my_products.delete_button.${i + 1}`}
                          aria-label="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="my_products.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? "Редактировать товар" : "Добавить товар"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image upload */}
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                className="w-full h-40 rounded-xl border-2 border-dashed bg-muted/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden relative"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Загрузить фото товара"
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Предпросмотр"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Нажмите чтобы загрузить фото
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      JPG, PNG · макс 500KB
                    </p>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              {imagePreview && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => {
                    setImagePreview("");
                    setForm((prev) => ({ ...prev, imageUrl: "" }));
                  }}
                >
                  Убрать фото
                </Button>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="product-name">Название *</Label>
              <Input
                id="product-name"
                placeholder="Например: Умная лампочка RGB"
                value={form.name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
                data-ocid="my_products.name.input"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="product-desc">Описание</Label>
              <Textarea
                id="product-desc"
                placeholder="Кратко опишите товар..."
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="resize-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, category: v }))
                }
              >
                <SelectTrigger data-ocid="my_products.category.input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price + Currency */}
            <div className="space-y-1.5">
              <Label htmlFor="product-price">Цена</Label>
              <div className="flex gap-2">
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, price: e.target.value }))
                  }
                  className="flex-1"
                  data-ocid="my_products.price.input"
                />
                <Select
                  value={form.priceCurrency}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      priceCurrency: v as CurrencyCode,
                    }))
                  }
                >
                  <SelectTrigger
                    className="w-28"
                    data-ocid="my_products.price_currency.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.symbol} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.price &&
                !Number.isNaN(Number(form.price)) &&
                Number(form.price) > 0 &&
                form.priceCurrency !== "RUB" && (
                  <p className="text-xs text-muted-foreground">
                    ≈{" "}
                    {formatInCurrency(
                      Number(form.price) /
                        getCurrencyInfo(form.priceCurrency).rateToUsd,
                      getCurrencyInfo("RUB"),
                    )}{" "}
                    — в этой сумме будет сохранена цена
                  </p>
                )}
            </div>

            {/* In Stock */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <Label htmlFor="product-instock" className="cursor-pointer">
                В наличии
              </Label>
              <Switch
                id="product-instock"
                checked={form.inStock}
                onCheckedChange={(v) =>
                  setForm((prev) => ({ ...prev, inStock: v }))
                }
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              data-ocid="my_products.cancel_button"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-ocid="my_products.save_button"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {editingProduct ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
