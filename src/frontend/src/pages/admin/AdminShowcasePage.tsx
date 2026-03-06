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
import { ImageIcon, Pencil, RotateCcw, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DEFAULT_SHOWCASE_ITEMS,
  type ShowcaseItem,
  getShowcaseItems,
  saveShowcaseItems,
} from "../../data/showcaseItems";

interface ItemFormData {
  name: string;
  label: string;
  tag: string;
  img: string;
}

export function AdminShowcasePage() {
  const [items, setItems] = useState<ShowcaseItem[]>(() => getShowcaseItems());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ItemFormData>({
    name: "",
    label: "",
    tag: "",
    img: "",
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function openEdit(index: number) {
    const item = items[index];
    setEditIndex(index);
    setForm({
      name: item.name,
      label: item.label,
      tag: item.tag,
      img: item.img,
    });
    setImagePreview(item.img);
    setDialogOpen(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setForm((f) => ({ ...f, img: url }));
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error("Введите название");
      return;
    }
    if (editIndex === null) return;
    const updated = items.map((item, i) =>
      i === editIndex
        ? {
            ...item,
            name: form.name,
            label: form.label,
            tag: form.tag,
            img: form.img || item.img,
          }
        : item,
    );
    setItems(updated);
    saveShowcaseItems(updated);
    setDialogOpen(false);
    toast.success("Карточка обновлена");
  }

  function handleReset() {
    saveShowcaseItems(DEFAULT_SHOWCASE_ITEMS);
    setItems(DEFAULT_SHOWCASE_ITEMS);
    toast.success("Витрина сброшена к стандартным значениям");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Витрина лампочек</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Редактируйте карточки в секции "Широкий ассортимент товаров" на
            главной странице
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleReset}
          data-ocid="showcase.reset.button"
        >
          <RotateCcw className="w-4 h-4" />
          Сбросить
        </Button>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        data-ocid="showcase.list"
      >
        {items.map((item, i) => (
          <div
            key={item.id}
            className="border border-border rounded-xl overflow-hidden bg-card shadow-sm"
            data-ocid={`showcase.item.${i + 1}`}
          >
            <div className="relative aspect-square bg-muted">
              {item.img ? (
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2 h-8 w-8 shadow"
                onClick={() => openEdit(i)}
                data-ocid={`showcase.edit_button.${i + 1}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="p-3">
              <p className="text-xs text-muted-foreground">{item.tag}</p>
              <p className="font-semibold text-sm leading-tight mt-0.5">
                {item.name}
              </p>
              <p className="text-xs text-primary mt-1">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" data-ocid="showcase.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Редактировать карточку
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image */}
            <div className="space-y-2">
              <Label>Фото</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleImageChange}
                    data-ocid="showcase.upload_button"
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
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="sc-name">Название *</Label>
              <Input
                id="sc-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                placeholder="Название лампочки"
                data-ocid="showcase.name.input"
              />
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <Label htmlFor="sc-label">Бейдж (метка)</Label>
              <Input
                id="sc-label"
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
                placeholder="Хит продаж"
                data-ocid="showcase.label.input"
              />
            </div>

            {/* Tag */}
            <div className="space-y-1.5">
              <Label htmlFor="sc-tag">Категория</Label>
              <Input
                id="sc-tag"
                value={form.tag}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tag: e.target.value }))
                }
                placeholder="Лампочки"
                data-ocid="showcase.tag.input"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" data-ocid="showcase.cancel_button">
                Отмена
              </Button>
            </DialogClose>
            <Button onClick={handleSave} data-ocid="showcase.save_button">
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
