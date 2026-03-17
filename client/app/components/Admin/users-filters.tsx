import { Input, Select, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { UsersQueryParams } from '@/services/admin/usersService';

interface UsersFiltersProps {
  filters: UsersQueryParams;
  onFilterChange: (newFilters: Partial<UsersQueryParams>) => void;
}

export function UsersFilters({ filters, onFilterChange }: UsersFiltersProps) {
  const { t } = useTranslation();

  // Debounce search to avoid too many requests
  const handleSearch = (value: string) => {
    onFilterChange({ search: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder={t('users.searchPlaceholder')}
        prefix={<SearchOutlined className="text-[#8F8E8A]" />}
        className="flex-1"
        value={filters.search}
        onChange={(e) => handleSearch(e.target.value)}
        allowClear
        style={{
          background: '#F3F3F1',
          borderColor: 'rgba(143, 142, 138, 0.5)',
          borderRadius: 8,
          height: 40,
        }}
      />

      <Select
        placeholder={t('users.allRoles')}
        style={{ width: 140, height: 40 }}
        value={filters.role || 'all'}
        onChange={(value) => onFilterChange({ role: value === 'all' ? undefined : value })}
        options={[
          { value: 'all', label: t('users.allRoles') },
          { value: 'Artist', label: t('users.artist') },
          { value: 'Admin', label: t('users.admin') },
        ]}
      />

      <Select
        placeholder={t('users.allStatus')}
        style={{ width: 140, height: 40 }}
        value={filters.status || 'all'}
        onChange={(value) => onFilterChange({ status: value === 'all' ? undefined : value })}
        options={[
          { value: 'all', label: t('users.allStatus') },
          { value: '1', label: t('users.active') }, // adjust numeric values based on your API
          { value: '0', label: t('users.suspended') },
        ]}
      />

      <Button
        icon={<FilterOutlined />}
        style={{
          background: '#F3F3F1',
          borderColor: 'rgba(143, 142, 138, 0.5)',
          height: 40,
          width: 40,
        }}
        onClick={() => onFilterChange({ search: '', role: undefined, status: undefined })}
      />
    </div>
  );
}