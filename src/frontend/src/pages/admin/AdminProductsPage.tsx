import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../../backend.d";
import { SAMPLE_IMAGES, SAMPLE_PRODUCTS } from "../../data/sampleProducts";
import {
  useCreateProduct,
  useDeleteProduct,
  useIsPremiumActive,
  useProducts,
  useUpdateProduct,
} from "../../hooks/useQueries";
import { useStorageClient } from "../../hooks/useStorage";
import { formatPrice } from "../../utils/format";
import { generateId } from "../../utils/format";

interface ProductFormData {
  name: string;
  description: string;
  category: string;
  price: string;
  inStock: boolean;
  imageId?: string;
}

const emptyForm: ProductFormData = {
  name: "",
  description: "",
  category: "",
  price: "",
  inStock: true,
};

export function AdminProductsPage() {
  const { data: fetchedProducts, isLoading } = useProducts();
  const { mutateAsync: createProduct, isPending: creating } =
    useCreateProduct();
  const { mutateAsync: updateProduct, isPending: updating } =
    useUpdateProduct();
  const { mutateAsync: deleteProduct } = useDeleteProduct();
  const { uploadFile, isUploading, uploadProgress } = useStorageClient();
  const { data: isPremium } = useIsPremiumActive();

  const rawProducts = fetchedProducts ?? [];
  const products = rawProducts.length > 0 ? rawProducts : SAMPLE_PRODUCTS;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const FREE_TIER_LIMIT = 10;

  function openCreate() {
    // Check product limit for free tier users
    if (!isPremium && rawProducts.length >= FREE_TIER_LIMIT) {
      setLimitModalOpen(true);
      return;
    }
    setEditProduct(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: (Number(product.price) / 100).toString(),
      inStock: product.inStock,
      imageId: product.imageId,
    });
    setImageFile(null);
    const preview = SAMPLE_IMAGES[product.id] ?? null;
    setImagePreview(preview);
    setDialogOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category.trim() || !form.price) {
      toast.error("Заполните все обязательные поля");
      return;
    }
    const priceKopecks = BigInt(
      Math.round(Number.parseFloat(form.price) * 100),
    );

    let imageId = form.imageId;
    if (imageFile) {
      try {
        imageId = await uploadFile(imageFile);
      } catch {
        toast.error("Ошибка загрузки изображения");
        return;
      }
    }

    const productData: Product = {
      id: editProduct?.id ?? generateId(),
      name: form.name,
      description: form.description,
      category: form.category,
      price: priceKopecks,
      inStock: form.inStock,
      imageId,
    };

    try {
      if (editProduct) {
        await updateProduct(productData);
        toast.success("Товар обновлён");
      } else {
        await createProduct(productData);
        toast.success("Товар создан");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Ошибка сохранения товара");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      toast.success("Товар удалён");
    } catch {
      toast.error("Ошибка удаления");
    }
  }

  const isSaving = creating || updating || isUploading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Товары</h1>
        <Button
          onClick={openCreate}
          className="gap-2"
          data-ocid="admin.products.open_modal_button"
        >
          <Plus className="w-4 h-4" />
          Добавить товар
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.products.loading_state">
          {["ps1", "ps2", "ps3", "ps4"].map((k) => (
            <Skeleton key={k} className="h-12 w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div
          className="text-center py-20 text-muted-foreground"
          data-ocid="admin.products.empty_state"
        >
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Товаров пока нет</p>
          <p className="text-sm">Нажмите «Добавить товар» для создания</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table data-ocid="admin.products.table">
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Наличие</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, i) => {
                const imgSrc = SAMPLE_IMAGES[product.id] ?? null;
                return (
                  <TableRow
                    key={product.id}
                    data-ocid={`admin.products.row.${i + 1}`}
                  >
                    <TableCell>
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-48 truncate">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="font-display font-semibold">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell>
                      {product.inStock ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          В наличии
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Нет</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(product)}
                          data-ocid={`admin.products.edit_button.${i + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              data-ocid={`admin.products.delete_button.${i + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Удалить товар?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                «{product.name}» будет удалён без возможности
                                восстановления.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="admin.products.cancel_button">
                                Отмена
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(product.id)}
                                data-ocid="admin.products.confirm_button"
                              >
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="admin.products.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editProduct ? "Редактировать товар" : "Новый товар"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Изображение</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-muted border border-border">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    data-ocid="admin.products.upload_button"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 pointer-events-none"
                  >
                    <Upload className="w-4 h-4" />
                    Загрузить фото
                  </Button>
                </label>
              </div>
              {isUploading && (
                <p className="text-xs text-muted-foreground">
                  Загрузка: {uploadProgress}%
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-name">Название *</Label>
              <Input
                id="prod-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Название товара"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-category">Категория *</Label>
              <Input
                id="prod-category"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="Электроника"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">Цена (руб.) *</Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="1299.00"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="prod-desc">Описание</Label>
              <Textarea
                id="prod-desc"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Описание товара…"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center gap-3">
              <Switch
                id="prod-stock"
                checked={form.inStock}
                onCheckedChange={(v) => setForm((f) => ({ ...f, inStock: v }))}
              />
              <Label htmlFor="prod-stock">В наличии</Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                variant="outline"
                data-ocid="admin.products.cancel_button"
              >
                Отмена
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="gap-2"
              data-ocid="admin.products.save_button"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editProduct ? "Сохранить" : "Создать"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product limit modal */}
      <AlertDialog open={limitModalOpen} onOpenChange={setLimitModalOpen}>
        <AlertDialogContent data-ocid="admin.products.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Crown
                className="w-5 h-5"
                style={{ color: "oklch(var(--premium-dark))" }}
              />
              Достигнут лимит товаров
            </AlertDialogTitle>
            <AlertDialogDescription>
              На бесплатном тарифе можно добавить до 10 товаров. Купите Премиум
              для безлимитных объявлений.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setLimitModalOpen(false)}
              data-ocid="admin.products.cancel_button"
            >
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(var(--premium)), oklch(var(--premium-dark)))",
                  color: "oklch(var(--premium-foreground))",
                }}
                data-ocid="admin.products.confirm_button"
              >
                <Crown className="w-4 h-4" />
                Купить Премиум
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
