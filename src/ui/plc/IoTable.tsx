import { PLC_INPUTS, PLC_OUTPUTS } from '../../core/plc';
import { t } from '../../i18n';
import { useEditor } from '../editor/store';
import { useSim } from '../sim/simStore';
import { ioEntry, setIo, usedMarkers, wiredDevices } from './io';
import styles from './Plc.module.css';

/** I/O table (TIA "PLC tags"): address, symbolic name, comment and the wired device. */
export function IoTable() {
  const project = useEditor((s) => s.project);
  const mode = useEditor((s) => s.mode);
  useSim((s) => s.version);
  const sim = mode === 'sim' ? useSim.getState().sim : null;
  const editable = mode === 'edit';
  const io = project.plc.io;
  const wired = wiredDevices(project);
  const hasPlc = project.components.some((c) => c.type.startsWith('plc.'));

  const update = (address: string, patch: { symbol?: string; comment?: string }) =>
    useEditor.getState().apply((d) => {
      d.plc.io = setIo(d.plc.io, address, patch);
    });

  function fillFromWiring() {
    useEditor.getState().apply((d) => {
      for (const [address, device] of wired) {
        const e = ioEntry(d.plc.io, address);
        if (!e?.comment) d.plc.io = setIo(d.plc.io, address, { comment: device });
      }
    });
  }

  const rows = [
    ...PLC_INPUTS.map((a) => ({ address: a, group: 'inputs' })),
    ...PLC_OUTPUTS.map((a) => ({ address: a, group: 'outputs' })),
    ...usedMarkers(project.plc.ladder).map((a) => ({ address: a, group: 'markers' })),
  ];

  return (
    <div className={styles.io} data-testid="io-table">
      <div className={styles.palette}>
        <p className={styles.muted}>{hasPlc ? t('io.intro') : t('io.noPlc')}</p>
        {editable && wired.size > 0 && (
          <button type="button" className={styles.btn} onClick={fillFromWiring}>
            {t('io.fill')}
          </button>
        )}
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t('io.address')}</th>
            <th>{t('io.symbol')}</th>
            <th>{t('io.comment')}</th>
            <th>{t('io.wired')}</th>
            {sim && <th>{t('io.state')}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ address, group }, i) => {
            const e = ioEntry(io, address);
            const value = sim?.ladder?.read(address);
            const first = i === 0 || rows[i - 1]!.group !== group;
            return (
              <tr key={address} data-address={address} className={first ? styles.groupStart : ''}>
                <td className={styles.addr}>{address}</td>
                <td>
                  <input
                    value={e?.symbol ?? ''}
                    disabled={!editable}
                    aria-label={`${address} ${t('io.symbol')}`}
                    onChange={(ev) => update(address, { symbol: ev.target.value })}
                  />
                </td>
                <td>
                  <input
                    value={e?.comment ?? ''}
                    disabled={!editable}
                    aria-label={`${address} ${t('io.comment')}`}
                    onChange={(ev) => update(address, { comment: ev.target.value })}
                  />
                </td>
                <td className={styles.addr}>{wired.get(address) ?? ''}</td>
                {sim && (
                  <td>
                    <span
                      className={value ? styles.ledOn : styles.ledOff}
                      data-value={value ? 1 : 0}
                    >
                      {value ? '1' : '0'}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
