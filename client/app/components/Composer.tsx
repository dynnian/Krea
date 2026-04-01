// components/Composer.tsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Avatar, Button, Input, message } from "antd";
import { User, Image, Music, FileText } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { postsApi } from "../services/postsService";
import type { PostDto } from "../types/api";
import CreatePortfolioPostModal from "@/components/Posts/CreatePortfolioPostModal.tsx"; // asegurar la ruta correcta
import { PostType } from "../types/common";

const { TextArea } = Input;

interface ComposerForm {
  content: string;
}

interface ComposerProps {
  onPost: (newPost: PostDto) => void;
}

export default function Composer({ onPost }: ComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const { control, handleSubmit, reset } = useForm<ComposerForm>({
    defaultValues: { content: "" },
  });

  const onSubmit = async (data: ComposerForm) => {
    if (!user) {
      message.warning(t("post.auth_required"));
      navigate("/login");
      return;
    }

    if (!data.content.trim()) {
      message.warning(t("home.post_required"));
      return;
    }

    setSubmitting(true);
    try {
      const title = data.content.substring(0, 50).trim() || "Sin título";

      const response = await postsApi.createPost({
        authorPostId: user.id,
        type: 1, // PostType.TEXT
        title: title,
        content: data.content,
        isWork: false,
        isLocal: true,
      });

      const newPost: PostDto = {
        id: response.data.postId,
        authorPostId: user.id,
        author: {
          id: user.id,
          username: user.handle || user.email.split("@")[0],
          displayName: user.name || user.handle || user.email.split("@")[0],
          avatar: undefined,
        },
        title: title,
        content: data.content,
        isWork: false,
        isLocal: true,
        uploadCount: 0,
        likesCount: 0,
        uploadedAt: new Date().toISOString(),
        media: [],
        isLikedByCurrentUser: false,
        isRetweetedByCurrentUser: false,
      };
      onPost(newPost);
      reset();
      message.success(t("home.post_success"));
    } catch (error) {
      console.error("Error creating post:", error);
      message.error(t("home.post_error"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <div className="bg-[#E8F1FC] rounded-[15px] outline outline-[1.5px] outline-[#95ACCC] p-[22px] shadow-md mb-6 min-h-[140px]">
        <div className="flex items-start gap-6">
          <Avatar
            icon={<User />}
            size={48}
            className="bg-white border border-black rounded-full"
          />
          <div className="flex-1">
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  placeholder={t("home.composer_placeholder") || "¿Qué piensas?"}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  className="bg-[#F3F3F1] rounded-[15px] p-3 text-base border-0"
                />
              )}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setModalVisible(true)}
                  className="p-2 hover:bg-[#E3E2DE] rounded-full transition"
                  title={t("createPost.image")}
                >
                  <Image size={20} className="text-[#1B1C1E]" />
                </button>
                <button
                  onClick={() => setModalVisible(true)}
                  className="p-2 hover:bg-[#E3E2DE] rounded-full transition"
                  title={t("createPost.music")}
                >
                  <Music size={20} className="text-[#1B1C1E]" />
                </button>
                <button
                  onClick={() => setModalVisible(true)}
                  className="p-2 hover:bg-[#E3E2DE] rounded-full transition"
                  title={t("createPost.literature")}
                >
                  <FileText size={20} className="text-[#1B1C1E]" />
                </button>
              </div>
              <Button
                type="primary"
                onClick={handleSubmit(onSubmit)}
                loading={submitting}
                className="bg-[#0B5107] hover:bg-green-700 border border-black rounded-[55px] px-6 py-2 text-white"
              >
                {t("home.post_button")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <CreatePortfolioPostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          // Opcional: refrescar feed
          setModalVisible(false);
        }}
      />
    </>
  );
}