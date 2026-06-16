"use client";

import { useCallback, useEffect, useState } from "react";
import { ordersApi } from "@/lib/api";
import { mapOrderToCustomer } from "@/lib/api/mappers";
import type { ApiOrder } from "@/lib/api/types";
import { useAuthStore } from "@/store/useAuthStore";

export function useCustomerOrders() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const portal = useAuthStore((s) => s.portal);
  const [orders, setOrders] = useState<
    ReturnType<typeof mapOrderToCustomer>[]
  >([]);
  const [rawOrders, setRawOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!accessToken || portal !== "customer") {
      setOrders([]);
      setRawOrders([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const apiOrders = await ordersApi.listOrders();
      setOrders(apiOrders.map(mapOrderToCustomer));
      setRawOrders(apiOrders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pesanan");
    } finally {
      setLoading(false);
    }
  }, [accessToken, portal]);

  useEffect(() => {
    load();
  }, [load]);

  return { orders, rawOrders, loading, error, reload: load };
}
