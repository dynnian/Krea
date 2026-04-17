// components/Admin/reports-moderation-table.tsx

import { useState, useEffect } from 'react';
import { Table, Tag, Button, Select, Space, Modal, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { getPostReports, evaluateReport } from '@/services/admin/reportsService';
import type {
  AdminPostModerationReportDto,
  PostModerationDecisionAction,
} from '@/types/admin';

const { Option } = Select;
const { TextArea } = Input;

const decisionActions: { value: PostModerationDecisionAction; labelKey: string; color: string }[] = [
  { value: 'Dismiss', labelKey: 'reports.decisionDismiss', color: 'default' },
  { value: 'DeletePost', labelKey: 'reports.decisionDeletePost', color: 'red' },
  { value: 'SuspendAuthor', labelKey: 'reports.decisionSuspendAuthor', color: 'orange' },
];

const getStatusInfo = (
  status: number, // 1 = Pending, 2 = Resolved
  resolvedAction: PostModerationDecisionAction | null,
  t: (key: string) => string
): { text: string; color: string } => {
  if (status === 1) {
    return { text: t('reports.statusPending'), color: 'gold' };
  }
  if (resolvedAction === 'Dismiss') return { text: t('reports.statusDismissed'), color: 'default' };
  if (resolvedAction === 'DeletePost') return { text: t('reports.statusDeleted'), color: 'red' };
  if (resolvedAction === 'SuspendAuthor') return { text: t('reports.statusSuspended'), color: 'orange' };
  return { text: t('reports.statusResolved'), color: 'blue' };
};

export function ReportsModerationTable() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<AdminPostModerationReportDto[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Resolved' | undefined>('Pending');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentReport, setCurrentReport] = useState<AdminPostModerationReportDto | null>(null);
  const [decision, setDecision] = useState<PostModerationDecisionAction>('Dismiss');
  const [moderatorNote, setModeratorNote] = useState('');

  const fetchReports = async (page: number, pageSize: number, status?: 'Pending' | 'Resolved') => {
    setLoading(true);
    try {
      const data = await getPostReports({ status, page, pageSize });
      setReports(data.items);
      setPagination({
        current: data.page,
        pageSize: data.pageSize,
        total: data.totalCount,
      });
    } catch (error) {
      console.error(error);
      message.error(t('reports.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(pagination.current, pagination.pageSize, statusFilter);
  }, [statusFilter, pagination.current, pagination.pageSize]);

  const handleTableChange = (paginationParams: any) => {
    fetchReports(paginationParams.current, paginationParams.pageSize, statusFilter);
  };

  const handleStatusFilterChange = (value: 'Pending' | 'Resolved' | undefined) => {
    setStatusFilter(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const openEvaluationModal = (record: AdminPostModerationReportDto) => {
    setCurrentReport(record);
    setDecision('Dismiss');
    setModeratorNote('');
    setModalVisible(true);
  };

  const handleEvaluate = async () => {
    if (!currentReport) return;
    try {
      await evaluateReport(currentReport.id, { 
        action: decision,   // ← Usar 'action' en lugar de 'decision'
        moderatorNote: moderatorNote || undefined 
      });
      message.success(t('reports.evaluateSuccess'));
      setModalVisible(false);
      fetchReports(pagination.current, pagination.pageSize, statusFilter);
    } catch (error) {
      console.error(error);
      message.error(t('reports.evaluateError'));
    }
  };

  const columns = [
    {
      title: t('reports.post'),
      dataIndex: 'postTitle',
      key: 'postTitle',
    },
    {
      title: t('reports.reportedBy'),
      dataIndex: 'reporterDisplayName',
      key: 'reporterDisplayName',
    },
    {
      title: t('reports.reason'),
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: t('reports.details'),
      dataIndex: 'details',
      key: 'details',
      ellipsis: true,
      render: (details: string) => details || '—',
    },
    {
      title: t('reports.status'),
      key: 'status',
      render: (_: any, record: AdminPostModerationReportDto) => {
        const { text, color } = getStatusInfo(record.status, record.resolvedAction, t);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: t('reports.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('common.actions'),
      key: 'actions',
      render: (_: any, record: AdminPostModerationReportDto) => {
        if (record.status !== 1) {
          return <span className="text-gray-400">{t('reports.alreadyReviewed')}</span>;
        }
        return (
          <Button type="primary" size="small" onClick={() => openEvaluationModal(record)}>
            {t('reports.review')}
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Space>
          <span>{t('reports.filterByStatus')}:</span>
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            allowClear
            placeholder={t('reports.allStatus')}
            style={{ width: 150 }}
          >
            <Option value="Pending">{t('reports.statusPending')}</Option>
            <Option value="Resolved">{t('reports.statusResolved')}</Option>
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={reports}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `${t('common.total')} ${total} ${t('common.items')}`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title={t('reports.evaluateReport')}
        open={modalVisible}
        onOk={handleEvaluate}
        onCancel={() => setModalVisible(false)}
        okText={t('common.submit')}
        cancelText={t('common.cancel')}
      >
        <div className="space-y-4">
          <div><strong>{t('reports.post')}:</strong> {currentReport?.postTitle}</div>
          <div><strong>{t('reports.reason')}:</strong> {currentReport?.reason}</div>
          <div><strong>{t('reports.details')}:</strong> {currentReport?.details || '—'}</div>
          <div>
            <label className="block mb-1">{t('reports.decision')}</label>
            <Select value={decision} onChange={setDecision} style={{ width: '100%' }}>
              {decisionActions.map((action) => (
                <Option key={action.value} value={action.value}>
                  <span style={{ color: action.color === 'red' ? '#ff4d4f' : action.color === 'orange' ? '#fa8c16' : undefined }}>
                    {t(action.labelKey)}
                  </span>
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block mb-1">{t('reports.moderatorNote')}</label>
            <TextArea
              rows={3}
              value={moderatorNote}
              onChange={(e) => setModeratorNote(e.target.value)}
              placeholder={t('reports.moderatorNotePlaceholder')}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}