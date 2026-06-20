import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export type LessonSkillKey =
  | "productThinking"
  | "analytics"
  | "communication"
  | "prioritization"
  | "execution"
  | "riskManagement";

const SKILL_LABELS: Record<LessonSkillKey, string> = {
  productThinking: "Продуктовое мышление",
  analytics: "Аналитика",
  communication: "Коммуникация",
  prioritization: "Приоритизация",
  execution: "Исполнение",
  riskManagement: "Управление рисками",
};

const ORDER: LessonSkillKey[] = [
  "productThinking",
  "analytics",
  "communication",
  "prioritization",
  "execution",
  "riskManagement",
];

export function LessonRadar({ skills }: { skills: Record<LessonSkillKey, number> }) {
  const data = ORDER.map((k) => ({ skill: SKILL_LABELS[k], value: Math.round(skills[k]) }));
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            dataKey="value"
            stroke="var(--primary)"
            fill="var(--primary)"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
