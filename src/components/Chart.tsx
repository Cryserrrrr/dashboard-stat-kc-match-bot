import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ChartProps {
  data: Array<{ name: string; value: number } | { [key: string]: any }>;
  type: "pie" | "bar" | "line";
  title?: string;
  height?: number;
  colors?: string[];
}

const COLORS = ["#588157", "#3a5a40", "#344e41", "#a3b18a", "#dad7cd"];

export function Chart({
  data,
  type,
  title,
  height = 300,
  colors = COLORS,
}: ChartProps) {
  if (type === "pie") {
    return (
      <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#588157"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tw-bg-opacity, 1)",
                border: "1px solid var(--tw-border-opacity, 1)",
                borderRadius: "8px",
                color: "var(--tw-text-opacity, 1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {title}
        </h3>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              className="dark:stroke-gray-600"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--tw-text-opacity, 1)" }}
              axisLine={{ stroke: "var(--tw-border-opacity, 1)" }}
            />
            <YAxis
              tick={{ fill: "var(--tw-text-opacity, 1)" }}
              axisLine={{ stroke: "var(--tw-border-opacity, 1)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tw-bg-opacity, 1)",
                border: "1px solid var(--tw-border-opacity, 1)",
                borderRadius: "8px",
                color: "var(--tw-text-opacity, 1)",
              }}
            />
            <Legend
              wrapperStyle={{
                color: "var(--tw-text-opacity, 1)",
              }}
            />
            {Object.keys(data[0] || {})
              .filter((key) => key !== "name")
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{
                    fill: colors[index % colors.length],
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: colors[index % colors.length],
                    strokeWidth: 2,
                  }}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            className="dark:stroke-gray-600"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "var(--tw-text-opacity, 1)" }}
            axisLine={{ stroke: "var(--tw-border-opacity, 1)" }}
          />
          <YAxis
            tick={{ fill: "var(--tw-text-opacity, 1)" }}
            axisLine={{ stroke: "var(--tw-border-opacity, 1)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tw-bg-opacity, 1)",
              border: "1px solid var(--tw-border-opacity, 1)",
              borderRadius: "8px",
              color: "var(--tw-text-opacity, 1)",
            }}
          />
          <Bar dataKey="value" fill="#588157" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
