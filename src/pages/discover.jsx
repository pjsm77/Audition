import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';

const PLAYLIST_ID = '11172145064';

// Lista atualizada e especializada de proxies para rodar no Netlify
const PROXIES = [
  // 1. AllOrigins (Usando uma rota de fallback alternativa)
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  // 2. Corsproxy.io (Excelente para localhost, mantido como segunda opção)
  (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  // 3. ThingProxy (Um proxy focado em requisições de APIs REST que limpa o cabeçalho Origin)
  (url) => `https://thingproxy.freeboard.io/fetch/${url}`
];

export default function Discover() {
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [collectionArtistsIds, setCollectionArtistsIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      let tracksFetched = [];
      let supabaseSet = new Set();
      let errorMessages = [];

      // 1. BUSCA NA TBL_ARTISTS (Supabase)
      try {
        const { data: supabaseArtists, error: sbError } = await supabase
          .from('tbl_artists')
          .select('deezer_id')
          .not('deezer_id', 'is', null);

        if (sbError) throw sbError;

        if (supabaseArtists) {
          const idsSet = new Set(
            supabaseArtists.map(a => a.deezer_id?.toString().trim()).filter(Boolean)
          );
          supabaseSet = idsSet;
        }
      } catch (sbErr) {
        console.error("Erro Supabase:", sbErr);
        errorMessages.push(`Supabase: ${sbErr.message}`);
      }

      // 2. BUSCA NO DEEZER COM ROTATÓRIA DE PROXY ADAPTADA PARA PRODUÇÃO
      try {
        let nextUrl = `https://api.deezer.com/playlist/${PLAYLIST_ID}/tracks`;
        let pagesFetched = 0;
        const maxPages = 40; 
        let proxyIndex = 0;

        while (nextUrl && pagesFetched < maxPages) {
          let success = false;
          let attempts = 0;
          let data = null;

          while (!success && attempts < PROXIES.length) {
            const currentProxyFunc = PROXIES[(proxyIndex + attempts) % PROXIES.length];
            const targetUrl = currentProxyFunc(nextUrl);

            try {
              // Adicionado um timeout para o Netlify não prender a requisição infinitamente
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 6000);

              const response = await fetch(targetUrl, { signal: controller.signal });
              clearTimeout(timeoutId);
              
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
              }

              const rawResult = await response.json();
              
              // Tratamento robusto: AllOrigins encapsula em .contents, outros proxies jogam direto
              if (rawResult && typeof rawResult === 'object' && 'contents' in rawResult) {
                // Certifica que se vier string dentro de contents, faz o parse corretamente
                data = typeof rawResult.contents === 'string' ? JSON.parse(rawResult.contents) : rawResult.contents;
              } else {
                data = rawResult;
              }

              if (data && !data.error) {
                success = true;
                proxyIndex = (proxyIndex + attempts) % PROXIES.length; 
              } else if (data && data.error) {
                throw new Error(data.error.message);
              }
            } catch (fetchErr) {
              console.warn(`Proxy ${(proxyIndex + attempts) % PROXIES.length} falhou no Netlify:`, fetchErr.message);
              attempts++;
            }
          }

          if (success && data && data.data) {
            tracksFetched = [...tracksFetched, ...data.data];
            nextUrl = data.next ? data.next : null;
            pagesFetched++;
          } else {
            throw new Error("Os proxies públicos falharam em responder no ambiente do Netlify.");
          }
        }
      } catch (deezerErr) {
        console.error("Erro fatal Deezer:", deezerErr);
        errorMessages.push(`Deezer: ${deezerErr.message}`);
      }

      setCollectionArtistsIds(supabaseSet);
      setPlaylistTracks(tracksFetched);

      if (errorMessages.length > 0 && tracksFetched.length === 0) {
        setError(errorMessages.join(' | '));
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  // 3. PROCESSAMENTO DOS FILTROS (Imutável, baseado no código funcional)
  const filteredData = useMemo(() => {
    return playlistTracks
      .map((track, index) => {
        const artistIdStr = track.artist?.id?.toString().trim();
        const isInCollection = artistIdStr ? collectionArtistsIds.has(artistIdStr) : false;
        
        return {
          rowKey: track.id ? `track-${track.id}-${index}` : `idx-${index}`,
          artistName: track.artist?.name || 'Artista Sem Nome',
          artistLink: track.artist?.id ? `https://www.deezer.com/artist/${track.artist.id}` : '#',
          trackTitle: track.title || 'Faixa Sem Título',
          trackLink: track.link || '#',
          albumTitle: track.album?.title || 'Álbum Desconhecido',
          albumLink: track.album?.id ? `https://www.deezer.com/album/${track.album.id}` : '#',
          albumCover: track.album?.cover_small || '',
          isInCollection
        };
      })
      .filter(item => {
        const matchesSearch = 
          item.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.trackTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.albumTitle.toLowerCase().includes(searchTerm.toLowerCase());

        if (statusFilter === 'in_collection') return matchesSearch && item.isInCollection;
        if (statusFilter === 'not_in_collection') return matchesSearch && !item.isInCollection;
        
        return matchesSearch;
      });
  }, [playlistTracks, collectionArtistsIds, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full text-slate-400 bg-slate-900">
        <p className="animate-pulse text-lg">Sincronizando tbl_artists com a Playlist do Deezer...</p>
      </div>
    );
  }

  return (
    <div className="w-full text-slate-100 bg-slate-900" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho Fixo */}
      <header className="p-6 border-b border-slate-800 bg-slate-900 flex-none">
        <h1 className="text-3xl font-bold tracking-tight">Discover Manager</h1>
        {error && (
          <div className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2 rounded mt-2">
            Aviso de Instabilidade: {error}
          </div>
        )}
        <p className="text-slate-400 mt-1 text-sm">
          Total de faixas encontradas na playlist: {playlistTracks.length}
        </p>
      </header>

      {/* Área de Filtros Fixa */}
      <div className="p-6 bg-slate-900/50 border-b border-slate-800 flex-none flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por artista, música ou álbum..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="in_collection">Na Coleção (Limpar)</option>
            <option value="not_in_collection">Fora da Coleção</option>
          </select>
        </div>
      </div>

      {/* Tabela de Scroll */}
      <div className="flex-1" style={{ overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 bg-slate-850 z-10 border-b border-slate-700 shadow-md">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-400 bg-slate-850">Artista</th>
              <th className="p-4 text-sm font-semibold text-slate-400 bg-slate-850">Música / Álbum</th>
              <th className="p-4 text-sm font-semibold text-slate-400 bg-slate-850">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500 bg-slate-900">
                  Nenhum registro correspondente aos filtros.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.rowKey} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <a href={item.artistLink} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-400 hover:underline">
                      {item.artistName}
                    </a>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.albumCover && (
                        <img src={item.albumCover} alt={item.albumTitle} className="w-10 h-10 rounded bg-slate-800 object-cover flex-none" />
                      )}
                      <div>
                        <a href={item.trackLink} target="_blank" rel="noopener noreferrer" className="block text-slate-200 font-normal hover:text-indigo-400 hover:underline">
                          {item.trackTitle}
                        </a>
                        <a href={item.albumLink} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:underline mt-0.5">
                          Sleeve: {item.albumTitle}
                        </a>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {item.isInCollection ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Na Coleção
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pendente
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}