import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../../backend.d";
import { useOrders, useUpdateOrderStatus } from "../../hooks/useQueries";
import { formatPrice } from "../../utils/format";

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "Новый",
  [OrderStatus.confirmed]: "Подтверждён",
  [OrderStatus.completed]: "Выполнен",
  [OrderStatus.cancelled]: "Отменён",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  [OrderStatus.confirmed]: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  [OrderStatus.completed]: "bg-green-100 text-green-800 hover:bg-green-100",
  [OrderStatus.cancelled]: "bg-red-100 text-red-800 hover:bg-red-100",
};

const SAMPLE_ORDERS = [
  {
    id: "order-1",
    customerName: "Иван Петров",
    phoneNumber: "+7 900 123-45-67",
    address: "г. Москва, ул. Арбат, д. 5",
    items: [{ productId: "sample-1", quantity: BigInt(1) }],
    totalPrice: BigInt(1299900),
    status: OrderStatus.pending,
  },
  {
    id: "order-2",
    customerName: "Мария Сидорова",
    phoneNumber: "+7 916 987-65-43",
    address: "г. Санкт-Петербург, пр. Невский, д. 100",
    items: [
      { productId: "sample-3", quantity: BigInt(1) },
      { productId: "sample-5", quantity: BigInt(2) },
    ],
    totalPrice: BigInt(1129700),
    status: OrderStatus.confirmed,
  },
  {
    id: "order-3",
    customerName: "Алексей Козлов",
    phoneNumber: "+7 925 555-00-11",
    address: "г. Казань, ул. Баумана, д. 3",
    items: [{ productId: "sample-6", quantity: BigInt(1) }],
    totalPrice: BigInt(189900),
    status: OrderStatus.completed,
  },
];

export function AdminOrdersPage() {
  const { data: fetchedOrders, isLoading } = useOrders();
  const { mutateAsync: updateStatus, isPending: updating } =
    useUpdateOrderStatus();

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const rawOrders = fetchedOrders ?? [];
  const orders = rawOrders.length > 0 ? rawOrders : SAMPLE_ORDERS;

  const filtered =
    filterStatus === "all"
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    try {
      await updateStatus({ orderId, status });
      toast.success("Статус обновлён");
    } catch {
      toast.error("Ошибка обновления статуса");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Заказы</h1>
        <Badge variant="outline" className="text-sm">
          Всего: {orders.length}
        </Badge>
      </div>

      {/* Status filter */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList>
          <TabsTrigger value="all">Все</TabsTrigger>
          <TabsTrigger value={OrderStatus.pending}>Новые</TabsTrigger>
          <TabsTrigger value={OrderStatus.confirmed}>
            Подтверждённые
          </TabsTrigger>
          <TabsTrigger value={OrderStatus.completed}>Выполненные</TabsTrigger>
          <TabsTrigger value={OrderStatus.cancelled}>Отменённые</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2" data-ocid="admin.orders.loading_state">
          {["os1", "os2", "os3"].map((k) => (
            <Skeleton key={k} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="admin.orders.empty_state"
        >
          <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Заказов нет</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table data-ocid="admin.orders.table">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order, i) => (
                <TableRow
                  key={order.id}
                  data-ocid={`admin.orders.row.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {order.phoneNumber}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-40 truncate">
                    {order.address}
                  </TableCell>
                  <TableCell className="font-display font-semibold">
                    {formatPrice(order.totalPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {updatingId === order.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                      ) : null}
                      <Select
                        value={order.status}
                        onValueChange={(v) =>
                          handleStatusChange(order.id, v as OrderStatus)
                        }
                        disabled={updating && updatingId === order.id}
                      >
                        <SelectTrigger
                          className="h-8 w-40 text-xs"
                          data-ocid={`admin.orders.select.${i + 1}`}
                        >
                          <SelectValue>
                            <Badge className={STATUS_COLORS[order.status]}>
                              {STATUS_LABELS[order.status]}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrderStatus).map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              <Badge className={STATUS_COLORS[s]}>
                                {STATUS_LABELS[s]}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
