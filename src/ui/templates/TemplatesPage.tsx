import { useState } from 'react';
import type { Domain } from '../../core/types';
import { allTags, filterTemplates, TEMPLATES } from '../../learning/templates';
import { getSheet } from '../../learning/theory/sheets';
import { t } from '../../i18n';
import { useLearning } from '../learning/store';
import { useNav } from '../navigation';
import { DraftBadge } from '../theory/TheorySheetView';
import { CircuitPreview } from './CircuitPreview';
import { openTemplateInEditor } from './open';
import styles from './Templates.module.css';

const DOMAINS = [...new Set(TEMPLATES.map((tpl) => tpl.domain))];
const LEVELS = [...new Set(TEMPLATES.map((tpl) => tpl.level))].sort();
const TAGS = allTags(TEMPLATES);

/** Templates section (SPEC §8.5): catalog cards with a preview and filters. */
export function TemplatesPage() {
  const [domain, setDomain] = useState<Domain | ''>('');
  const [level, setLevel] = useState(0);
  const [tag, setTag] = useState('');
  const list = filterTemplates(TEMPLATES, { domain, level, tag });

  function showTheory(id: string) {
    useLearning.getState().showTheory(id);
    useNav.getState().go('theory');
  }

  return (
    <div className={styles.page}>
      <p className={styles.intro}>{t('templates.intro')}</p>
      <div className={styles.filters} role="group" aria-label={t('templates.filters')}>
        <label>
          {t('templates.domain')}
          <select value={domain} onChange={(e) => setDomain(e.target.value as Domain | '')}>
            <option value="">{t('theory.all')}</option>
            {DOMAINS.map((d) => (
              <option key={d} value={d}>
                {t(`domain.${d}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('templates.level')}
          <select value={level} onChange={(e) => setLevel(Number(e.target.value))}>
            <option value={0}>{t('theory.all')}</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {t(`templates.levels.${l}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('templates.tag')}
          <select value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">{t('theory.all')}</option>
            {TAGS.map((tg) => (
              <option key={tg} value={tg}>
                {tg}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.count}>
          {list.length} / {TEMPLATES.length}
        </span>
      </div>

      {list.length === 0 && <p className={styles.muted}>{t('templates.none')}</p>}
      <ul className={styles.grid}>
        {list.map((tpl) => (
          <li key={tpl.id} className={styles.card} data-template-id={tpl.id}>
            <div className={styles.thumb}>
              <CircuitPreview project={tpl.circuit} />
            </div>
            <div className={styles.cardBody}>
              <div className={styles.meta}>
                <span>{t(`domain.${tpl.domain}`)}</span>
                <span>·</span>
                <span>{t(`templates.levels.${tpl.level}`)}</span>
                <DraftBadge status={tpl.status} />
              </div>
              <h2 className={styles.title}>{tpl.title}</h2>
              <p className={styles.summary}>{tpl.summary}</p>
              <div className={styles.tags}>
                {tpl.tags.map((tg) => (
                  <button
                    key={tg}
                    type="button"
                    className={styles.tag}
                    aria-pressed={tag === tg}
                    onClick={() => setTag(tag === tg ? '' : tg)}
                  >
                    {tg}
                  </button>
                ))}
              </div>
              <div className={styles.theory}>
                {tpl.theoryRefs.map((id) => {
                  const sheet = getSheet(id);
                  return sheet ? (
                    <button
                      key={id}
                      type="button"
                      className={styles.link}
                      onClick={() => showTheory(id)}
                    >
                      {t('templates.theory')}: {sheet.title}
                    </button>
                  ) : null;
                })}
              </div>
              <button
                type="button"
                className={styles.open}
                onClick={() => void openTemplateInEditor(tpl.id)}
                title={t('templates.openHint')}
              >
                {t('templates.open')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
