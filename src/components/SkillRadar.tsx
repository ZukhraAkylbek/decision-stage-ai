import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { type SkillKey } from "@/lib/scenarios";
import { useT } from "@/lib/i18n";

const SKILL_TKEYS: Record<SkillKey, string> = {
  productThinking: "skill.productThinking",
  analytics: "skill.analytics",
  communication: "skill.communication",
  prioritization: "skill.prioritization",
  execution: "skill.execution",
  riskManagement: "skill.riskManagement",
};

export function SkillRadar({ skills }: { skills: Record<SkillKey, number> }) {
  const t = useT();
  const data = (Object.keys(SKILL_TKEYS) as SkillKey[]).map((k) => ({
    skill: t(SKILL_TKEYS[k]),
    value: skills[k],
  }));
  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer>
        <RadarChart data={data} outerRadius="75%">
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
