// Payment Service - Handles bKash, Nagad, Rocket, SSLCommerz payments
import { API_CONFIG } from '@/config/api.config';
import ApiService from './api.service';

export interface PaymentMethod {
  id: string;
  type: 'bkash' | 'nagad' | 'rocket' | 'card' | 'cash';
  details: {
    accountNumber?: string;
    cardLast4?: string;
    cardBrand?: string;
  };
  isDefault: boolean;
}

export interface PaymentRequest {
  rideId: string;
  amount: number;
  method: string;
  gateway: string;
}

export interface Transaction {
  id: string;
  rideId: string;
  amount: number;
  vat: number;
  total: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface WalletBalance {
  balance: number;
  currency: string;
  pendingAmount: number;
}

class PaymentService {
  // Get saved payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await ApiService.get<{ success: boolean; data: PaymentMethod[] }>(
        `${API_CONFIG.SERVICES.PAYMENT}/methods`
      );
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Get payment methods failed:', error);
      throw error;
    }
  }

  // Add new payment method
  async addPaymentMethod(data: {
    type: string;
    accountNumber?: string;
    cardToken?: string;
  }): Promise<PaymentMethod> {
    try {
      const response = await ApiService.post<{ success: boolean; data: PaymentMethod }>(
        `${API_CONFIG.SERVICES.PAYMENT}/methods`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Add payment method failed:', error);
      throw error;
    }
  }

  // Remove payment method
  async removePaymentMethod(methodId: string): Promise<{ success: boolean }> {
    try {
      return await ApiService.delete(
        `${API_CONFIG.SERVICES.PAYMENT}/methods/${methodId}`
      );
    } catch (error) {
      console.error('[PaymentService] Remove payment method failed:', error);
      throw error;
    }
  }

  // Initiate payment for a ride
  async initiatePayment(data: PaymentRequest): Promise<{
    success: boolean;
    paymentUrl?: string;
    transactionId: string;
  }> {
    try {
      const response = await ApiService.post<{
        success: boolean;
        data: { paymentUrl?: string; transactionId: string };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/initiate`,
        data
      );
      return { success: response.success, ...response.data };
    } catch (error) {
      console.error('[PaymentService] Initiate payment failed:', error);
      throw error;
    }
  }

  // Process bKash payment
  async processBkashPayment(rideId: string, amount: number, walletNumber: string): Promise<{
    success: boolean;
    paymentUrl: string;
    transactionId: string;
  }> {
    try {
      const response = await ApiService.post<{
        success: boolean;
        data: { paymentUrl: string; transactionId: string };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/bkash/create`,
        { rideId, amount, walletNumber }
      );
      return { success: response.success, ...response.data };
    } catch (error) {
      console.error('[PaymentService] bKash payment failed:', error);
      throw error;
    }
  }

  // Process Nagad payment
  async processNagadPayment(rideId: string, amount: number, walletNumber: string): Promise<{
    success: boolean;
    paymentUrl: string;
    transactionId: string;
  }> {
    try {
      const response = await ApiService.post<{
        success: boolean;
        data: { paymentUrl: string; transactionId: string };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/nagad/create`,
        { rideId, amount, walletNumber }
      );
      return { success: response.success, ...response.data };
    } catch (error) {
      console.error('[PaymentService] Nagad payment failed:', error);
      throw error;
    }
  }

  // Verify payment status
  async verifyPayment(transactionId: string): Promise<{
    success: boolean;
    status: string;
    transaction: Transaction;
  }> {
    try {
      const response = await ApiService.get<{
        success: boolean;
        data: { status: string; transaction: Transaction };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/verify/${transactionId}`
      );
      return { success: response.success, ...response.data };
    } catch (error) {
      console.error('[PaymentService] Verify payment failed:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(page = 1, limit = 20): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    try {
      const response = await ApiService.get<{
        success: boolean;
        data: { transactions: Transaction[]; total: number };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/transactions`,
        { params: { page, limit } }
      );
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Get transaction history failed:', error);
      throw error;
    }
  }

  // Get wallet balance (for drivers)
  async getWalletBalance(): Promise<WalletBalance> {
    try {
      const response = await ApiService.get<{ success: boolean; data: WalletBalance }>(
        `${API_CONFIG.SERVICES.PAYMENT}/wallet/balance`
      );
      return response.data;
    } catch (error) {
      console.error('[PaymentService] Get wallet balance failed:', error);
      throw error;
    }
  }

  // Request payout (for drivers)
  async requestPayout(amount: number, method: 'bkash' | 'nagad'): Promise<{
    success: boolean;
    message: string;
    payoutId: string;
  }> {
    try {
      const response = await ApiService.post<{
        success: boolean;
        data: { message: string; payoutId: string };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/payout/request`,
        { amount, method }
      );
      return { success: response.success, ...response.data };
    } catch (error) {
      console.error('[PaymentService] Request payout failed:', error);
      throw error;
    }
  }

  // Apply promo code
  async applyPromoCode(code: string, rideId: string): Promise<{
    success: boolean;
    discount: number;
    message: string;
  }> {
    try {
      const response = await ApiService.post<{
        success: boolean;
        data: { discount: number; message: string };
      }>(
        `${API_CONFIG.SERVICES.PAYMENT}/promo/apply`,
        { code, rideId }
      );
      return { success: response.success, ...response.data };
    } catch (error) {
      console.error('[PaymentService] Apply promo code failed:', error);
      throw error;
    }
  }
}

export default new PaymentService();
