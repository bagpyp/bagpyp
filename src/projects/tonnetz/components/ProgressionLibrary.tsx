import { useState, useMemo } from 'react';
import {
  PROGRESSIONS,
  ALL_GENRES,
  ALL_TAGS,
} from '../data/progressions';
import type { Progression } from '../data/progressions';
import { useApp } from '../state/AppContext';
import { playPath, initAudio } from '../audio/synth';

export function ProgressionLibrary() {
  const { dispatch } = useApp();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter progressions based on current selections
  const filteredProgressions = useMemo(() => {
    let results = PROGRESSIONS;

    // Filter by genre
    if (selectedGenre) {
      results = results.filter(p => p.genre === selectedGenre);
    }

    // Filter by tags (AND logic - must have all selected tags)
    if (selectedTags.length > 0) {
      results = results.filter(p =>
        selectedTags.every(tag => p.tags.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query)) ||
        p.source?.toLowerCase().includes(query) ||
        p.chords.some(c => c.toLowerCase().includes(query))
      );
    }

    return results;
  }, [selectedGenre, selectedTags, searchQuery]);

  // Get available tags based on current genre filter
  const availableTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    const progs = selectedGenre
      ? PROGRESSIONS.filter(p => p.genre === selectedGenre)
      : PROGRESSIONS;

    for (const prog of progs) {
      for (const tag of prog.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    return ALL_TAGS.filter(tag => tagCounts.has(tag))
      .map(tag => ({ tag, count: tagCounts.get(tag) || 0 }))
      .sort((a, b) => b.count - a.count);
  }, [selectedGenre]);

  const handleLoad = (progression: Progression) => {
    dispatch({ type: 'CLEAR_PATH' });
    // The progression already has pre-computed points with proper voicing
    for (const point of progression.points) {
      dispatch({
        type: 'ADD_POINT_TO_PATH',
        point,
      });
    }
  };

  const handleLoadAndPlay = async (progression: Progression) => {
    if (playingId) return;

    handleLoad(progression);

    await initAudio();
    setPlayingId(progression.id);

    // Play the pre-computed points directly
    await playPath(progression.points, 50);

    setPlayingId(null);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setSelectedTags([]);
    setSearchQuery('');
  };

  const hasFilters = selectedGenre || selectedTags.length > 0 || searchQuery.trim();

  return (
    <div className="progression-library">
      <h3>Progressions</h3>

      {/* Search */}
      <div className="prog-search">
        <input
          type="text"
          placeholder="Search progressions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="prog-search-input"
        />
      </div>

      {/* Genre filter */}
      <div className="prog-genre-filter">
        <select
          value={selectedGenre || ''}
          onChange={(e) => setSelectedGenre(e.target.value || null)}
          className="prog-genre-select"
        >
          <option value="">All Genres</option>
          {ALL_GENRES.map(genre => (
            <option key={genre} value={genre}>
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Tag chips */}
      <div className="prog-tags">
        {availableTags.slice(0, 12).map(({ tag, count }) => (
          <button
            key={tag}
            className={`prog-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => toggleTag(tag)}
            title={`${count} progressions`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button className="prog-clear-filters" onClick={clearFilters}>
          Clear filters ({filteredProgressions.length} results)
        </button>
      )}

      {/* Progression list */}
      <div className="progression-list">
        {filteredProgressions.map((prog) => (
          <div
            key={prog.id}
            className={`progression-item ${playingId === prog.id ? 'playing' : ''} ${expandedId === prog.id ? 'expanded' : ''}`}
          >
            <div
              className="progression-header"
              onClick={() => setExpandedId(expandedId === prog.id ? null : prog.id)}
            >
              <div className="progression-info">
                <span className="progression-name">{prog.name}</span>
                <span className="progression-meta">
                  {prog.genre && <span className="prog-genre-badge">{prog.genre}</span>}
                  <span className="progression-length">{prog.chords.length} chords</span>
                </span>
              </div>
              <div className="progression-actions">
                <button
                  className="prog-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadAndPlay(prog);
                  }}
                  disabled={playingId !== null}
                  title="Load and play"
                >
                  {playingId === prog.id ? '♫' : '▶'}
                </button>
                <button
                  className="prog-load-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoad(prog);
                  }}
                  disabled={playingId !== null}
                  title="Load to grid"
                >
                  ↗
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {expandedId === prog.id && (
              <div className="progression-details">
                <div className="prog-chords">
                  {prog.chords.map((chord, i) => (
                    <span key={i} className="prog-chord">{chord}</span>
                  ))}
                </div>
                {prog.source && (
                  <div className="prog-source">{prog.source}</div>
                )}
                {prog.tags.length > 0 && (
                  <div className="prog-detail-tags">
                    {prog.tags.map(tag => (
                      <span
                        key={tag}
                        className={`prog-detail-tag ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filteredProgressions.length === 0 && (
          <div className="prog-no-results">
            No progressions match your filters
          </div>
        )}
      </div>
    </div>
  );
}
