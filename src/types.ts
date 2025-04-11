import { EditorRange } from "obsidian";

export interface MarkFormat {
    name: string;
    pattern: RegExp;
    type: 'inline' | 'block';
}

export const markFormats: MarkFormat[] = [
    { name: 'Bold', pattern: /\*\*([^*]+)\*\*/g, type: 'inline' },
    { name: 'Italics', pattern: /\*([^*]+)\*/g, type: 'inline' },
    { name: 'Highlight', pattern: /==(.*?)==/g, type: 'inline' },
    { name: 'Strikethrough', pattern: /~~(.*?)~~/g, type: 'inline' },
    { name: 'Code', pattern: /`([^`]+)`/g, type: 'block' },
    { name: 'Math', pattern: /\$\$(.*?)\$\$/g, type: 'block' },
    { name: 'Comment', pattern: /%%(.+?)%%/g, type: 'inline' }
];

export interface MarkedRange extends EditorRange {
    format?: string;
}