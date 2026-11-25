import React, { useState, useEffect } from 'react';

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdHXgLWY4B9dDr00Dl3SPHCpqD8QNAA2lWL6c-l_pRjFfV7iQ/formResponse";

const DOCUMENTAZIONE_URL = `${import.meta.env.BASE_URL}BeDigital_Registro_Valutazione_Usabilita.pdf`;
const QUESTIONARIO_URL   = "https://docs.google.com/forms/d/e/1FAIpQLSf8V1N8sEWE7P-TH93GIVT2xkFNuht-qCPHqxeUqdHVaxYYIw/viewform?usp=dialog";

const FORM_ENTRIES = {
  partecipante: "entry.1226722140",
  task:         "entry.721408048",
  start:        "entry.563909580",
  finish:       "entry.1092844992",
  tempo:        "entry.328127551",
  errori:       "entry.54046344",
  note:         "entry.691730657"
};

const TASKS = [
  {
    id: 'u1',
    profilo: 'Utente',
    label: 'Utente — T1 (Facile): Studio di una lezione e ripasso con le flashcard',
    target: '45 – 90 sec',
    stop: 'Visualizza la risposta sul retro di almeno una flashcard.'
  },
  {
    id: 'u2',
    profilo: 'Utente',
    label: 'Utente — T2 (Medio): Test di autovalutazione e verifica nel Diario di bordo',
    target: '90 – 180 sec',
    stop: "Visualizza nel Diario di bordo le percentuali aggiornate sull'IA."
  },
  {
    id: 'u3',
    profilo: 'Utente',
    label: 'Utente — T3 (Difficile): Iscrizione a un Team e verifica partecipanti',
    target: '45 – 120 sec',
    stop: "Visualizza l'elenco dei partecipanti iscritti al gruppo (codice G-PGCGWXU)."
  },
  {
    id: 'a1',
    profilo: 'Admin',
    label: 'Admin — T1 (Facile): Gestione utenti e promozione di un ruolo',
    target: '45 – 90 sec',
    stop: "Conferma la promozione ad Amministratore e l'utente risulta aggiornato."
  },
  {
    id: 'a2',
    profilo: 'Admin',
    label: "Admin — T2 (Medio): Inserimento di una nuova domanda nei quiz sull'Intelligenza Artificiale",
    target: '90 – 180 sec',
    stop: 'Salva correttamente la nuova domanda nel catalogo risorse.'
  },
  {
    id: 'a3',
    profilo: 'Admin',
    label: 'Admin — T3 (Difficile): Preparazione e salvataggio di un prompt didattico nel Prompt Lab',
    target: '60 – 150 sec',
    stop: 'Il prompt risulta salvato e visibile nella Raccolta prompt.'
  }
];

const CATEGORIE_ERRORE = [
  "Errore di obiettivo / contenuto",
  "Errore di compilazione / flusso",
  "Clic a vuoto / esitazione bloccante"
];

