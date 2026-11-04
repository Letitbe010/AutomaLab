import { IDBFactory } from 'fake-indexeddb';
import { addComponent } from '../../src/ui/editor/model/ops';
import { useEditor } from '../../src/ui/editor/store';
import * as db from '../../src/storage/db';
import { buildBackup, parseBackup } from '../../src/storage/backup';
import { flushProgress, noteQuizResult, useProgress } from '../../src/storage/progress';
import {
  applyImportAll,
  bootstrap,
  flush,
  importProjectFile,
  newProject,
  openProject,
  prepareImportAll,
  shutdown,
  useStorage,
} from '../../src/storage/persistence';

function freshProfile() {
  globalThis.indexedDB = new IDBFactory();
  db.resetDbConnection();
}

beforeEach(freshProfile);

afterEach(() => shutdown());

describe('persistence', () => {
  it('creates a first project on an empty profile', async () => {
    await bootstrap();
    const { projectId, projects } = useStorage.getState();
    expect(projectId).not.toBeNull();
    expect(projects).toHaveLength(1);
  });

  it('saves edits and reloads them after a restart (same profile)', async () => {
    await bootstrap();
    const id = useStorage.getState().projectId!;
    useEditor.getState().apply((p) => addComponent(p, 'pn.cyl.single', 100, 100));
    expect(useStorage.getState().status).toBe('dirty');
    await flush();
    expect(useStorage.getState().status).toBe('saved');

    shutdown();
    useEditor.getState().loadProject({ ...useEditor.getState().project, components: [] });
    await bootstrap();
    expect(useStorage.getState().projectId).toBe(id);
    expect(useEditor.getState().project.components.map((c) => c.type)).toEqual(['pn.cyl.single']);
  });

  it('returns to "saved" when undo restores the saved state', async () => {
    await bootstrap();
    useEditor.getState().apply((p) => addComponent(p, 'pn.source', 0, 0));
    await flush();
    useEditor.getState().apply((p) => addComponent(p, 'pn.source', 50, 0));
    expect(useStorage.getState().status).toBe('dirty');
    useEditor.getState().undo();
    expect(useStorage.getState().status).toBe('saved');
  });

  it('switches between projects without losing changes', async () => {
    await bootstrap();
    const first = useStorage.getState().projectId!;
    useEditor.getState().apply((p) => addComponent(p, 'pn.source', 0, 0));
    await newProject();
    expect(useEditor.getState().project.components).toHaveLength(0);
    await openProject(first);
    expect(useEditor.getState().project.components).toHaveLength(1);
  });

  it('imports a project file as a new project', async () => {
    await bootstrap();
    const before = useStorage.getState().projects.length;
    const text = JSON.stringify({ ...useEditor.getState().project, name: 'Inportatua' });
    expect(await importProjectFile(text)).toEqual({ ok: true });
    expect(useStorage.getState().projects).toHaveLength(before + 1);
    expect(useEditor.getState().project.name).toBe('Inportatua');
  });

  it('restores a full backup into another profile', async () => {
    await bootstrap();
    useEditor.getState().apply((p) => addComponent(p, 'pn.cyl.single', 0, 0));
    await flush();
    const backup = buildBackup(await db.listProjects());
    shutdown();

    freshProfile(); // "another browser profile"
    await bootstrap();
    const prepared = await prepareImportAll(JSON.stringify(backup));
    if (!prepared.ok) throw new Error('backup should parse');
    expect(prepared.preview.added).toHaveLength(1);
    await applyImportAll(prepared.backup);
    expect(useEditor.getState().project.components.map((c) => c.type)).toEqual(['pn.cyl.single']);
    expect(useStorage.getState().meta.lastBackupAt).toBeDefined();
  });

  it('saves quiz progress, exports it in the backup and merges it on import', async () => {
    await bootstrap();
    await noteQuizResult('tpl-pn-01', {
      score: 0.8,
      correct: 4,
      total: 5,
      wrong: ['q2'],
      byType: { single: [4, 5] },
    });
    await flushProgress();
    const stored = await db.getProgress();
    expect(
      (stored as { templates: Record<string, { bestScore: number }> }).templates['tpl-pn-01']!
        .bestScore,
    ).toBe(0.8);
    const backup = buildBackup(
      await db.listProjects(),
      new Date(),
      useProgress.getState().progress as never,
    );
    const text = JSON.stringify(backup);
    shutdown();

    freshProfile();
    await bootstrap();
    expect(useProgress.getState().progress.templates).toEqual({});
    const parsed = parseBackup(text);
    if (!parsed.ok) throw new Error('backup should parse');
    await applyImportAll(parsed.backup);
    expect(useProgress.getState().progress.templates['tpl-pn-01']!.bestScore).toBe(0.8);
  });
});
