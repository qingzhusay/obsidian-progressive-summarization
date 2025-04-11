import { MarkedRange, SummarizationLevel } from '../types';
import { MarkdownView } from 'obsidian';

export interface TextProcessor {
    findRanges(content: string, level: SummarizationLevel): MarkedRange[];
}

export interface RangeRenderer {
    renderRanges(ranges: MarkedRange[], container: HTMLElement, activeView: MarkdownView): Promise<void>;
}