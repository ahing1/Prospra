"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";

import api from "@/lib/axios";
import type {
  BehavioralAssistantTurnRequest,
  BehavioralAssistantTurnResponse,
  BehavioralFeedback,
  StarDimensionStatus,
  StarDimensionFeedback,
  TranscriptionResponse,
} from "@/types/behavioral";

type BehavioralInterviewAssistantProps = {
  defaultJobDescription?: string;
  defaultRole?: string;
  defaultSeniority?: string;
};

type InterviewHistoryItem = {
  question: string;
  answer: string;
  follow_up?: string;
  feedback: BehavioralFeedback | null;
  index: number;
};

const focusAreaPresets = [
  "Leadership alignment",
  "Cross-functional collaboration",
  "Ownership and accountability",
  "Working with ambiguity",
  "Stakeholder communication",
  "Conflict navigation",
  "Coaching and mentorship",
  "Influence without authority",
];

const seniorityOptions = ["", "Junior", "Mid", "Senior", "Lead", "Manager", "Director"];

const statusTone: Record<StarDimensionStatus, string> = {
  strong: "text-emerald-200 bg-emerald-500/10 border-emerald-300/40",
  okay: "text-sky-200 bg-sky-500/10 border-sky-300/40",
  light: "text-amber-200 bg-amber-500/10 border-amber-300/40",
  missing: "text-rose-200 bg-rose-500/10 border-rose-300/40",
};

