import React, { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [streamLoading, setStreamLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAnime = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`https://anime-scrape-production.up.railway.app/db/anime-list?page=${page}`);
      const data = await response.json();
      console.log('API Response:', data); 
      
      if (Array.isArray(data)) {
        setAnimeList(data);
      } else if (data.results && Array.isArray(data.results)) {
        setAnimeList(data.results);
      } else if (data.data && Array.isArray(data.data)) {
        setAnimeList(data.data);
      } else {
        setAnimeList([]);
        console.warn('Unexpected API response structure:', data);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch anime data');
      setLoading(false);
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAnime(currentPage);
  }, [currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setStreamData(null); // Clear current stream when changing pages
    setSelectedAnime(null);
  };

  const fetchEpisodeStream = async (anime, episodeNumber) => {
    setStreamLoading(true);
    try {
      const animeId = (anime.title || anime.name || 'unknown')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');

      const response = await fetch(`https://anime-scrape-production.up.railway.app/episode-stream?id=${animeId}&ep=${episodeNumber}`);
      const data = await response.json();
      
      setStreamData(data);
      setSelectedAnime({...anime, episode: episodeNumber});
      console.log('Episode stream data:', data);
    } catch (error) {
      console.error('Error fetching episode stream:', error);
      setStreamData(null);
    }
    setStreamLoading(false);
  };

  const generateEpisodeButtons = (anime) => {
    let episodeCount = 0;
    
    if (anime.episodes) {
      const episodeStr = anime.episodes.toString();
      const match = episodeStr.match(/\d+/);
      if (match) {
        episodeCount = parseInt(match[0]);
      }
    } else if (anime.episode_count) {
      episodeCount = parseInt(anime.episode_count);
    }
    
    if (episodeCount === 0 || isNaN(episodeCount)) {
      return <p style={{ color: '#8b949e', fontSize: '12px' }}>No episodes available</p>;
    }

    const buttons = [];
    for (let i = 1; i <= episodeCount; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => fetchEpisodeStream(anime, i)}
          disabled={streamLoading}
          style={{
            margin: '2px',
            padding: '4px 8px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundColor: '#21262d',
            color: '#c9d1d9',
            border: '1px solid #30363d',
            borderRadius: '3px',
            minWidth: '25px'
          }}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  const renderStreamingPlayer = () => {
    if (!streamData) {
      return <p style={{ color: '#8b949e' }}>No stream data available</p>;
    }

    console.log('Full streamData:', streamData);

    // Check different possible property names for streaming links
    let streamingLink = null;
    
    if (streamData.streaming_link) {
      streamingLink = streamData.streaming_link;
    } else if (streamData.data && streamData.data.streaming_link) {
      streamingLink = streamData.data.streaming_link;
    } else if (streamData.streaming_links && streamData.streaming_links.length > 0) {
      streamingLink = streamData.streaming_links[0];
    } else if (streamData.stream_url) {
      streamingLink = streamData.stream_url;
    } else if (streamData.url) {
      streamingLink = streamData.url;
    }

    if (!streamingLink) {
      return (
        <div style={{ color: '#8b949e' }}>
          <p>No streaming link available</p>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer' }}>Debug: Show API response</summary>
            <pre style={{ fontSize: '10px', overflow: 'auto', marginTop: '10px', backgroundColor: '#0d1117', padding: '10px', borderRadius: '4px' }}>
              {JSON.stringify(streamData, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    return (
      <div>
        <iframe 
          src={streamingLink}
          width="100%"
          height="500"
          frameBorder="0"
          allowFullScreen
          style={{
            borderRadius: '8px',
            backgroundColor: '#000'
          }}
        />
      </div>
    );
  };

  const renderPagination = () => {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '10px', 
        margin: '20px 0',
        padding: '20px'
      }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          style={{
            padding: '8px 12px',
            backgroundColor: currentPage === 1 ? '#30363d' : '#21262d',
            color: currentPage === 1 ? '#8b949e' : '#c9d1d9',
            border: '1px solid #30363d',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        
        <span style={{ color: '#c9d1d9', fontSize: '14px' }}>
          Page {currentPage}
        </span>
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={loading}
          style={{
            padding: '8px 12px',
            backgroundColor: '#21262d',
            color: '#c9d1d9',
            border: '1px solid #30363d',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Next
        </button>
        
        <div style={{ marginLeft: '20px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span style={{ color: '#8b949e', fontSize: '12px' }}>Go to page:</span>
          <input
            type="number"
            min="1"
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page > 0) {
                handlePageChange(page);
              }
            }}
            style={{
              width: '60px',
              padding: '4px 6px',
              backgroundColor: '#21262d',
              color: '#c9d1d9',
              border: '1px solid #30363d',
              borderRadius: '3px',
              fontSize: '12px'
            }}
          />
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading anime...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Anime List</h1>
      
      {streamData && (
        <div style={{ backgroundColor: '#161b22', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
          <h2>Now Playing: {selectedAnime?.title || selectedAnime?.name} - Episode {selectedAnime?.episode}</h2>
          
          {streamLoading ? (
            <div>Loading stream...</div>
          ) : (
            renderStreamingPlayer()
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {renderPagination()}

      <div>
        {animeList.length > 0 ? (
          animeList.map((anime, index) => (
            <div key={index} className="anime-card">
              {(anime.image || anime.poster || anime.thumbnail) && (
                <img 
                  src={anime.image || anime.poster || anime.thumbnail} 
                  alt={anime.title || anime.name || 'Anime poster'}
                  className="anime-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="anime-info">
                <h3>{anime.title || anime.name || 'Unknown Title'}</h3>
                <p>Episodes: {anime.episodes || anime.episode_count || 'N/A'}</p>
                
                <div style={{ marginTop: '10px' }}>
                  <p style={{ fontSize: '14px', marginBottom: '5px', color: '#8b949e' }}>Episodes:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                    {generateEpisodeButtons(anime)}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No anime found</p>
        )}
      </div>

      {/* Bottom Pagination */}
      {renderPagination()}
    </div>
  );
}

export default App