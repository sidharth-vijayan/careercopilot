"use client";

import { create } from "zustand";

export type ToastType = "default" | "success" | "error";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 5000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = (
  title: string,
  options?: { description?: string; type?: ToastType }
) => {
  useToastStore.getState().addToast({
    title,
    description: options?.description,
    type: options?.type || "default",
  });
};
