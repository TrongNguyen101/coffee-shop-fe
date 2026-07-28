import { useState, useEffect, useCallback } from 'react';
import { getDrinksApi } from '../api/drinksAPI';
import type { DrinkItem, GetDrinksRequest } from '../types';

// Default pagination and sorting parameters
const DEFAULT_PARAMS: GetDrinksRequest = {
  page: 1,
  size: 10,
  search: '',
  sortBy: 'drinkName',
  sortDirection: 'ASC',
};

// Custom hook to handle drinks API fetching, searching, and pagination state
export function useDrinks(initialPage = 1, initialSize = 10) {
  // Query parameters state
  const [params, setParams] = useState<GetDrinksRequest>({
    ...DEFAULT_PARAMS,
    page: initialPage,
    size: initialSize,
  });

  // API data states
  const [items, setItems] = useState<DrinkItem[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Loading and modal UI states
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // Core API requester function
  const fetchDrinks = useCallback(
    async (currentParams: GetDrinksRequest, isSearchAction = false) => {
      setLoading(true);
      if (isSearchAction) setSearchLoading(true);

      try {
        // Build payload matching backend API requirements
        const payload: GetDrinksRequest = {
          page: currentParams.page,
          size: currentParams.size,
          search: currentParams.search?.trim() || '',
          sortBy: currentParams.sortBy || 'drinkName',
          sortDirection: currentParams.sortDirection || 'ASC',
        };

        const response = await getDrinksApi(payload);
        const resItems = response.items ?? [];

        setItems(resItems);
        setTotalElements(response.pagination?.totalElements ?? resItems.length ?? 0);

        // Trigger empty state modal if search yields no records
        if (isSearchAction && currentParams.search?.trim() && resItems.length === 0) {
          setShowEmptyModal(true);
        }
      } catch (err) {
        console.error('Failed to fetch drinks:', err);
        if (isSearchAction && currentParams.search?.trim()) {
          setShowEmptyModal(true);
        }
        setItems([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
        setSearchLoading(false);
      }
    },
    [],
  );

  // Refetch data whenever query params or search flag changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDrinks(params, isSearch);
  }, [params, fetchDrinks, isSearch]);

  // Handler for explicit search actions (resets page to 1)
  const handleSearch = (searchKeyword: string) => {
    setIsSearch(true);
    setParams((prev) => ({
      ...prev,
      search: searchKeyword.trim(),
      page: 1,
    }));
  };

  // Handler for pagination page or page size changes
  const handlePageChange = (page: number, size?: number) => {
    setIsSearch(false);
    setParams((prev) => ({
      ...prev,
      page,
      size: size ?? prev.size,
    }));
  };

  return {
    items,
    totalElements,
    currentPage: params.page,
    currentPageSize: params.size,
    searchKeyword: params.search ?? '',
    loading,
    searchLoading,
    showEmptyModal,
    closeEmptyModal: () => setShowEmptyModal(false),
    handleSearch,
    handlePageChange,
    refresh: () => fetchDrinks(params, false),
  };
}
