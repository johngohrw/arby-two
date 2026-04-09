import { GitLabClient } from './index';

// Initialize the client
const client = new GitLabClient({
  endpoint: 'https://gitlab.com',  // or your self-hosted GitLab URL
  projectId: '12345678',           // numeric ID or 'group/project-name'
  token: 'glpat-your-access-token',
});

// Example: Fetch multiple files
async function fetchFiles() {
  const files = await client.fetchFiles(
    ['src/index.ts', 'package.json', 'README.md'],
    'main'
  );
  
  for (const file of files) {
    console.log(`${file.path}: ${file.content.length} bytes`);
  }
}

// Example: Bulk update files in a single commit
async function bulkUpdate() {
  const commit = await client.bulkUpdate(
    [
      { path: 'src/index.ts', content: 'console.log("Hello");', action: 'update' },
      { path: 'config.json', content: '{"version": "1.0"}', action: 'create' },
      { path: 'old-file.txt', content: '', action: 'delete' },
    ],
    'main',
    'Bulk update: modify, create, and delete files'
  );
  
  console.log('Created commit:', commit.id, commit.message);
}

// Example: Create multiple new files
async function createFiles() {
  const commit = await client.createFiles(
    [
      { path: 'docs/readme.md', content: '# Documentation' },
      { path: 'docs/guide.md', content: '# Guide' },
    ],
    'main',
    'Add documentation files'
  );
  
  console.log('Created commit:', commit.id);
}

// Example: Delete multiple files
async function deleteFiles() {
  const commit = await client.deleteFiles(
    ['temp/file1.txt', 'temp/file2.txt'],
    'main',
    'Remove temporary files'
  );
  
  console.log('Created commit:', commit.id);
}

// Example: Move/rename files
async function moveFiles() {
  const commit = await client.moveFiles(
    [
      { previousPath: 'old-name.ts', newPath: 'new-name.ts' },
      { previousPath: 'folder/old.md', newPath: 'newfolder/new.md', content: 'Updated content' },
    ],
    'main',
    'Rename and move files'
  );
  
  console.log('Created commit:', commit.id);
}
