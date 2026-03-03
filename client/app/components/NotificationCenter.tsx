// components/NotificationCenter.tsx
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../contexts/NotificationContext.tsx';
import { useI18n } from '../contexts/I18nContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/es';
import 'dayjs/locale/en';

// Extender dayjs con el plugin de tiempo relativo
dayjs.extend(relativeTime);

// Mapa de idiomas (ajusta según tus códigos)
const localeMap = {
  es: 'es',
  en: 'en',
};

export default function NotificationCenter() {
  const { t } = useTranslation();
  const { language } = useI18n(); // 'es' o 'en'
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  // Cambiar el locale de dayjs según el idioma actual
  const currentLocale = localeMap[language as keyof typeof localeMap] || 'en';
  dayjs.locale(currentLocale);

  return (
    <div className="w-[529px] bg-[#E8F1FC] rounded-[13px] outline outline-2 outline-[#8F8E8A] outline-offset-[-2px] flex flex-col items-center overflow-hidden">
      {/* Header */}
      <div className="self-stretch pb-7 px-6 flex justify-center items-center gap-2.5">
        <div className="flex-1 text-[#1B1C1E] text-3xl font-barlow font-medium leading-[39px]">
          {t('notifications.title')}
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px outline outline-1 outline-[#8F8E8A] outline-offset-[-0.5px]" />

      {/* Lista de notificaciones */}
      <div className="self-stretch max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-[#1B1C1E] text-sm font-inter">
            {t('notifications.empty')}
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="self-stretch px-6 py-2 bg-[#E8F1FC] border-t border-b border-[#8F8E8A] flex flex-col justify-center items-start gap-2 cursor-pointer hover:bg-[#d0e2f5] transition-colors"
              onClick={() => markAsRead(notif.id)}
            >
              <div className="self-stretch text-justify text-[#1B1C1E] text-sm font-barlow font-medium leading-5">
                {notif.content}
              </div>
              <div className="text-center text-[#1B1C1E] text-xs font-inter font-medium leading-5">
                {dayjs(notif.createdAt).fromNow()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer con acción de marcar todas como leídas (solo si hay notificaciones) */}
      {notifications.length > 0 && (
        <>
          <div className="w-full h-px outline outline-1 outline-[#8F8E8A]" />
          <div className="self-stretch p-3 flex justify-end">
            <button
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={markAllAsRead}
            >
              {t('notifications.mark_all_read')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}