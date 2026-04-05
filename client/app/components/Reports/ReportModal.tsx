import { Modal, Select, Input, message } from 'antd';
import { useTranslation } from 'react-i18next';
import { reportsApi } from '../../services/reportsService';
import { useState } from 'react';
import "./reportModal.css";

interface ReportModalProps {
  open: boolean;
  postId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const reportReasons = ['Spam', 'Harassment', 'HateSpeech', 'Nudity', 'Violence', 'Copyright', 'Misinformation', 'Other'];

export default function ReportModal({ open, postId, onClose, onSuccess }: ReportModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      message.warning(t('post.report_reason_required'));
      return;
    }
    setSubmitting(true);
    try {
      await reportsApi.reportPost(postId, { reason, details: details || null });
      message.success(t('post.report_success'));
      onSuccess?.();
      onClose();
      setReason('');
      setDetails('');
    } catch {
      message.error(t('post.report_error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      footer={null}
      onCancel={onClose}
      centered
      width={650}
      className="custom-report-modal"
      styles={{ body: { padding: 0, background: 'transparent' } }}
      maskClosable={true}
    >
      <div className="bg-[#E8F1FC] rounded-[9px] outline outline-2 outline-[#8F8E8A] p-6">
        <h2 className="text-[26px] font-medium text-[#1B1C1E] leading-7 mb-6">
          {t('post.report_title')}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1B1C1E] mb-2">
              {t('post.report_reason')}
            </label>
            <Select
              placeholder={t('post.report_reason_placeholder')}
              value={reason || undefined}
              onChange={setReason}
              options={reportReasons.map(r => ({ value: r, label: t(`post.report_reason_${r.toLowerCase()}`) || r }))}
              className="w-full h-14 [&_.ant-select-selector]:!h-14 [&_.ant-select-selector]:!bg-[#F3F3F1] [&_.ant-select-selector]:!border-2 [&_.ant-select-selector]:!border-[#1B1C1E] [&_.ant-select-selector]:!rounded-[10px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1B1C1E] mb-2">
              {t('post.report_details')}
            </label>
            <Input.TextArea
              rows={4}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder={t('post.report_details_placeholder')}
              className="bg-[#F3F3F1] border-2 border-[#1B1C1E] rounded-[10px] p-4 text-base placeholder:text-[#8F8E8A]"
            />
          </div>

          <div className="flex justify-end gap-6 pt-4">
            <button
              onClick={onClose}
              className="px-5 py-1.5 bg-[#E3E2DE] rounded-[7px] border border-[#AB1313] text-[#AB1313] text-sm font-medium hover:bg-opacity-80 transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-1.5 bg-[#0B5107] rounded-[7px] border border-[#1B1C1E] text-[#E3E2DE] text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {submitting ? t('common.saving') : t('post.report_submit')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}