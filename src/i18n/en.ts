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
} as const;

export type MessageKey = keyof typeof enMessages;
