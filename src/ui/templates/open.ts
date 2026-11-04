import { openTemplate } from '../../storage/persistence';
import { fitView } from '../editor/actions';
import { useLearning } from '../learning/store';
import { useNav } from '../navigation';

/** Opens a template copy, switches to the editor and shows its description panel. */
export async function openTemplateInEditor(id: string): Promise<boolean> {
  const ok = await openTemplate(id);
  if (!ok) return false;
  const learning = useLearning.getState();
  learning.closeDrawer();
  learning.setTemplatePanel(true);
  learning.setTemplateTab('description');
  useNav.getState().go('editor');
  // The canvas measures itself once mounted; fit after that.
  requestAnimationFrame(() => requestAnimationFrame(fitView));
  return true;
}
