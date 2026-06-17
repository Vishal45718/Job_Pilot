"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type ResearchData = { day: string; value: number }[];
type JobsData = { day: string; value: number }[];
type MatchData = { range: string; value: number }[];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-overlay-dark text-white text-xs px-3 py-2 rounded shadow-md border border-overlay">
        <p className="font-medium">{`${label}: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export function CompanyResearchChart({ data }: { data: ResearchData }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <h2 className="text-[16px] font-semibold text-text-primary mb-6">
        Company Research Activity
      </h2>
      <div className="flex-1 w-full h-[250px]">
        {total === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
            No research activity in the last 7 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickCount={5}
            />
            <Tooltip cursor={{ fill: "#F9FAFB" }} content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#61A8FF" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function JobsFoundChart({ data }: { data: JobsData }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <h2 className="text-[16px] font-semibold text-text-primary mb-6">
        Jobs Found Over Time
      </h2>
      <div className="flex-1 w-full h-[250px]">
        {total === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
            No jobs found in the last 30 days.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickCount={5}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#7C5CFC"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, fill: "#7C5CFC", stroke: "#FFFFFF", strokeWidth: 2 }}
              fill="url(#colorJobs)"
            />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export function MatchScoreChart({ data }: { data: MatchData }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <h2 className="text-[16px] font-semibold text-text-primary mb-6">
        Match Score Distribution
      </h2>
      <div className="flex-1 w-full h-[250px]">
        {total === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">
            No match score data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EAF3" />
            <XAxis
              dataKey="range"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              tickCount={5}
            />
            <Tooltip cursor={{ fill: "#F9FAFB" }} content={<CustomTooltip />} />
            <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
