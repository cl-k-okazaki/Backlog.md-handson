/**
 * English messages for the localized CLI output. English is the default locale, and every other
 * locale must translate each key listed here.
 */
export const enMessages = {
	"help.programDescription": "Backlog.md - Project management CLI",
	"help.versionOption": "display version number",
	"help.helpOption": "display help for command",
	"help.helpCommand": "display help for command",
	"taskList.sortedByPriority": "Tasks (sorted by priority):",
	"taskList.noStatus": "No Status",
	"taskList.noTasks": "No tasks found.",
	"taskList.noChildTasks": "No child tasks found for parent task {parentId}.",
	"web.nav.tasks": "Tasks",
	"web.nav.kanbanBoard": "Kanban Board",
	"web.nav.allTasks": "All Tasks",
	"web.nav.milestones": "Milestones",
	"web.nav.drafts": "Drafts",
	"web.nav.statistics": "Statistics",
	"web.nav.documents": "Documents",
	"web.nav.documentation": "Documentation",
	"web.nav.decisions": "Decisions",
	"web.nav.settings": "Settings",
	"web.nav.searchPlaceholder": "Search (⌘K)...",
	"web.board.heading": "Kanban Board",
	"web.board.newTask": "+ New Task",
	"web.board.laneAllTasks": "All Tasks",
	"web.board.laneMilestone": "Milestone",
	"web.board.allAssignees": "All assignees",
	"web.board.unassigned": "Unassigned",
	"web.board.allTypes": "All types",
	"web.board.allProjects": "All projects",
	"web.board.allPriorities": "All priorities",
	"web.board.clearFilters": "Clear filters",
} as const;

export type MessageKey = keyof typeof enMessages;
