import React, { useState, useEffect } from 'react';

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdHXgLWY4B9dDr00Dl3SPHCpqD8QNAA2lWL6c-l_pRjFfV7iQ/formResponse";

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
  "Utente — T1 (Facile): Studio lezione e flashcard",
  "Utente — T2 (Medio): Test e Diario di bordo",
  "Utente — T3 (Difficile): Iscrizione Team e lista",
  "Admin — T1 (Facile): Gestione utenti e promozione",
  "Admin — T2 (Medio): Nuova domanda quiz IA",
  "Admin — T3 (Difficile): Prompt Lab e salvataggio"
];

export default function App() {
  const [partecipante, setPartecipante] = useState('P-Test 4');
  const [task, setTask] = useState(TASKS[0]);
  const [note, setNote] = useState('');
  const [errori, setErrori] = useState(0);
  const [aiuto, setAiuto] = useState(false);

  const [attivo, setAttivo] = useState(false);
  const [secondi, setSecondi] = useState(0);
  const [oraInizio, setOraInizio] = useState('');
  const [statoDrive, setStatoDrive] = useState('');

  const [righe, setRighe] = useState(() => {
    const salvate = localStorage.getItem('bedigital_log');
    return salvate ? JSON.parse(salvate) : [];
  });

  useEffect(() => {
    localStorage.setItem('bedigital_log', JSON.stringify(righe));
  }, [righe]);

  useEffect(() => {
    if (!attivo) return;
    const id = setInterval(() => setSecondi((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [attivo]);

  const oraAttuale = () =>
      new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  const formattaTempo = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s} (${sec}s)`;
  };

  const avviaTimer = () => {
    if (!oraInizio) setOraInizio(oraAttuale());
    setAttivo(true);
  };

  const salvaRiga = async () => {
    if (secondi === 0 && !oraInizio) return;
    setAttivo(false);

    const nuovaRiga = {
      id: Date.now(),
      partecipante,
      task,
      start: oraInizio || oraAttuale(),
      finish: oraAttuale(),
      tempo: formattaTempo(secondi),
      errori: aiuto ? `${errori} (Aiuto)` : `${errori}`,
      note: note || '-'
    };

    // 1. Salva subito in localStorage
    setRighe((prev) => [...prev, nuovaRiga]);

    // 2. Invia i dati al Google Form (che li scrive sul Foglio Excel di Drive)
    setStatoDrive('⏳ Invio al Foglio Google...');
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
      setStatoDrive('✅ Salvato sul Foglio Excel in Google Drive (e in locale)!');
    } catch (err) {
      setStatoDrive('⚠️ Salvato solo in locale (errore di rete).');
    }

    setSecondi(0);
    setOraInizio('');
    setErrori(0);
    setAiuto(false);
    setNote('');
  };

  const scaricaCSV = () => {
    const intestazione = 'Partecipante;Ruolo / Task;Start;Finish;Tempo impiegato;Errori;Note\n';
    const corpo = righe
        .map((r) => `${r.partecipante};${r.task};${r.start};${r.finish};${r.tempo};${r.errori};"${r.note}"`)
        .join('\n');

    const blob = new Blob([intestazione + corpo], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Registro_Usabilita_BeDigital.csv';
    a.click();
  };

  return (
      <div style={{ maxWidth: 800, margin: '30px auto', fontFamily: 'sans-serif', padding: '0 15px' }}>
        <h2>BeDigital — Annotazione Usabilità, Tempi ed Errori</h2>

        <div style={{ border: '1px solid #ccc', padding: 20, borderRadius: 8, marginBottom: 25 }}>
          <div style={{ display: 'flex', gap: 15, marginBottom: 15, flexWrap: 'wrap' }}>
            <div>
              <label><strong>Partecipante:</strong></label><br />
              <input
                  value={partecipante}
                  onChange={(e) => setPartecipante(e.target.value)}
                  style={{ padding: 6, marginTop: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label><strong>Task:</strong></label><br />
              <select
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  style={{ width: '100%', padding: 6, marginTop: 4 }}
              >
                {TASKS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 15, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 28, fontWeight: 'bold', background: '#f4f4f4', padding: '8px 16px', borderRadius: 6 }}>
              {formattaTempo(secondi)}
            </div>

            <div>
              <button onClick={avviaTimer} disabled={attivo} style={{ padding: '8px 14px', marginRight: 6 }}>
                ▶ Avvia
              </button>
              <button onClick={() => setAttivo(false)} disabled={!attivo} style={{ padding: '8px 14px', marginRight: 6 }}>
                ⏸ Pausa
              </button>
              <button
                  onClick={() => { setAttivo(false); setSecondi(0); setOraInizio(''); }}
                  style={{ padding: '8px 14px' }}
              >
                ↺ Reset
              </button>
            </div>

            <div>
              <strong>Errori / Clic a vuoto: {errori} </strong>
              <button onClick={() => setErrori(errori + 1)} style={{ padding: '4px 10px', marginLeft: 5 }}>+1</button>
              {errori > 0 && (
                  <button onClick={() => setErrori(errori - 1)} style={{ padding: '4px 10px', marginLeft: 4 }}>-1</button>
              )}
            </div>

            <label>
              <input type="checkbox" checked={aiuto} onChange={(e) => setAiuto(e.target.checked)} /> Aiuto dato
            </label>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
                placeholder="Note (es. Ha aperto un racconto invece della lezione...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                style={{ flex: 1, padding: 8 }}
            />
            <button
                onClick={salvaRiga}
                style={{ padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              Salva
            </button>
          </div>

          {statoDrive && <p style={{ marginTop: 10, fontSize: 14, fontWeight: 'bold' }}>{statoDrive}</p>}
        </div>

        {righe.length > 0 && (
            <>
              <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead style={{ background: '#f0f0f0' }}>
                <tr>
                  <th>Partecipante</th>
                  <th>Ruolo / Task</th>
                  <th>Start</th>
                  <th>Finish</th>
                  <th>Tempo</th>
                  <th>Errori</th>
                  <th>Note</th>
                </tr>
                </thead>
                <tbody>
                {righe.map((r) => (
                    <tr key={r.id}>
                      <td>{r.partecipante}</td>
                      <td>{r.task}</td>
                      <td>{r.start}</td>
                      <td>{r.finish}</td>
                      <td>{r.tempo}</td>
                      <td>{r.errori}</td>
                      <td>{r.note}</td>
                    </tr>
                ))}
                </tbody>
              </table>

              <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                <button onClick={scaricaCSV} style={{ padding: '8px 14px' }}>📥 Scarica copia CSV</button>
                <button
                    onClick={() => { if (window.confirm('Svuotare solo la tabella locale? (Il file su Drive resta intatto)')) setRighe([]); }}
                    style={{ padding: '8px 14px', marginLeft: 'auto', color: 'red' }}
                >
                  Svuota locale
                </button>
              </div>
            </>
        )}
      </div>
  );
}