import { ItemView, WorkspaceLeaf, debounce, MarkdownRenderer, TFile, MarkdownView } from 'obsidian';
import { Logger } from '../utils/logger';
import { MarkedRange, markFormats } from '../types';

export const PROGRESSIVE_SUMMARIZATION_VIEW = 'progressive-summarization-view';

export class ProgressiveSummarizationrView extends ItemView {
    private logger: Logger;
    private content: HTMLElement;
    private lastActiveFile: TFile | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.logger = new Logger('ProgressiveSummarizationrView');
    }

    getViewType(): string {
        return PROGRESSIVE_SUMMARIZATION_VIEW;
    }

    getDisplayText(): string {
        return 'Progressive Summarization';
    }

    async onOpen(): Promise<void> {
        this.logger.info('onOpen');
        this.lastActiveFile = null;

        const container = this.containerEl.children[1];
        container.empty();
        this.content = container.createDiv("progressive-summarization-content");
        
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', this.debounceUpdateView)
        );
    
        this.registerEvent(
            this.app.workspace.on('editor-change', this.debounceUpdateView)
        );
        
        await this.updateView();
    }

    async onClose() {
        this.logger.info('onClose');
        this.content.empty();
        this.lastActiveFile = null;

        this.app.workspace.off('active-leaf-change', this.debounceUpdateView);
        this.app.workspace.off('editor-change', this.debounceUpdateView);
    }

    private debounceUpdateView = debounce(() => this.updateView(), 300);
    
    private async updateView() {
        this.logger.info('updateView');
        
        let activeView = this.getActiveView();
        if (!activeView || !(activeView.file instanceof TFile)) {
            this.content.empty();
            return;
        }
    
        // Same the last active file
        this.lastActiveFile = activeView.file;
        
        this.content.empty();
        
        // Get content of current edit view
        const sourceEditor = activeView.editor;
        if (!sourceEditor) {
            return;
        }
        
        const content = sourceEditor.getValue();
        const markedRanges = this.findMarkedRanges(content);
        
        if (markedRanges.length === 0) {
            this.content.empty();
            return;
        }
    
        // Clear existing content
        this.content.empty();
    
        // Create container for all marked items
        const markedContainer = this.content.createDiv("marked-text-container");
    
        // Process ranges in batches to avoid UI blocking
        const BATCH_SIZE = 5;
        for (let i = 0; i < markedRanges.length; i += BATCH_SIZE) {
            const batch = markedRanges.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async range => {
                const text = content.substring(
                    content.split('\n').slice(0, range.from.line).join('\n').length + 
                    (range.from.line > 0 ? 1 : 0) + 
                    range.from.ch,
                    content.split('\n').slice(0, range.to.line).join('\n').length + 
                    (range.to.line > 0 ? 1 : 0) + 
                    range.to.ch
                );
    
                const itemDiv = markedContainer.createDiv({
                    cls: `marked-text-item ${range.format?.toLowerCase() || ''}`
                });
    
                // Store range information for click handling
                itemDiv.dataset.line = range.from.line.toString();
                itemDiv.dataset.ch = range.from.ch.toString();
    
                await MarkdownRenderer.renderMarkdown(
                    text,
                    itemDiv,
                    activeView?.file?.path || '',
                    this
                );
    
                // Add click handler
                itemDiv.addEventListener('click', () => {
                    const line = parseInt(itemDiv.dataset.line || '0');
                    const ch = parseInt(itemDiv.dataset.ch || '0');
                    
                    // Focus editor and scroll to position
                    if (activeView?.editor) {
                        activeView.editor.setCursor({ line, ch });
                        activeView.editor.focus();
                    }
                });
            }));
    
            // Small delay between batches to keep UI responsive
            if (i + BATCH_SIZE < markedRanges.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
    }

    private getActiveView() {
        let activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

        // If there's no active Markdown view, try to find the view with the last active file
        if ((!activeView || !(activeView.file instanceof TFile)) && this.lastActiveFile) {
            const leaves = this.app.workspace.getLeavesOfType("markdown");
            for (const leaf of leaves) {
                const view = leaf.view as MarkdownView;
                if (view && view.file && view.file.path === this.lastActiveFile.path) {
                    activeView = view;
                    break;
                }
            }
        }

        return activeView;
    }


    private findMarkedRanges(content: string): MarkedRange[] {
        const ranges: MarkedRange[] = [];
        const lines = content.split('\n');
        
        // Check if a range is already included in the existing ranges
        const isDuplicateContext = (newRange: MarkedRange, existingRanges: MarkedRange[]): boolean => {
            if (existingRanges.length === 0) return false;
            const lastRange = existingRanges[existingRanges.length - 1];
            return lastRange.from.line === newRange.from.line &&
                   lastRange.from.ch === newRange.from.ch &&
                   lastRange.to.line === newRange.to.line &&
                   lastRange.to.ch === newRange.to.ch;
        };
    
        lines.forEach((line, lineNum) => {
            markFormats.forEach(format => {
                format.pattern.lastIndex = 0;
                let match;
                
                while ((match = format.pattern.exec(line)) !== null) {
                    const matchStart = match.index;
                    const matchEnd = match.index + match[0].length;
                    
                    if (format.type === 'inline') {
                        let contextStart = matchStart;
                        let contextEnd = matchEnd;
                        
                        // Looking for context start (until sentence start or line start)   
                        for (let i = matchStart - 1; i >= 0; i--) {
                            if (line[i].match(/[.!?。！？]/)) {
                                contextStart = i + 1;
                                break;
                            }
                            contextStart = i;
                        }
                        
                        // Looking for context end (until sentence end or line end)
                        for (let i = matchEnd; i < line.length; i++) {
                            if (line[i].match(/[.!?。！？]/)) {
                                contextEnd = i + 1;
                                break;
                            }
                            contextEnd = i + 1;
                        }
                        
                        while (contextStart < matchStart && /\s/.test(line[contextStart])) {
                            contextStart++;
                        }
                        while (contextEnd > matchEnd && /\s/.test(line[contextEnd - 1])) {
                            contextEnd--;
                        }
                        
                        const newRange: MarkedRange = {
                            from: { 
                                line: lineNum,
                                ch: contextStart
                            },
                            to: { 
                                line: lineNum,
                                ch: contextEnd
                            },
                            format: format.name
                        };
                        
                        if (!isDuplicateContext(newRange, ranges)) {
                            ranges.push(newRange);
                        }
                    } else {
                        const fullMatch = match[0];
                        const newRange: MarkedRange = {
                            from: { 
                                line: lineNum,
                                ch: matchStart
                            },
                            to: { 
                                line: lineNum,
                                ch: matchStart + fullMatch.length
                            },
                            format: format.name
                        };
                        
                        if (!isDuplicateContext(newRange, ranges)) {
                            ranges.push(newRange);
                        }
                    }
                }
            });
        });
    
        return ranges;
    }
}