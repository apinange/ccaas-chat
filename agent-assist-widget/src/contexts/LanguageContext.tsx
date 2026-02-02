import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import i18n from 'i18next';
import { GoogleSheetsService, UserData } from '../services/googleSheetsService';

interface LanguageContextType {
  currentLocale: string;
  availableLocales: string[];
  userData: UserData | null;
  changeLanguage: (locale: string) => void;
  loadUserData: (ani: string) => Promise<void>;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLocale, setCurrentLocale] = useState<string>('pt-BR');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const availableLocales = GoogleSheetsService.getAvailableLocales();

  // Load user data and set locale based on user information
  const loadUserData = async (ani: string) => {
    setIsLoading(true);
    try {
      const data = await GoogleSheetsService.getUserByANI(ani);
      if (data && data.locale) {
        setUserData(data);
        changeLanguage(data.locale);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Change language
  const changeLanguage = (locale: string) => {
    setCurrentLocale(locale);
    if (i18n.isInitialized) {
      i18n.changeLanguage(locale).then(() => {
        // Update HTML title and meta tags
        updateHTMLMetaTags(locale);
      });
    }
    localStorage.setItem('i18nextLng', locale);
  };

  // Update HTML title and meta tags based on language
  const updateHTMLMetaTags = (locale: string) => {
    const translations = i18n.getResourceBundle(locale, 'translation');
    if (translations && translations.app) {
      document.title = translations.app.title || 'Agent Assist';
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && translations.app.description) {
        metaDescription.setAttribute('content', translations.app.description);
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = locale;
    }
  };

  // Wait for i18n to be initialized, then detect language from URL locale parameter
  useEffect(() => {
    const initializeLanguage = () => {
      if (i18n.isInitialized) {
        const urlParams = new URLSearchParams(window.location.search);
        const localeParam = urlParams.get('locale');
        
              if (localeParam && availableLocales.includes(localeParam)) {
                changeLanguage(localeParam);
              } else {
                // Use default language if no locale parameter or invalid locale
                changeLanguage('pt-BR');
              }
      } else {
        // Wait for i18n to be ready
        setTimeout(initializeLanguage, 100);
      }
    };
    
    initializeLanguage();
  }, []);

  const value: LanguageContextType = {
    currentLocale,
    availableLocales,
    userData,
    changeLanguage,
    loadUserData,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      <div key={currentLocale}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
