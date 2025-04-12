import { Plugin, WorkspaceLeaf } from 'obsidian';
import { Logger } from './src/utils/logger';
import { ProgressiveSummarizationView, PROGRESSIVE_SUMMARIZATION_VIEW } from './src/views/ProgressiveSummarizationView';

export default class ProgressiveSummarizationPlugin extends Plugin {
    private logger: Logger;

    async onload() {
        this.logger = new Logger('ProgressiveSummarizationPlugin');
        this.logger.info('Plugin loaded');

        this.registerView(
            PROGRESSIVE_SUMMARIZATION_VIEW,
            (leaf: WorkspaceLeaf) => new ProgressiveSummarizationView(leaf)
        );

        this.app.workspace.onLayoutReady(() => {
            this.activateView();
        });
    }

    onunload() {
        this.logger.info('Plugin unloaded');
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
