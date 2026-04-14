import { Task } from '../types';

export const parseTasksFromCSV = (content: string): Partial<Task>[] => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const tasks: Partial<Task>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const currentLine = parseCSVLine(lines[i]);
    if (currentLine.length === 0) continue;

    const task: any = {};
    headers.forEach((header, index) => {
      const val = currentLine[index];
      if (!val) return;

      switch (header) {
        case 'Title': task.title = val.replace(/^"|"$/g, '').replace(/""/g, '"'); break;
        case 'JIRA ID': task.jiraId = val; break;
        case 'Status': task.status = val; break;
        case 'Type': task.type = val; break;
        case 'Classification': task.classification = val; break;
        case 'Sprint Name': task.sprintName = val; break;
        case 'Estimated Points': task.estimatedPoints = Number(val); break;
        case 'Total Seconds': task.totalSeconds = Number(val); break;
        case 'Created At': task.createdAt = new Date(val).getTime(); break;
        // We omit ID to generate new ones, or keep it if we want to update.
        // For 'generating tasks' as requested, we'll generate new IDs in useTasks.
      }
    });

    if (task.title) {
      tasks.push(task);
    }
  }

  return tasks;
};

// Helper to handle commas inside quotes
function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
