import axios from "axios";

const API_URL = "https://libretranslate.de/translate"; // URL de l'API LibreTranslate

export const translateText = async (text, targetLang) => {
  try {
    const response = await axios.post(
      API_URL,
      {
        q: text,
        source: "auto", // Détection automatique de la langue
        target: targetLang, // Langue cible
        format: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.translatedText;
  } catch (error) {
    console.error("Erreur de traduction :", error);
    return text; // Retourne le texte original en cas d'erreur
  }
};
