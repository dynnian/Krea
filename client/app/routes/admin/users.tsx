// routes/admin/users.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, Spin, Alert, Pagination } from 'antd';
import { useTranslation } from 'react-i18next';
import { UsersTable } from '@/components/Admin/users-table';
import { UsersFilters } from '@/components/Admin/users-filters';
import { getUsers, type UsersQueryParams } from '@/services/admin/usersService';
import type { AdminUsersPageDto } from '@/types/admin';

export default function UsersPage() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminUsersPageDto | null>(null);
  const [filters, setFilters] = useState<UsersQueryParams>({
    page: 1,
    pageSize: 10,
    search: '',
    role: '',
    status: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getUsers(filters);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(t('users.fetchError') || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [filters, t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (newFilters: Partial<UsersQueryParams>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 })); // reset to first page on filter change
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setFilters((prev) => ({ ...prev, page, pageSize: pageSize || prev.pageSize }));
  };

  const handleUserUpdated = () => {
    fetchUsers(); // refresh after any update
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message={t('common.error')}
        description={error}
        type="error"
        showIcon
        className="mb-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#1B1C1E]">{t('users.title')}</h1>
        <p className="text-[#8F8E8A] mt-1">{t('users.subtitle')}</p>
      </div>

      <Card
        title={<span className="text-lg font-medium text-[#1B1C1E]">{t('users.allUsers')}</span>}
        extra={<span className="text-sm text-[#8F8E8A]">{t('users.allUsersDesc')}</span>}
        className="border border-[#8F8E8A]/50 shadow-sm"
      >
        <UsersFilters filters={filters} onFilterChange={handleFilterChange} />
        <div className="mt-6">
          <UsersTable
            data={data?.items || []}
            loading={loading}
            pagination={{
              current: data?.page || 1,
              pageSize: data?.pageSize || 10,
              total: data?.totalCount || 0,
              onChange: handlePageChange,
            }}
            onUserUpdated={handleUserUpdated}
            availableRoles={data?.availableRoles || []}
          />
        </div>
      </Card>
    </div>
  );
}