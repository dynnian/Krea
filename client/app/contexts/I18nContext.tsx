import { createContext, useContext, useState } from 'react'
import i18n from '../i18n/index.ts'

const I18nContext = createContext(null)

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language)

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
    setLanguage(lang)
  }

  return (
    <I18nContext.Provider value={{ language, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext)
