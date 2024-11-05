import { t } from 'i18next';

export const  sessionTypeFunc = (sessionType: string) => {
    const translated1on1 = t('1on1');  // Translation for "1on1"
    return sessionType === translated1on1 ? '1on1' : 'group';
};