import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';

// Inicialize o cliente do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
        let tracks = [];
        let nextUrl = `https://api.deezer.com/playlist/${PLAYLIST_ID}/tracks`;
        
        let pagesFetched = 0;
        const maxPages = 20; 

        while (nextUrl && pagesFetched < maxPages) {
          // Garante o uso do proxy para evitar CORS em todas as páginas da paginação
          const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(nextUrl)}`);
          if (!response.ok) throw new Error('Falha ao buscar dados do Deezer via Proxy.');
          
          const wrapper = await response.json();
          
          // Tratamento caso o proxy retorne vazio ou erro
          if (!wrapper.contents) {
            throw new Error('Conteúdo não retornado pelo proxy AllOrigins.');
          }

          const data = JSON.parse(wrapper.contents);
          
          if (data.error) {
            throw new Error(`Erro na API do Deezer: ${data.error.message}`);
          }

          if (data.data) {
            tracks = [...tracks, ...data.data];
          }
          
          nextUrl = data.next ? data.next : null;
          pagesFetched++;
        }

        // 2. Buscar IDs dos artistas no Supabase
        const { data: supabaseArtists, error: sbError } = await supabase
          .from('tbl_artists')
          .select('deezer_id');

        if (sbError) throw sbError;

        const artistIdsSet = new Set(
          supabaseArtists
            ?.map(a => a.deezer_id?.toString())
            .filter(Boolean)
        );

        setPlaylistTracks(tracks);
        setCollectionArtistsIds(artistIdsSet);
      } catch (err) {
        console.error("Erro detalhado no carregamento:", err);
        setError(err.message || 'Ocorreu um erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 3. Cruzamento e Filtros de dados
  const filteredData = useMemo(() => {
    return playlistTracks
      .map(track => {
        const artistIdStr = track.artist?.id?.toString();
        const isInCollection = collectionArtistsIds.has(artistIdStr);
        
        return {
          id: track.id,
          artistName: track.artist?.name || 'Artista Desconhecido',
          artistLink: `https://www.deezer.com/artist/${track.artist?.id}`,
          trackTitle: track.title || 'Faixa Sem Título',
          trackLink: track.link,
          albumTitle: track.album?.title || 'Álbum Desconhecido',
          albumLink: `https://www.deezer.com/album/${track.album?.id}`,
          albumCover: track.album?.cover_small,
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
      <div className="flex justify-center items-center h-64 text-slate-400">
        <p className="animate-pulse">Carregando faixas da playlist e cruzando com o Supabase...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg my-4 max-w-7xl mx-auto">
        <strong>Erro de Carregamento:</strong> {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-100 bg-slate-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Discover Manager</h1>
        <p className="text-slate-400 mt-2">
          Gerencie e limpe sua playlist de descoberta. Total de faixas encontradas: {playlistTracks.length}
        </p>
      </header>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

      {/* Grid de Dados */}
      <div className="overflow-x-auto bg-slate-800 border border-slate-700 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-850">
              <th className="p-4 text-sm font-semibold text-slate-400">Artista</th>
              <th className="p-4 text-sm font-semibold text-slate-400">Música / Álbum</th>
              <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500">
                  Nenhum registro encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-750/40 transition-colors">
                  <td className="p-4">
                    <a
                      href={item.artistLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-400 hover:underline"
                    >
                      {item.artistName}
                    </a>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {item.albumCover && (
                        <img 
                          src={item.albumCover} 
                          alt={item.albumTitle} 
                          className="w-10 h-10 rounded bg-slate-700 object-cover" 
                        />
                      )}
                      <div>
                        <a 
                          href={item.trackLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-slate-200 font-normal hover:text-indigo-400 hover:underline"
                        >
                          {item.trackTitle}
                        </a>
                        <a 
                          href={item.albumLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="block text-xs text-slate-400 hover:underline mt-0.5"
                        >
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