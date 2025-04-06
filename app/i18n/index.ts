import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";

// Import all translation files
import en from "./locales/en.json";
import es from "./locales/es.json";
import tr from "./locales/tr.json";
import de from "./locales/de.json";

// Define available languages
export const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "tr", name: "Türkçe" },
  { code: "de", name: "Deutsch" },
];

// Get the device language
const deviceLanguage = Localization.locale.split("-")[0];

// Check if the device language is supported, otherwise default to English
const defaultLanguage = languages.some((lang) => lang.code === deviceLanguage)
  ? deviceLanguage
  : "en";

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    tr: { translation: tr },
    de: { translation: de },
  },
  lng: defaultLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Function to change language
export const changeLanguage = async (languageCode: string) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem("userLanguage", languageCode);
  } catch (error) {
    console.error("Error changing language:", error);
  }
};

// Function to initialize language from storage
export const initializeLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem("userLanguage");
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Error initializing language:", error);
  }
};

export default i18n;
