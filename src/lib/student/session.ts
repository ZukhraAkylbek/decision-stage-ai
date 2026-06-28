import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface StudentSession {
  id: string;
  name: string;
  telegram: string;
}

const KEY = "pm_student";

export function getStudent(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
}

export function setStudent(s: StudentSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event("pm-student-change"));
}

export function clearStudent() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("pm-student-change"));
}

/** Reactive hook for the current student session. */
export function useStudent() {
  const [student, setStudentState] = useState<StudentSession | null>(getStudent);
  useEffect(() => {
    const sync = () => setStudentState(getStudent());
    window.addEventListener("pm-student-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pm-student-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return student;
}

/** Logs a student in by name + telegram nick. Returns null when no such student exists. */
export async function studentLogin(name: string, telegram: string): Promise<StudentSession | null> {
  const { data, error } = await supabase.rpc("student_login", {
    p_name: name,
    p_telegram: telegram,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;
  return { id: (row as any).id, name: (row as any).name, telegram: (row as any).telegram };
}

export type ProgressKind = "test" | "office";

export async function saveStudentProgress(p: {
  studentId: string;
  kind: ProgressKind;
  itemId: string;
  step: number;
  status: "in_progress" | "completed";
  score?: number | null;
}) {
  await supabase.rpc("student_save_progress", {
    p_student_id: p.studentId,
    p_kind: p.kind,
    p_item_id: p.itemId,
    p_step: p.step,
    p_status: p.status,
    p_score: (p.score ?? null) as unknown as number,
  });
}

export interface ProgressRow {
  kind: string;
  item_id: string;
  current_step: number;
  status: string;
  score: number | null;
  updated_at: string;
}

export async function listStudentProgress(studentId: string): Promise<ProgressRow[]> {
  const { data, error } = await supabase.rpc("student_progress_list", { p_student_id: studentId });
  if (error) throw error;
  return (data ?? []) as ProgressRow[];
}
