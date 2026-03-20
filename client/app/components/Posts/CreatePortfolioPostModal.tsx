import React, { useEffect, useState } from 'react';
import { Modal, Upload, Input, Checkbox, message, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { postsApi } from '../../services/postsService';
import { PostType } from '../../types/common';
import type { CreatePostData, UploadMediaData } from '../../types/api';
import type { UploadMediaType } from '../../types/api';


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
  const [belongsToAlbum, setBelongsToAlbum] = useState(false);
  useEffect(() => {
    if (visible) {
      setPostType(initialPostType);
    }
  }, [visible, initialPostType]);
  

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
        Type: postType,           // ahora es "image" | "music" | "text"
        Title: title,
        Description: description || '',
        IsWorkMedia: true,
        LanguageCode: user?.languageCode || 'es', // Siempre enviar
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

      const newPost = await postsApi.createPost(createData);
      console.log("Respuesta createPost:", newPost); // Depuración
      const postId = newPost.postId; // ¿Existe newPost.id?

      for (const file of fileList) {
        await handleUpload(postId, file);
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
    setBelongsToAlbum(false);
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
    <Modal
      open={visible}
      title={null}
      footer={null}
      onCancel={onClose}
      width={650}
      centered
      className="custom-modal"
      styles={{ body: { padding: 0 } }}
    >
      <div className="p-6 bg-[#E8F1FC] rounded-lg outline outline-2 outline-[#8F8E8A]">
        <h2 className="text-2xl font-medium text-[#1B1C1E] mb-6">
          {t('createPost.title', { type: getTitleText() })}
        </h2>

        <div className="space-y-4">
          {/* Tipo de contenido */}
          <div>
            <label className="block text-sm font-medium text-[#1B1C1E] mb-2">
              {t('createPost.contentType')}
            </label>
            <Select value={postType} onChange={setPostType} className="w-full" size="large">
                <Option value={PostType.IMAGE}>Imagen</Option>
                <Option value={PostType.MUSIC}>Música</Option>
                <Option value={PostType.TEXT}>Literatura</Option>
            </Select>
          </div>

          {/* Subida de archivos */}
          <div>
            <label className="block text-sm font-medium text-[#1B1C1E] mb-2">
              {t('createPost.uploadLabel')}
            </label>
            <Dragger
              {...uploadProps}
              className="bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-lg hover:border-[#1351AA]"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined className="text-[#1B1C1E] text-3xl" />
              </p>
              <p className="ant-upload-text text-[#1B1C1E] font-medium">
                {t('createPost.uploadText')}
              </p>
            </Dragger>
          </div>

          {/* Checkbox "Álbum" solo para música */}
          {postType === PostType.MUSIC && (
            <div className="flex items-center gap-3">
              <Checkbox
                checked={belongsToAlbum}
                onChange={(e) => setBelongsToAlbum(e.target.checked)}
                className="text-[#1B1C1E] font-medium"
              >
                <span className="text-base">{t('createPost.belongsToAlbum')}</span>
              </Checkbox>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-[#1B1C1E] mb-2">
              {t('createPost.titleField')}
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('createPost.titlePlaceholder', { type: getTitleText() })}
              className="h-14 bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-lg px-4 text-base placeholder:text-[#8F8E8A]"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-[#1B1C1E] mb-2">
              {t('createPost.description')}
            </label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('createPost.descriptionPlaceholder')}
              rows={4}
              className="bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-lg p-3 text-base placeholder:text-[#8F8E8A]"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#E3E2DE] text-[#1B1C1E] rounded-lg border border-[#1B1C1E] text-sm font-medium hover:bg-opacity-80 transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2 bg-[#0B5107] text-white rounded-lg border border-[#1B1C1E] text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePortfolioPostModal;