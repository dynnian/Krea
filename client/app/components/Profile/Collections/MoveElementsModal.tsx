// deno-lint-ignore-file
import React from "react";
import { Input, Modal, ConfigProvider } from "antd";

export type MoveTargetCollection = {
  id: string;
  title: string;
  coverUrl?: string;
};

type MoveElementsModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  moveTargets: MoveTargetCollection[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedTargetId: string | null;
  onSelectTarget: (targetId: string) => void;
  title: string;
  otherCollectionsLabel: string;
};

export default function MoveElementsModal({
  open,
  onClose,
  onSave,
  moveTargets,
  searchValue,
  onSearchChange,
  selectedTargetId,
  onSelectTarget,
  title,
  otherCollectionsLabel,
}: MoveElementsModalProps) {
  const filteredTargets = moveTargets.filter((target) =>
  target.title.toLowerCase().includes(searchValue.toLowerCase())
);
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: "transparent",
            headerBg: "transparent",
            footerBg: "transparent",
          },
        },
      }}
    >
      <Modal
        open={open}
        title={null}
        footer={null}
        onCancel={onClose}
        width={650}
        centered
        rootClassName="custom-modal"
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <div className="p-[30px] bg-[#E8F1FC]  rounded-lg outline outline-2 outline-[#8F8E8A]">
          <h2 className="text-[24px] font-medium text-[#1B1C1E] mb-8">
            {title}
          </h2>

          <div className="space-y-4">
            <div>
              <Input
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Buscar"
                className="h-14 bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-lg px-4 text-base placeholder:text-[#8F8E8A]"
              />
            </div>

            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                {otherCollectionsLabel}
              </label>

              <div className="max-h-[360px] overflow-y-auto pr-[4px] space-y-4">
                {filteredTargets.map((target) => {
                  const isSelected = selectedTargetId === target.id;

                  return (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => onSelectTarget(target.id)}
                      className={`w-full flex items-center gap-[12px] text-left rounded-[12px] px-[4px] py-[4px] transition cursor-pointer ${
                        isSelected
                          ? "bg-[#BFD1EA]"
                          : "hover:bg-[#DCE9F9]"
                      }`}
                    >
                      <div className="w-[66px] h-[66px] rounded-[5px] overflow-hidden bg-[#D9D9D9] shrink-0 border border-[#95ACCC]">
                        {target.coverUrl ? (
                          <img
                            src={target.coverUrl}
                            alt={target.title}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>

                      <span className="text-[18px] font-medium text-[#1B1C1E]">
                        {target.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="krea-cancel-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={!selectedTargetId}
                className="krea-save-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
}