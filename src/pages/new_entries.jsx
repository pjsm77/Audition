import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajuste o caminho de acordo com a sua estrutura de pastas

export default function NewEntries() {
export default function NewEntries() {
  // Estados do Formulário e Controle
  const [deezerUrl, setDeezerUrl] = useState('');
  const [status, setStatus] = useState({ text: '', type: '' }); // type: 'found' | 'new' | ''
  const [loading, setLoading] = useState(false);
  const [showPanels, setShowPanels] = useState(false);

  // Dados carregados do banco / Deezer
  const [countries, setCountries] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [cities, setCities] = useState([]);

  // Valores selecionados pelo usuário
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('portugues');
  const [artistRating, setArtistRating] = useState('1');
  const [albumYear, setAlbumYear] = useState('');
  const [listeningDate, setListeningDate] = useState(new Date().toISOString().split('T')[0]);

  // Dados brutos do Álbum e Faixas (Deezer)
  const [rawData, setRawData] = useState({ album: null, tracks: [] });
  // Notas das faixas: objeto mapeando { [deezer_id_track]: rating_value }
  const [trackRatings, setTrackRatings] = useState({});

  // Lista de países e idiomas prioritários (conforme suas regras originais)
  const priorityCountries = ['Estados Unidos', 'Inglaterra', 'Austrália', 'Brasil', 'Alemanha', 'Argentina', 'Espanha', 'França', 'Suécia', 'Noruega'];
  const priorityLangs = ['english', 'spanish', 'portuguese', 'french', 'italian', 'german', 'swedish', 'polish', 'finnish', 'norwegian', 'dutch'];

  // Carrega Países e Idiomas ao montar o componente
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Carrega Países
        const { data: dbCountries, error: errC } = await supabase
          .from('tbl_countries')
          .select('*')
          .order('portuguese_name');
        
        if (!errC && dbCountries) {
          const top = dbCountries.filter(c => priorityCountries.includes(c.portuguese_name));
          const others = dbCountries.filter(c => !priorityCountries.includes(c.portuguese_name));
          setCountries([...top, ...others]);
        }

        // Carrega Idiomas
        const { data: dbLangs, error: errL } = await supabase
          .from('tbl_languages')
          .select('language')
          .order('language');

        if (!errL && dbLangs) {
          const topLangs = dbLangs.filter(l => priorityLangs.includes(l.language.toLowerCase()));
          const otherLangs = dbLangs.filter(l => !priorityLangs.includes(l.language.toLowerCase()));
          setLanguages({ top: topLangs, others: otherLangs });
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    }
    loadInitialData();
  }, []);

  // Injeção limpa de script JSONP para a API do Deezer
  const fetchDeezerJsonp = (albumId) => {
    return new Promise((resolve, reject) => {
      const callbackName = `jsonp_deezer_${Date.now()}`;
      
      window[callbackName] = (data) => {
        cleanup();
        resolve(data);
      };

      const script = document.createElement('script');
      script.src = `https://api.deezer.com/album/${albumId}?output=jsonp&callback=${callbackName}`;
      script.id = callbackName;
      script.onerror = () => {
        cleanup();
        reject(new Error("Erro ao carregar script do Deezer."));
      };

      document.body.appendChild(script);

      function cleanup() {
        delete window[callbackName];
        const el = document.getElementById(callbackName);
        if (el) el.remove();
      }
    });
  };

  // Processa a URL inserida
  const processUrl = async (url) => {
    const id = url.match(/album\/(\d+)/)?.[1];
    if (!id) return;

    setStatus({ text: "🔍 Verificando banco...", type: "new" });
    
    try {
      // 1. Verifica se o álbum já existe ou busca o artista vinculado
      const { data: albumData } = await supabase
        .from('tbl_albums')
        .select('*, tbl_artists(*)')
        .eq('deezer_id_album', id);

      // 2. Busca dados direto da API do Deezer via JSONP
      const deezerData = await fetchDeezerJsonp(id);
      
      // Tratamento básico de propriedades extraídas
      deezerData.deezer_id_cover = deezerData.cover_xl ? deezerData.cover_xl.split('/cover/')[1]?.split('/')[0] : null;
      deezerData.release_year = deezerData.release_date ? deezerData.release_date.split('-')[0] : null;

      setRawData({
        album: deezerData,
        tracks: deezerData.tracks.data
      });

      // Inicializa todas as faixas com nota padrão 3
      const initialRatings = {};
      deezerData.tracks.data.forEach(t => {
        initialRatings[t.id] = 3;
      });
      setTrackRatings(initialRatings);

      setAlbumYear(deezerData.release_year || "");
      setListeningDate(new Date().toISOString().split('T')[0]);
      setShowPanels(true);

      // 3. Busca o artista no Supabase para ver se ele já está cadastrado
      const deezerIdArt = String(deezerData.artist.id);
      const { data: artData } = await supabase
        .from('tbl_artists')
        .select('*')
        .eq('deezer_id', deezerIdArt);

      if (artData && artData.length > 0) {
        setStatus({ text: "⚠️ ARTISTA ENCONTRADO", type: "found" });
        const art = artData[0];
        
        setSelectedLanguage(art.language || "portugues");
        setArtistRating(art.rating || "1");

        // Tenta remapear o país e carregar as cidades dele
        const foundCountry = countries.find(c => c.id_country === art.id_country);
        if (foundCountry) {
          setCountrySearch(foundCountry.portuguese_name);
          setSelectedCountryId(foundCountry.id_country);
          await loadCities(foundCountry.id_country, art.id_city);
        }
      } else {
        setStatus({ text: "✨ NOVO ARTISTA", type: "new" });
        setCountrySearch('');
        setSelectedCountryId('');
        setSelectedCityId('');
        setCities([]);
      }

    } catch (e) {
        console.error("Erro detalhado no processUrl:", e);
        setStatus({ text: `Erro: ${e.message || e}`, type: "new" });
      }
  };

  // Carrega cidades com base no ID do país selecionado
  const loadCities = async (countryId, targetCityId = '') => {
    const { data: dbCities } = await supabase
      .from('tbl_cities')
      .select('*')
      .eq('id_country', countryId)
      .order('name');

    if (dbCities) {
      setCities(dbCities);
      if (targetCityId) {
        setSelectedCityId(targetCityId);
      } else {
        setSelectedCityId('');
      }
    }
  };

  // Manipulador do input de busca de país (Datalist)
  const handleCountryInput = async (val) => {
    setCountrySearch(val);
    const foundCountry = countries.find(c => c.portuguese_name === val);
    if (foundCountry) {
      setSelectedCountryId(foundCountry.id_country);
      await loadCities(foundCountry.id_country);
    }
  };

  // Handler para alteração de nota das faixas
  const handleTrackRateChange = (trackId, val) => {
    setTrackRatings(prev => ({ ...prev, [trackId]: parseInt(val) }));
  };

  // Envio final para o Banco de Dados (Mantendo a chamada idêntica à RPC)
  const saveToDatabase = async () => {
    if (!selectedCityId) {
      alert("Selecione a cidade!");
      return;
    }

    setLoading(true);
    setStatus({ text: "⏳ GRAVANDO...", type: "new" });

    try {
      // 1. Executa a RPC do banco para obter ou criar o artista de forma segura
      const { data: artResult, error: rpcError } = await supabase.rpc('get_or_create_artist', {
        p_deezer_id: String(rawData.album.artist.id),
        p_name: rawData.album.artist.name,
        p_id_city: parseInt(selectedCityId),
        p_language: selectedLanguage,
        p_rating: parseInt(artistRating),
        p_deezer_photo: rawData.album.artist.picture_xl
      });

      if (rpcError) throw rpcError;

      let idArt;
      if (Array.isArray(artResult) && artResult.length > 0) {
        idArt = artResult[0].id_artist || artResult[0];
      } else if (artResult && typeof artResult === 'object') {
        idArt = artResult.id_artist || artResult;
      } else {
        idArt = artResult;
      }

      if (!idArt) throw new Error("Não foi possível obter o ID do artista.");
      idArt = parseInt(idArt);

      // 2. Salva o Álbum
      const { data: albData, error: albError } = await supabase
        .from('tbl_albums')
        .insert([{
          id_artist: idArt,
          name: rawData.album.title,
          year: parseInt(albumYear),
          date: listeningDate,
          deezer_id_album: String(rawData.album.id),
          deezer_id_cover: rawData.album.deezer_id_cover
        }])
        .select();

      if (albError || !albData || albData.length === 0) {
        throw new Error(albError?.message || "Erro ao criar álbum.");
      }
      const idAlb = albData[0].id_album;

      // 3. Estrutura e envia as faixas em lote
      const tracksPayload = rawData.tracks.map((t, idx) => ({
        id_album: idAlb,
        id_artist: idArt,
        name: t.title,
        track_number: parseInt(t.track_position || (idx + 1)),
        duration: t.duration,
        deezer_id_track: String(t.id),
        rating: trackRatings[t.id] || 3
      }));

      const { error: tracksError } = await supabase
        .from('tbl_tracks')
        .insert(tracksPayload);

      if (tracksError) throw tracksError;

      alert("✅ Gravado com sucesso!");
      handleClear();

    } catch (e) {
      console.error("Erro na gravação:", e);
      alert("Erro: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setDeezerUrl(text);
      processUrl(text);
    } catch (err) {
      alert('Erro ao colar: ' + err);
    }
  };

  const handleClear = () => {
    setDeezerUrl('');
    setStatus({ text: '', type: '' });
    setShowPanels(false);
    setRawData({ album: null, tracks: [] });
    setCountrySearch('');
    setSelectedCountryId('');
    setSelectedCityId('');
    setCities([]);
    setTrackRatings({});
  };

  // Formatação de minutos e segundos das faixas
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Termos de pesquisa do Google para origem do artista
  const googleSearchUrl = rawData.album 
    ? `https://www.google.com/search?q=${encodeURIComponent(`${rawData.album.artist.name} band origin city country`)}`
    : '#';

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h3 style={styles.titleHeader}>Sincronizador Master</h3>
          
          <div style={styles.flexGap}>
            <button style={{ ...styles.btnMain, ...styles.btnAccent }} onClick={handlePasteFromClipboard}>
              📋 COLAR
            </button>
            <button style={{ ...styles.btnMain, ...styles.btnClean }} onClick={handleClear}>
              🗑️ LIMPAR
            </button>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Link Deezer</label>
            <input 
              type="text" 
              style={styles.input} 
              placeholder="https://..." 
              value={deezerUrl}
              onChange={(e) => {
                setDeezerUrl(e.target.value);
                processUrl(e.target.value);
              }}
            />
          </div>

          {status.text && (
            <div style={{ ...styles.statusBadge, ...styles[status.type] }}>
              {status.text}
            </div>
          )}

          {showPanels && (
            <div id="config-panel">
              <div style={styles.formGroup}>
                <label style={styles.label}>País</label>
                <input 
                  list="countries_list" 
                  style={styles.input}
                  value={countrySearch}
                  onChange={(e) => handleCountryInput(e.target.value)}
                />
                <datalist id="countries_list">
                  {countries.map(c => (
                    <option key={c.id_country} value={c.portuguese_name} />
                  ))}
                </datalist>
              </div>

              {selectedCountryId && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Cidade</label>
                  <select 
                    style={styles.select} 
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {cities.map(c => (
                      <option key={c.id_city} value={c.id_city}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.gridTwoCols}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Idioma</label>
                  <select 
                    style={styles.select} 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {languages.top?.map(l => (
                      <option key={l.language} value={l.language}>
                        {l.language.charAt(0).toUpperCase() + l.language.slice(1)}
                      </option>
                    ))}
                    <option disabled>──────────</option>
                    {languages.others?.map(l => (
                      <option key={l.language} value={l.language}>
                        {l.language.charAt(0).toUpperCase() + l.language.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Rating Artista</label>
                  <select 
                    style={styles.select} 
                    value={artistRating}
                    onChange={(e) => setArtistRating(e.target.value)}
                  >
                    <option value="1">⭐ (1)</option>
                    <option value="2">⭐⭐ (2)</option>
                    <option value="3">⭐⭐⭐ (3)</option>
                  </select>
                </div>
              </div>

              <div style={styles.gridTwoCols}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Ano de Lançamento</label>
                  <input 
                    type="number" 
                    style={styles.input} 
                    value={albumYear}
                    onChange={(e) => setAlbumYear(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data de Audição</label>
                  <input 
                    type="date" 
                    style={styles.input} 
                    value={listeningDate}
                    onChange={(e) => setListeningDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {showPanels && rawData.album && (
          <div id="review-panel">
            <div style={styles.sectionBox}>
              <div style={styles.sectionTitle}>ARTISTA</div>
              <div style={styles.dataRow}><span>Nome:</span> <b>{rawData.album.artist.name}</b></div>
              <div style={styles.dataRow}><span>Deezer ID Artista:</span> <b>{rawData.album.artist.id}</b></div>
              <a href={googleSearchUrl} style={styles.searchLink} target="_blank" rel="noopener noreferrer">🔍 Pesquisar Origem</a>
            </div>

            <div style={styles.sectionBox}>
              <div style={styles.sectionTitle}>ÁLBUM</div>
              <div style={styles.dataRow}><span>Título:</span> <b>{rawData.album.title}</b></div>
              <div style={styles.dataRow}><span>Deezer ID Álbum:</span> <b>{rawData.album.id}</b></div>
              <div style={styles.dataRow}><span>Ano:</span> <b>{albumYear}</b></div>
            </div>

            <div style={styles.sectionBox}>
              <div style={styles.sectionTitle}>FAIXAS</div>
              <div style={styles.trackList}>
                {rawData.tracks.map((track, idx) => {
                  const pos = track.track_position || (idx + 1);
                  return (
                    <div key={track.id} style={styles.trackItem}>
                      <span>{pos}</span>
                      <span>{track.title}</span>
                      <span>{formatDuration(track.duration)}</span>
                      <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{track.id}</span>
                      <select 
                        style={{ ...styles.select, padding: '2px', fontSize: '0.7rem' }}
                        value={trackRatings[track.id] || 3}
                        onChange={(e) => handleTrackRateChange(track.id, e.target.value)}
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              style={{ ...styles.btnMain, backgroundColor: loading ? '#475569' : '#2dd4bf' }} 
              onClick={saveToDatabase}
              disabled={loading}
            >
              {loading ? "⏳ GRAVANDO..." : "ADICIONAR"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mapeamento fiel das classes CSS inline para o padrão de objetos de estilo do React
const styles = {
  body: {
    fontFamily: '-apple-system, system-ui, sans-serif',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '10px',
    margin: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  card: {
    backgroundColor: '#1e293b',
    padding: '18px',
    borderRadius: '12px',
    border: '1px solid #334155',
  },
  titleHeader: {
    textAlign: 'center',
    color: '#2dd4bf',
    margin: '0 0 15px 0',
  },
  flexGap: {
    display: 'flex',
    gap: '8px',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '12px',
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.65rem',
    marginBottom: '4px',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#020617',
    border: '1px solid #334155',
    padding: '10px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    backgroundColor: '#020617',
    border: '1px solid #334155',
    padding: '10px',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.95rem',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  statusBadge: {
    padding: '8px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    textAlign: 'center',
    marginBottom: '12px',
    fontWeight: 'bold',
  },
  found: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    color: '#fbbf24',
    border: '1px solid #fbbf24',
  },
  new: {
    backgroundColor: 'rgba(45, 212, 191, 0.15)',
    color: '#2dd4bf',
    border: '1px solid #2dd4bf',
  },
  gridTwoCols: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  sectionBox: {
    backgroundColor: '#020617',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '0.7rem',
    color: '#2dd4bf',
    borderBottom: '1px solid #1e293b',
    paddingBottom: '5px',
    marginBottom: '8px',
    fontWeight: 'bold',
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    padding: '3px 0',
  },
  trackList: {
    maxHeight: '180px',
    overflowY: 'auto',
    fontSize: '0.75rem',
  },
  trackItem: {
    display: 'grid',
    gridTemplateColumns: '25px 1fr 50px 80px 60px',
    gap: '5px',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #1e293b',
  },
  btnMain: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    marginTop: '10px',
  },
  btnAccent: {
    margin: 0,
    backgroundColor: '#818cf8',
    color: 'white',
  },
  btnClean: {
    margin: 0,
    backgroundColor: '#475569',
    color: 'white',
  },
  searchLink: {
    fontSize: '0.7rem',
    color: '#818cf8',
    textDecoration: 'underline',
    marginTop: '4px',
    display: 'inline-block',
  },
};