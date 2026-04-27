// components/Composer.tsx
// deno-lint-ignore-file
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext.tsx";
import { useNavigate } from "react-router";
import { Avatar, Button, Input, message } from "antd";
import { User, Image, Music, FileText } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { postsApi } from "../services/postsService.ts";
import axiosClient from "../lib/axios.ts";
import type { PostDto, UploadMediaType } from "../types/api.ts";
import CreatePortfolioPostModal from "@/components/Posts/CreatePortfolioPostModal.tsx"; 
import { PostType } from "../types/common.ts";

const { TextArea } = Input;

interface ComposerForm {
  content: string;
}

interface ComposerProps {
  onPost: (newPost: PostDto) => void;
}

const getCurrentUserAvatar = (user: any) =>
  user?.avatar ??
  user?.profilePictureUrl ??
  user?.ProfilePictureUrl ??
  user?.profile?.avatar ??
  user?.profile?.profilePictureUrl ??
  null;

export default function Composer({ onPost }: ComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState<UploadMediaType>(PostType.IMAGE);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfileAvatar(null);
      return;
    }

    const loadCurrentUserProfile = async () => {
      try {
        const res = await axiosClient.get("/users/me/profile");
        const apiProfile = res.data;

        setProfileAvatar(
          apiProfile.profilePictureUrl ??
            apiProfile.ProfilePictureUrl ??
            null
        );
      } catch (error) {
        console.error("Error loading current user avatar:", error);
        setProfileAvatar(null);
      }
    };

    void loadCurrentUserProfile();
  }, [user]);

  const currentUserAvatar = getCurrentUserAvatar(user) ?? profileAvatar;

  const { control, handleSubmit, reset, watch } = useForm<ComposerForm>({
    defaultValues: { content: "" },
  });

  const composerContent = watch("content");
  const isPostButtonDisabled = submitting || !composerContent?.trim();

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
          avatar: currentUserAvatar ?? undefined,
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

  const openModalWithType = (type: UploadMediaType) => {
    setSelectedPostType(type);
    setModalVisible(true);
  };

  if (!user) return null;

  return (
    <>
      <div className="bg-[#E8F1FC] rounded-[15px] ring-[1.5px] ring-[#95ACCC] focus-within:ring-[2px] focus-within:ring-[#1351AA] focus-within:shadow-[0_4px_15px_rgba(19,81,170,0.15)] transition-all duration-300 ease-in-out p-[22px] shadow-md mb-6 min-h-[140px]">
        <div className="flex items-start gap-6">
          <Avatar
            src={currentUserAvatar ?? undefined}
            icon={!currentUserAvatar && <User />}
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
                  className="!bg-transparent !border-none !shadow-none !resize-none"
                />
              )}
            />
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openModalWithType(PostType.IMAGE)}
                  className="p-2 hover:bg-[#E3E2DE] rounded-full transition cursor-pointer"
                  title={t("createPost.image")}
                >
                  <Image size={20} className="text-[#1B1C1E]" />
                </button>
                <button
                  type="button"
                  onClick={() => openModalWithType(PostType.MUSIC)}
                  className="p-2 hover:bg-[#E3E2DE] rounded-full transition cursor-pointer"
                  title={t("createPost.music")}
                >
                  <Music size={20} className="text-[#1B1C1E]" />
                </button>
                <button
                  type="button"
                  onClick={() => openModalWithType(PostType.TEXT)}
                  className="p-2 hover:bg-[#E3E2DE] rounded-full transition cursor-pointer"
                  title={t("createPost.literature")}
                >
                  <FileText size={20} className="text-[#1B1C1E]" />
                </button>
              </div>
                <Button
                  type="primary"
                  onClick={handleSubmit(onSubmit)}
                  loading={submitting}
                  disabled={isPostButtonDisabled}
                  className={`border border-black rounded-[55px] px-6 py-2 text-white transition ${
                    isPostButtonDisabled
                      ? "!bg-[#8F8E8A] !border-[#8F8E8A] !text-[#E3E2DE] !cursor-not-allowed hover:!bg-[#8F8E8A]"
                      : "bg-[#0B5107] hover:bg-green-700 border border-black rounded-[55px] px-6 py-2 text-white"
                  }`}
                >
                  {t("home.post_button")}
                </Button>
            </div>
          </div>
        </div>
      </div>

      <CreatePortfolioPostModal
        visible={modalVisible}
        initialPostType={selectedPostType}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
        }}
      />
    </>
  );
}