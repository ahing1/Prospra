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

export type StarDimensionStatus = "strong" | "okay" | "light" | "missing";

export type StarDimensionFeedback = {
  status: StarDimensionStatus;
  note: string;
};

export type StarFeedback = {
  situation: StarDimensionFeedback;
  task: StarDimensionFeedback;
  action: StarDimensionFeedback;
  result: StarDimensionFeedback;
};

export type BehavioralFeedback = {
  summary: string;
  star: StarFeedback;
  strengths: string[];
  improvements: string[];
  next_practice?: string | null;
  score: number;
};

export type BehavioralAssistantTurnResponse = {
  question: string;
  follow_up: string;
  question_index: number;
  total_questions: number;
  feedback?: BehavioralFeedback | null;
};

export type BehavioralAssistantTurnRequest = {
  job_description: string;
  role: string;
  seniority?: string | null;
  focus_areas?: string[];
  target_questions?: number;
  answer?: string | null;
  previous_questions?: string[];
};

export type TranscriptionResponse = { text: string };
