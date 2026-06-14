export const THEMES = {
    ekonomika: ['Energetika', 'Trhy', 'Banky', 'Veřejné finance', 'Průmysl', 'Municipality', 'Obchod'],
    politika:  ['Vláda', 'Strany', 'Zahraničí', 'Obrana', 'Volby', 'Sněmovna'],
  } as const
  
  export const THEME_FALLBACK = 'Různé'
  
  export type Rubric = keyof typeof THEMES