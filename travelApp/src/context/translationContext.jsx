import React, { createContext, useContext, useState } from "react";
import { translateText } from "../services/translationService";

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState({});

  const translatePage = async (content) => {
    const translatedContent = {};
    for (const key in content) {
      translatedContent[key] = await translateText(content[key], language);
    }
    setTranslations(translatedContent);
  };

  return (
    <TranslationContext.Provider value={{ translations, translatePage, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
