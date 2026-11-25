# BeDigital — Registro di Valutazione dell'Usabilità

Applicazione web sviluppata in React per il supporto alle sessioni di test di usabilità della piattaforma **BeDigital**. Permette all'osservatore di cronometrare l'esecuzione dei task, classificare gli errori in tempo reale e sincronizzare automaticamente i dati raccolti.

## Funzionalità principali

- **Cronometro integrato:** rilevazione precisa dei tempi di esecuzione (*Avvia*, *Pausa*, *Reset*) con registrazione automatica degli orari di inizio e fine.
- **Gestione Task per Profilo:** selezione guidata dei task suddivisi tra profilo **Utente** e profilo **Admin**, con indicazione del tempo target e della condizione di stop.
- **Classificazione degli Errori:** registrazione rapida tramite checkbox delle categorie previste dal protocollo (*Errore di obiettivo / contenuto*, *Errore di compilazione / flusso*, *Clic a vuoto / esitazione bloccante*), campo libero *Altro*, flag per *Aiuto esterno fornito* e note qualitative.
- **Doppia persistenza dei dati:**
  - **Sincronizzazione Cloud:** invio automatico di ogni rilevazione a un foglio di calcolo su Google Drive tramite Google Forms.
  - **Backup Locale:** salvataggio nella memoria del browser (`localStorage`) con tabella riepilogativa ed esportazione in formato **CSV**.
- **Accesso rapido alle risorse:** collegamenti diretti nella barra superiore al documento del protocollo (`BeDigital_Valutazione_Usabilita.pdf`) e al questionario finale per i partecipanti.

## Tecnologie utilizzate

- **React** + **Vite**
- **GitHub Pages** (hosting statico)
- **Google Forms / Google Sheets** (raccolta dati remota)

## Installazione e avvio in locale

1. Clona il repository:
   ```bash
   git clone https://github.com/miriamferrara/bedigital-usability.git
   cd bedigital-usability
   ```

2. Installa le dipendenze:
   ```bash
   npm install
   ```

3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

## Pubblicazione (Deploy)

Per aggiornare la versione online su GitHub Pages:

```bash
npm run deploy
```

L'applicazione è accessibile all'indirizzo: [https://miriamferrara.github.io/bedigital-usability/](https://miriamferrara.github.io/bedigital-usability/)