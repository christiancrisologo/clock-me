import { Task } from '../types';
import config from '../config.json';
import { HOURS_PER_POINT } from '../constants';

export const parseTasksFromCSV = (content: string): Partial<Task>[] => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
  const tasks: Partial<Task>[] = [];
  const fieldMatches = config.fieldMatches as Record<string, string[]>;

  // Pre-calculate which internal key each column index maps to
  const headerMap: Record<number, string> = {};
  headers.forEach((header, index) => {
    for (const [internalKey, aliases] of Object.entries(fieldMatches)) {
      if (aliases.includes(header)) {
        headerMap[index] = internalKey;
        break;
      }
    }
  });

  for (let i = 1; i < lines.length; i++) {
    const currentLine = parseCSVLine(lines[i]);
    if (currentLine.length === 0) continue;

    const task: any = {};
    
    currentLine.forEach((val, index) => {
      const internalKey = headerMap[index];
      if (!internalKey) return;

      const cleanVal = val.trim().replace(/^"|"$/g, '');
      if (cleanVal === '') return;

      // Handle specific types based on the internal key
      switch (internalKey) {
        case 'title':
        case 'summary':
          task.title = cleanVal.replace(/""/g, '"');
          break;
        case 'jiraId':
          task.jiraId = cleanVal;
          task.issueKey = cleanVal; // Keep both for compatibility
          break;
        case 'createdAt':
        case 'updatedAt':
        case 'resolved':
          task[internalKey] = new Date(cleanVal).getTime();
          break;
        case 'estimatedHours':
        case 'totalSeconds':
        case 'estimatedPoints':
        case 'storyPoints':
          task[internalKey] = Number(cleanVal);
          if (['storyPoints', 'estimatedPoints'].includes(internalKey)) {
            task.estimatedHours = Number(cleanVal) * HOURS_PER_POINT;
          }
          break;
        case 'sprint':
          task.sprintName = cleanVal;
          break;
        case 'classification':
          task.classification = cleanVal.toLowerCase() as 'regular' | 'sprintly';
          break;
        default:
          task[internalKey] = cleanVal;
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
