// Google Sheets API integration service
// This service will fetch user data from the Google Spreadsheet

export interface UserData {
  ani: string;
  userId: string;
  name: string;
  age: number;
  gender: string;
  address: string;
  crmData: string;
  demoDomain: string;
  voiceBiometrics: boolean;
  blacklisting: boolean;
  trustLevel: number;
  transcription: boolean;
  suggestions: boolean;
  summary: boolean;
  notes: boolean;
  cxoneAgent: string;
  locale?: string; // This will be determined based on domain or other criteria
}

export interface LocaleMapping {
  [domain: string]: string;
}

// Domain to locale mapping based on your spreadsheet
const DOMAIN_LOCALE_MAPPING: LocaleMapping = {
  'banking': 'en',      // Default to English for banking
  'carmax': 'en',       // Default to English for carmax
  'hsbc': 'en',         // Default to English for HSBC
  'ukfs': 'en',         // Default to English for UKFS
  // Add more mappings as needed
  'default': 'en'
};

export class GoogleSheetsService {
  private static readonly SPREADSHEET_ID = '1Dcm1E-RD3K1DRGtsQNhF-o-c2IeaoBupEq6g7h56fxY';
  private static readonly API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';

  /**
   * Get user data by ANI (phone number)
   */
  static async getUserByANI(ani: string): Promise<UserData | null> {
    try {
      // For now, we'll use mock data based on your spreadsheet
      // In production, you would integrate with Google Sheets API
      const mockUsers = this.getMockUserData();
      const user = mockUsers.find(u => u.ani === ani);
      
      if (user) {
        // Use locale from mock data if available, otherwise determine from domain
        if (!user.locale) {
          user.locale = this.determineLocale(user.demoDomain);
        }
        return user;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Determine locale based on domain and other criteria
   */
  private static determineLocale(domain: string): string {
    // You can implement more sophisticated logic here
    // For example, based on domain, customer type, or other factors
    
    if (domain.includes('br') || domain.includes('brazil')) {
      return 'pt-BR';
    }
    
    if (domain.includes('mx') || domain.includes('mexico') || domain.includes('es')) {
      return 'es-US';
    }
    
    return DOMAIN_LOCALE_MAPPING[domain] || DOMAIN_LOCALE_MAPPING['default'];
  }

  /**
   * Mock user data based on your spreadsheet
   * In production, replace this with actual Google Sheets API calls
   */
  private static getMockUserData(): UserData[] {
    return [
      {
        ani: '306946427719',
        userId: 'user1',
        name: 'Angelos Georgaras',
        age: 35,
        gender: 'male',
        address: 'Kasaba 37, Kaisariani',
        crmData: 'TRUE',
        demoDomain: 'FALSE',
        voiceBiometrics: false,
        blacklisting: true,
        trustLevel: 0,
        transcription: false,
        suggestions: false,
        summary: true,
        notes: true,
        cxoneAgent: 'Angelos Georgaras'
      },
      {
        ani: '2106930664',
        userId: 'zab4',
        name: 'Dimitris Zab',
        age: 45,
        gender: 'male',
        address: 'Athens',
        crmData: 'Customer Type = SILVER, product=23342',
        demoDomain: 'carmax',
        voiceBiometrics: true,
        blacklisting: false,
        trustLevel: 0,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true,
        cxoneAgent: ''
      },
      {
        ani: '13134029489',
        userId: 'ca1',
        name: 'Chris Adomaitis',
        age: 30,
        gender: 'male',
        address: '123 Main Street, Farmington Hills, MI 48336',
        crmData: 'Customer Type = GOLDEN, email = cadomaitis@omilia.com, product = 2022 Sonata',
        demoDomain: 'banking',
        voiceBiometrics: true,
        blacklisting: false,
        trustLevel: 400,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true,
        cxoneAgent: 'Rob Brame'
      },
      {
        ani: '302106930664',
        userId: 'dm1',
        name: 'Dimitris Tsarouhas',
        age: 35,
        gender: 'male',
        address: 'Athens',
        crmData: 'Name = Brooke Walton, email = bwalton@omilia.com',
        demoDomain: 'ukfs',
        voiceBiometrics: true,
        blacklisting: true,
        trustLevel: 400,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true,
        cxoneAgent: 'Dimitris Tsarouhas'
      },
      // Test data for different locales
      {
        ani: '5511999999999',
        userId: 'br1',
        name: 'João Silva',
        age: 28,
        gender: 'male',
        address: 'São Paulo, Brasil',
        crmData: 'Customer Type = GOLDEN, email = joao@example.com',
        demoDomain: 'banking',
        voiceBiometrics: true,
        blacklisting: false,
        trustLevel: 300,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true,
        cxoneAgent: 'João Silva',
        locale: 'pt-BR'
      },
      {
        ani: '5215555555555',
        userId: 'mx1',
        name: 'María García',
        age: 32,
        gender: 'female',
        address: 'Ciudad de México, México',
        crmData: 'Customer Type = SILVER, email = maria@example.com',
        demoDomain: 'banking',
        voiceBiometrics: true,
        blacklisting: false,
        trustLevel: 200,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true,
        cxoneAgent: 'María García',
        locale: 'es-US'
      },
      {
        ani: '5511888888888',
        userId: 'br2',
        name: 'Ana Costa',
        age: 25,
        gender: 'female',
        address: 'Rio de Janeiro, Brasil',
        crmData: 'Customer Type = BRONZE, email = ana@example.com',
        demoDomain: 'hsbc',
        voiceBiometrics: false,
        blacklisting: false,
        trustLevel: 100,
        transcription: false,
        suggestions: false,
        summary: true,
        notes: false,
        cxoneAgent: 'Ana Costa',
        locale: 'pt-BR'
      }
    ];
  }

  /**
   * Get all available locales
   */
  static getAvailableLocales(): string[] {
    return ['en', 'pt-BR', 'es-US'];
  }

  /**
   * Get locale display name
   */
  static getLocaleDisplayName(locale: string): string {
    const displayNames: { [key: string]: string } = {
      'en': 'English',
      'pt-BR': 'Português (Brasil)',
      'es-US': 'Español (Estados Unidos)'
    };
    
    return displayNames[locale] || locale;
  }
}
