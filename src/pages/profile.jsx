import React, { useState } from 'react';
import { 
  User, Disc, Music, Link2, BarChart3, Globe, MapPin, 
  Star, MessageSquare, Flame, Calendar, Award, Heart 
} from 'lucide-react';

// --- MOCK DATA ---
const artistMock = {
  name: "Midnight Oil",
  rating: 4.8,
  country: "Austrália",
  city: "Sydney",
  countryCode: "au", // Usado para a API de bandeiras
  language: "Inglês",
  genre: "Alternative Rock / Punk Rock",
  globalRanking: 12,
  totalScrobbles: 3450,
  trendingPosition: "3º no Trend Mensal",
  daysSinceLastScrobble: 2,
  recencyScore: 95, // Indicador de quão ativo está no seu player
  guitarSetlistCount: 5,
  photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60", // Foto genérica de show
  fansCount: {
    deezer: "1.2M",
    spotify: "2.5M",
    lastfm: "850K"
  },
  links: [
    { name: "Official Website", url: "#", type: "web" },
    { name: "Wikipedia", url: "#", type: "wiki" },
    { name: "Last.fm", url: "#", type: "lastfm" },
    { name: "Deezer", url: "#", type: "deezer" }
  ],
  topTracks: [
    { title: "Beds Are Burning", scrobbles: 420, inSetlist: true },
    { title: "Blue Sky Mine", scrobbles: 310, inSetlist: true },
    { title: "The Dead Heart", scrobbles: 285, inSetlist: false },
    { title: "Forgotten Years", scrobbles: 190, inSetlist: true },
    { title: "Power and the Passion", scrobbles: 155, inSetlist: false }
  ],
  collectionAlbums: [
    { title: "Diesel and Dust", year: 1987, format: "Vinil", rating: 5 },
    { title: "Blue Sky Mining", year: 1990, format: "CD", rating: 4.5 },
    { title: "Red Sails in the Sunset", year: 1984, format: "Digital", rating: 4 }
  ],
  deezerAlbums: [
    { title: "Resist", year: 2022, tracksCount: 12 },
    { title: "The Makarrata Project", year: 2020, tracksCount: 7 },
    { title: "Capricornia", year: 2002, tracksCount: 11 },
    { title: "Breathe", year: 1996, tracksCount: 13 }
  ],
  charts: {
    years: ["2022", "2023", "2024", "2025", "2026"],
    scrobbles: [450, 720, 1100, 980, 200]
  },
  similarArtists: ["The Living End", "Cold Chisel", "Hoodoo Gurus", "INXS"]
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState('main');

  // Abas disponíveis
  const tabs = [
    { id: 'main', label: 'Principal', icon: <User size={16} /> },
    { id: 'albums', label: 'Coleção', icon: <Disc size={16} /> },
    { id: 'tracks', label: 'Tracks', icon: <Music size={16} /> },
    { id: 'deezer', label: 'Deezer', icon: <Heart size={16} /> },
    { id: 'charts', label: 'Stats', icon: <BarChart3 size={16} /> },
    { id: 'links', label: 'Links', icon: <Link2 size={16} /> },
  ];

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen pb-12 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* --- HEADER DO ARTISTA (FIXO/PRINCIPAL) --- */}
      <div className="relative h-48 bg-gradient-to-b from-slate-700 to-slate-900 overflow-hidden">
        <img 
          src={artistMock.photo} 
          alt={artistMock.name} 
          className="w-full h-full object-cover opacity-40 blur-sm absolute scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        
        {/* Info Rápida no Header */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <img 
            src={artistMock.photo} 
            alt={artistMock.name} 
            className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-xl shadow-black/50"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black tracking-tight truncate">{artistMock.name}</h1>
              {/* Bandeira via flagcdn */}
              <img 
                src={`https://flagcdn.com/w20/${artistMock.countryCode}.png`} 
                alt={artistMock.country}
                className="h-3 rounded-sm object-cover"
              />
            </div>
            <p className="text-xs text-slate-400 font-medium truncate">{artistMock.genre}</p>
            
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                <Star size={12} fill="currentColor" /> {artistMock.rating}
              </span>
              <span className="text-slate-500">•</span>
              <span className="flex items-center gap-1">
                <MapPin size={12} className="text-rose-400" /> {artistMock.city}, {artistMock.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- NAVEGAÇÃO POR ABAS (SCROLL HORIZONTAL NO CELULAR) --- */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 overflow-x-auto scrollbar-none flex whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/50' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* --- CONTEÚDO DAS ABAS --- */}
      <div className="p-4 max-w-md mx-auto">
        
        {/* TAB 1: PRINCIPAL */}
        {activeTab === 'main' && (
          <div className="space-y-4">
            
            {/* Cards de Métricas Rápidas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Scrobbles Totais</p>
                <p className="text-xl font-black text-emerald-400 mt-1">{artistMock.totalScrobbles}</p>
              </div>
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">Ranking Geral</p>
                <p className="text-xl font-black text-sky-400 mt-1">#{artistMock.globalRanking}</p>
              </div>
            </div>

            {/* Status de Recência e Algoritmo */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={14} /> Último scrobble:</span>
                <span className="font-semibold text-slate-200">{artistMock.daysSinceLastScrobble} dias atrás</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5"><Flame size={14} /> Score de Recência:</span>
                <span className="font-bold text-amber-400">{artistMock.recencyScore}/100</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5"><Award size={14} /> Status na Gaveta:</span>
                <span className="font-semibold text-purple-400 text-xs px-2 py-0.5 bg-purple-500/10 rounded-full border border-purple-500/20">{artistMock.trendingPosition}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5"><Globe size={14} /> Idioma das Letras:</span>
                <span className="font-semibold text-slate-200">{artistMock.language}</span>
              </div>
            </div>

            {/* No Violão / Setlist PJ */}
            <div className="bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-800/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-emerald-300 text-sm">Repertório no Violão</h3>
                <p className="text-xs text-emerald-400/80 mt-0.5">Músicas prontas para tocar</p>
              </div>
              <div className="bg-emerald-500 text-slate-950 font-black px-3 py-1.5 rounded-lg text-lg">
                {artistMock.guitarSetlistCount}
              </div>
            </div>

            {/* Artistas Similares */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Artistas Similares</h3>
              <div className="flex flex-wrap gap-2">
                {artistMock.similarArtists.map((artist, idx) => (
                  <span key={idx} className="text-xs font-medium px-3 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg">
                    {artist}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ÁLBUNS DA COLEÇÃO */}
        {activeTab === 'albums' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-400 mb-1 px-1">Álbuns na Coleção ({artistMock.collectionAlbums.length})</h3>
            {artistMock.collectionAlbums.map((album, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-white">{album.title}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{album.year} • <span className="text-emerald-400 font-medium">{album.format}</span></p>
                </div>
                <div className="text-amber-400 font-bold text-xs flex items-center gap-0.5 bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                  <Star size={10} fill="currentColor" /> {album.rating}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: TRACKS LIST */}
        {activeTab === 'tracks' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-400 mb-2 px-1">Top Músicas por Scrobbles</h3>
            {artistMock.topTracks.map((track, idx) => (
              <div key={idx} className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-500 w-4 text-center">{idx + 1}</span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-200 truncate">{track.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{track.scrobbles} scrobbles</p>
                  </div>
                </div>
                {track.inSetlist && (
                  <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded">
                    Violão
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: DEEZER ALBUMS */}
        {activeTab === 'deezer' && (
          <div className="space-y-4">
            {/* Fãs nas Plataformas */}
            <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Fãs / Seguidores</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800"><p className="text-slate-400 font-medium">Deezer</p><p className="font-bold text-slate-200 mt-0.5">{artistMock.fansCount.deezer}</p></div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800"><p className="text-slate-400 font-medium">Spotify</p><p className="font-bold text-slate-200 mt-0.5">{artistMock.fansCount.spotify}</p></div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800"><p className="text-slate-400 font-medium">Last.fm</p><p className="font-bold text-slate-200 mt-0.5">{artistMock.fansCount.lastfm}</p></div>
              </div>
            </div>

            {/* Catálogo Deezer */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-400 px-1">Todos os Álbuns no Deezer ({artistMock.deezerAlbums.length})</h3>
              {artistMock.deezerAlbums.map((album, idx) => (
                <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-slate-200">{album.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{album.year} • {album.tracksCount} faixas</p>
                  </div>
                  <Disc size={16} className="text-slate-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CHARTS & STATS */}
        {activeTab === 'charts' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Histórico de Scrobbles por Ano</h3>
              
              {/* Gráfico Simulado em Barras CSS Puro (Mobile Friendly) */}
              <div className="flex items-end justify-between h-32 pt-4 px-2 bg-slate-900/50 rounded-lg border border-slate-800">
                {artistMock.charts.years.map((year, idx) => {
                  const val = artistMock.charts.scrobbles[idx];
                  const maxVal = Math.max(...artistMock.charts.scrobbles);
                  const pct = (val / maxVal) * 100;
                  
                  return (
                    <div key={year} className="flex flex-col items-center flex-1 group">
                      <span className="text-[10px] font-bold text-emerald-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {val}
                      </span>
                      <div 
                        style={{ height: `${pct}%` }} 
                        className="w-5 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm min-h-[4px]"
                      />
                      <span className="text-[10px] text-slate-500 mt-2 font-medium">{year}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LINKS INTERNOS / EXTERNOS */}
        {activeTab === 'links' && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-400 mb-2 px-1">Links & Plataformas</h3>
            {artistMock.links.map((link, idx) => (
              <a 
                key={idx} 
                href={link.url}
                className="bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 rounded-xl p-3.5 flex items-center justify-between group transition-colors"
              >
                <span className="text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {link.name}
                </span>
                <Link2 size={14} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}