import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export default function DonationSuccessPage() {
  useEffect(() => {
    // Se puede hacer polling o refresh de pagos
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F3F1]">
      <div className="text-center">
        <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-[#075C08] flex items-center justify-center">
          <CheckCircle2 size={48} className="text-white" />
        </div>

        <h1 className="text-3xl font-bold mb-3">
          Donación completada
        </h1>

        <p className="text-lg text-[#555]">
          Gracias por apoyar a este creador.
        </p>
      </div>
    </div>
  );
}