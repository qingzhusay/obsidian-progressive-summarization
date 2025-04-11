import { ItemView, WorkspaceLeaf, debounce, TFile, MarkdownView } from 'obsidian';

import { Logger } from '../utils/logger';
import { SummarizationLevels, SummarizationLevel } from '../types';

import { TextProcessor, RangeRenderer } from '../interfaces/processors';
import { DefaultTextProcessor } from '../processors/DefaultTextProcessor';
import { DefaultRangeRenderer } from '../renderers/DefaultRangeRenderer';

export const PROGRESSIVE_SUMMARIZATION_VIEW = 'progressive-summarization-view';

export class ProgressiveSummarizationView extends ItemView {
    private logger: Logger;

    private content: HTMLElement;
    private lastActiveFile: TFile | null = null;
    private currentLevel: SummarizationLevel = SummarizationLevels[0];
    
    private textProcessor: TextProcessor;
    private rangeRenderer: RangeRenderer;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.logger = new Logger('ProgressiveSummarizationView');
        
        this.textProcessor = new DefaultTextProcessor();
        this.rangeRenderer = new DefaultRangeRenderer();
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
        
        this.createControlBar(container);
        this.content = container.createDiv("progressive-summarization-content");
        
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', this.debounceUpdateView)
        );
    
        this.registerEvent(
            this.app.workspace.on('editor-change', this.debounceUpdateView)
        );
        
        await this.updateView();
    }
    
    private buttonListeners: Map<HTMLElement, () => void> = new Map();
    
    private createControlBar(container: Node) {
        const controlBar = container.createDiv("progressive-summarization-controls");
        const levelSelector = controlBar.createDiv("level-selector");
        
        SummarizationLevels.forEach(level => {
            const button = levelSelector.createEl("button", {
                text: level.displayName,
                cls: this.currentLevel === level ? "level-button-active" : ""
            });
            
            const clickHandler = () => {
                this.currentLevel = level;
                this.updateLevelButtons(levelSelector);
                this.updateView();
            };
            
            button.addEventListener("click", clickHandler);
            this.buttonListeners.set(button, clickHandler);
        });
    }
    
    async onClose() {
        this.logger.info('onClose');
        this.content.empty();
        this.lastActiveFile = null;
    
        // Remove button listeners
        this.buttonListeners.forEach((listener, button) => {
            button.removeEventListener("click", listener);
        });
        this.buttonListeners.clear();
    
        this.app.workspace.off('active-leaf-change', this.debounceUpdateView);
        this.app.workspace.off('editor-change', this.debounceUpdateView);
    }

    private updateLevelButtons(container: HTMLElement) {
        const buttons = container.querySelectorAll("button");
        buttons.forEach(button => {
            button.classList.remove("level-button-active");
        });
        
        // Find the button index for current level
        const activeIndex = SummarizationLevels.findIndex(level => level === this.currentLevel);
        if (activeIndex >= 0 && activeIndex < buttons.length) {
            buttons[activeIndex].classList.add("level-button-active");
        }
    }

    private debounceUpdateView = debounce(() => this.updateView(), 300);
    
    private async updateView() {
        this.logger.info('updateView');
        
        let activeView = this.getActiveView();
        if (!activeView || !(activeView.file instanceof TFile)) {
            this.content.empty();
            return;
        }
    
        this.lastActiveFile = activeView.file;
        this.content.empty();
        
        const sourceEditor = activeView.editor;
        if (!sourceEditor) return;
        
        const content = sourceEditor.getValue();
        const markedRanges = this.textProcessor.findRanges(content, this.currentLevel);
        
        if (markedRanges.length === 0) return;
    
        const markedContainer = this.content.createDiv("marked-text-container");
        await this.rangeRenderer.renderRanges(markedRanges, markedContainer, activeView);
    }

    private getActiveView() {
        let activeView = this.app.workspace.getActiveViewOfType(MarkdownView);

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
}