import { Modal } from "antd";
import { User } from "lucide-react";

type DonationDetailModalProps = {
  open: boolean;
  amount: string;
  description: string;
  onCancel: () => void;
  onContinue: () => void;
};


export default function DonationDetailModal({
  open,
  amount,
  description,
  onCancel,
  onContinue,
}: DonationDetailModalProps) {
  return (
    <Modal open={open} footer={null} closable={false} centered width={650}>
      <div className="bg-[#EAF4FF] border-2 border-[#8F8E8A] rounded-lg px-7 py-6">
        <h2 className="text-3xl font-medium mb-4">Detalle de donación</h2>

        <div className="grid grid-cols-2 gap-8 mb-6">
          <UserInfo title="Donador" />
          <UserInfo title="Recibidor" />
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-3">Descripción</h3>
          <p className="leading-8">
              {description || "Sin descripción agregada."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="font-bold mb-3">Fecha</h3>
            <p className="text-lg">XX/XX/XXXX</p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Cantidad</h3>
            <p className="text-lg">{amount || "XX"}DOP</p>
          </div>
        </div>

        <div className="flex justify-end gap-7">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-7 rounded-md border border-red-600 text-red-600 bg-transparent hover:bg-red-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onContinue}
            className="h-10 px-7 rounded-md bg-[#075C08] text-white hover:bg-[#064b07]"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
}

function UserInfo({ title }: { title: string }) {
  return (
    <div>
      <h3 className="font-bold mb-5">{title}</h3>

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-md border border-[#1F1F1F] bg-[#F3F3F1] flex items-center justify-center">
          <User size={30} />
        </div>

        <span>·</span>
        <span className="text-lg">Username</span>
        <span className="text-lg">@Dominio</span>
      </div>
    </div>
  );
}