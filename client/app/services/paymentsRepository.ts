export type PayPalPaymentContext = {
  itemId: string;
  amountLabel: string;
  paymentType: "commission" | "subscription";
};

export type PayPalCreateOrderResult = {
  orderId: string;
  approvalUrl?: string;
};

export type PayPalCaptureResult = {
  status: "COMPLETED" | "FAILED";
  transactionId?: string;
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const paymentsRepository = {
  getPaypalClientId(): string {
    // TODO(frontend-integration): mover a configuración central si se crea módulo de env.
    return String(import.meta.env.VITE_PAYPAL_CLIENT_ID ?? "");
  },

  hasPaypalConfiguration(): boolean {
    return this.getPaypalClientId().trim().length > 0;
  },

  // TODO(frontend-integration): reemplazar por POST /api/payments/paypal/order
  async createPaypalOrder(context: PayPalPaymentContext): Promise<PayPalCreateOrderResult> {
    await wait(350);

    return {
      orderId: `mock-order-${context.paymentType}-${context.itemId}-${Date.now()}`,
      // TODO(frontend-integration): backend debe devolver approvalUrl real de PayPal.
      approvalUrl: undefined,
    };
  },

  // TODO(frontend-integration): reemplazar por POST /api/payments/paypal/capture
  async capturePaypalOrder(orderId: string): Promise<PayPalCaptureResult> {
    await wait(350);

    if (!orderId) {
      return { status: "FAILED" };
    }

    return {
      status: "COMPLETED",
      transactionId: `mock-capture-${Date.now()}`,
    };
  },
};
