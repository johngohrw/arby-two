# GitLab Client

A TypeScript client for interacting with GitLab repositories using [Gitbeaker](https://github.com/jdalrymple/gitbeaker). Supports fetching multiple files and bulk-updating files in a single atomic commit.

## Installation

The client requires `@gitbeaker/rest` and `@gitbeaker/core` as dependencies:

```bash
npm install @gitbeaker/rest @gitbeaker/core
```

## Quick Start

```typescript
import { GitLabClient } from './gitlab-client';

const client = new GitLabClient({
  endpoint: 'https://gitlab.com',
  projectId: '12345678', // or 'group/project-name'
  token: 'glpat-your-access-token',
});

// Fetch files
const files = await client.fetchFiles(['src/index.ts', 'package.json'], 'main');

// Bulk update in a single commit
const commit = await client.bulkUpdate(
  [{ path: 'src/index.ts', content: 'console.log("Hello");' }],
  'main',
  'Update index.ts'
);
```

## API Reference

### Constructor

#### `new GitLabClient(options: GitLabClientOptions)`

Creates a new GitLab client instance.

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `endpoint` | `string` | GitLab instance URL (e.g., `https://gitlab.com` or `https://gitlab.company.com`) |
| `projectId` | `string \| number` | Project ID (numeric) or URL-encoded path (e.g., `group/project`) |
| `token` | `string` | Personal access token or OAuth token |

### Methods

#### `fetchFile(filePath: string, branch: string): Promise<string>`

Fetches a single file's content from a specific branch.

**Parameters:**
- `filePath` - Path to the file in the repository
- `branch` - Branch name to fetch from

**Returns:** File content as a string

**Example:**
```typescript
const content = await client.fetchFile('package.json', 'main');
console.log(content);
```

---

#### `fetchFiles(filePaths: string[], branch: string): Promise<FileContent[]>`

Fetches multiple files' contents from a specific branch.

**Parameters:**
- `filePaths` - Array of file paths to fetch
- `branch` - Branch name to fetch from

**Returns:** Array of `FileContent` objects

```typescript
interface FileContent {
  path: string;
  content: string;
}
```

**Example:**
```typescript
const files = await client.fetchFiles(
  ['src/index.ts', 'package.json', 'README.md'],
  'main'
);

for (const file of files) {
  console.log(`${file.path}: ${file.content.length} bytes`);
}
```

---

#### `bulkUpdate(files: FileUpdate[], branch: string, commitMessage: string): Promise<ExpandedCommitSchema>`

Performs multiple file operations (create, update, delete, move, chmod) in a **single atomic commit**.

**Parameters:**
- `files` - Array of file update operations
- `branch` - Target branch name
- `commitMessage` - Commit message

**FileUpdate interface:**
```typescript
interface FileUpdate {
  path: string;
  content: string;
  action?: 'create' | 'update' | 'delete' | 'move' | 'chmod';
}
```

**Example:**
```typescript
const commit = await client.bulkUpdate(
  [
    { path: 'src/index.ts', content: 'console.log("Hello");', action: 'update' },
    { path: 'config.json', content: '{"version": "1.0"}', action: 'create' },
    { path: 'old-file.txt', content: '', action: 'delete' },
  ],
  'main',
  'Bulk update: modify, create, and delete files'
);

console.log('Commit ID:', commit.id);
console.log('Commit URL:', commit.web_url);
```

---

#### `createFiles(files: Omit<FileUpdate, 'action'>[], branch: string, commitMessage: string): Promise<ExpandedCommitSchema>`

Creates multiple new files in a single commit.

**Parameters:**
- `files` - Array of files to create (path and content)
- `branch` - Target branch name
- `commitMessage` - Commit message

**Example:**
```typescript
const commit = await client.createFiles(
  [
    { path: 'docs/readme.md', content: '# Documentation' },
    { path: 'docs/guide.md', content: '# Getting Started' },
  ],
  'main',
  'Add documentation'
);
```

---

#### `deleteFiles(filePaths: string[], branch: string, commitMessage: string): Promise<ExpandedCommitSchema>`

Deletes multiple files in a single commit.

**Parameters:**
- `filePaths` - Array of file paths to delete
- `branch` - Target branch name
- `commitMessage` - Commit message

**Example:**
```typescript
const commit = await client.deleteFiles(
  ['temp/file1.txt', 'temp/file2.txt'],
  'main',
  'Remove temporary files'
);
```

---

#### `moveFiles(moves: MoveOperation[], branch: string, commitMessage: string): Promise<ExpandedCommitSchema>`

Moves/renames multiple files in a single commit.

**Parameters:**
- `moves` - Array of move operations
- `branch` - Target branch name
- `commitMessage` - Commit message

```typescript
interface MoveOperation {
  previousPath: string;
  newPath: string;
  content?: string; // Optional: update content while moving
}
```

**Example:**
```typescript
const commit = await client.moveFiles(
  [
    { previousPath: 'old-name.ts', newPath: 'new-name.ts' },
    { 
      previousPath: 'docs/old-readme.md', 
      newPath: 'README.md',
      content: '# New README\n\nUpdated content'
    },
  ],
  'main',
  'Rename and reorganize files'
);
```

---

#### `getProjectId(): string | number`

Returns the project ID this client is configured for.

**Example:**
```typescript
console.log(client.getProjectId()); // '12345678' or 'group/project'
```

## Use Cases

### 1. Code Generation

Generate multiple files and commit them atomically:

```typescript
const generatedFiles = [
  { path: 'generated/types.ts', content: generateTypes() },
  { path: 'generated/api.ts', content: generateApiClient() },
  { path: 'generated/README.md', content: generateDocs() },
];

await client.createFiles(
  generatedFiles,
  'main',
  'chore: regenerate API client from OpenAPI spec'
);
```

### 2. Configuration Updates

Update configuration across multiple files:

```typescript
// Fetch current configs
const configs = await client.fetchFiles(
  ['package.json', 'tsconfig.json', '.eslintrc.js'],
  'main'
);

// Modify configs
const updated = configs.map(file => ({
  path: file.path,
  content: updateConfig(file.content),
  action: 'update' as const,
}));

// Commit all changes together
await client.bulkUpdate(updated, 'main', 'chore: update dependencies');
```

### 3. Refactoring

Rename files and update imports:

```typescript
await client.bulkUpdate(
  [
    // Delete old files
    { path: 'old-utils.ts', action: 'delete', content: '' },
    // Create new files with updated content
    { path: 'new-utils.ts', action: 'create', content: newUtilsCode },
    // Update references
    { path: 'src/index.ts', action: 'update', content: updatedIndexCode },
  ],
  'main',
  'refactor: rename utils module'
);
```

### 4. Bulk Cleanup

Remove temporary or deprecated files:

```typescript
const tempFiles = ['temp/build.log', 'temp/debug.json', 'cache/old-data.json'];
await client.deleteFiles(tempFiles, 'main', 'chore: cleanup temporary files');
```

## Error Handling

All methods throw descriptive errors on failure:

```typescript
try {
  const files = await client.fetchFiles(['missing-file.ts'], 'main');
} catch (error) {
  console.error('Failed to fetch:', error.message);
  // Output: "Failed to fetch file 'missing-file.ts': 404 Not Found"
}
```

## Authentication

### Personal Access Token

Create a token in GitLab under **User Settings → Access Tokens**:

1. Go to https://gitlab.com/-/profile/personal_access_tokens
2. Select scopes: `api` or `read_repository` + `write_repository`
3. Copy the generated token

### Project Access Token

For project-specific access, use a Project Access Token:

1. Go to **Project Settings → Access Tokens**
2. Create a token with required scopes

### CI/CD Job Token

When running in GitLab CI, you can use the predefined `CI_JOB_TOKEN`:

```typescript
const client = new GitLabClient({
  endpoint: process.env.CI_SERVER_URL!,
  projectId: process.env.CI_PROJECT_ID!,
  token: process.env.CI_JOB_TOKEN!,
});
```

## TypeScript Types

All types are exported and can be imported:

```typescript
import type { 
  GitLabClientOptions, 
  FileContent, 
  FileUpdate 
} from './gitlab-client';
```

## See Also

- [Gitbeaker Documentation](https://github.com/jdalrymple/gitbeaker)
- [GitLab Commits API](https://docs.gitlab.com/ee/api/commits.html)
- [GitLab Repository Files API](https://docs.gitlab.com/ee/api/repository_files.html)
