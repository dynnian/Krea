// deno-lint-ignore-file no-sloppy-imports jsx-button-has-type no-unused-vars
import React, { useEffect, useMemo, useState } from "react";
import { Modal, Upload, Input, Select, ConfigProvider, message } from "antd";
import { InboxOutlined, CloseOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import "../../../app.css";
import {
  collectionsApi,
  // type CollectionType,
  type CreateCollectionResponse,
} from "../../../services/collectionsService";

const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

type PortfolioCollectionType = "images" | "music" | "literature";

type CollectionSelectableItem = {
  id: string;
  title: string;
  year?: string;
};

type CreateCollectionModalProps = {
  open: boolean;
  onClose: () => void;
  ownerId: string;
  initialPortfolioType?: PortfolioCollectionType;
  availableItemsByType: Record<PortfolioCollectionType, CollectionSelectableItem[]>;
  onSuccess?: (
    created: CreateCollectionResponse,
    selectedItems: CollectionSelectableItem[],
    uploadedCoverUrl?: string | null
  ) => void;
};


const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  open,
  onClose,
  ownerId,
  initialPortfolioType = "images",
  availableItemsByType,
  onSuccess,
}) => {
  const [portfolioType, setPortfolioType] = useState<PortfolioCollectionType>(initialPortfolioType);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  const [selectedItems, setSelectedItems] = useState<CollectionSelectableItem[]>([]);
  useEffect(() => {
    if (!open) return;

    setPortfolioType(initialPortfolioType);
    setSelectedItemId(undefined);
    setSelectedItems([]);
  }, [open, initialPortfolioType]);

  const availableItems = useMemo(
    () => availableItemsByType[portfolioType] ?? [],
    [availableItemsByType, portfolioType]
  );

  const isMusic = portfolioType === "music";
  const isLiterature = portfolioType === "literature";
  const isImages = portfolioType === "images";

  const modalTitle = isMusic ? "Crear álbum" : "Crear colección";

  const coverLabel = isMusic
    ? "Elija un cover para su álbum."
    : "Elija un cover para su colección.";

  const titleLabel = isMusic ? "Título del álbum" : "Título de la colección";
  const titlePlaceholder = isMusic ? "Título del álbum" : "Título de la colección";

  const searchLabel = isMusic
    ? "Busque las canciones a añadir al álbum"
    : "Busque las obras a añadir a la colección";

  const searchPlaceholder = isMusic
    ? "Buscar canciones"
    : "Buscar obras";

  const addedListLabel = isMusic
    ? "Lista de canciones a añadir"
    : "Lista de obras a añadir";

  const typeLabel = isMusic ? "Álbum" : "Colección";

  const getBackendCollectionType = (): number => {
    switch (portfolioType) {
      case "images":
        return 0;
      case "music":
        return 1;
      case "literature":
        return 2;
      default:
        return 0;
    }
  };
  const resetForm = () => {
    setPortfolioType(initialPortfolioType);
    setFileList([]);
    setTitle("");
    setDescription("");
    setSelectedItemId(undefined);
    setSelectedItems([]);
  };

  const handleModalClose = () => {
    resetForm();
    onClose();
  };

  const handleAddItem = (value: string) => {
    setSelectedItemId(value);

    const foundItem = availableItems.find((item) => item.id === value);
    if (!foundItem) return;

    const alreadyExists = selectedItems.some((item) => item.id === foundItem.id);
    if (alreadyExists) return;

    setSelectedItems((prev) => [...prev, foundItem]);
    setSelectedItemId(undefined);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

const handleSave = async () => {
  if (!title.trim()) {
    message.error(isMusic ? "Debes escribir el título del álbum." : "Debes escribir el título de la colección.");
    return;
  }

  try {
const payload = {
  ownerId,
  title: title.trim(),
  description: description.trim() || undefined,
  type: getBackendCollectionType(),
};


  const created = await collectionsApi.createCollection(payload);

  let uploadedCoverUrl: string | null = null;

  const coverFile = fileList[0]?.originFileObj;
  if (coverFile instanceof File) {
    const uploadedCover = await collectionsApi.uploadCollectionCover(created.id, coverFile);
    uploadedCoverUrl = uploadedCover.url;
  }

  for (const item of selectedItems) {
    await collectionsApi.addPostToCollection(created.id, item.id);
  }

  message.success(isMusic ? "Álbum creado correctamente." : "Colección creada correctamente.");

  onSuccess?.(created, selectedItems, uploadedCoverUrl);
  handleModalClose();
  } catch (error: any) {
    console.error("Error creating collection:", error);
    console.error("Error response data:", error?.response?.data);
    console.error("Error response status:", error?.response?.status);
    message.error(isMusic ? "No se pudo crear el álbum." : "No se pudo crear la colección.");
  }
};

  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    fileList,
    beforeUpload: () => false,
    onChange(info) {
      setFileList(info.fileList.slice(-1));
    },
    accept: "image/*",
  };
  
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
        onCancel={handleModalClose}
        width={650}
        centered
        rootClassName="custom-modal"
        styles={{ body: { padding: 0 } }}
      >
        <div className="p-6 bg-[#E8F1FC] rounded-lg outline outline-2 outline-[#8F8E8A]">
          <h2 className="text-[24px] font-medium text-[#1B1C1E] mb-8">
            {modalTitle}
          </h2>

          <div className="space-y-4">
            {/* Tipo de portfolio */}
            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                Tipo de portafolio
              </label>
                <Select
                value={portfolioType}
                onChange={(value) => {
                    setPortfolioType(value as PortfolioCollectionType);
                    setSelectedItems([]);
                    setSelectedItemId(undefined);
                }}
                className="w-full"
                size="large"
                options={[
                    { value: "images", label: "Imágenes" },
                    { value: "music", label: "Música" },
                    { value: "literature", label: "Literatura" },
                ]}
                />
            </div>

            {/* Cover */}
            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                {coverLabel}
              </label>
              <Dragger
                {...uploadProps}
                className="bg-transparent rounded-[14px] min-h-[170px]"
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined className="text-[#1351AA] text-[42px]" />
                </p>
                <p className="ant-upload-text text-[#1B1C1E] text-[16px] font-medium">
                  Adjuntar archivo/s
                </p>
              </Dragger>
            </div>

            {/* Título */}
            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                {titleLabel}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                className="h-14 bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-lg px-4 text-base placeholder:text-[#8F8E8A]"
              />
            </div>

            {/* Buscar elementos */}
            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                {searchLabel}
              </label>
              <Select
                value={selectedItemId}
                onChange={handleAddItem}
                placeholder={searchPlaceholder}
                className="w-full h-[56px]"
                size="large"
                allowClear
                showSearch
                optionFilterProp="label"
                listHeight={240}
                options={availableItems.map((item) => ({
                  value: item.id,
                  label: item.title,
                }))}
              />
            </div>

            {/* Lista de elementos añadidos */}
            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                {addedListLabel}
              </label>

              <div className="overflow-hidden border border-[#D1D5DB] hover:border-[#326EB8] transition rounded-[px] bg-[#FFFFFF]">
                {selectedItems.length === 0 ? (
                  <div className="px-4 py-4 text-[14px] text-[#8F8E8A]">
                    No hay {isMusic ? "canciones" : "obras"} añadidas.
                  </div>
                ) : (
                  selectedItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        index !== selectedItems.length - 1
                          ? "border-b border-[#D1D5DB] "
                          : ""
                      }`}
                    >
                      <div className="text-[16px] text-[#1B1C1E]">
                        <span>{item.title}</span>
                        {item.year ? <span> ・ {item.year}</span> : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="flex h-[15px] w-[15px] items-center justify-center text-[#D84A4A] hover:opacity-50 transition cursor-pointer"
                        aria-label={`Quitar ${typeLabel}`}
                      >
                        <CloseOutlined />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Descripción
            <div>
              <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                Descripción (opcional)
              </label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-[14px] p-4 text-[16px] placeholder:text-[#8F8E8A]"
              />
            </div>
            */}
            {/* Botones */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleModalClose}
                className="krea-cancel-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="krea-save-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default CreateCollectionModal;