// deno-lint-ignore-file
import React from "react";
import { Avatar, Typography } from "antd";
import { Bookmark, MoreHorizontal, User, Check, Edit } from "lucide-react";
import type { ProfileData } from "../../types/profile.ts";

const { Title, Text } = Typography;

interface ProfileHeaderProps {
  profile: ProfileData;
  onGoToSettings: () => void;
  onGoToSaved: () => void;
}

function ConfigurationButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
    >
      <Edit size={14} />
      <span className="text-[13px] font-medium leading-5 text-[#1B1C1E]">
        Configuración
      </span>
    </button>
  );
}

function FavoritesButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
    >
      <Bookmark size={14} />
      <span className="text-[13px] font-medium leading-5 text-[#1B1C1E]">
        Guardados
      </span>
    </button>
  );
}

function MoreButton({
  onClick,
  variant = "circle",
}: {
  onClick?: () => void;
  variant?: "circle" | "plain";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "circle"
          ? "w-7 h-7 rounded-full bg-[#F3F3F1] border border-[#1B1C1E] flex items-center justify-center"
          : "text-[#1B1C1E] flex items-center justify-center cursor-pointer rounded-full p-[4px] hover:bg-[#C0CFE4] ring-inset hover:border-[1px] hover:border-[#000000]"
      }
    >
      <MoreHorizontal size={16} />
    </button>
  );
}

export default function ProfileHeader({
  profile,
  onGoToSettings,
  onGoToSaved,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row gap-6 px-[70px]">
      <div className="flex justify-center md:justify-start">
        <Avatar
          src={profile.user.avatar}
          icon={!profile.user.avatar && <User size={60} />}
          size={141}
          className="bg-white border-2 border-gray-800"
        />
      </div>

      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Title level={3} className="!mb-0">
                {profile.user.name}
              </Title>

              {profile.user.isVerified && (
                <div className="w-5 h-5 bg-[#0B5107] rounded-full flex items-center justify-center border border-gray-800">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>

            <Text type="secondary">@{profile.user.handle}</Text>
          </div>

          <div className="flex flex-wrap gap-2">
            <ConfigurationButton onClick={onGoToSettings} />
            <FavoritesButton onClick={onGoToSaved} />
            <MoreButton variant="circle" />
          </div>
        </div>

        <p className="text-gray-800 text-sm text-justify mt-4 leading-relaxed">
          {profile.bio}
        </p>

        <div className="flex gap-6 mt-4 text-sm">
          <span>{profile.followingCount} Seguidos</span>
          <span>{profile.followersCount} Seguidores</span>
        </div>
      </div>
    </div>
  );
}