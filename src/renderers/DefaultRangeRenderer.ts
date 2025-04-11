import { RangeRenderer } from '../interfaces/processors';
import { MarkedRange } from '../types';
import { MarkdownRenderer, MarkdownView } from 'obsidian';

export class DefaultRangeRenderer implements RangeRenderer {
    async renderRanges(
        markedRanges: MarkedRange[], 
        container: HTMLElement,
        activeView: MarkdownView
    ) {
        const BATCH_SIZE = 5;
        
        for (let i = 0; i < markedRanges.length; i += BATCH_SIZE) {
            const batch = markedRanges.slice(i, i + BATCH_SIZE);
            
            await Promise.all(batch.map(async range => {
                const text = range.content || '';
                
                // Set CSS class based on level
                const levelClass = `level-${range.level.level}`;
                
                const itemDiv = container.createDiv({
                    cls: `marked-text-item ${levelClass}`
                });
    
                // Store range information for click handling
                itemDiv.dataset.line = range.from.line.toString();
                itemDiv.dataset.ch = range.from.ch.toString();
    
                await MarkdownRenderer.renderMarkdown(
                    text,
                    itemDiv,
                    activeView?.file?.path || '',
                    activeView
                );
    
                // Add click handler
                itemDiv.addEventListener('click', () => {
                    const line = parseInt(itemDiv.dataset.line || '0');
                    const ch = parseInt(itemDiv.dataset.ch || '0');
                    
                    if (activeView?.editor) {
                        activeView.editor.setCursor({ line, ch });
                        activeView.editor.focus();
                    }
                });
            }));
    
            if (i + BATCH_SIZE < markedRanges.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
    }
}