import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Spin, Alert, Avatar, Button, message } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../services/admin/usersService.ts';
import type { PublicUserProfile } from '../types/api';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const profileRes = await userApi.getProfile(userId);
        setProfile(profileRes.data);
      } catch (err) {
        console.error(err);
        setError(t('profile.load_error'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, t]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      message.warning(t('profile.login_to_follow'));
      navigate('/login');
      return;
    }
    setFollowLoading(true);
    try {
      if (following) {
        await userApi.unfollow(userId!);
        setFollowing(false);
        message.success(t('profile.unfollowed'));
      } else {
        await userApi.follow(userId!);
        setFollowing(true);
        message.success(t('profile.followed'));
      }
    } catch (err) {
      message.error(t('profile.follow_error'));
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('profile.not_found')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Tarjeta de perfil */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar size={96} icon={<UserOutlined />} className="bg-gray-200" />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            <p className="text-gray-500">@{profile.username}</p>
            {profile.biography && (
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{profile.biography}</p>
            )}
            <div className="mt-4">
              {!isOwnProfile && (
                <Button
                  type={following ? 'default' : 'primary'}
                  loading={followLoading}
                  onClick={handleFollow}
                >
                  {following ? t('profile.unfollow') : t('profile.follow')}
                </Button>
              )}
              {isOwnProfile && (
                <Button icon={<EditOutlined />} onClick={() => navigate('/settings')}>
                  {t('profile.edit_profile')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}