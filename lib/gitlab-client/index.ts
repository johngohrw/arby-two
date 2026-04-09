import { Gitlab } from '@gitbeaker/rest';
import type { CommitAction, ExpandedCommitSchema } from '@gitbeaker/core';

export interface FileContent {
  path: string;
  content: string;
}

export interface FileUpdate {
  path: string;
  content: string;
  action?: 'create' | 'update' | 'delete' | 'move' | 'chmod';
}

export interface GitLabClientOptions {
  /** GitLab instance URL (e.g., https://gitlab.com or https://gitlab.company.com) */
  endpoint: string;
  /** GitLab project ID (numeric ID or URL-encoded path like 'group/project') */
  projectId: string | number;
  /** GitLab personal access token or OAuth token */
  token: string;
}

/**
 * A client for interacting with GitLab repositories using Gitbeaker.
 * Supports fetching multiple files and bulk-updating files in a single commit.
 */
export class GitLabClient {
  private api: InstanceType<typeof Gitlab>;
  private projectId: string | number;

  constructor(options: GitLabClientOptions) {
    this.api = new Gitlab({
      host: options.endpoint,
      token: options.token,
    });
    this.projectId = options.projectId;
  }

  /**
   * Fetch the contents of multiple files from a specific branch.
   * @param filePaths - Array of file paths to fetch
   * @param branch - Branch name to fetch files from
   * @returns Array of file contents with their paths
   */
  async fetchFiles(filePaths: string[], branch: string): Promise<FileContent[]> {
    const results: FileContent[] = [];

    for (const path of filePaths) {
      try {
        const content = await this.api.RepositoryFiles.showRaw(
          this.projectId,
          path,
          branch
        );
        results.push({
          path,
          content: typeof content === 'string' ? content : await this.blobToString(content),
        });
      } catch (error) {
        throw new Error(`Failed to fetch file '${path}': ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return results;
  }

  /**
   * Fetch a single file's content from a specific branch.
   * @param filePath - Path to the file
   * @param branch - Branch name to fetch from
   * @returns File content as string
   */
  async fetchFile(filePath: string, branch: string): Promise<string> {
    const content = await this.api.RepositoryFiles.showRaw(
      this.projectId,
      filePath,
      branch
    );
    return typeof content === 'string' ? content : await this.blobToString(content);
  }

  /**
   * Bulk update multiple files in a single commit.
   * @param files - Array of file updates with path, content, and optional action
   * @param branch - Branch name to commit to
   * @param commitMessage - Commit message
   * @returns The created commit
   */
  async bulkUpdate(
    files: FileUpdate[],
    branch: string,
    commitMessage: string
  ): Promise<ExpandedCommitSchema> {
    const actions: CommitAction[] = files.map((file) => ({
      action: file.action ?? 'update',
      filePath: file.path,
      content: file.content,
    }));

    const commit = await this.api.Commits.create(
      this.projectId,
      branch,
      commitMessage,
      actions
    );

    return commit as ExpandedCommitSchema;
  }

  /**
   * Create multiple new files in a single commit.
   * @param files - Array of files to create with path and content
   * @param branch - Branch name to commit to
   * @param commitMessage - Commit message
   * @returns The created commit
   */
  async createFiles(
    files: Omit<FileUpdate, 'action'>[],
    branch: string,
    commitMessage: string
  ): Promise<ExpandedCommitSchema> {
    const actions: CommitAction[] = files.map((file) => ({
      action: 'create' as const,
      filePath: file.path,
      content: file.content,
    }));

    const commit = await this.api.Commits.create(
      this.projectId,
      branch,
      commitMessage,
      actions
    );

    return commit as ExpandedCommitSchema;
  }

  /**
   * Delete multiple files in a single commit.
   * @param filePaths - Array of file paths to delete
   * @param branch - Branch name to commit to
   * @param commitMessage - Commit message
   * @returns The created commit
   */
  async deleteFiles(
    filePaths: string[],
    branch: string,
    commitMessage: string
  ): Promise<ExpandedCommitSchema> {
    const actions: CommitAction[] = filePaths.map((path) => ({
      action: 'delete' as const,
      filePath: path,
    }));

    const commit = await this.api.Commits.create(
      this.projectId,
      branch,
      commitMessage,
      actions
    );

    return commit as ExpandedCommitSchema;
  }

  /**
   * Move/rename multiple files in a single commit.
   * @param moves - Array of moves with previousPath and new path
   * @param branch - Branch name to commit to
   * @param commitMessage - Commit message
   * @returns The created commit
   */
  async moveFiles(
    moves: { previousPath: string; newPath: string; content?: string }[],
    branch: string,
    commitMessage: string
  ): Promise<ExpandedCommitSchema> {
    const actions: CommitAction[] = moves.map((move) => ({
      action: 'move' as const,
      filePath: move.newPath,
      previousPath: move.previousPath,
      content: move.content,
    }));

    const commit = await this.api.Commits.create(
      this.projectId,
      branch,
      commitMessage,
      actions
    );

    return commit as ExpandedCommitSchema;
  }

  /**
   * Get the project ID this client is configured for.
   */
  getProjectId(): string | number {
    return this.projectId;
  }

  private async blobToString(blob: Blob): Promise<string> {
    return blob.text();
  }
}
