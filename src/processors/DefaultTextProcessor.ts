import { TextProcessor } from '../interfaces/processors';
import { MarkedRange, SummarizationLevel } from '../types';

export class DefaultTextProcessor implements TextProcessor {
    findRanges(content: string, level: SummarizationLevel): MarkedRange[] {
        const ranges: MarkedRange[] = [];
        const lines = content.split('\n');
        
        this.findRangesWithPattern(lines, level, ranges);
        
        return ranges;
    }
    
    private findRangesWithPattern(
        lines: string[], 
        level: SummarizationLevel,
        ranges: MarkedRange[]
    ) {
        lines.forEach((line, lineNum) => {
            level.pattern.lastIndex = 0;
            let match;
            
            while ((match = level.pattern.exec(line)) !== null) {
                const matchStart = match.index;
                const matchEnd = match.index + match[0].length;
                
                // Get sentence context
                const context = this.getSentenceContext(line, matchStart, matchEnd);
                const textContent = line.substring(context.start, context.end);
                
                const newRange: MarkedRange = {
                    from: { line: lineNum, ch: context.start },
                    to: { line: lineNum, ch: context.end },
                    content: textContent,
                    level
                };
                
                // Check for duplicates
                if (!this.isDuplicateRange(newRange, ranges)) {
                    ranges.push(newRange);
                }
            }
        });
    }
    
    private isDuplicateRange(newRange: MarkedRange, existingRanges: MarkedRange[]): boolean {
        return existingRanges.some(range => 
            range.from.line === newRange.from.line &&
            range.from.ch === newRange.from.ch &&
            range.to.line === newRange.to.line &&
            range.to.ch === newRange.to.ch
        );
    }
    
    private getSentenceContext(line: string, matchStart: number, matchEnd: number) {
        let contextStart = matchStart;
        let contextEnd = matchEnd;
        
        // Find context start (until sentence beginning or line start)
        for (let i = matchStart - 1; i >= 0; i--) {
            if (line[i].match(/[.!?。！？]/)) {
                contextStart = i + 1;
                break;
            }
            contextStart = i;
        }
        
        // Find context end (until sentence end or line end)
        for (let i = matchEnd; i < line.length; i++) {
            if (line[i].match(/[.!?。！？]/)) {
                contextEnd = i + 1;
                break;
            }
            contextEnd = i + 1;
        }
        
        // Trim whitespace from context boundaries
        while (contextStart < matchStart && /\s/.test(line[contextStart])) {
            contextStart++;
        }
        while (contextEnd > matchEnd && /\s/.test(line[contextEnd - 1])) {
            contextEnd--;
        }
        
        return { start: contextStart, end: contextEnd };
    }
}