import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'mr' | 'tl' | 'id' | 'vi' | 'ko' | 'ja' | 'pt' | 'es' | 'de' | 'fr';

interface SettingsContextType {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Language display names and flags
export const languageOptions: { code: Language; name: string; flag: string; country: string }[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', country: 'United States' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳', country: 'India' },
  { code: 'tl', name: 'Filipino', flag: '🇵🇭', country: 'Philippines' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', country: 'Indonesia' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', country: 'Vietnam' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', country: 'South Korea' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', country: 'Japan' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', country: 'Brazil' },
  { code: 'es', name: 'Español', flag: '🇲🇽', country: 'Mexico' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', country: 'Germany' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', country: 'France' },
];

const translations: Record<Language, Record<string, string>> = {
  en: {
    settings: 'Settings',
    profile: 'Profile',
    appearance: 'Appearance',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    themeDescription: 'Switch between light and dark appearance',
    notifications: 'Notifications',
    pushNotifications: 'Push Notifications',
    notificationsDescription: 'Receive notifications about activity on your posts',
    language: 'Language',
    languageDescription: 'Choose your preferred language',
    about: 'About',
    appVersion: 'App Version',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    logout: 'Logout',
    logoutDescription: 'Sign out of your account',
  },
  mr: {
    settings: 'सेटिंग्ज',
    profile: 'प्रोफाइल',
    appearance: 'दृश्य',
    theme: 'थीम',
    darkMode: 'डार्क मोड',
    lightMode: 'लाइट मोड',
    themeDescription: 'लाइट आणि डार्क थीम मध्ये बदला',
    notifications: 'सूचना',
    pushNotifications: 'पुश सूचना',
    notificationsDescription: 'तुमच्या पोस्टवरील क्रियाकलापांबद्दल सूचना प्राप्त करा',
    language: 'भाषा',
    languageDescription: 'तुमची पसंतीची भाषा निवडा',
    about: 'बद्दल',
    appVersion: 'अॅप आवृत्ती',
    termsOfService: 'सेवा अटी',
    privacyPolicy: 'गोपनीयता धोरण',
    logout: 'लॉगआउट',
    logoutDescription: 'तुमच्या खात्यातून साइन आउट करा',
  },
  tl: {
    settings: 'Mga Setting',
    profile: 'Profile',
    appearance: 'Hitsura',
    theme: 'Tema',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    themeDescription: 'Magpalit sa light at dark na hitsura',
    notifications: 'Mga Notipikasyon',
    pushNotifications: 'Push Notifications',
    notificationsDescription: 'Tumanggap ng mga notipikasyon tungkol sa aktibidad sa iyong mga post',
    language: 'Wika',
    languageDescription: 'Piliin ang iyong gustong wika',
    about: 'Tungkol',
    appVersion: 'Bersyon ng App',
    termsOfService: 'Mga Tuntunin ng Serbisyo',
    privacyPolicy: 'Patakaran sa Privacy',
    logout: 'Mag-logout',
    logoutDescription: 'Mag-sign out sa iyong account',
  },
  id: {
    settings: 'Pengaturan',
    profile: 'Profil',
    appearance: 'Tampilan',
    theme: 'Tema',
    darkMode: 'Mode Gelap',
    lightMode: 'Mode Terang',
    themeDescription: 'Beralih antara tampilan terang dan gelap',
    notifications: 'Notifikasi',
    pushNotifications: 'Notifikasi Push',
    notificationsDescription: 'Terima notifikasi tentang aktivitas pada postingan Anda',
    language: 'Bahasa',
    languageDescription: 'Pilih bahasa yang Anda inginkan',
    about: 'Tentang',
    appVersion: 'Versi Aplikasi',
    termsOfService: 'Ketentuan Layanan',
    privacyPolicy: 'Kebijakan Privasi',
    logout: 'Keluar',
    logoutDescription: 'Keluar dari akun Anda',
  },
  vi: {
    settings: 'Cài đặt',
    profile: 'Hồ sơ',
    appearance: 'Giao diện',
    theme: 'Chủ đề',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    themeDescription: 'Chuyển đổi giữa giao diện sáng và tối',
    notifications: 'Thông báo',
    pushNotifications: 'Thông báo đẩy',
    notificationsDescription: 'Nhận thông báo về hoạt động trên bài đăng của bạn',
    language: 'Ngôn ngữ',
    languageDescription: 'Chọn ngôn ngữ ưa thích của bạn',
    about: 'Giới thiệu',
    appVersion: 'Phiên bản ứng dụng',
    termsOfService: 'Điều khoản dịch vụ',
    privacyPolicy: 'Chính sách bảo mật',
    logout: 'Đăng xuất',
    logoutDescription: 'Đăng xuất khỏi tài khoản của bạn',
  },
  ko: {
    settings: '설정',
    profile: '프로필',
    appearance: '외관',
    theme: '테마',
    darkMode: '다크 모드',
    lightMode: '라이트 모드',
    themeDescription: '라이트와 다크 외관 사이 전환',
    notifications: '알림',
    pushNotifications: '푸시 알림',
    notificationsDescription: '게시물 활동에 대한 알림 받기',
    language: '언어',
    languageDescription: '선호하는 언어를 선택하세요',
    about: '정보',
    appVersion: '앱 버전',
    termsOfService: '서비스 약관',
    privacyPolicy: '개인정보 보호정책',
    logout: '로그아웃',
    logoutDescription: '계정에서 로그아웃',
  },
  ja: {
    settings: '設定',
    profile: 'プロフィール',
    appearance: '外観',
    theme: 'テーマ',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    themeDescription: 'ライトとダークの外観を切り替え',
    notifications: '通知',
    pushNotifications: 'プッシュ通知',
    notificationsDescription: '投稿のアクティビティに関する通知を受け取る',
    language: '言語',
    languageDescription: 'お好みの言語を選択してください',
    about: '概要',
    appVersion: 'アプリバージョン',
    termsOfService: '利用規約',
    privacyPolicy: 'プライバシーポリシー',
    logout: 'ログアウト',
    logoutDescription: 'アカウントからサインアウト',
  },
  pt: {
    settings: 'Configurações',
    profile: 'Perfil',
    appearance: 'Aparência',
    theme: 'Tema',
    darkMode: 'Modo Escuro',
    lightMode: 'Modo Claro',
    themeDescription: 'Alternar entre aparência clara e escura',
    notifications: 'Notificações',
    pushNotifications: 'Notificações Push',
    notificationsDescription: 'Receber notificações sobre atividades em suas postagens',
    language: 'Idioma',
    languageDescription: 'Escolha seu idioma preferido',
    about: 'Sobre',
    appVersion: 'Versão do App',
    termsOfService: 'Termos de Serviço',
    privacyPolicy: 'Política de Privacidade',
    logout: 'Sair',
    logoutDescription: 'Sair da sua conta',
  },
  es: {
    settings: 'Configuración',
    profile: 'Perfil',
    appearance: 'Apariencia',
    theme: 'Tema',
    darkMode: 'Modo Oscuro',
    lightMode: 'Modo Claro',
    themeDescription: 'Cambiar entre apariencia clara y oscura',
    notifications: 'Notificaciones',
    pushNotifications: 'Notificaciones Push',
    notificationsDescription: 'Recibir notificaciones sobre actividad en tus publicaciones',
    language: 'Idioma',
    languageDescription: 'Elige tu idioma preferido',
    about: 'Acerca de',
    appVersion: 'Versión de la App',
    termsOfService: 'Términos de Servicio',
    privacyPolicy: 'Política de Privacidad',
    logout: 'Cerrar sesión',
    logoutDescription: 'Cerrar sesión de tu cuenta',
  },
  de: {
    settings: 'Einstellungen',
    profile: 'Profil',
    appearance: 'Erscheinungsbild',
    theme: 'Thema',
    darkMode: 'Dunkelmodus',
    lightMode: 'Hellmodus',
    themeDescription: 'Zwischen hellem und dunklem Erscheinungsbild wechseln',
    notifications: 'Benachrichtigungen',
    pushNotifications: 'Push-Benachrichtigungen',
    notificationsDescription: 'Benachrichtigungen über Aktivitäten zu Ihren Beiträgen erhalten',
    language: 'Sprache',
    languageDescription: 'Wählen Sie Ihre bevorzugte Sprache',
    about: 'Über',
    appVersion: 'App-Version',
    termsOfService: 'Nutzungsbedingungen',
    privacyPolicy: 'Datenschutzrichtlinie',
    logout: 'Abmelden',
    logoutDescription: 'Von Ihrem Konto abmelden',
  },
  fr: {
    settings: 'Paramètres',
    profile: 'Profil',
    appearance: 'Apparence',
    theme: 'Thème',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    themeDescription: 'Basculer entre apparence claire et sombre',
    notifications: 'Notifications',
    pushNotifications: 'Notifications Push',
    notificationsDescription: 'Recevoir des notifications sur l\'activité de vos publications',
    language: 'Langue',
    languageDescription: 'Choisissez votre langue préférée',
    about: 'À propos',
    appVersion: 'Version de l\'App',
    termsOfService: 'Conditions d\'Utilisation',
    privacyPolicy: 'Politique de Confidentialité',
    logout: 'Déconnexion',
    logoutDescription: 'Se déconnecter de votre compte',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    // Check system preference first, then saved preference
    const saved = localStorage.getItem('creaverse-theme');
    if (saved) {
      return saved as 'dark' | 'light';
    }
    // Default to system preference or dark
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [notificationsEnabled, setNotificationsEnabledState] = useState(() => {
    const saved = localStorage.getItem('creaverse-notifications');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('creaverse-language');
    return (saved as Language) || 'en';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    // Remove existing theme classes
    document.documentElement.classList.remove('dark', 'light');
    
    // Add new theme class
    document.documentElement.classList.add(newTheme);
    
    // Update state and localStorage
    setThemeState(newTheme);
    localStorage.setItem('creaverse-theme', newTheme);
    
    // Force a repaint to ensure theme is applied immediately
    document.documentElement.style.colorScheme = newTheme;
  };

  const setNotificationsEnabled = (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    localStorage.setItem('creaverse-notifications', JSON.stringify(enabled));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('creaverse-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    // Remove any existing theme classes
    document.documentElement.classList.remove('dark', 'light');
    
    // Add the current theme class
    document.documentElement.classList.add(theme);
    
    // Set color scheme for better browser integration
    document.documentElement.style.colorScheme = theme;
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f0f23' : '#ffffff');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#0f0f23' : '#ffffff';
      document.head.appendChild(meta);
    }
  }, [theme]);

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        notificationsEnabled,
        setNotificationsEnabled,
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