export default function App() {
  // Recupera l'ultimo partecipante salvato nel localStorage
  const [partecipante, setPartecipante] = useState(() => {
    return localStorage.getItem('bedigital_partecipante') || 'P-Test 1';
  });

  const [taskId, setTaskId] = useState(TASKS[0].id);
  const [note, setNote] = useState('');

  // Checkbox errori
  const [erroriSelezionati, setErroriSelezionati] = useState([]);
  const [altroErroreAttivo, setAltroErroreAttivo] = useState(false);
  const [testoAltroErrore, setTestoAltroErrore] = useState('');
  const [aiuto, setAiuto] = useState(false);

  // Cronometro
  const [attivo, setAttivo] = useState(false);
  const [secondi, setSecondi] = useState(0);
  const [oraInizio, setOraInizio] = useState('');
  const [statoDrive, setStatoDrive] = useState({ testo: '', tipo: '' });

  // Registro locale
  const [righe, setRighe] = useState(() => {
    const salvate = localStorage.getItem('bedigital_log');
    return salvate ? JSON.parse(salvate) : [];
  });

  useEffect(() => {
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.display = 'block';
    document.body.style.background = '#f1f5f9';
    const root = document.getElementById('root');
    if (root) {
      root.style.maxWidth = '100%';
      root.style.width = '100%';
      root.style.margin = '0';
      root.style.padding = '0';
      root.style.textAlign = 'left';
    }
  }, []);

  // Salva righe e partecipante corrente nel localStorage ad ogni modifica
  useEffect(() => {
    localStorage.setItem('bedigital_log', JSON.stringify(righe));
  }, [righe]);

  useEffect(() => {
    localStorage.setItem('bedigital_partecipante', partecipante);
  }, [partecipante]);

  useEffect(() => {
    if (!attivo) return;
    const id = setInterval(() => setSecondi((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [attivo]);

  const taskSelezionato = TASKS.find((t) => t.id === taskId) || TASKS[0];

  const toggleErrore = (etichetta) => {
    setErroriSelezionati((prev) =>
        prev.includes(etichetta)
            ? prev.filter((item) => item !== etichetta)
            : [...prev, etichetta]
    );
  };

  const oraAttuale = () =>
      new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const formattaTempo = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s} (${sec}s)`;
  };

  const formattaErrori = () => {
    const lista = [...erroriSelezionati];
    if (altroErroreAttivo) {
      lista.push(testoAltroErrore.trim() ? `Altro: ${testoAltroErrore.trim()}` : 'Altro');
    }
    const totale = lista.length;
    let risultato = totale === 0
        ? '0'
        : `${totale} ${totale === 1 ? 'errore' : 'errori'} (${lista.join('; ')})`;

    if (aiuto) risultato += ' [Aiuto]';
    return risultato;
  };

  const avviaTimer = () => {
    if (!oraInizio) setOraInizio(oraAttuale());
    setAttivo(true);
  };

  const resetForm = () => {
    setAttivo(false);
    setSecondi(0);
    setOraInizio('');
    setErroriSelezionati([]);
    setAltroErroreAttivo(false);
    setTestoAltroErrore('');
    setAiuto(false);
    setNote('');
  };

  const incrementaPartecipante = (attuale) => {
    const match = attuale.trim().match(/^(.*?)(\d+)$/);
    if (match) {
      return `${match[1]}${parseInt(match[2], 10) + 1}`;
    }
    return attuale;
  };

  const salvaRiga = async () => {
    if (secondi === 0 && !oraInizio) {
      setStatoDrive({ testo: '⚠️ Avvia prima il cronometro per registrare il task.', tipo: 'warn' });
      return;
    }
    setAttivo(false);

    const nuovaRiga = {
      id: Date.now(),
      partecipante: partecipante.trim() || 'P-Test 1',
      task: taskSelezionato.label,
      start: oraInizio || oraAttuale(),
      finish: oraAttuale(),
      tempo: formattaTempo(secondi),
      errori: formattaErrori(),
      note: note.trim() || '-'
    };

    // 1. Salva in localStorage
    setRighe((prev) => [...prev, nuovaRiga]);

    // 2. Invia al Google Form -> Foglio Excel su Drive
    setStatoDrive({ testo: '⏳ Salvataggio sul Foglio Excel in Google Drive...', tipo: 'info' });
    const formData = new URLSearchParams();
    formData.append(FORM_ENTRIES.partecipante, nuovaRiga.partecipante);
    formData.append(FORM_ENTRIES.task, nuovaRiga.task);
    formData.append(FORM_ENTRIES.start, nuovaRiga.start);
    formData.append(FORM_ENTRIES.finish, nuovaRiga.finish);
    formData.append(FORM_ENTRIES.tempo, nuovaRiga.tempo);
    formData.append(FORM_ENTRIES.errori, nuovaRiga.errori);
    formData.append(FORM_ENTRIES.note, nuovaRiga.note);

    try {
      await fetch(FORM_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
      });
      setStatoDrive({ testo: '✅ Salvato su Google Drive e nella tabella locale!', tipo: 'ok' });
    } catch (err) {
      setStatoDrive({ testo: '⚠️ Salvato in locale (verifica connessione per Drive).', tipo: 'warn' });
    }

    // Incrementa automaticamente il partecipante dopo il salvataggio
    setPartecipante((prev) => incrementaPartecipante(prev));
    resetForm();
  };

  const scaricaCSV = () => {
    const intestazione = 'Partecipante;Ruolo / Task;Start;Finish;Tempo impiegato;N° errori / clic a vuoto;Note\n';
    const corpo = righe
        .map((r) => `"${r.partecipante}";"${r.task}";"${r.start}";"${r.finish}";"${r.tempo}";"${r.errori.replace(/"/g, '""')}";"${r.note.replace(/"/g, '""')}"`)
        .join('\n');

    const blob = new Blob(['\uFEFF' + intestazione + corpo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Registro_Usabilita_BeDigital.csv';
    a.click();
  };

  return (
      <div style={styles.appShell}>
        {/* Barra superiore */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={styles.brandBadge}>
              <span style={{ color: '#4f6bed', fontWeight: 800 }}>Be</span>
              <span style={{ color: '#f59e0b', fontWeight: 800 }}>Digital</span>
            </span>
              <span style={{ color: '#cbd5e1', fontWeight: 300 }}>|</span>
              <h1 style={styles.title}>Registro di Valutazione · Tempi ed Errori</h1>
            </div>

            <div style={styles.headerActions}>
              <a
                  href={DOCUMENTAZIONE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.linkBtn}
              >
                📄 Documentazione
              </a>
              <a
                  href={QUESTIONARIO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...styles.linkBtn, ...styles.linkBtnPrimary }}
              >
                📝 Questionario
              </a>
              <div style={styles.syncPill}>● Sync Drive</div>
            </div>
          </div>
        </header>

        {/* Contenitore principale con spazietto ai bordi */}
        <main style={styles.mainContent}>
          {/* Riga 1: Partecipante + Task */}
          <div style={styles.topRow}>
            <div style={styles.partecipanteCol}>
              <label style={styles.label}>Partecipante</label>
              <input
                  value={partecipante}
                  onChange={(e) => setPartecipante(e.target.value)}
                  style={styles.input}
                  placeholder="P-Test 1"
              />
            </div>

            <div style={styles.taskCol}>
              <label style={styles.label}>Ruolo e Task da osservare</label>
              <select
                  value={taskId}
                  onChange={(e) => setTaskId(e.target.value)}
                  style={styles.select}
              >
                <optgroup label="SCHEDA A • PROFILO UTENTE (utente@gmail.com)">
                  {TASKS.filter((t) => t.profilo === 'Utente').map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
                <optgroup label="SCHEDA B • PROFILO ADMIN (admin@gmail.com)">
                  {TASKS.filter((t) => t.profilo === 'Admin').map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Barra Target & Stop */}
          <div style={styles.targetBox}>
            <span><strong>⏱ Target:</strong> {taskSelezionato.target}</span>
            <span><strong>✓ Stop:</strong> {taskSelezionato.stop}</span>
          </div>

          {/* Barra Cronometro */}
          <div style={styles.timerBar}>
            <div style={styles.timerDisplay}>
              <span style={styles.timerDigits}>{formattaTempo(secondi)}</span>
              <span style={styles.timerMeta}>Start: <strong>{oraInizio || '--:--'}</strong></span>
            </div>

            <div style={styles.timerButtons}>
              <button
                  onClick={avviaTimer}
                  disabled={attivo}
                  style={{ ...styles.btn, ...styles.btnPrimary, opacity: attivo ? 0.5 : 1 }}
              >
                ▶ Avvia
              </button>
              <button
                  onClick={() => setAttivo(false)}
                  disabled={!attivo}
                  style={{ ...styles.btn, ...styles.btnWarning, opacity: !attivo ? 0.5 : 1 }}
              >
                ⏸ Pausa
              </button>
              <button onClick={resetForm} style={{ ...styles.btn, ...styles.btnNeutral }}>
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Sezione Errori: 3 Categorie Generali + Altro */}
          <div style={styles.errorsSection}>
            <div style={styles.errorsHeader}>
              <span style={styles.label}>Tipologia di errore / clic a vuoto</span>
              <label style={styles.helpInline}>
                <input
                    type="checkbox"
                    checked={aiuto}
                    onChange={(e) => setAiuto(e.target.checked)}
                    style={{ width: 15, height: 15, accentColor: '#f59e0b' }}
                />
                <span>Aiuto esterno fornito</span>
              </label>
            </div>

            <div style={styles.checkboxGrid}>
              {CATEGORIE_ERRORE.map((err) => {
                const checked = erroriSelezionati.includes(err);
                return (
                    <label
                        key={err}
                        style={{
                          ...styles.checkboxItem,
                          background: checked ? '#fef2f2' : '#ffffff',
                          borderColor: checked ? '#ef4444' : '#cbd5e1',
                          color: checked ? '#991b1b' : '#1e293b'
                        }}
                    >
                      <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleErrore(err)}
                          style={{ width: 15, height: 15, accentColor: '#dc2626', flexShrink: 0 }}
                      />
                      <span>{err}</span>
                    </label>
                );
              })}

              {/* Checkbox Altro con campo scrivibile */}
              <div
                  style={{
                    ...styles.checkboxItem,
                    background: altroErroreAttivo ? '#fef2f2' : '#ffffff',
                    borderColor: altroErroreAttivo ? '#ef4444' : '#cbd5e1'
                  }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <input
                      type="checkbox"
                      checked={altroErroreAttivo}
                      onChange={(e) => setAltroErroreAttivo(e.target.checked)}
                      style={{ width: 15, height: 15, accentColor: '#dc2626' }}
                  />
                  <span style={{ fontWeight: 600 }}>Altro:</span>
                </label>
                <input
                    type="text"
                    placeholder="Specifica errore..."
                    value={testoAltroErrore}
                    onFocus={() => setAltroErroreAttivo(true)}
                    onChange={(e) => {
                      setTestoAltroErrore(e.target.value);
                      if (!altroErroreAttivo && e.target.value) setAltroErroreAttivo(true);
                    }}
                    style={styles.inlineInput}
                />
              </div>
            </div>
          </div>

          {/* Riga Note e Pulsante Salva */}
          <div style={styles.saveRow}>
            <input
                placeholder="Note aggiuntive (es. Ha aperto un racconto invece della lezione; poi ha trovato la flashcard)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ ...styles.input, flex: 1, minWidth: 220 }}
            />
            <button onClick={salvaRiga} style={{ ...styles.btn, ...styles.btnSuccess }}>
              Salva
            </button>
          </div>

          {statoDrive.testo && (
              <div style={{
                ...styles.feedbackBanner,
                background: statoDrive.tipo === 'ok' ? '#ecfdf5' : statoDrive.tipo === 'warn' ? '#fffbeb' : '#eff6ff',
                color: statoDrive.tipo === 'ok' ? '#065f46' : statoDrive.tipo === 'warn' ? '#92400e' : '#1e40af',
                borderColor: statoDrive.tipo === 'ok' ? '#a7f3d0' : statoDrive.tipo === 'warn' ? '#fde68a' : '#bfdbfe'
              }}>
                {statoDrive.testo}
              </div>
          )}

          {/* Tabella Rilevazioni */}
          {righe.length > 0 && (
              <div style={styles.tableSection}>
                <div style={styles.tableHeaderRow}>
                  <h2 style={styles.sectionTitle}>Rilevazioni registrate ({righe.length})</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={scaricaCSV} style={{ ...styles.btn, ...styles.btnNeutral }}>
                      📥 Esporta CSV
                    </button>
                    <button
                        onClick={() => {
                          if (window.confirm('Svuotare la tabella locale? (I dati già inviati su Google Drive restano salvati)')) {
                            setRighe([]);
                            setPartecipante('P-Test 1');
                            localStorage.removeItem('bedigital_log');
                            localStorage.removeItem('bedigital_partecipante');
                          }
                        }}
                        style={{ ...styles.btn, ...styles.btnDanger }}
                    >
                      🗑 Svuota locale
                    </button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={styles.table}>
                    <thead>
                    <tr>
                      <th style={styles.th}>Partecipante</th>
                      <th style={styles.th}>Ruolo / Task</th>
                      <th style={styles.th}>Start</th>
                      <th style={styles.th}>Finish</th>
                      <th style={styles.th}>Tempo</th>
                      <th style={styles.th}>Errori / Clic a vuoto</th>
                      <th style={styles.th}>Note</th>
                    </tr>
                    </thead>
                    <tbody>
                    {righe.map((r, idx) => (
                        <tr key={r.id} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td style={{ ...styles.td, fontWeight: 700, whiteSpace: 'nowrap' }}>{r.partecipante}</td>
                          <td style={styles.td}>{r.task}</td>
                          <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{r.start}</td>
                          <td style={{ ...styles.td, whiteSpace: 'nowrap' }}>{r.finish}</td>
                          <td style={{ ...styles.td, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.tempo}</td>
                          <td style={styles.td}>{r.errori}</td>
                          <td style={styles.td}>{r.note}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </main>
      </div>
  );
}

const styles = {
  appShell: {
    minHeight: '100vh',
    width: '100%',
    background: '#f1f5f9',
    fontFamily: "'Segoe UI', Roboto, -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#0f172a',
    boxSizing: 'border-box',
    overflowX: 'hidden',
    WebkitFontSmoothing: 'antialiased'
  },
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    width: '100%',
    boxSizing: 'border-box'
  },
  headerInner: {
    maxWidth: 1240,
    margin: '0 auto',
    padding: '14px 36px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    boxSizing: 'border-box'
  },
  brandBadge: {
    fontSize: 22,
    letterSpacing: '-0.5px'
  },
  title: {
    margin: 0,
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: '0.2px',
    color: '#475569'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap'
  },
  linkBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    background: '#f8fafc',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    textDecoration: 'none',
    cursor: 'pointer'
  },
  linkBtnPrimary: {
    background: '#eef2ff',
    borderColor: '#c7d2fe',
    color: '#3730a3'
  },
  syncPill: {
    fontSize: 12,
    fontWeight: 600,
    color: '#065f46',
    background: '#d1fae5',
    padding: '5px 11px',
    borderRadius: 999
  },
  mainContent: {
    maxWidth: 1240,
    margin: '0 auto',
    padding: '22px 36px',
    width: '100%',
    boxSizing: 'border-box'
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 16,
    marginBottom: 14,
    width: '100%',
    boxSizing: 'border-box'
  },
  partecipanteCol: {
    width: 135,
    flexShrink: 0
  },
  taskCol: {
    flex: 1,
    minWidth: 0
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 6
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    outline: 'none'
  },
  select: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#ffffff',
    textOverflow: 'ellipsis'
  },
  targetBox: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 24px',
    background: '#eef2ff',
    border: '1px solid #c7d2fe',
    color: '#1e1b4b',
    padding: '9px 14px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14
  },
  timerBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    padding: '12px 18px',
    borderRadius: 8,
    marginBottom: 14
  },
  timerDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 14
  },
  timerDigits: {
    fontSize: 28,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    color: '#0f172a'
  },
  timerMeta: {
    fontSize: 13,
    color: '#64748b'
  },
  timerButtons: {
    display: 'flex',
    gap: 8
  },
  errorsSection: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '14px 16px',
    marginBottom: 14
  },
  errorsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  helpInline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: '#b45309',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '4px 10px',
    borderRadius: 6,
    cursor: 'pointer'
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 10
  },
  checkboxItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  inlineInput: {
    flex: 1,
    minWidth: 100,
    border: 'none',
    borderBottom: '1px solid #94a3b8',
    background: 'transparent',
    padding: '2px 4px',
    fontSize: 13,
    outline: 'none',
    color: '#0f172a'
  },
  saveRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap'
  },
  btn: {
    padding: '9px 18px',
    fontSize: 14,
    fontWeight: 600,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  btnPrimary: {
    background: '#4f6bed',
    color: '#fff'
  },
  btnWarning: {
    background: '#f59e0b',
    color: '#fff'
  },
  btnSuccess: {
    background: '#16a34a',
    color: '#fff'
  },
  btnNeutral: {
    background: '#e2e8f0',
    color: '#1e293b'
  },
  btnDanger: {
    background: '#fee2e2',
    color: '#b91c1c'
  },
  feedbackBanner: {
    marginTop: 10,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid',
    fontSize: 13,
    fontWeight: 600
  },
  tableSection: {
    marginTop: 20,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '16px'
  },
  tableHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10
  },
  sectionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13
  },
  th: {
    textAlign: 'left',
    padding: '9px 10px',
    background: '#f1f5f9',
    color: '#334155',
    fontWeight: 700,
    borderBottom: '2px solid #cbd5e1',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '9px 10px',
    borderBottom: '1px solid #e2e8f0',
    verticalAlign: 'top'
  }
};