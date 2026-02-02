import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { SSelector, SOption, SLabel } from './styled';

const LanguageSelector: React.FC = () => {
  const { currentLocale, availableLocales, changeLanguage } = useLanguage();

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    changeLanguage(newLocale);
  };

  return (
    <div>
      <SLabel htmlFor="language-selector">
        Language:
      </SLabel>
      <SSelector
        id="language-selector"
        value={currentLocale}
        onChange={handleLanguageChange}
      >
        {availableLocales.map((locale) => (
          <SOption key={locale} value={locale}>
            {GoogleSheetsService.getLocaleDisplayName(locale)}
          </SOption>
        ))}
      </SSelector>
    </div>
  );
};

export default LanguageSelector;
