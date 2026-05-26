import React, { useState, useEffect, useMemo } from 'react';
// IMPORTAÇÃO CORRETA: Herdando a mesma instância centralizada que funciona no countries.jsx
import { supabase } from '../supabaseClient';

const PLAYLIST_ID = '11172145064';

export default function Discover() {
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [collectionArtistsIds, setCollectionArtistsIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // 1. BUSCAR IDS DOS ARTISTAS NA TBL_ARTISTS DO SUPABASE
        const { data: supabaseArtists, error: sbError } = await supabase
          .from('tbl_artists')
          .select('deezer_id')
          .not('deezer_id', 'is', null);

        if (sbError) throw sbError;

        const artistIdsSet = new Set(
          supabaseArtists
            ?.map(a => a.deezer_id?.toString().trim())
            .filter(Boolean)
        );

        // 2. BUSCAR DADOS DA PLAYLIST DO DEEZER VIA EDGE FUNCTION EXCLUSIVA
        let tracks = [];
        let nextUrl = `https://api.deezer.com/playlist/${PLAYLIST_ID}/tracks`;
        
        let pagesFetched = 0;
        const maxPages = 40; // Aumentado para 40 para carregar com folga todos os 630+ registros da playlist

        while (nextUrl && pagesFetched < maxPages) {
          const origin = window.location.origin;
          const proxyUrl = `${origin}/api/deezer-proxy?url=${encodeURIComponent(nextUrl)}`;

          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error(`Falha no proxy interno (Status ${response.status})`);
          
          const data = await response.json();
          
          if (data && data.error) {
            throw new Error(data.error.message || 'Erro retornado pela API do Deezer');
          }

          if (data && data.data && data.data.length > 0) {
            tracks = [...tracks, ...data.data];
            nextUrl = data.next ? data.next : null;
            pagesFetched++;
          } else {
            break;
          }
        }

        setPlaylistTracks(tracks);
        setCollectionArtistsIds(artistIdsSet);
      } catch (err) {
        console.error("Erro na carga do Discover:", err);
        setError(err.message || 'Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 3. CRUZAMENTO E FILTROS DE DADOS
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
          // Mudado para cover_medium para evitar compressão pixelada no mobile
          albumCover: track.album?.cover_medium || '', 
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
        <p className="animate-pulse text-lg font-medium">Sincronizando artistas com a Playlist do Deezer...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen text-slate-100 bg-slate-900 flex flex-col font-sans antialiased">
      
      {/* Cabeçalho Fixo */}
      <header className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/50 backdrop-blur flex-none flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Discover Manager</h1>
          {error && (
            <div className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 p-2 rounded mt-2 max-w-xl">
              Erro detectado: {error}
            </div>
          )}
          <p className="text-slate-400 mt-1 text-xs sm:text-sm font-light">
            Total de faixas encontradas na playlist: <span className="font-semibold text-indigo-400">{playlistTracks.length}</span>
          </p>
        </div>
        
        <a 
          href={`https://www.deezer.com/playlist/${PLAYLIST_ID}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-600/10 self-stretch sm:self-center text-center"
        >
          Ver Playlist no Deezer ↗
        </a>
      </header>

      {/* Área de Filtros */}
      <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800/60 flex-none flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por artista, música ou álbum..."
            className="w-full bg-slate-800 border border-slate-700/70 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-56">
          <select
            className="w-full bg-slate-800 border border-slate-700/70 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os Status</option>
            <option value="in_collection">Na Coleção (Limpar)</option>
            <option value="not_in_collection">Fora da Coleção (Pendente)</option>
          </select>
        </div>
      </div>

      {/* Conteúdo Dinâmico (Cards no Mobile / Tabela no Desktop) */}
      <div className="flex-1 overflow-y-auto w-full p-4 sm:p-0">
        
        {filteredData.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Nenhum registro correspondente aos filtros.
          </div>
        ) : (
          <>
            {/* VISTA MOBILE: Grid de Cards (Escondido em telas 'sm' ou maiores) */}
            <div className="block sm:hidden space-y-3">
              {filteredData.map((item) => (
                <div key={`${item.rowKey}-card`} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 flex gap-4 hover:border-slate-700 transition-all">
                  {item.albumCover && (
                    <img 
                      src={item.albumCover} 
                      alt={item.albumTitle} 
                      className="w-16 h-16 rounded-lg bg-slate-800 object-cover flex-none shadow-md" 
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <a href={item.artistLink} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-indigo-400 uppercase tracking-wider truncate hover:underline">
                        {item.artistName}
                      </a>
                      {item.isInCollection ? (
                        <span className="inline-flex flex-none items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Na Coleção
                        </span>
                      ) : (
                        <span className="inline-flex flex-none items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Pendente
                        </span>
                      )}
                    </div>
                    
                    <a href={item.trackLink} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-100 truncate hover:text-indigo-300 transition-colors">
                      {item.trackTitle}
                    </a>
                    
                    <a href={item.albumLink} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 truncate hover:underline">
                      Álbum: {item.albumTitle}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA DESKTOP: Tabela Tradicional (Escondida no mobile) */}
            <div className="hidden sm:block w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-800/95 backdrop-blur z-10 border-b border-slate-700 shadow-sm">
                  <tr>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Artista</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Música / Álbum</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-400 w-40">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 bg-slate-900">
                  {filteredData.map((item) => (
                    <tr key={item.rowKey} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 max-w-[200px] truncate">
                        <a href={item.artistLink} target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">
                          {item.artistName}
                        </a>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          {item.albumCover && (
                            <img src={item.albumCover} alt={item.albumTitle} className="w-10 h-10 rounded shadow-sm bg-slate-800 object-cover flex-none" />
                          )}
                          <div className="min-w-0">
                            <a href={item.trackLink} target="_blank" rel="noopener noreferrer" className="block text-slate-200 text-sm font-normal hover:text-indigo-400 hover:underline truncate">
                              {item.trackTitle}
                            </a>
                            <a href={item.albumLink} target="_blank" rel="noopener noreferrer" className="block text-xs text-slate-400 hover:text-slate-300 hover:underline mt-0.5 truncate">
                              Álbum: {item.albumTitle}
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}