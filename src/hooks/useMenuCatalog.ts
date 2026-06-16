"use client";

import { useCallback, useEffect, useState } from "react";
import { categoriesApi, menusApi } from "@/lib/api";
import {
  mapCategoryToCustomer,
  mapMenuToCustomer,
  type CustomerCategory,
  type CustomerMenuItem,
} from "@/lib/api/mappers";

export function useMenuCatalog() {
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [menuItems, setMenuItems] = useState<CustomerMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [apiCategories, apiMenus] = await Promise.all([
        categoriesApi.listCategories(),
        menusApi.listMenus(),
      ]);
      const activeMenus = apiMenus.filter((m) => m.is_active !== false);
      setCategories(apiCategories.map(mapCategoryToCustomer));
      setMenuItems(activeMenus.map(mapMenuToCustomer));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat menu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, menuItems, loading, error, reload: load };
}
