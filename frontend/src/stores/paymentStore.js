// src/stores/usePaymentStore.js
import { create } from "zustand";
import { axiosInstance } from "../api/httpClient.js";

export const usePaymentStore = create((set) => ({
    payment: null,
    isCreatingPayment: false,
    isVerifyingPayment: false,
    paymentError: null,

    createPayment: async (payload) => {
        try {
            set({ isCreatingPayment: true, paymentError: null });

            const response = await axiosInstance.post("/payments/create", payload);
            const paymentData = response.data.data;

            set({ payment: paymentData });
            return paymentData;
        } catch (error) {
            const message = error?.response?.data?.message || "Unable to initialize payment.";
            set({ paymentError: message });
            throw error;
        } finally {
            set({ isCreatingPayment: false });
        }
    },

    verifyPayment: async ({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    }) => {
        try {
            set({ isVerifyingPayment: true, paymentError: null });

            const response = await axiosInstance.post("/payments/verify", {
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });

            const paymentData = response.data.data;
            set({ payment: paymentData });
            return paymentData;
        } catch (error) {
            const message = error?.response?.data?.message || "Payment verification failed.";
            set({ paymentError: message });
            throw error;
        } finally {
            set({ isVerifyingPayment: false });
        }
    },

    clearPayment: () => {
        set({
            payment: null,
            paymentError: null,
            isCreatingPayment: false,
            isVerifyingPayment: false,
        });
    },
}));