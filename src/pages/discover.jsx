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
          // Detecta dinamicamente a origem (funciona idêntico em localhost ou no Netlify)
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
          // rowKey único combinando ID e índice para evitar colisões de chaves na renderização
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
    // Layout flex vertical rígido (estilo countries.jsx) para destravar o scroll nativo perfeitamente
    <div className="w-full text-slate-100 bg-slate-900" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Cabeçalho Fixo */}
      <header className="p-6 border-b border-slate-800 bg-slate-900 flex-none">
        <h1 className="text-3xl font-bold tracking-tight">Discover Manager</h1>
        {error && (
          <div className="text-xs bg-red-500/10 border border-red-500/30 text-red-500 p-2 rounded mt-2">
            Erro detectado: {error}
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

      {/* Tabela com scroll nativo e sticky header */}
      <div className="flex-1" style={{ overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 bg-slate-800 z-10 border-b border-slate-700 shadow-md">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-400 bg-slate-800">Artista</th>
              <th className="p-4 text-sm font-semibold text-slate-400 bg-slate-800">Música / Álbum</th>
              <th className="p-4 text-sm font-semibold text-slate-400 bg-slate-800">Status</th>
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