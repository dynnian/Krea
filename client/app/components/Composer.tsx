import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Avatar, Button, Input, message } from "antd";
import { User } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { postsApi } from "../services/postsService";
import type { PostDto } from "../types/api";

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
          username: user.handle || user.email.split('@')[0],
          displayName: user.name || user.handle || user.email.split('@')[0],
          avatar: undefined, // no tenemos avatar aún
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
    <div className="flex gap-3 mb-6 p- border-black-200">
      
      <Avatar
        icon={<User />}
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
        <div className="flex justify-end mt-3">
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