export default function BehavioralInterviewAssistant({
  defaultJobDescription = "",
  defaultRole = "Software Engineer",
  defaultSeniority = "Senior",
}: BehavioralInterviewAssistantProps) {
  const { userId, isLoaded } = useAuth();
  const [jobDescription, setJobDescription] = useState(defaultJobDescription);
  const [role, setRole] = useState(defaultRole);
  const [seniority, setSeniority] = useState(defaultSeniority);
  const [focusAreas, setFocusAreas] = useState<string[]>(["Leadership alignment", "Cross-functional collaboration"]);
  const [targetQuestions, setTargetQuestions] = useState(4);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentFollowUp, setCurrentFollowUp] = useState("");
  const [currentIndex, setCurrentIndex] = useState(1);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const [answer, setAnswer] = useState("");
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSupported, setRecordingSupported] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const extractErrorMessage = (err: any) => {
    const detail = err?.response?.data?.detail ?? err?.response?.data;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      const joined = detail
        .map((item) => (typeof item === "string" ? item : item?.msg || JSON.stringify(item)))
        .filter(Boolean)
        .join("; ");
      if (joined) return joined;
    }
    if (detail && typeof detail === "object") {
      return detail.msg || detail.error || JSON.stringify(detail);
    }
    return (
      err?.message ||
      (err?.response?.status === 402
        ? "This assistant is a Pro feature. Check your plan in Profile."
        : "Something went wrong. Please try again.")
    );
  };

  useEffect(() => {
    setJobDescription(defaultJobDescription);
  }, [defaultJobDescription]);

  useEffect(() => {
    setRole(defaultRole);
  }, [defaultRole]);

  useEffect(() => {
    setSeniority(defaultSeniority);
  }, [defaultSeniority]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const available = typeof MediaRecorder !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
    setRecordingSupported(available);
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleFocusArea = (area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area]));
  };

  const resetSession = () => {
    setHistory([]);
    setPreviousQuestions([]);
    setCurrentQuestion("");
    setCurrentFollowUp("");
    setAnswer("");
    setCurrentIndex(1);
    setError(null);
  };

  const startInterview = async () => {
    const trimmedDescription = jobDescription.trim();
    const trimmedRole = role.trim();
    if (!isLoaded) {
      setError("Loading your session. Try again in a moment.");
      return;
    }
    if (!userId) {
      setError("Sign in to run the behavioral assistant.");
      return;
    }
    if (trimmedDescription.length < 30) {
      setError("Please paste more of the job description (30+ characters).");
      return;
    }
    resetSession();
    setIsLoadingQuestion(true);
    setError(null);

    const payload: BehavioralAssistantTurnRequest = {
      job_description: trimmedDescription,
      role: trimmedRole || "Software Engineer",
      seniority: seniority || null,
      focus_areas: focusAreas.filter(Boolean),
      target_questions: targetQuestions,
      previous_questions: [],
    };

    try {
      const { data } = await api.post<BehavioralAssistantTurnResponse>("/behavioral/assistant/turn", payload, {
        headers: { "X-User-Id": userId },
      });
      setCurrentQuestion(data.question);
      setCurrentFollowUp(data.follow_up);
      setCurrentIndex(data.question_index || 1);
      setPreviousQuestions([data.question]);
    } catch (err: any) {
      console.error("Failed to start behavioral interview", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion) {
      setError("Start the interview to get your first question.");
      return;
    }
    if (isSubmittingAnswer) return;
    if (!isLoaded) {
      setError("Loading your session. Try again in a moment.");
      return;
    }
    if (!userId) {
      setError("Sign in to run the behavioral assistant.");
      return;
    }
    const trimmedAnswer = answer.trim();
    if (trimmedAnswer.length < 12) {
      setError("Add more detail so the assistant can score your STAR coverage.");
      return;
    }

    setIsSubmittingAnswer(true);
    setError(null);

    const payload: BehavioralAssistantTurnRequest = {
      job_description: jobDescription.trim(),
      role: role.trim() || "Software Engineer",
      seniority: seniority || null,
      focus_areas: focusAreas.filter(Boolean),
      target_questions: targetQuestions,
      answer: trimmedAnswer,
      previous_questions: previousQuestions,
    };

    try {
      const { data } = await api.post<BehavioralAssistantTurnResponse>("/behavioral/assistant/turn", payload, {
        headers: { "X-User-Id": userId },
      });
      const answeredTurn: InterviewHistoryItem = {
        question: currentQuestion,
        follow_up: currentFollowUp,
        answer: trimmedAnswer,
        feedback: data.feedback ?? null,
        index: currentIndex,
      };
      setHistory((prev) => [...prev, answeredTurn]);
      const nextQuestion = data.question || currentQuestion;
      setCurrentQuestion(nextQuestion);
      setCurrentFollowUp(data.follow_up);
      setCurrentIndex(data.question_index || currentIndex + 1);
      setPreviousQuestions((prev) => (prev.includes(nextQuestion) ? prev : [...prev, nextQuestion]));
      setAnswer("");
    } catch (err: any) {
      console.error("Failed to score behavioral answer", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const transcribeBlob = async (blob: Blob) => {
    if (!isLoaded) {
      setError("Loading your session. Try again in a moment.");
      return;
    }
    if (!userId) {
      setError("Sign in to run the behavioral assistant.");
      return;
    }
    if (!blob || blob.size === 0) {
      setError("No audio was captured. Try recording again or type your answer.");
      return;
    }
    setIsTranscribing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", blob, "interview-answer.webm");
      const { data } = await api.post<TranscriptionResponse>("/behavioral/assistant/transcribe", formData, {
        headers: { "X-User-Id": userId, "Content-Type": "multipart/form-data" },
      });
      if (data?.text) {
        setAnswer((prev) => (prev ? `${prev}\n${data.text}` : data.text));
      }
    } catch (err: any) {
      console.error("Transcription failed", err);
      setError(extractErrorMessage(err));
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    if (!recordingSupported) {
      setError("Your browser does not support in-app recording. Paste your answer instead.");
      return;
    }
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await transcribeBlob(blob);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone capture failed", err);
      setError("Microphone permission was blocked. Enable it and try again.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
  };

  const reachedTarget = history.length >= targetQuestions;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">Behavioral assistant</p>
          <h2 className="text-2xl font-semibold text-white">Simulate the onsite with feedback</h2>
          <p className="max-w-2xl text-sm text-slate-200">
            Friendly, JD-aware interviewer that asks one question at a time, listens to your answer (text or audio), and scores
            STAR coverage with coaching notes.
          </p>
          <p className="text-xs text-slate-400">Audio is transcribed on the fly and never stored on the server.</p>
        </div>
        <span className="rounded-full border border-sky-200/40 bg-sky-200/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-100">
          Pro
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr,1fr]">
        <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-200">Context</p>
              <h3 className="text-xl font-semibold text-white">Tailor to the company</h3>
              <p className="text-sm text-slate-300">
                Paste the JD so the assistant mirrors their values, stack, and expectations.
              </p>
            </div>
            <button
              type="button"
              onClick={startInterview}
              disabled={isLoadingQuestion}
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoadingQuestion ? "Preparing..." : "Start interview"}
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-200">Job description</label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              rows={6}
              placeholder="Paste responsibilities, values, and role scope..."
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-white placeholder:text-slate-500 focus:border-white/40 focus:outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Role title</label>
              <input
                value={role}
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/90 p-3 text-sm text-slate-900 shadow-inner focus:border-white/40 focus:outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200">Seniority</label>
              <select
                value={seniority}
                onChange={(event) => setSeniority(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/90 p-3 text-sm text-slate-900 shadow-inner focus:border-white/40 focus:outline-none"
              >
                {seniorityOptions.map((option) => (
                  <option key={option || "blank"} value={option}>
                    {option || "Not specified"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-semibold text-slate-200">Focus areas</label>
              <span className="text-xs text-slate-400">Signals to emphasize in the session</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {focusAreaPresets.map((area) => {
                const selected = focusAreas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocusArea(area)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      selected
                        ? "border-sky-200 bg-sky-100 text-slate-900 shadow shadow-sky-400/20"
                        : "border-white/20 bg-white/5 text-slate-200 hover:border-white/40"
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Number of questions</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={2}
                max={8}
                value={targetQuestions}
                onChange={(event) => setTargetQuestions(parseInt(event.target.value, 10))}
                className="flex-1 accent-white"
              />
              <span className="w-12 rounded-2xl border border-white/20 bg-white/10 py-1 text-center text-sm font-semibold text-white">
                {targetQuestions}
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-sky-200/30 bg-sky-200/10 p-6 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-100">Live interview</p>
              <h3 className="text-xl font-semibold text-white">Answer then get STAR feedback</h3>
              <p className="text-sm text-sky-50">
                Questions arrive one by one. Answer in text or record audio, then submit to see strengths and gaps.
              </p>
            </div>
            <div className="rounded-full border border-slate-100/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
              {currentQuestion ? `Q${currentIndex} of ${targetQuestions}` : "Ready"}
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-300/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-50">
              {error}
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-white/15 bg-slate-950/40 p-4 shadow-inner">
            {currentQuestion ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Interview question
                </div>
                <p className="text-lg font-semibold text-white">{currentQuestion}</p>
                <p className="text-sm text-slate-200">Follow-up: {currentFollowUp}</p>
              </>
            ) : (
              <div className="space-y-2 text-sm text-slate-200">
                <p>Start the interview to get your first prompt. The assistant will keep tone friendly and concise.</p>
                <p>Prep tip: jot 2-3 impact stories before you hit record.</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">
              Your answer (text or audio)
            </label>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={5}
              placeholder="Describe the situation, what you owned, what you did, and the result..."
              className="w-full rounded-2xl border border-white/20 bg-white/5 p-3 text-sm text-white placeholder:text-slate-400 focus:border-white/40 focus:outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!recordingSupported || isTranscribing}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  isRecording
                    ? "border-rose-300/50 bg-rose-500/20 text-rose-50"
                    : "border-white/30 bg-white/10 text-white hover:border-white/60"
                } ${!recordingSupported ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {isRecording ? "Stop recording" : "Record answer"}
              </button>
              {isTranscribing && <span className="text-xs text-slate-200">Transcribing audio...</span>}
              <span className="text-xs text-slate-400">
                Keep it concise; transcripts are for feedback only and are not stored.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-200">
              {currentQuestion
                ? `Answer then submit to see STAR coverage for Q${currentIndex}.`
                : "Start the interview to receive a tailored prompt."}
            </div>
            <button
              type="button"
              onClick={submitAnswer}
              disabled={isSubmittingAnswer || !currentQuestion}
              className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                isSubmittingAnswer || !currentQuestion
                  ? "cursor-not-allowed border border-white/20 bg-white/10 text-slate-300"
                  : "border border-white/30 bg-white/10 text-white hover:border-white/60"
              }`}
            >
              {isSubmittingAnswer ? "Scoring..." : "Submit answer for feedback"}
            </button>
          </div>
        </section>
      </div>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-200">Session log</p>
            <h3 className="text-xl font-semibold text-white">STAR feedback for each response</h3>
            <p className="text-sm text-slate-300">
              Track strengths and gaps as you move through the interview. Target: {targetQuestions} questions.
            </p>
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
            {reachedTarget ? "Target met" : `Progress: ${history.length}/${targetQuestions}`}
          </div>
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-4 text-sm text-slate-300">
            Feedback will appear here after you submit an answer. The assistant will adapt follow-ups based on each turn.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <article
                key={`${item.question}-${item.index}`}
                className="space-y-3 rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-inner"
              >
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  <span>Question {item.index}</span>
                  <span>{item.follow_up ? "Follow-up included" : "Primary prompt"}</span>
                </div>
                <p className="text-lg font-semibold text-white">{item.question}</p>
                {item.follow_up && <p className="text-sm text-slate-200">Follow-up: {item.follow_up}</p>}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Your answer</p>
                  <p className="whitespace-pre-line text-white/90">{item.answer}</p>
                </div>
                {item.feedback ? (
                  <div className="space-y-3 rounded-2xl border border-sky-200/30 bg-sky-200/5 p-3 text-slate-50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-100">Feedback</p>
                      <span className="rounded-full border border-sky-200/40 px-3 py-1 text-[11px] font-semibold text-sky-50">
                        STAR score: {item.feedback.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-white/90">{item.feedback.summary}</p>
                    <div className="grid gap-2 md:grid-cols-2">
                      {([
                        ["situation", item.feedback.star.situation],
                        ["task", item.feedback.star.task],
                        ["action", item.feedback.star.action],
                        ["result", item.feedback.star.result],
                      ] as Array<[string, StarDimensionFeedback]>).map(([key, detail]) => (
                        <div
                          key={key}
                          className={`rounded-2xl border px-3 py-2 text-sm font-semibold capitalize ${
                            statusTone[detail.status]
                          }`}
                        >
                          {key}: {detail.note}
                        </div>
                      ))}
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.25em] text-sky-100">Strengths</p>
                        <ul className="space-y-1 text-sm text-slate-50">
                          {item.feedback.strengths.map((strength, index) => (
                            <li
                              key={`${strength}-${index}`}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                            >
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.25em] text-sky-100">Coaching</p>
                        <ul className="space-y-1 text-sm text-slate-50">
                          {item.feedback.improvements.map((tip, index) => (
                            <li
                              key={`${tip}-${index}`}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                            >
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {item.feedback.next_practice && (
                      <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-50">
                        Next drill: {item.feedback.next_practice}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-3 text-xs text-slate-300">
                    Feedback not available for this turn.
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
