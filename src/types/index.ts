export interface Word {
  en: string;
  zh: string;
}

export interface Description {
  en: string;
  zh: string;
}

export interface AnalysisResult {
  words: Word[];
  description: Description;
} 