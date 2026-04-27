// deno-lint-ignore-file

import React, { useEffect, useState } from 'react';
import { Modal, Upload, Input, message, Select, ConfigProvider } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { postsApi } from '../../services/postsService.ts';
import { genresApi, type GenreDto } from "../../services/genresService.ts";
import {
  collectionsApi,
  type UserCollectionDto,
  type CollectionType,
} from '../../services/collectionsService.ts';
import { PostType } from '../../types/common.ts';
import type { CreatePostData, UploadMediaData } from '../../types/api.ts';
import type { UploadMediaType } from '../../types/api.ts';
import '../../app.css'



const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;
const MAX_FILE_SIZE_MB: Record<PostType, number> = {
  [PostType.PLAIN]: 0,
  [PostType.IMAGE]: 10,
  [PostType.MUSIC]: 20,
  [PostType.TEXT]: 40,
};
const getMaxFileSizeBytes = (postType: PostType) => {
  return MAX_FILE_SIZE_MB[postType] * 1024 * 1024;
};
const ACCEPTED_MIME_TYPES: Record<PostType, string[]> = {
  [PostType.PLAIN]: [],
  [PostType.IMAGE]: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  [PostType.MUSIC]: ['audio/mpeg', 'audio/wav'],
  [PostType.TEXT]: ['application/pdf', 'application/epub+zip', 'text/plain'],
};

interface CreatePortfolioPostModalProps {
  visible: boolean;
  initialPostType?: UploadMediaType;
  onClose: () => void;
  onSuccess?: () => void;
}



