import { Plugin, WorkspaceLeaf } from 'obsidian';
import { Logger } from './src/utils/logger';
import { ProgressiveSummarizationrView, PROGRESSIVE_SUMMARIZATION_VIEW } from './src/views/ProgressiveSummarizationrView';

export default class ProgressiveSummarizationPlugin extends Plugin {
    private logger: Logger;

    async onload() {
        this.logger = new Logger('ProgressiveSummarizationPlugin');
        this.logger.info('Plugin loaded');

        this.registerView(
            PROGRESSIVE_SUMMARIZATION_VIEW,
            (leaf: WorkspaceLeaf) => new ProgressiveSummarizationrView(leaf)
        );

        this.addCommand({
            id: 'show-progressive-summarization-view',
            name: 'Show Progressive Summarization View',
            callback: () => {
                this.activateView();
            },
        });

        this.app.workspace.onLayoutReady(() => {
            this.activateView();
        });
    }

    onunload() {
        this.logger.info('Plugin unloaded');
        this.app.workspace.detachLeavesOfType(PROGRESSIVE_SUMMARIZATION_VIEW);
    }

    async activateView() {
        this.logger.info('Activating view');
        const { workspace } = this.app;
        
        let leaf: WorkspaceLeaf | null = workspace.getLeavesOfType(PROGRESSIVE_SUMMARIZATION_VIEW)[0];
        if (!leaf) {
            leaf = workspace.getRightLeaf(false);
            if (leaf) {
                await leaf.setViewState({
                    type: PROGRESSIVE_SUMMARIZATION_VIEW,
                    active: true,
                });
            }
        }
        
        if (leaf) {
            workspace.revealLeaf(leaf);
            this.logger.info('View activated');
        }
    }
}
