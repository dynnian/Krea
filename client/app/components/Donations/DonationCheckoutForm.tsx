import { CreditCard, ChevronDown } from "lucide-react";

type PaymentMethod = "card" | "paypal";

type DonationCheckoutFormProps = {
  selectedPaymentMethod: PaymentMethod;
  onPaymentMethodChange: (method: PaymentMethod) => void;
};

export default function DonationCheckoutForm({
  selectedPaymentMethod,
  onPaymentMethodChange,
}: DonationCheckoutFormProps) {
  const isCardSelected = selectedPaymentMethod === "card";
  const isPaypalSelected = selectedPaymentMethod === "paypal";

  const paymentButtonBase =
    "h-14 rounded-md border-2 flex items-center justify-center transition-all duration-200";

  const selectedClass =
    "bg-[#1351AA] border-[#1351AA] text-white shadow-md scale-[1.01]";

  const unselectedClass =
    "bg-[#E3E2DE] border-[#1F1F1F] text-[#1F1F1F] hover:bg-[#D8D7D3] hover:shadow-sm";

  return (
    <div className="w-full max-w-[520px]">
      <h1 className="text-3xl lg:text-4xl font-bold mb-10">
        Donar a Usuario
      </h1>

      <form className="space-y-7">
        <div>
          <label className="block text-lg font-medium mb-4">
            Método de pago
          </label>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onPaymentMethodChange("card")}
              className={`${paymentButtonBase} gap-2 text-lg font-medium ${
                isCardSelected ? selectedClass : unselectedClass
              }`}
            >
              Tarjeta <CreditCard size={24} />
            </button>

            <button
              type="button"
              onClick={() => onPaymentMethodChange("paypal")}
              className={`${paymentButtonBase} text-2xl font-bold ${
                isPaypalSelected ? selectedClass : unselectedClass
              }`}
            >
              PayPal
            </button>
          </div>
        </div>

        {isCardSelected && (
          <>
            <div>
              <label className="block text-lg font-medium mb-2">
                Nombre en la tarjeta
              </label>

              <input
                type="text"
                placeholder="Nombre"
                className="w-full h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A] focus:border-[#1351AA]"
              />
            </div>

            <div>
              <label className="block text-lg font-medium mb-2">
                Datos de la tarjeta
              </label>

              <input
                type="text"
                placeholder="Número de la tarjeta"
                className="w-full h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A] focus:border-[#1351AA]"
              />

              <div className="grid grid-cols-2 gap-2 mt-1">
                <input
                  type="text"
                  placeholder="MM/AA"
                  className="h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A] focus:border-[#1351AA]"
                />

                <input
                  type="text"
                  placeholder="CVV"
                  className="h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A] focus:border-[#1351AA]"
                />
              </div>
            </div>
          </>
        )}

        {isPaypalSelected && (
          <div className="rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] p-5">
            <p className="font-medium">
              Serás redirigido a PayPal para completar el pago.
            </p>
            <p className="text-sm text-[#555] mt-1">
              En este Happy Path solo simularemos la confirmación.
            </p>
          </div>
        )}

        <div>
          <label className="block text-lg font-medium mb-2">País</label>

          <button
            type="button"
            className="w-full h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 flex items-center justify-between text-left hover:bg-[#E3E2DE] transition-colors"
          >
            <span>República Dominicana</span>
            <ChevronDown size={22} />
          </button>
        </div>
      </form>
    </div>
  );
}