const CreatePortfolioPostModal: React.FC<CreatePortfolioPostModalProps> = ({
  visible,
  initialPostType = PostType.IMAGE,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [postType, setPostType] = useState<UploadMediaType>(initialPostType);

  const [genres, setGenres] = useState<GenreDto[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [genresLoading, setGenresLoading] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(undefined);
  const [collections, setCollections] = useState<UserCollectionDto[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const beforeUpload = (file: File) => {
    const currentPostType = postType as PostType;
    const allowedTypes = ACCEPTED_MIME_TYPES[currentPostType];
    const maxSizeMb = MAX_FILE_SIZE_MB[currentPostType];
    const maxSizeBytes = getMaxFileSizeBytes(currentPostType);

    if (allowedTypes && allowedTypes.length && !allowedTypes.includes(file.type)) {
      message.error(t('createPost.invalidFileType', { type: getTitleText() }));
      return Upload.LIST_IGNORE;
    }

    if (maxSizeMb > 0 && file.size > maxSizeBytes) {
      message.error(`El archivo supera el límite de ${maxSizeMb} MB.`);
      return Upload.LIST_IGNORE;
    }

    return false;
  };

useEffect(() => {
  if (!visible) return;

  setPostType(initialPostType);
  setSelectedCollectionId(undefined);

  const loadCollections = async () => {
    if (!user?.id) return;

    try {
      setCollectionsLoading(true);
      const data = await collectionsApi.getUserCollections(user.id);
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
      message.error('No se pudieron cargar las colecciones.');
    } finally {
      setCollectionsLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      setGenresLoading(true);
      const data = await genresApi.getAll();
      setGenres(data);
    } catch (error) {
      console.error("Error loading genres:", error);
      message.error("No se pudieron cargar los géneros.");
    } finally {
      setGenresLoading(false);
    }
  };

  loadCollections();
  loadGenres();
}, [visible, initialPostType, user?.id]);

const showGenresSection = postType === PostType.MUSIC || postType === PostType.TEXT

const getInsertLabel = () => {
  return showGenresSection ? 'Inserte elemento' : 'Inserte 1 o varios elementos';
};

const getTitleLabel = () => {
  switch (postType) {
    case PostType.MUSIC:
      return 'Titulo de la cancion';
    case PostType.TEXT:
      return 'Titulo de la obra';
    case PostType.IMAGE:
      return 'Titulo de la obra';
    default:
      return 'Titulo';
  }
};

const getTitlePlaceholder = () => {
  switch (postType) {
    case PostType.MUSIC:
      return 'Titulo de la cancion';
    case PostType.TEXT:
      return 'Titulo de la obra';
    case PostType.IMAGE:
      return 'Titulo de la obra';
    default:
      return 'Titulo';
  }
};

const getModalTitle = () => {
  switch (postType) {
    case PostType.MUSIC:
      return 'Añadir canción al portafolio';
    case PostType.TEXT:
      return 'Añadir obra al portafolio';
    case PostType.IMAGE:
      return 'Añadir obra al portafolio';
    default:
      return 'Añadir contenido al portafolio';
  }
};

const getGenreLabel = () => {
  return postType === PostType.MUSIC ? 'Añadir Genero/s' : 'Añadir Genero';
};
  

  // Mapeo de PostType (string) al número que espera el backend
  const postTypeToNumber: Record<PostType, number> = {
    [PostType.PLAIN]: 0,
    [PostType.TEXT]: 1,
    [PostType.IMAGE]: 2,
    [PostType.MUSIC]: 3,
  };

  const handleUpload = async (postId: string, file: UploadFile) => {
    const origin = file.originFileObj;
    
    if (!origin) {
      throw new Error('No se encontró el archivo original para subir.');
    }

    let fileObj = origin as File;

    const uploadData: UploadMediaData = {
        File: fileObj,
        Type: postType,
        Title: title,
        Description: description || '',
        IsWorkMedia: true,
        LanguageCode: user?.languageCode || 'es',
        GenreIds: selectedGenreIds,
    };
    // Metadatos según tipo
    if (postType === PostType.IMAGE) {
        const img = new Image();
        img.src = URL.createObjectURL(fileObj);
        await new Promise((resolve) => { img.onload = resolve; });
        uploadData.Width = img.width;
        uploadData.Height = img.height;
        uploadData.Format = file.name.split('.').pop() || 'jpg';
        uploadData.FileSize = fileObj.size;
        URL.revokeObjectURL(img.src);
    } else if (postType === PostType.MUSIC) {
        // Aquí podrías extraer metadatos reales con una librería
        uploadData.BitrateKbps = 128;        // ejemplo
        uploadData.DurationSec = 180;        // ejemplo
        uploadData.Format = file.name.split('.').pop() || 'mp3';
        uploadData.FileSize = fileObj.size;
    } else if (postType === PostType.TEXT) {
  uploadData.SortTitle = title;
  uploadData.Subtitle = '';
  uploadData.Format = file.name.split('.').pop() || 'txt';
  uploadData.FileSize = fileObj.size;

  if (fileObj.type === 'text/plain') {
    const text = await fileObj.text();
    const words = text.split(/\s+/).filter(Boolean).length;
    uploadData.WordCount = words;
  }
}

    await postsApi.uploadMedia(postId, uploadData);
    
  };



  const handleSubmit = async () => {
    if (!user) {
      message.warning(t('createPost.authRequired'));
      return;
    }
    if (!title.trim()) {
      message.warning(t('createPost.titleRequired'));
      return;
    }
    if (fileList.length === 0) {
      message.warning(t('createPost.fileRequired'));
      return;
    }

    const currentPostType = postType as PostType;
    const maxSizeMb = MAX_FILE_SIZE_MB[currentPostType];
    const maxSizeBytes = getMaxFileSizeBytes(currentPostType);

    const oversizedFile = fileList.find((file) => {
      const origin = file.originFileObj as File | undefined;
      return origin && maxSizeMb > 0 && origin.size > maxSizeBytes;
    });

    if (oversizedFile) {
      message.error(`El archivo "${oversizedFile.name}" supera el límite de ${maxSizeMb} MB.`);
      return;
    }

    setLoading(true);

    setLoading(true);
    let createdPostId: string | null = null;

    try {
      const createData: CreatePostData = {
        authorPostId: user.id,
        type: postTypeToNumber[postType],
        title: title,
        content: description || '',
        isWork: true,
        isLocal: false,
      };

      const response: any = await postsApi.createPost(createData);

      const postId =
        response?.data?.postId ||
        response?.data?.id ||
        response?.postId ||
        response?.id;

      if (!postId) {
        console.error("Respuesta createPost sin ID:", response);
        throw new Error('No se recibió el ID del post');
      }

      createdPostId = postId;

      for (const file of fileList) {
        await handleUpload(postId, file);
      }

      if (selectedCollectionId) {
        await collectionsApi.addPostToCollection(selectedCollectionId, postId);
      }

      message.success(t('createPost.success'));
      onSuccess?.();
      resetForm();
      onClose();

    } catch (error) {
      console.error('Error al crear post:', error);
      console.error('response data:', (error as any)?.response?.data);
      console.error('response status:', (error as any)?.response?.status);

      if (createdPostId) {
        try {
          await postsApi.deletePost(createdPostId);
          console.warn('Post eliminado por rollback tras fallo:', createdPostId);
        } catch (rollbackError) {
          console.error('No se pudo eliminar el post creado tras el fallo:', rollbackError);
        }
      }

      const status = (error as any)?.response?.status;

      if (status === 413) {
        message.error('El archivo es demasiado grande.');
      } else if (status === 400) {
        message.error('No se pudo subir el archivo. Revisa el formato, tamaño o metadatos.');
      } else {
        message.error(t('createPost.error'));
      }
    } finally {
      setLoading(false);
    }
  };

const resetForm = () => {
  setFileList([]);
  setTitle('');
  setDescription('');
  setPostType(PostType.IMAGE);
  setSelectedGenreIds([]);
  setSelectedCollectionId(undefined);
  };

  const getAcceptType = () => {
    switch (postType) {
      case PostType.MUSIC:
        return 'audio/mpeg,audio/wav';
      case PostType.IMAGE:
        return 'image/*';
      case PostType.TEXT:
        return '.pdf,.epub,.txt,application/pdf,application/epub+zip,text/plain';
      default:
        return '*/*';
    }
  };

  const getTargetCollectionType = (): CollectionType => {
    switch (postType) {
      case PostType.IMAGE:
        return 0;
      case PostType.MUSIC:
        return 1;
      case PostType.TEXT:
        return 2;
      default:
        return 0;
    }
  };

  const filteredCollections = collections.filter(
    (collection) => collection.type === getTargetCollectionType()
  );
  
  const getTitleText = () => {
    switch (postType) {
      case PostType.MUSIC:
        return t('createPost.music');
      case PostType.IMAGE:
        return t('createPost.image');
      case PostType.TEXT:
        return t('createPost.literature');
      default:
        return t('createPost.content');
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange(info) {
      setFileList(info.fileList);
    },
    beforeUpload,
    accept: getAcceptType(),
  };

  const getTargetGenreType = () => {
    switch (postType) {
      case PostType.IMAGE:
        return 0;
      case PostType.MUSIC:
        return 1;
      case PostType.TEXT:
        return 2;
      default:
        return 0;
    }
  };

  const filteredGenres = genres.filter(
    (genre) => genre.type === getTargetGenreType()
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            contentBg: 'transparent',
            headerBg: 'transparent',
            footerBg: 'transparent',
          },
        },
      }}
    >
    <Modal
      open={visible}
      title={null}
      footer={null}
      onCancel={onClose}
      width={650}
      centered
      rootClassName="custom-modal"
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-6 bg-[#E8F1FC] rounded-lg outline outline-2 outline-[#8F8E8A]">
        <h2 className="text-[24px] font-medium text-[#1B1C1E] mb-8">
          {getModalTitle()}
        </h2>



        <div className="space-y-4">
          <div>
          <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
            Tipo de contenido
          </label>
          <Select
            value={postType}
            onChange={(value) => {
              setPostType(value);
              setSelectedCollectionId(undefined);
              setSelectedGenreIds([]);
            }}
            className="w-full"
            size="large"
          >
            <Option value={PostType.IMAGE}>Imagen</Option>
            <Option value={PostType.MUSIC}>Música</Option>
            <Option value={PostType.TEXT}>Literatura</Option>
          </Select>
        </div>            

          {/* Subida de archivos */}
          <div>
            <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
              {getInsertLabel()}
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
              {getTitleLabel()}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getTitlePlaceholder()}
              className="h-14 bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-lg px-4 text-base placeholder:text-[#8F8E8A]"
            />
          </div>

          {/* Géneros */}
          {showGenresSection && (
            <>
              <div>
                <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
                  {getGenreLabel()}
                </label>
                <Select
                  mode="multiple"
                  value={selectedGenreIds}
                  onChange={(values) => {
                    if (values.length > 4) {
                      message.warning("Solo puedes seleccionar hasta 4 géneros.");
                      return;
                    }

                    setSelectedGenreIds(values);
                  }}
                  className="w-full h-[56px]"
                  rootClassName="w-full"
                  size="large"
                  showSearch
                  allowClear
                  maxTagCount={4}
                  placeholder="Escribe y busca un género."
                  loading={genresLoading}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    String(option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={filteredGenres.map((genre) => ({
                    value: genre.id,
                    label: genre.name,
                  }))}
                />
              </div>

            </>
          )}

          {/* Añadir a colección */}
          <div>
            <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2">
              {postType === PostType.MUSIC ? '¿Añadir a álbum?' : '¿Añadir a colección?'}
            </label>
            <Select
              value={selectedCollectionId}
              onChange={setSelectedCollectionId}
              placeholder={postType === PostType.MUSIC ? "Seleccionar álbum" : "Seleccionar colección"}
              className="w-full h-[56px]"
              size="large"
              allowClear
              showSearch
              loading={collectionsLoading}
              optionFilterProp="children"
            >
            {filteredCollections.map((collection) => (
              <Option key={collection.id} value={collection.id}>
                {collection.title}
              </Option>
            ))}
            </Select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-[16px] font-medium text-[#1B1C1E] mb-2
            ">
              Descripción (opcional)
            </label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-[14px] p-4 text-[16px] placeholder:text-[#8F8E8A]"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="krea-cancel-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="krea-save-button px-5 py-2 rounded-lg border border-[#1B1C1E] font-medium transition disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
    </ConfigProvider>
  );
};

export default CreatePortfolioPostModal;