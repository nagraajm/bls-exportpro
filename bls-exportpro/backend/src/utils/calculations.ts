import { CONSTANTS } from '../config/constants';
import { OrderItem } from '../../../shared/types.ts';

export interface CalculationResult {
  subtotal: number;
  igst: number;
  drawback: number;
  rodtep: number;
  totalAmount: number;
}

export function calculateOrderTotals(
  items: OrderItem[],
  currency: 'USD' | 'INR'
): CalculationResult {
  const subtotal = items.reduce((sum, item) => {
    return sum + (item.quantity * item.unitPrice);
  }, 0);
  
  const igst = subtotal * CONSTANTS.IGST_RATE;
  const drawback = subtotal * CONSTANTS.DRAWBACK_RATE;
  const rodtep = subtotal * CONSTANTS.RODTEP_RATE;
  
  const totalAmount = subtotal + igst - drawback - rodtep;
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    igst: parseFloat(igst.toFixed(2)),
    drawback: parseFloat(drawback.toFixed(2)),
    rodtep: parseFloat(rodtep.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2)),
  };
}

export function convertCurrency(
  amount: number,
  fromCurrency: 'USD' | 'INR',
  toCurrency: 'USD' | 'INR',
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'INR') {
    return parseFloat((amount * exchangeRate).toFixed(2));
  }
  
  if (fromCurrency === 'INR' && toCurrency === 'USD') {
    return parseFloat((amount / exchangeRate).toFixed(2));
  }
  
  return amount;
}

export function formatCurrency(amount: number, currency: 'USD' | 'INR'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}