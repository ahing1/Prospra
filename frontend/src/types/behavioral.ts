export type BehavioralQuestion = {
  question: string;
  why_it_matters: string;
  coaching_points: string[];
  signals: string[];
};

export type BehavioralInterviewResponse = {
  role: string;
  seniority?: string | null;
  questions: BehavioralQuestion[];
};
