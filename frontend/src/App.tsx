import { useState, useEffect, FormEvent } from 'react';
import { Cloud, Sparkles, TerminalSquare, Hourglass, RefreshCcw, Star, Copy, FilePlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://mini-api-esme-454538766395.europe-west1.run.app';

interface PoemEntry {
  text: string;
  createdAt: string;
}

interface DataEntry {
  name?: string;
  score?: number;
  [key: string]: unknown;
}

function formatServerTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('fr-FR');
  } catch {
    return isoString;
  }
}

export default function App() {
  const [online, setOnline] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusTime, setStatusTime] = useState('-- -- --');
  const [helloMessage, setHelloMessage] = useState('');
  const [poem, setPoem] = useState('');
  const [poemLoading, setPoemLoading] = useState(false);
  const [poemHistory, setPoemHistory] = useState<PoemEntry[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [refreshingEntries, setRefreshingEntries] = useState(false);
  const [formName, setFormName] = useState('');
  const [formScore, setFormScore] = useState(0);

  async function fetchStatus() {
    setLoadingStatus(true);
    try {
      const [helloRes, statusRes] = await Promise.all([
        fetch(`${API_BASE}/hello`),
        fetch(`${API_BASE}/status`),
      ]);
      const helloData = await helloRes.json();
      const statusData = await statusRes.json();
      setOnline(helloRes.ok);
      setHelloMessage(helloData.message ?? '');
      const serverTime = statusData.server_time
        ? new Date(statusData.server_time).toLocaleTimeString('fr-FR').replace(/:/g, ' : ')
        : '-- -- --';
      setStatusTime(serverTime);
    } catch {
      setOnline(false);
      setStatusTime('-- -- --');
    } finally {
      setLoadingStatus(false);
    }
  }

  async function fetchEntries() {
    setRefreshingEntries(true);
    try {
      const res = await fetch(`${API_BASE}/data`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Impossible de charger les données');
    } finally {
      setRefreshingEntries(false);
    }
  }

  async function handleGeneratePoem() {
    setPoemLoading(true);
    try {
      const res = await fetch(`${API_BASE}/poem`);
      const data = await res.json();
      const text: string = data.poem ?? data.text ?? JSON.stringify(data);
      setPoem(text);
      setPoemHistory((prev) => [{ text, createdAt: new Date().toISOString() }, ...prev].slice(0, 10));
    } catch {
      toast.error('Erreur lors de la génération du poème');
    } finally {
      setPoemLoading(false);
    }
  }

  async function handleAddEntry(e: FormEvent) {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Le nom ne peut pas être vide');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, score: Number(formScore) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
      }
      toast.success('Entrée ajoutée !');
      setFormName('');
      setFormScore(0);
      fetchEntries();
    } catch (err) {
      toast.error(`Erreur : ${err instanceof Error ? err.message : "Échec de l'ajout"}`);
    }
  }

  useEffect(() => {
    fetchStatus();
    fetchEntries();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper via-yellow-50 to-green-50 text-ink font-mono">
      {/* Header de journal moderne */}
      <header className="border-b-4 border-gradient-to-r from-primary-700 via-secondary-700 to-tertiary-700 bg-gradient-to-r from-primary-100 via-secondary-100 to-tertiary-100 p-8 text-center shadow-brutal">
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-accent">
          VOL. 1 — N°1 — MAI 2026 — ÉDITION COLORÉE
        </div>
        <h1 className="text-6xl font-bold italic text-ink md:text-8xl bg-gradient-to-r from-primary-900 via-secondary-900 to-tertiary-900 bg-clip-text text-transparent">
          MINI API ESME
        </h1>
        <p className="mt-4 text-lg font-mono text-primary-800">
          JOURNAL TECHNIQUE MODERNE — FASTAPI + GCP + VERTEX AI
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <div className="border-2 border-primary-700 bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 font-mono text-sm text-white shadow-brutal-blue">
            <Cloud className="mr-2 inline h-4 w-4" />
            API ACTIVE
          </div>
          <div className="border-2 border-secondary-700 bg-gradient-to-r from-secondary-500 to-secondary-600 px-4 py-2 font-mono text-sm text-white shadow-brutal-green">
            <Sparkles className="mr-2 inline h-4 w-4" />
            IA CONNECTÉE
          </div>
          <div className="border-2 border-tertiary-700 bg-gradient-to-r from-tertiary-500 to-tertiary-600 px-4 py-2 font-mono text-sm text-white shadow-brutal-purple">
            <TerminalSquare className="mr-2 inline h-4 w-4" />
            DONNÉES SYNC
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-12">
        {/* Section 1 — API Status */}
        <section className="mb-16 section-api p-8 shadow-brutal-blue">
          <div className="mb-8 text-center">
            <p className="section-label text-primary-700">§ API STATUS §</p>
            <h2 className="mt-4 text-5xl font-bold text-primary-900">ÉTAT DE L'API</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className={`p-8 text-center ${online ? 'status-online' : 'status-offline'} shadow-brutal-green`}>
              <div className="mb-4">
                <p className="text-sm font-bold uppercase tracking-widest text-primary-800">STATUT</p>
                <div className="mt-4 border-2 border-primary-700 bg-white px-6 py-3 font-mono text-2xl font-bold text-primary-900 shadow-brutal">
                  [ {online ? 'ONLINE' : 'OFFLINE'} ]
                </div>
              </div>
              <p className="text-sm text-primary-700">MISE À JOUR AUTOMATIQUE TOUTES LES 30S</p>
              {loadingStatus && (
                <div className="mt-4 border border-primary-600 bg-primary-50 px-4 py-2 font-mono text-sm text-primary-800">
                  <Hourglass className="mr-2 inline h-4 w-4 animate-spin text-primary-600" />
                  CHARGEMENT...
                </div>
              )}
            </div>

            <div className="brutal-border bg-gradient-to-br from-primary-50 to-primary-100 p-8 text-center shadow-brutal-blue">
              <p className="text-sm font-bold uppercase tracking-widest text-primary-800">SERVEUR</p>
              <div className="mt-4 border-2 border-primary-700 bg-white p-4 font-mono text-3xl font-bold text-primary-900 shadow-brutal">
                {statusTime.split(' ').map((part, i) => (
                  <div key={i} className={i % 2 === 0 ? 'text-primary-700' : 'text-primary-900'}>{part}</div>
                ))}
              </div>
              <p className="mt-4 text-sm text-primary-700">{helloMessage}</p>
              <button
                className="mt-6 btn-primary px-6 py-3 font-mono text-sm font-bold uppercase tracking-widest"
                onClick={fetchStatus}
              >
                <RefreshCcw className="mr-2 inline h-4 w-4" />
                RAFRAÎCHIR
              </button>
            </div>
          </div>
        </section>

        <div className="separator" />

        {/* Section 2 — Générateur de poèmes */}
        <section className="mb-16 section-poem p-8 shadow-brutal-green">
          <div className="mb-8 text-center">
            <p className="section-label text-secondary-700">★ POEM GENERATOR ★</p>
            <h2 className="mt-4 text-5xl font-bold text-secondary-900">GÉNÉRATEUR DE POÈMES</h2>
          </div>

          <div className="mb-8 text-center">
            <button
              className="btn-secondary px-8 py-4 font-mono text-lg font-bold uppercase tracking-widest"
              onClick={handleGeneratePoem}
              disabled={poemLoading}
            >
              <Sparkles className="mr-3 inline h-5 w-5" />
              {poemLoading ? 'GÉNÉRATION...' : 'GÉNÉRER UN POÈME'}
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="brutal-border bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 shadow-brutal-green">
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-secondary-800">DERNIER POÈME</p>
              <AnimatePresence mode="wait">
                <motion.div
                  key={poem || 'empty'}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                >
                  {poem ? (
                    <div>
                      <blockquote className="border-l-4 border-secondary-600 pl-6 text-lg italic leading-relaxed text-secondary-900">
                        « {poem} »
                      </blockquote>
                      <button
                        className="mt-6 border-2 border-secondary-600 bg-secondary-100 px-4 py-2 font-mono text-sm text-secondary-800 hover:bg-secondary-200"
                        onClick={() => {
                          navigator.clipboard.writeText(poem);
                          toast.success('Poème copié !');
                        }}
                      >
                        <Copy className="mr-2 inline h-4 w-4" />
                        COPIER
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-secondary-600">
                      <Sparkles className="mx-auto mb-4 h-8 w-8" />
                      <p className="font-mono text-sm">CLIQUE SUR GÉNÉRER POUR CRÉER TON PREMIER POÈME</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {poemHistory.length > 0 && (
              <div className="brutal-border bg-gradient-to-br from-secondary-50 to-secondary-100 p-8 shadow-brutal-green">
                <div className="mb-4 flex items-center">
                  <Star className="mr-2 h-4 w-4 text-secondary-600" />
                  <p className="text-sm font-bold uppercase tracking-widest text-secondary-800">HISTORIQUE</p>
                </div>
                <div className="max-h-96 space-y-4 overflow-y-auto">
                  {poemHistory.map((item, index) => (
                    <div key={`${item.createdAt}-${index}`} className="border border-secondary-300 bg-white p-4 text-sm shadow-sm">
                      <p className="mb-2 italic text-secondary-900">« {item.text} »</p>
                      <p className="text-xs text-secondary-600">{formatServerTime(item.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="separator" />

        {/* Section 3 — Gestionnaire de données */}
        <section className="mb-16 section-data p-8 shadow-brutal-purple">
          <div className="mb-8 text-center">
            <p className="section-label text-tertiary-700">§ DATA MANAGER §</p>
            <h2 className="mt-4 text-5xl font-bold text-tertiary-900">GESTION DES DONNÉES</h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="brutal-border bg-gradient-to-br from-tertiary-50 to-tertiary-100 p-8 shadow-brutal-purple">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold uppercase text-tertiary-900">Liste des entrées</h3>
                <button
                  className="border-2 border-tertiary-600 bg-tertiary-100 px-4 py-2 font-mono text-sm text-tertiary-800 hover:bg-tertiary-200"
                  onClick={fetchEntries}
                  disabled={refreshingEntries}
                >
                  <RefreshCcw className="mr-2 inline h-4 w-4" />
                  {refreshingEntries ? 'RAFRAÎCHISSEMENT...' : 'RAFRAÎCHIR'}
                </button>
              </div>

              <div className="overflow-hidden border-2 border-tertiary-600">
                <table className="w-full border-collapse font-mono text-sm">
                  <thead className="border-b-2 border-tertiary-600 bg-tertiary-100">
                    <tr>
                      <th className="border-r border-tertiary-400 p-3 text-left font-bold uppercase text-tertiary-900">Nom</th>
                      <th className="border-r border-tertiary-400 p-3 text-left font-bold uppercase text-tertiary-900">Score</th>
                      <th className="p-3 text-left font-bold uppercase text-tertiary-900">Données</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="border-t border-tertiary-400 p-8 text-center text-tertiary-600">
                          AUCUNE ENTRÉE POUR LE MOMENT
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry, index) => (
                        <motion.tr
                          key={`${entry.name ?? 'entry'}-${index}`}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-t border-tertiary-300 table-row"
                        >
                          <td className="border-r border-tertiary-300 p-3 font-bold text-tertiary-900">{String(entry.name ?? '—')}</td>
                          <td className="border-r border-tertiary-300 p-3 text-tertiary-700">{String(entry.score ?? '—')}</td>
                          <td className="p-3 text-xs text-tertiary-600">{JSON.stringify(entry)}</td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="brutal-border bg-gradient-to-br from-tertiary-50 to-tertiary-100 p-8 shadow-brutal-purple">
              <div className="mb-6 flex items-center">
                <FilePlus className="mr-3 h-6 w-6 text-tertiary-600" />
                <h3 className="text-2xl font-bold uppercase text-tertiary-900">Nouvelle entrée</h3>
              </div>

              <form className="space-y-6" onSubmit={handleAddEntry}>
                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-tertiary-800">Nom</label>
                  <input
                    className="mt-2 w-full border-2 border-tertiary-400 bg-white p-3 font-mono text-sm text-tertiary-900 focus:border-tertiary-600 focus:bg-tertiary-50"
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    placeholder="MATHIS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-widest text-tertiary-800">Score</label>
                  <input
                    type="number"
                    className="mt-2 w-full border-2 border-tertiary-400 bg-white p-3 font-mono text-sm text-tertiary-900 focus:border-tertiary-600 focus:bg-tertiary-50"
                    value={formScore}
                    onChange={(event) => setFormScore(Number(event.target.value))}
                    placeholder="42"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-tertiary w-full py-4 font-mono text-lg font-bold uppercase tracking-widest"
                >
                  <TerminalSquare className="mr-3 inline h-5 w-5" />
                  AJOUTER
                </button>
              </form>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-ink/10 pt-6 text-center font-mono text-xs text-ink/40">
          Mini API ESME — 2026
        </footer>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, #f5f1e8 0%, #fef3c7 100%)',
            color: '#0a0a0a',
            border: '2px solid #1e40af',
            fontFamily: 'Courier New, IBM Plex Mono, monospace',
            boxShadow: '4px 4px 0 #1e40af'
          }
        }}
      />
    </div>
  );
}
