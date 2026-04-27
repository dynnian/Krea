// deno-lint-ignore-file
import React from "react";
import { Avatar, Typography } from "antd";
import {
  Bookmark,
  MoreHorizontal,
  User,
  Check,
  Edit,
  Mail,
  Heart,
  UserPlus,
  UserCheck,
} from "lucide-react";
import type { ProfileData } from "../../types/profile.ts";

const { Title, Text } = Typography;

interface ProfileHeaderProps {
  profile: ProfileData;
  variant?: "own" | "public";

  onGoToSettings?: () => void;
  onGoToSaved?: () => void;

  isFollowing?: boolean;
  followLoading?: boolean;
  onFollow?: () => void;
  onOpenDM?: () => void;
  onOpenDonation?: () => void;
  onOpenFollowers?: () => void;
  onOpenFollowing?: () => void;
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

function FollowButton({
  isFollowing,
  loading,
  onClick,
}: {
  isFollowing?: boolean;
  loading?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`px-5 py-1 rounded-full cursor-pointer transition border border-[#1B1C1E] flex items-center gap-1 disabled:opacity-60 ${
        isFollowing
          ? "bg-[#F3F3F1] hover:bg-[#E6E5E2] text-[#1B1C1E]"
          : "bg-[#0B5107] hover:bg-[#093B05] text-[#E3E2DE]"
      }`}
    >
      {isFollowing ? (
        <UserCheck size={14} className="text-[#1B1C1E]" />
      ) : (
        <UserPlus size={14} className="text-[#E3E2DE]" />
      )}
      <span
        className={`text-[13px] font-medium leading-5 ${
          isFollowing ? "text-[#1B1C1E]" : "text-[#E3E2DE]"
        }`}
      >
        {isFollowing ? "Siguiendo" : "Seguir"}
      </span>
    </button>
  );
}

function MessageButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
    >
      <Mail size={14} />
      <span className="text-[13px] font-medium leading-5 text-[#1B1C1E]">
        Mensaje
      </span>
    </button>
  );
}

function DonateButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-1 rounded-full cursor-pointer transition hover:bg-[#E6E5E2] bg-[#F3F3F1] text-[#1B1C1E] border border-[#1B1C1E] flex items-center gap-1"
    >
      <Heart size={14} />
      <span className="text-[13px] font-medium leading-5 text-[#1B1C1E]">
        Donar
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
  variant = "own",
  onGoToSettings,
  onGoToSaved,
  isFollowing,
  followLoading,
  onFollow,
  onOpenDM,
  onOpenDonation,
  onOpenFollowers,
  onOpenFollowing,
}: ProfileHeaderProps) {
  const isPublicProfile = variant === "public";
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
            {isPublicProfile ? (
              <>
                <FollowButton
                  isFollowing={isFollowing}
                  loading={followLoading}
                  onClick={onFollow}
                />
                <MessageButton onClick={onOpenDM} />
                <DonateButton onClick={onOpenDonation} />
                <MoreButton variant="circle" />
              </>
            ) : (
              <>
                <ConfigurationButton onClick={onGoToSettings} />
                <FavoritesButton onClick={onGoToSaved} />
                <MoreButton variant="circle" />
              </>
            )}
          </div>
        </div>

        <p className="text-gray-800 text-sm text-justify mt-4 leading-relaxed">
          {profile.bio}
        </p>

        <div className="flex gap-6 mt-4 text-sm">
          {isPublicProfile ? (
            <>
              <button
                type="button"
                onClick={onOpenFollowing}
                className="cursor-pointer hover:underline bg-transparent border-0 p-0 text-[#1B1C1E]"
              >
                {profile.followingCount} Seguidos
              </button>

              <button
                type="button"
                onClick={onOpenFollowers}
                className="cursor-pointer hover:underline bg-transparent border-0 p-0 text-[#1B1C1E]"
              >
                {profile.followersCount} Seguidores
              </button>
            </>
          ) : (
            <>
              <span>{profile.followingCount} Seguidos</span>
              <span>{profile.followersCount} Seguidores</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}