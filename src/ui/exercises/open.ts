import { attachExercise, startExercise } from '../../storage/persistence';
import { fitView } from '../editor/actions';
import { useLearning } from '../learning/store';
import { useNav } from '../navigation';

function showPanel(tab: 'statement' | 'check') {
  const learning = useLearning.getState();
  learning.closeDrawer();
  learning.setTemplatePanel(true);
  learning.setExerciseTab(tab);
  useNav.getState().go('editor');
}

/** New project for a design exercise (empty, or the example solution). */
export async function startExerciseInEditor(id: string, fromSolution = false): Promise<boolean> {
  const ok = await startExercise(id, fromSolution);
  if (!ok) return false;
  showPanel('statement');
  if (fromSolution) requestAnimationFrame(() => requestAnimationFrame(fitView));
  return true;
}

/** Checks the circuit already open in the editor against an exercise. */
export function checkCurrentProject(id: string): void {
  attachExercise(id);
  showPanel('check');
}
