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

const MOCK_MOVE_TARGETS: MoveTargetCollection[] = [
  {
    id: "mock-1",
    title: "Fantasy Worlds",
    coverUrl: "https://placehold.co/66x66?text=1",
  },
  {
    id: "mock-2",
    title: "Dreamscapes",
    coverUrl: "https://placehold.co/66x66?text=2",
  },
  {
    id: "mock-3",
    title: "Dark Visions",
    coverUrl: "https://placehold.co/66x66?text=3",
  },
  {
    id: "mock-4",
    title: "Nature Studies",
    coverUrl: "https://placehold.co/66x66?text=4",
  },
  {
    id: "mock-5",
    title: "Sketch Archive",
    coverUrl: "https://placehold.co/66x66?text=5",
  },
  {
    id: "mock-6",
    title: "Magic Creatures",
    coverUrl: "https://placehold.co/66x66?text=6",
  },
  {
    id: "mock-7",
    title: "Portrait Lab",
    coverUrl: "https://placehold.co/66x66?text=7",
  },
  {
    id: "mock-8",
    title: "Color Experiments",
    coverUrl: "https://placehold.co/66x66?text=8",
  },
];

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
  const displayTargets = moveTargets.length > 0 ? moveTargets : MOCK_MOVE_TARGETS;
  const filteredTargets = displayTargets.filter((target) =>
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
        <div className="p-6 bg-[#E8F1FC] rounded-lg outline outline-2 outline-[#8F8E8A]">
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
                      className={`w-full flex items-center gap-[12px] text-left rounded-[12px] px-[4px] py-[4px] transition ${
                        isSelected ? "bg-[#DCE9F9]" : "bg-transparent"
                      }`}
                    >
                      <div className="w-[66px] h-[66px] rounded-[10px] overflow-hidden bg-[#D9D9D9] shrink-0 border border-[#1B1C1E]">
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