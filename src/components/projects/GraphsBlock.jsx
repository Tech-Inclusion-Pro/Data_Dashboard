import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1720',
  border: '1px solid #2d2937',
  borderRadius: 8,
  color: '#f0ecf4',
}

function parseConfig(content) {
  try {
    const parsed = JSON.parse(content)
    if (parsed && parsed.chartType && Array.isArray(parsed.data)) return parsed
  } catch {
    // not a valid config
  }
  return null
}

function renderChart(config) {
  const { chartType, data, xKey = 'name', yKey = 'value', colors = ['#a67dff'] } = config

  switch (chartType) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2937" />
            <XAxis dataKey={xKey} tick={{ fill: '#9a92aa', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9a92aa', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey={yKey} fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )

    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2937" />
            <XAxis dataKey={xKey} tick={{ fill: '#9a92aa', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9a92aa', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Line type="monotone" dataKey={yKey} stroke={colors[0]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )

    case 'area':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} accessibilityLayer>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d2937" />
            <XAxis dataKey={xKey} tick={{ fill: '#9a92aa', fontSize: 11 }} />
            <YAxis tick={{ fill: '#9a92aa', fontSize: 11 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Area type="monotone" dataKey={yKey} stroke={colors[0]} fill={colors[0]} fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      )

    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart accessibilityLayer>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              label={({ name }) => name}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      )

    default:
      return <p className="text-xs text-text-muted">Unsupported chart type: {chartType}</p>
  }
}

export default function GraphsBlock({ block, onConfigure }) {
  const config = parseConfig(block.content)

  if (!config) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-xs text-text-muted">No chart configured yet.</p>
        <button
          onClick={onConfigure}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-brand-700"
          aria-label="Configure chart"
        >
          Configure Chart
        </button>
      </div>
    )
  }

  const textSummary = config.data
    .map((d) => `${d[config.xKey || 'name']}: ${d[config.yKey || 'value']}`)
    .join('; ')

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden">
      {config.title && (
        <p className="text-xs font-medium text-text-secondary">{config.title}</p>
      )}
      <div
        role="img"
        aria-label={`${config.chartType} chart: ${textSummary}`}
        className="min-h-[160px] flex-1"
      >
        {renderChart(config)}
      </div>
      <details className="mt-1">
        <summary className="cursor-pointer text-[10px] text-text-muted hover:text-text-secondary">
          View data as text
        </summary>
        <p className="mt-1 text-[10px] text-text-muted">{textSummary}</p>
      </details>
      <button
        onClick={onConfigure}
        className="self-start rounded-md bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-brand-700"
        aria-label="Reconfigure chart"
      >
        Reconfigure
      </button>
    </div>
  )
}
