// lib/hooks/useDeposits.ts
// Хуки для работы с вкладами

import { apiClient } from '@/lib/api/client';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { QUERY_KEYS } from '@/lib/api/queryClient';
import { useUserStore } from '@/lib/stores/userStore';
import {
    CreateDepositRequest,
    DepositListResponse,
    DepositWithInterestResponse,
    WithdrawResponse,
} from '@/types/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Список вкладов пользователя
 */
export function useDeposits() {
  return useQuery({
    queryKey: QUERY_KEYS.deposits,
    queryFn: async (): Promise<DepositListResponse> => {
      const { data } = await apiClient.get<DepositListResponse>(ENDPOINTS.deposits.list);
      return data;
    },
  });
}

/**
 * Детали вклада с процентами
 */
export function useDepositDetail(depositId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.depositDetail(depositId),
    queryFn: async (): Promise<DepositWithInterestResponse> => {
      const { data } = await apiClient.get<DepositWithInterestResponse>(
        ENDPOINTS.deposits.detail(depositId)
      );
      return data;
    },
    enabled: depositId > 0,
    // Проценты нужно обновлять чаще
    refetchInterval: 60 * 1000, // каждую минуту
  });
}

/**
 * Создание вклада
 */
export function useCreateDeposit() {
  const queryClient = useQueryClient();
  const { updateBalance } = useUserStore();

  return useMutation({
    mutationFn: async (payload: CreateDepositRequest) => {
      const { data } = await apiClient.post(ENDPOINTS.deposits.create, payload);
      return data;
    },
    onSuccess: (data) => {
      if (data.new_balance !== undefined) {
        updateBalance(data.new_balance);
      }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deposits });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
    },
  });
}

/**
 * Досрочное снятие (проценты сгорают)
 */
export function useWithdrawEarly() {
  const queryClient = useQueryClient();
  const { updateBalance } = useUserStore();

  return useMutation({
    mutationFn: async (depositId: number): Promise<WithdrawResponse> => {
      const { data } = await apiClient.post<WithdrawResponse>(
        ENDPOINTS.deposits.withdrawEarly(depositId)
      );
      return data;
    },
    onSuccess: (data) => {
      updateBalance(data.new_balance);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deposits });
    },
  });
}

/**
 * Успешное завершение вклада (тело + проценты)
 */
export function useWithdrawSuccess() {
  const queryClient = useQueryClient();
  const { updateBalance } = useUserStore();

  return useMutation({
    mutationFn: async (depositId: number): Promise<WithdrawResponse> => {
      const { data } = await apiClient.post<WithdrawResponse>(
        ENDPOINTS.deposits.withdrawSuccess(depositId)
      );
      return data;
    },
    onSuccess: (data) => {
      updateBalance(data.new_balance);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deposits });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user });
    },
  });
}
