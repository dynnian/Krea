import { CreditCard, ChevronDown } from "lucide-react";

export default function DonationCheckoutForm() {
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
              className="h-14 rounded-md border-2 border-[#1F1F1F] bg-[#E3E2DE] flex items-center justify-center gap-2 text-lg font-medium"
            >
              Tarjeta <CreditCard size={24} />
            </button>

            <button
              type="button"
              className="h-14 rounded-md border-2 border-[#1F1F1F] bg-[#E3E2DE] flex items-center justify-center text-2xl font-bold"
            >
              PayPal
            </button>
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">
            Nombre en la tarjeta
          </label>

          <input
            type="text"
            placeholder="Nombre"
            className="w-full h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A]"
          />
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">
            Datos de la tarjeta
          </label>

          <input
            type="text"
            placeholder="Número de la tarjeta"
            className="w-full h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A]"
          />

          <div className="grid grid-cols-2 gap-2 mt-1">
            <input
              type="text"
              placeholder="MM/AA"
              className="h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A]"
            />

            <input
              type="text"
              placeholder="CVV"
              className="h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 outline-none placeholder:text-[#8F8E8A]"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium mb-2">País</label>

          <button
            type="button"
            className="w-full h-14 rounded-md border-2 border-[#1F1F1F] bg-[#F3F3F1] px-8 flex items-center justify-between text-left"
          >
            <span>República Dominicana</span>
            <ChevronDown size={22} />
          </button>
        </div>
      </form>
    </div>
  );
}