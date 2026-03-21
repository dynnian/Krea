// deno-lint-ignore-file no-sloppy-imports jsx-button-has-type no-unused-vars
import React, { useEffect, useState } from 'react';
import { Modal, Upload, Input, Checkbox, message, Select, ConfigProvider } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsService';
import { collectionsApi, type UserCollectionDto } from '../../services/collectionsService';
import { PostType } from '../../types/common';
import type { CreatePostData, UploadMediaData } from '../../types/api';
import type { UploadMediaType } from '../../types/api';
import '../../app.css'



const { Dragger } = Upload;
const { TextArea } = Input;
const { Option } = Select;

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

  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>(undefined);
  const [collections, setCollections] = useState<UserCollectionDto[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  useEffect(() => {
    if (!visible) return;

    setPostType(initialPostType);

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

    loadCollections();
  }, [visible, initialPostType, user?.id]);


const showGenresSection = postType === PostType.MUSIC || postType === PostType.TEXT;


const removeGenre = (genreToRemove: string) => {
  setGenres((prev) => prev.filter((genre) => genre !== genreToRemove));
};

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
    const fileObj = file.originFileObj as File;
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
        // Para archivos de texto, puedes leer el contenido
        const text = await fileObj.text();
        const words = text.split(/\s+/).length;
        uploadData.WordCount = words;
        uploadData.LanguageCode = user?.languageCode || 'es';
        uploadData.SortTitle = title;
        uploadData.Subtitle = '';
        uploadData.Format = file.name.split('.').pop() || 'txt';
        uploadData.FileSize = fileObj.size;
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

    setLoading(true);
    try {
      const createData: CreatePostData = {
        authorPostId: user.id,
        type: postTypeToNumber[postType],
        title: title,
        content: description || '',
        isWork: true,
        isLocal: false,
      };

      const response = await postsApi.createPost(createData);
      console.log("Respuesta createPost:", response.data); // Para depurar

      // Obtener el ID del post (puede ser 'postId' o 'id')
      const postId = response.data?.postId || response.data?.id;
      if (!postId) {
        throw new Error('No se recibió el ID del post');
      }

      // Subir cada archivo al post creado
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
      message.error(t('createPost.error'));
    } finally {
      setLoading(false);
    }
  };

const resetForm = () => {
  setFileList([]);
  setTitle('');
  setDescription('');
  setPostType(PostType.IMAGE);
  setGenres([]);
  setSelectedGenreIds([]);
  setSelectedCollectionId(undefined);
  };

  const getAcceptType = () => {
    switch (postType) {
      case PostType.MUSIC:
        return 'audio/*';
      case PostType.IMAGE:
        return 'image/*';
      case PostType.TEXT:
        return 'application/pdf,application/epub+zip,.epub';
      default:
        return '*/*';
    }
  };

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
    beforeUpload: () => false,
    accept: getAcceptType(),
  };

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
            onChange={setPostType}
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
                  onChange={(values, options) => {
                    setSelectedGenreIds(values);
                    setGenres((options as { label: string; value: string }[]).map((option) => option.label));
                  }}
                  className="w-full"
                  rootClassName="krea-modal-multi-select"
                  size="large"
                  showSearch
                  placeholder="Escribe y busca un género."
                  options={[
                    { value: '11111111-1111-1111-1111-111111111111', label: 'Rock' },
                    { value: '22222222-2222-2222-2222-222222222222', label: 'Pop' },
                    { value: '33333333-3333-3333-3333-333333333333', label: 'Jazz' },
                    { value: '44444444-4444-4444-4444-444444444444', label: 'EDM' },
                    { value: '55555555-5555-5555-5555-555555555555', label: 'Indie' },
                    { value: '66666666-6666-6666-6666-666666666666', label: 'Fantasía' },
                    { value: '77777777-7777-7777-7777-777777777777', label: 'Romance' },
                    { value: '88888888-8888-8888-8888-888888888888', label: 'Ciencia ficción' },
                  ]}
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
              placeholder="Seleccionar Colección"
              className="w-full"
              rootClassName="krea-modal-single-select"
              size="large"
              allowClear
              showSearch
              loading={collectionsLoading}
              optionFilterProp="children"
            >
              {collections.map((collection) => (
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