import { t } from '../../src/i18n';
import { SECTIONS } from '../../src/ui/sections';

describe('i18n', () => {
  it('translates a dotted key to Basque', () => {
    expect(t('menu.editor')).toBe('Editorea');
  });

  it('falls back to Basque when the Spanish catalogue lacks a key', () => {
    expect(t('menu.theory', 'es')).toBe('Teoria');
  });

  it('returns the key itself when no translation exists', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('has a Basque label for every main menu section', () => {
    for (const id of SECTIONS) {
      expect(t(`menu.${id}`)).not.toBe(`menu.${id}`);
    }
  });
});
