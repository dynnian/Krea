import { Modal } from "antd";
import { User } from "lucide-react";
import type { PublicUserProfile } from "@/services/userService.ts";

type DonationUser = Pick<
  PublicUserProfile,
  "username" | "displayName" | "profilePictureUrl"
>;

type DonationDetailModalProps = {
  open: boolean;
  amount: string;
  currency?: string;
  description: string;
  donor?: DonationUser | null;
  recipient: DonationUser;
  onCancel: () => void;
  onContinue: () => void;
};

export default function DonationDetailModal({
  open,
  amount,
  currency = "DOP",
  description,
  donor,
  recipient,
  onCancel,
  onContinue,
}: DonationDetailModalProps) {
  const today = new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <Modal open={open} footer={null} closable={false} centered width={650}>
      <div className="bg-[#EAF4FF] border-2 border-[#8F8E8A] rounded-lg px-7 py-6">
        <h2 className="text-3xl font-medium mb-4">Detalle de donación</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <UserInfo title="Donador" user={donor} fallbackName="Tú" />
          <UserInfo title="Recibidor" user={recipient} />
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
            <p className="text-lg">{today}</p>
          </div>

          <div>
            <h3 className="font-bold mb-3">Cantidad</h3>
            <p className="text-lg">
              {amount || "XX"} {currency}
            </p>
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

function UserInfo({
  title,
  user,
  fallbackName = "Usuario",
}: {
  title: string;
  user?: DonationUser | null;
  fallbackName?: string;
}) {
  return (
    <div>
      <h3 className="font-bold mb-5">{title}</h3>

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-md overflow-hidden border border-[#1F1F1F] bg-[#F3F3F1] flex items-center justify-center shrink-0">
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt={user.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={30} />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-base font-medium truncate">
            {user?.displayName || fallbackName}
          </p>

          <p className="text-sm text-[#555] truncate">
            {user?.username ? `@${user.username}` : "@usuario"}
          </p>
        </div>
      </div>
    </div>
  );
}