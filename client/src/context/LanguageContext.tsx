import React, { createContext, useState, useContext } from 'react';

export type Language = 'en' | 'hi' | 'te' | 'ta' | 'kn' | 'ml';

const translations = {
  en: {
    brand: "TripEase",
    home: "Home",
    flights: "Flights",
    trains: "Trains",
    buses: "Buses",
    offers: "Offers",
    myBookings: "My Bookings",
    support: "Support",
    login: "Login",
    register: "Register",
    logout: "Logout",
    search: "Search",
    from: "From",
    to: "To",
    depDate: "Departure Date",
    retDate: "Return Date (Optional)",
    passengers: "Passengers",
    travelClass: "Travel Class",
    popularDestinations: "Popular Destinations",
    whyUs: "Why Choose Us",
    lowestPrices: "Lowest Prices",
    securePayments: "Secure Payments",
    instantBooking: "Instant Booking",
    liveTracking: "Live Status Tracking",
    aiAssistant: "AI Travel Assistant",
  },
  hi: {
    brand: "ट्रिपईज़",
    home: "मुख्य पृष्ठ",
    flights: "उड़ानें",
    trains: "ट्रेनें",
    buses: "बसें",
    offers: "ऑफ़र",
    myBookings: "मेरी बुकिंग",
    support: "सहायता",
    login: "लॉगिन",
    register: "पंजीकरण",
    logout: "लॉगआउट",
    search: "खोजें",
    from: "कहाँ से",
    to: "कहाँ तक",
    depDate: "प्रस्थान तिथि",
    retDate: "वापसी तिथि (वैकल्पिक)",
    passengers: "यात्री",
    travelClass: "यात्रा श्रेणी",
    popularDestinations: "लोकप्रिय गंतव्य",
    whyUs: "हमें क्यों चुनें",
    lowestPrices: "न्यूनतम मूल्य",
    securePayments: "सुरक्षित भुगतान",
    instantBooking: "त्वरित बुकिंग",
    liveTracking: "लाइव स्थिति",
    aiAssistant: "एआई सहायक",
  },
  te: {
    brand: "ట్రిప్ఈజ్",
    home: "హోమ్",
    flights: "విమానాలు",
    trains: "రైళ్లు",
    buses: "బస్సులు",
    offers: "ఆఫర్లు",
    myBookings: "నా బుకింగ్స్",
    support: "సహాయం",
    login: "లాగిన్",
    register: "రిజిస్టర్",
    logout: "లాగ్అవుట్",
    search: "వెతకండి",
    from: "ఎక్కడి నుండి",
    to: "ఎక్కడికి",
    depDate: "ప్రయాణ తేదీ",
    retDate: "తిరుగు ప్రయాణ తేదీ (ఆప్షనల్)",
    passengers: "ప్రయాణీకులు",
    travelClass: "ప్రయాణ క్లాస్",
    popularDestinations: "ప్రసిద్ధ గమ్యస్థానాలు",
    whyUs: "మమ్మల్ని ఎందుకు ఎంచుకోవాలి",
    lowestPrices: "అతి తక్కువ ధరలు",
    securePayments: "సురక్షిత చెల్లింపులు",
    instantBooking: "తక్షణ బుకింగ్",
    liveTracking: "లైవ్ ట్రాకింగ్",
    aiAssistant: "AI అసిస్టెంట్",
  },
  ta: {
    brand: "டிரிப்ஈஸ்",
    home: "முகப்பு",
    flights: "விமானங்கள்",
    trains: "ரயில்கள்",
    buses: "பேருந்துகள்",
    offers: "சலுகைகள்",
    myBookings: "எனது பதிவுகள்",
    support: "உதவி",
    login: "உள்நுழை",
    register: "பதிவு செய்",
    logout: "வெளியேறு",
    search: "தேடுக",
    from: "எங்கிருந்து",
    to: "எங்கு வரை",
    depDate: "புறப்படும் தேதி",
    retDate: "திரும்பும் தேதி (விருப்பத்தேர்வு)",
    passengers: "பயணிகள்",
    travelClass: "பயண வகுப்பு",
    popularDestinations: "பிரபலமான இடங்கள்",
    whyUs: "ஏன் எங்களை தேர்வு செய்ய வேண்டும்",
    lowestPrices: "மிகக் குறைந்த விலைகள்",
    securePayments: "பாதுகாப்பான கொடுப்பனவுகள்",
    instantBooking: "உடனடி முன்பதிவு",
    liveTracking: "நேரடி கண்காணிப்பு",
    aiAssistant: "AI உதவியாளர்",
  },
  kn: {
    brand: "ಟ್ರಿಪ್ಈಸ್",
    home: "ಹೋಮ್",
    flights: "ವಿಮಾನಗಳು",
    trains: "ರೈಲುಗಳು",
    buses: "ಬಸ್ಸುಗಳು",
    offers: "ಕೊಡುಗೆಗಳು",
    myBookings: "ನನ್ನ ಬುಕಿಂಗ್ಸ್",
    support: "ಬೆಂಬಲ",
    login: "ಲಾಗಿನ್",
    register: "ನೋಂದಣಿ",
    logout: "ಲಾಗ್ಔಟ್",
    search: "ಹುಡುಕಿ",
    from: "ಎಲ್ಲಿಂದ",
    to: "ಎಲ್ಲಿಗೆ",
    depDate: "ಪ್ರಯಾಣದ ದಿನಾಂಕ",
    retDate: "ಮರಳುವ ದಿನಾಂಕ (ಐಚ್ಛಿಕ)",
    passengers: "ಪ್ರಯಾಣಿಕರು",
    travelClass: "ಪ್ರಯಾಣ ವರ್ಗ",
    popularDestinations: "ಜನಪ್ರಿಯ ಸ್ಥಳಗಳು",
    whyUs: "ನಮ್ಮನ್ನು ಏಕೆ ಆರಿಸಬೇಕು",
    lowestPrices: "ಕಡಿಮೆ ದರಗಳು",
    securePayments: "ಸುರಕ್ಷಿತ ಪಾವತಿಗಳು",
    instantBooking: "ತ್ವರಿತ ಬುಕಿಂಗ್",
    liveTracking: "ಲೈವ್ ಟ್ರ್ಯಾಕಿಂಗ್",
    aiAssistant: "AI ಸಹಾಯಕ",
  },
  ml: {
    brand: "ട്രിപ്പ്ഈസ്",
    home: "ഹോം",
    flights: "വിമാനങ്ങൾ",
    trains: "ട്രെയിനുകൾ",
    buses: "ബസുകൾ",
    offers: "ഓഫറുകൾ",
    myBookings: "എന്റെ ബുക്കിംഗുകൾ",
    support: "സഹായം",
    login: "ലോഗിൻ",
    register: "രജിസ്റ്റർ",
    logout: "ലോഗ്ഔട്ട്",
    search: "തിരയുക",
    from: "എവിടെ നിന്ന്",
    to: "എങ്ങോട്ട്",
    depDate: "യാത്രാ തീയതി",
    retDate: "തിരിച്ചുപോകുന്ന തീയതി (ഓപ്ഷണൽ)",
    passengers: "യാത്രക്കാർ",
    travelClass: "യാത്രാ ക്ലാസ്",
    popularDestinations: "ജനപ്രിയ സ്ഥലങ്ങൾ",
    whyUs: "എന്തുകൊണ്ട് ഞങ്ങളെ തിരഞ്ഞെടുക്കണം",
    lowestPrices: "കുറഞ്ഞ നിരക്കുകൾ",
    securePayments: "സുരക്ഷിത പെയ്‌മെന്റുകൾ",
    instantBooking: "ഉടൻ ബുക്കിംഗ്",
    liveTracking: "തത്സമയ വിവരങ്ങൾ",
    aiAssistant: "AI സഹായി",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tripease_lang');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tripease_lang', lang);
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[language][key] || translations['en'][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
