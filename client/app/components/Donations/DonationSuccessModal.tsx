import { Modal } from "antd";
import { CheckCircle2 } from "lucide-react";

type DonationSuccessModalProps = {
  open: boolean;
  amount: string;
  receiverName?: string;
  onClose: () => void;
};

export default function DonationSuccessModal({
  open,
  amount,
  receiverName = "Usuario",
  onClose,
}: DonationSuccessModalProps) {
  return (
    <Modal open={open} footer={null} closable={false} centered width={520}>
      <div className="bg-[#EAF4FF] border-2 border-[#8F8E8A] rounded-lg px-8 py-8 text-center">
        <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-[#075C08] flex items-center justify-center">
          <CheckCircle2 size={48} className="text-white" />
        </div>

        <h2 className="text-3xl font-bold mb-3">Donación completada</h2>

        <p className="text-lg mb-2">
          Tu donación de <strong>{amount || "XX"}$</strong> a{" "}
          <strong>{receiverName}</strong> fue procesada correctamente.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="h-11 px-8 rounded-md bg-[#075C08] text-white hover:bg-[#064b07]"
        >
          Finalizar
        </button>
      </div>
    </Modal>
  );
}