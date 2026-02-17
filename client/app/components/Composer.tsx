import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Avatar, Button, Input, message } from "antd";
import { Image, Link2, Music, User } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import type { Post, ComposerForm, PostUpload } from "../types/post";
import type { PostType, Timestamp } from "../types/common";
import type { Media } from "../types/media";

const { TextArea } = Input;

interface ComposerProps {
  onPost: (newPost: Post) => void;
}

export default function Composer({ onPost }: ComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState<PostType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<ComposerForm>({
    defaultValues: { content: "" },
  });

  // Función para obtener el valor de PostType a partir de un string (para los botones)
  const getPostTypeFromString = (type: string): PostType => {
    // Asumiendo que PostType es un enum con estos valores (ajusta según tu definición)
    const map: Record<string, PostType> = {
      art: 'art' as PostType,
      literature: 'literature' as PostType,
      music: 'music' as PostType,
    };
    return map[type];
  };

  const onSubmit = async (data: ComposerForm) => {
    if (!user) {
      message.warning(t("post.auth_required"));
      navigate("/login");
      return;
    }

    if (!data.content.trim() && !mediaType) {
      message.warning(t("home.post_required"));
      return;
    }

    setSubmitting(true);
    try {
      // Determinar el tipo de post: si mediaType es null, usamos 'art' por defecto
      const postTypeValue: PostType | null = mediaType || getPostTypeFromString('art');

      // Construir el array de PostUpload si hay mediaType
      let mediaArray: PostUpload[] = [];
      if (mediaType) {
        // Crear un objeto Media de ejemplo (en producción, esto vendría de una subida real)
        const mockMedia: Media = {
          id: Date.now(),
          filename: mediaType === getPostTypeFromString('art') 
            ? "imagen.jpg" 
            : mediaType === getPostTypeFromString('music')
            ? "audio.mp3"
            : "enlace.txt",
          mime_type: mediaType === getPostTypeFromString('art')
            ? "image/jpeg"
            : mediaType === getPostTypeFromString('music')
            ? "audio/mpeg"
            : "text/plain",
          path: mediaType === getPostTypeFromString('art')
            ? "https://placehold.co/596x321"
            : mediaType === getPostTypeFromString('music')
            ? "/assets/audio-sample.mp3"
            : "https://ejemplo.com/articulo",
          file_size: 1024, // ejemplo
          uploaded_at: new Date().toISOString() as Timestamp, // asumiendo que Timestamp es string ISO
        };

        mediaArray = [
          {
            post_id: Date.now(), // temporal, el backend asignará el real
            media_id: mockMedia.id,
            is_work_media: false,
            media: mockMedia,
          },
        ];
      }

      const newPost: Post = {
        id: Date.now(),
        user_post_id: user.id,
        type: postTypeValue,
        title: null,
        content: data.content,
        is_work: false,
        is_deleted: false,
        is_local: true,
        post_replied_to: null,
        post_repost_of: null,
        created_at: new Date().toISOString() as Timestamp,
        updated_at: new Date().toISOString() as Timestamp,
        author: user,
        media: mediaArray,
        likesCount: 0,
        favoritesCount: 0,
      };

      onPost(newPost);
      reset();
      setMediaType(null);
      message.success(t("home.post_success"));
    } catch (error) {
      console.error(error);
      message.error(t("home.post_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  // Funciones para manejar los clics de los botones de adjuntar
  const handleMediaClick = (type: string) => {
    const postType = getPostTypeFromString(type);
    setMediaType(mediaType === postType ? null : postType);
  };

  const isMediaActive = (type: string): boolean => {
    const postType = getPostTypeFromString(type);
    return mediaType === postType;
  };

  return (
    <div className="flex gap-3 mb-6 p-4 bg-[#E8F1FC] border-y border-black-200">
      <Avatar
        src={user.avatar}
        icon={!user.avatar && <User/>}
        size={48}
        className="bg-[#E8F1FC] border border-gray-800"
      />
      <div className="flex-1">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              placeholder={t("home.composer_placeholder")}
              autoSize={{ minRows: 2, maxRows: 6 }}
              bordered={false}
              className="text-base bg-gray-50 rounded-lg p-3"
            />
          )}
        />

        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-4">
            <button
              onClick={() => handleMediaClick('art')}
              className={`p-2 rounded-full transition ${
                isMediaActive('art')
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Image size={20} />
            </button>
            <button
              onClick={() => handleMediaClick('literature')}
              className={`p-2 rounded-full transition ${
                isMediaActive('literature')
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Link2 size={20} />
            </button>
            <button
              onClick={() => handleMediaClick('music')}
              className={`p-2 rounded-full transition ${
                isMediaActive('music')
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Music size={20} />
            </button>
          </div>
          <Button
            type="primary"
            onClick={handleSubmit(onSubmit)}
            loading={submitting}
            className="bg-[#1351AA]"
          >
            {t("home.post_button")}
          </Button>
        </div>
      </div>
    </div>
  );
}