// src/pages/profile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Caso use rotas dinâmicas ex: /artist/:id
import { supabase } from '../supabaseClient';
import { User, Disc, Music, Heart, BarChart3, Link2, Star, MapPin } from 'lucide-react';

export default function ArtistProfile() {
  const [activeTab, setActiveTab] = useState('main');
  const [loading, setLoading] = useState(false);
  
  // Mock de dados baseado fielmente no seu HTML (Pronto para virar Estado do Supabase)
  const [artist, setArtist] = useState({
    name: "Midnight Oil",
    rating: 3, // Usando 1, 2 ou 3 para casar com a lógica do seu top10.jsx
    country: "Austrália",
    city: "Sydney",
    countryCode: "au",
    language: "Inglês",
    genre: "Alternative Rock / Punk Rock",
    globalRanking: 12,
    totalScrobbles: 3450,
    trendingPosition: "3º no Trend Mensal",
    daysSinceLastScrobble: 2,
    recencyScore: 95,
    guitarSetlistCount: 5,
    photo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60",
    fansCount: { deezer: "1.2M", spotify: "2.5M", lastfm: "850K" },
    links: [
      { name: "Official Website", url: "https://www.midnightoil.com" },
      { name: "Wikipedia", url: "#" },
      { name: "Last.fm", url: "#" },
      { name: "Deezer", url: "https://www.deezer.com/artist/1190" }
    ],
    topTracks: [
      { title: "Beds Are Burning", scrobbles: 420, inSetlist: true },
      { title: "Blue Sky Mine", scrobbles: 310, inSetlist: true },
      { title: "The Dead Heart", scrobbles: 285, inSetlist: false },
      { title: "Forgotten Years", scrobbles: 190, inSetlist: true },
      { title: "Power and the Passion", scrobbles: 155, inSetlist: false }
    ],
    collectionAlbums: [
      { title: "Diesel and Dust", year: 1987, format: "Vinil", rating: 3 },
      { title: "Blue Sky Mining", year: 1990, format: "CD", rating: 3 },
      { title: "Red Sails in the Sunset", year: 1984, format: "Digital", rating: 2 }
    ],
    deezerAlbums: [
      { title: "Resist", year: 2022, tracksCount: 12 },
      { title: "The Makarrata Project", year: 2020, tracksCount: 7 },
      { title: "Capricornia", year: 2002, tracksCount: 11 }
    ],
    charts: {
      years: ["2022", "2023", "2024", "2025", "2026"],
      scrobbles: [450, 720, 1100, 980, 200]
    },
    similarArtists: ["The Living End", "Cold Chisel", "Hoodoo Gurus", "INXS"]
  });

  // Dicionário de países idêntico ao seu top10.jsx
  const countryMap = {
    "austrália": "au", "argentina": "ar", "brasil": "br", "estados unidos": "us", "eua": "us", "inglaterra": "gb-eng", "reino unido": "gb" // ... adicione os outros conforme necessário
  };

  // Lógica estrita de cores herdada do seu top10.jsx
  const getRatingColor = (rating) => {
    if (!rating) return '#AAAAAA'; 
    const r = Number(rating);
    if (r === 1) return "#e97b78"; 
    if (r === 2) return "#f8c039"; 
    if (r === 3) return "#6dbe99"; 
    return "#AAAAAA";
  };

  const tabs = [
    { id: 'main', label: 'Principal', icon: User },
    { id: 'albums', label: 'Coleção', icon: Disc },
    { id: 'tracks', label: 'Tracks', icon: Music },
    { id: 'deezer', label: 'Deezer', icon: Heart },
    { id: 'charts', label: 'Stats', icon: BarChart3 },
    { id: 'links', label: 'Links', icon: Link2 },
  ];

  return (
    <div className="max-w-md mx-auto bg-slate-950 min-h-screen text-slate-100 shadow-2xl relative font-sans">
      
      {/* HEADER DO ARTISTA */}
      <div className="relative h-48 bg-gradient-to-b from-slate-800 to-slate-950 overflow-hidden">
        <img 
          src={artist.photo} 
          alt=""
          className="w-full h-full object-cover opacity-30 blur-sm absolute scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <img 
            src={artist.photo} 
            alt={artist.name}
            className="w-20 h-20 rounded-xl object-cover border-2"
            style={{ borderColor: getRatingColor(artist.rating) }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black uppercase tracking-wide truncate" style={{ color: getRatingColor(artist.rating) }}>
                {artist.name}
              </h1>
              <img 
                src={`https://flagcdn.com/w20/${artist.countryCode}.png`} 
                alt={artist.country} 
                className="h-3 rounded-sm shadow-sm" 
              />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{artist.genre}</p>
            
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300">
              <span className="flex items-center gap-1 font-bold" style={{ color: getRatingColor(artist.rating) }}>
                <Star size={12} fill="currentColor" /> {artist.rating === 3 ? 'TOP' : artist.rating === 2 ? 'MED' : 'LOW'}
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-0.5 text-slate-400">
                <MapPin size={12} /> {artist.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ABAS DE NAVEGAÇÃO COMPACTAS */}
      <div className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-900 overflow-x-auto flex whitespace-nowrap scrollbar-none">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                isSelected 
                  ? 'border-emerald-500 text-emerald-400 bg-slate-900/40' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <IconComponent size={13} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="p-4 space-y-4">
        
        {/* ABA PRINCIPAL */}
        {activeTab === 'main' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Scrobbles</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{artist.totalScrobbles}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Ranking Global</p>
                <p className="text-xl font-black text-sky-400 mt-0.5">#{artist.globalRanking}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-3.5 space-y-2.5 text-xs font-medium">
              <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                <span className="text-slate-400 uppercase tracking-wider">Último scrobble:</span>
                <span className="text-slate-200 font-bold">{artist.daysSinceLastScrobble} dias atrás</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                <span className="text-slate-400 uppercase tracking-wider">Score de Recência:</span>
                <span className="text-amber-400 font-black">{artist.recencyScore}/100</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/40 pb-1.5">
                <span className="text-slate-400 uppercase tracking-wider">Status Mensal:</span>
                <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">{artist.trendingPosition}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400 uppercase tracking-wider">Idioma de canto:</span>
                <span className="text-slate-200 uppercase font-bold">{artist.language}</span>
              </div>
            </div>

            {/* SEÇÃO VIOLÃO */}
            <div className="bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-900/40 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-emerald-400 text-xs uppercase tracking-wider">Repertório no Violão</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Músicas prontas para tocar na roda</p>
              </div>
              <div className="bg-emerald-500 text-slate-950 font-black px-3 py-1 rounded-lg text-sm">
                {artist.guitarSetlistCount}
              </div>
            </div>

            {/* ARTISTAS SIMILARES */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Similares Recomendados</h3>
              <div className="flex flex-wrap gap-2">
                {artist.similarArtists.map((similar, i) => (
                  <span key={i} className="text-xs font-bold uppercase tracking-wide px-2.5 py-1.5 bg-slate-900 border border-slate-800/80 text-slate-300 rounded-lg">
                    {similar}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ABA COLEÇÃO DE ÁLBUNS */}
        {activeTab === 'albums' && (
          <div className="space-y-2 animate-fadeIn">
            {artist.collectionAlbums.map((album, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-100">{album.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {album.year} • <span className="text-emerald-400 font-bold uppercase">{album.format}</span>
                  </p>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded" style={{ color: getRatingColor(album.rating), backgroundColor: `${getRatingColor(album.rating)}15` }}>
                  ★ {album.rating}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ABA TOP TRACKS */}
        {activeTab === 'tracks' && (
          <div className="space-y-2 animate-fadeIn">
            {artist.topTracks.map((track, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-600 w-4">{i + 1}</span>
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wide text-slate-200">{track.title}</h4>
                    <p className="text-[11px] text-emerald-500 font-bold mt-0.5">{track.scrobbles} scrobbles</p>
                  </div>
                </div>
                {track.inSetlist && (
                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 border border-emerald-500/20 rounded-md tracking-wider">
                    VIOLÃO
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA DEEZER ALBUMS */}
        {activeTab === 'deezer' && (
          <div className="space-y-2 animate-fadeIn">
            {artist.deezerAlbums.map((album, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-slate-200">{album.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{album.year} • {album.tracksCount} faixas</p>
                </div>
                <Heart size={14} className="text-slate-700 hover:text-rose-500 transition-colors cursor-pointer" />
              </div>
            ))}
          </div>
        )}

        {/* ABA HISTÓRICO / STATS */}
        {activeTab === 'charts' && (
          <div className="bg-slate-900 border border-slate-800/60 rounded-xl p-4 animate-fadeIn">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Histórico de Ouvidas por Ano</h3>
            <div className="flex items-end justify-between h-28 pt-4 bg-slate-950 p-3 rounded-xl border border-slate-900">
              {artist.charts.years.map((year, i) => {
                const val = artist.charts.scrobbles[i];
                const maxVal = Math.max(...artist.charts.scrobbles);
                const pct = (val / maxVal) * 100;
                return (
                  <div key={year} className="flex flex-col items-center flex-1 group">
                    <span className="text-[9px] text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {val}
                    </span>
                    <div 
                      style={{ height: `${pct}%` }} 
                      className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-[3px] transition-all duration-500" 
                    />
                    <span className="text-[9px] text-slate-500 font-bold mt-2">{year}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ABA LINKS EXTERNOS */}
        {activeTab === 'links' && (
          <div className="grid grid-cols-1 gap-2 animate-fadeIn">
            {artist.links.map((link, i) => (
              <a 
                key={i} 
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 border border-slate-800/60 hover:border-slate-700 hover:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-slate-300 transition-all"
              >
                <span>{link.name}</span>
                <Link2 size={14} className="text-slate-500" />
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}