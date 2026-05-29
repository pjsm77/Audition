useEffect(() => {
    async function fetchChartData() {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const artistView = period === 'monthly' ? 'vw_top_artists_monthly' : 'vw_top_artists_annually';
      const songView = period === 'monthly' ? 'vw_top_songs_monthly' : 'vw_top_songs_annually';

      try {
        // 1. Busca Top Artistas com critério de desempate
        let artistQuery = supabase
          .from(artistView)
          .select('artist, scrobbles')
          .eq('year', year);

        if (period === 'monthly') {
          artistQuery = artistQuery.eq('month', month);
        }

        const { data: artistsData, error: errArt } = await artistQuery
          .order('scrobbles', { ascending: false })
          .order('last_scrobble', { ascending: false }) // Desempate: Mais recente primeiro
          .limit(10); // Garante apenas os 10 primeiros colocados

        if (errArt) throw errArt;

        // 2. Busca Top Músicas com critério de desempate
        let songQuery = supabase
          .from(songView)
          .select('song, artist, scrobbles')
          .eq('year', year);

        if (period === 'monthly') {
          songQuery = songQuery.eq('month', month);
        }

        const { data: songsData, error: errSong } = await songQuery
          .order('scrobbles', { ascending: false })
          .order('last_scrobble', { ascending: false }) // Desempate: Mais recente primeiro
          .limit(10); // Garante apenas os 10 primeiros colocados

        if (errSong) throw errSong;

        setTopArtists(artistsData || []);
        setTopSongs(songsData || []);

      } catch (error) {
        console.error('Erro ao carregar os charts:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, [period, currentDate]);