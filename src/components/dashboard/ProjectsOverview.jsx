import { useProjectStore } from '../../store/projectStore'

function countProjectTasks(project) {
  let count = 0
  for (const block of project.blocks || []) {
    if (block.type === 'tasks') {
      try {
        const tasks = JSON.parse(block.content)
        if (Array.isArray(tasks)) count += tasks.length
      } catch { /* empty */ }
    }
  }
  return count
}

export default function ProjectsOverview() {
  const projects = useProjectStore((s) => s.projects)

  const totalProjects = projects.length
  const totalBlocks = projects.reduce((sum, p) => sum + (p.blocks || []).length, 0)
  const totalTasks = projects.reduce((sum, p) => sum + countProjectTasks(p), 0)
  const totalFiles = projects.reduce((sum, p) => sum + (p.files || []).length, 0)

  if (totalProjects === 0) {
    return (
      <div className="rounded-xl border border-surface-overlay bg-surface-card p-6">
        <h3 className="text-lg font-semibold text-text-primary">Projects Overview</h3>
        <p className="mt-2 text-sm text-text-muted">No projects yet. Create one in the Projects view.</p>
      </div>
    )
  }

  const stats = [
    { label: 'Projects', value: totalProjects },
    { label: 'Blocks', value: totalBlocks },
    { label: 'Tasks', value: totalTasks },
    { label: 'Files', value: totalFiles },
  ]

  return (
    <div className="rounded-xl border border-surface-overlay bg-surface-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">Projects Overview</h3>

      {/* Stat Cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-surface-overlay bg-surface-elevated px-4 py-3 text-center"
          >
            <p className="text-2xl font-bold text-brand-400">{stat.value}</p>
            <p className="text-xs text-text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Project List Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const blockCount = (project.blocks || []).length
          const taskCount = countProjectTasks(project)
          const fileCount = (project.files || []).length
          return (
            <div
              key={project.id}
              className="rounded-lg border border-surface-overlay bg-surface-base px-4 py-3"
            >
              <p className="text-sm font-medium text-text-primary truncate" title={project.name}>
                {project.name}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-text-muted">
                <span>{blockCount} block{blockCount !== 1 ? 's' : ''}</span>
                <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
              </div>
              <p className="mt-1 text-[10px] text-text-muted">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
