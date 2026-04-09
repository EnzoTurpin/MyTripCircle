import { request } from "./apiCore";

export const subscriptionsApi = {
  getSubscription: () => request<any>("/subscriptions/me"),

  validatePurchase: (data: {
    receiptData: string;
    platform: string;
    productId: string;
    transactionId?: string;
  }) => request<{ success: boolean; message?: string }>("/subscriptions/validate", "POST", data),

  cancelSubscription: () =>
    request<{ success: boolean; message?: string }>("/subscriptions/cancel", "POST"),
};
