import { Status } from "@/types/common"


export const getProductStatus = (quantity: number, threshold: number): Status => {
  if (quantity === 0) return 'out-of-stock'
  if (quantity <= threshold) return 'low-stock'
  return 'in-stock'
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-PH').format(new Date(date))
}

export const generateSKU = (name: string, category: string): string => {
  const namePart = name.slice(0, 3).toUpperCase()
  const categoryPart = category.slice(0, 3).toUpperCase()
  const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${namePart}-${categoryPart}-${randomPart}`
}


import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}