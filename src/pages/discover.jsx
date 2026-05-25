import React, { useState, useEffect, useMemo } from 'react';
// IMPORTAÇÃO CORRETA: Utilizando o cliente centralizado idêntico ao countries.jsx
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
      
      let tracksFetched = [];
      let supabaseSet = new Set();
      let errorMessages = [];

      // 1. Busca no Supabase (tbl_artists com tratamento de nulos)
      try {
        const { data: supabaseArtists, error: sbError } = await supabase
          .from('tbl_artists')
          .select('deezer_id')
          .not('deezer_id', 'is', null);

        if (sbError) throw sbError;

        if (supabaseArtists && supabaseArtists.length > 0) {
          const idsSet = new Set(
            supabaseArtists
              .map(a => a.deezer_id?.toString().trim())
              .filter(Boolean)
          );
          supabaseSet = idsSet;
        }
      } catch (sbErr) {
        console.error("Erro ao ler tbl_artists do Supabase:", sbErr);
        errorMessages.push(`Banco de Dados: ${sbErr.message || 'Erro de conexão'}`);
      }

      // 2. Busca na API do Deezer via Proxy CORS
      try {
        let nextUrl = `https://api.deezer.com/playlist/${PLAYLIST_ID}/tracks`;
        let pagesFetched = 0;
        const maxPages = 15; 

        while (nextUrl && pagesFetched < maxPages) {
          const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(nextUrl)}`;
          
          const response = await fetch(proxyUrl);
          if (!response.ok) throw new Error(`HTTP ${response.status} no Proxy`);
          
          const wrapper = await response.json();
          if (!wrapper || !wrapper.contents) throw new Error("Resposta do proxy veio vazia.");

          const data = JSON.parse(wrapper.contents);
          
          if (data.error) {
            throw new Error(`Deezer API: ${data.error.message}`);
          }

          if (data.data && data.data.length > 0) {
            tracksFetched = [...tracksFetched, ...data.data];
          } else {
            break;
          }
          
          nextUrl = data.next ? data.next : null;
          pagesFetched++;
        }
      } catch (deezerErr) {
        console.error("Erro ao buscar dados do Deezer:", deezerErr);
        errorMessages.push(`Deezer: ${deezerErr.message}`);
      }

      // Atualiza os estados com o que foi possível carregar
      setCollectionArtistsIds(supabaseSet);
      setPlaylistTracks(tracksFetched);

      // Se não conseguiu trazer nenhuma música e houve algum erro, exibe o alerta
      if (errorMessages.length > 0 && tracksFetched.length === 0) {
        setError(errorMessages.join(' | '));
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // 3. Cruzamento e Filtros de dados (Garante tratamento para strings e chaves nulas)
  const filteredData = useMemo(() => {
    return playlistTracks
      .map((track, index) => {
        const artistIdStr = track.artist?.id?.toString().trim();
        const isInCollection = artistIdStr ? collectionArtistsIds.has(artistIdStr) : false;
        
        return {
          // Evita erros de chaves duplicadas na renderização do React criando um id único composto
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
        if (statusFilter === 'not_in_collection') return matchesSearch && !item.not_in_collection;
        
        return matchesSearch;
      });
  }, [playlistTracks, collectionArtistsIds, searchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400 bg-slate-900">
        <p className="animate-pulse">Sincronizando metadados da tbl_artists com a Playlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg my-4 max-w-7xl mx-auto">
        <strong>Falha no carregamento:</strong> {error}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-100 bg-slate-900 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Discover Manager</h1>
        <p className="text-slate-400 mt-2">
          Gerencie sua playlist de descoberta. Total de faixas encontradas: {playlistTracks.length}
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

      {/* Tabela de Dados */}
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
                <tr key={item.rowKey} className="hover:bg-slate-750/40 transition-colors">
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