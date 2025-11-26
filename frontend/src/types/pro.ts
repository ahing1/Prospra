export type CoachMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProjectCoachRequest = {
  project_title: string;
  project_summary: string;
  tech_stack: string[];
  stage?: string | null;
  user_message: string;
  history: CoachMessage[];
};

export type ProjectCoachResponse = {
  message: string;
  next_steps: string[];
  questions: string[];
};
