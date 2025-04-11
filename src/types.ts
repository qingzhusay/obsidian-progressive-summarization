import { EditorRange } from "obsidian";

export interface SummarizationLevel {
    level: number;
    pattern: RegExp;
    displayName: string;
}

export const SummarizationLevels: SummarizationLevel[] = [
    {
        level: 1,
        pattern: /\*\*([^*]+)\*\*/g,
        displayName: "Bold"
    },
    {
        level: 2,
        pattern: /==(.*?)==/g,
        displayName: "Highlight"
    }
];

export interface MarkedRange extends EditorRange {
    content?: string;
    level: SummarizationLevel;
}