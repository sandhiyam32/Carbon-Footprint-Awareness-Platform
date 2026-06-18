import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const [activeTab, setActiveTab] = useState('forum');
  const [posts, setPosts] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showForm, setShowForm] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/forum/'),
      api.get('/challenges/'),
      api.get('/leaderboard/'),
    ]).then(([p, c, l]) => {
      setPosts(p.data.results || p.data);
      setChallenges(c.data.results || c.data);
      setLeaderboard(l.data.results || l.data);
    }).finally(() => setLoading(false));
  }, []);

  const handlePost = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/forum/', newPost);
      setPosts(prev => [data, ...prev]);
      setNewPost({ title: '', content: '' });
      setShowForm(false);
      toast.success('Post created! 🌿');
    } catch { toast.error('Failed to post'); }
  };

  const handleLike = async (id) => {
    const { data } = await api.post(`/forum/${id}/like/`);
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: data.likes } : p));
  };

  const handleComment = async (postId) => {
    if (!comment.trim()) return;
    const { data } = await api.post(`/forum/${postId}/comment/`, { content: comment });
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...(p.comments || []), data] } : p));
    setComment('');
    toast.success('Comment added!');
  };

  const handleJoinChallenge = async id => {
    try {
      await api.post(`/challenges/${id}/join/`);
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, is_joined: true } : c));
      toast.success('Joined the challenge! 💪');
    } catch { toast.error('Already joined or error occurred'); }
  };

  const handleCompleteChallenge = async id => {
    try {
      await api.post(`/challenges/${id}/complete/`);
      setChallenges(prev => prev.map(c => c.id === id ? { ...c, completed: true } : c));
      toast.success('Challenge completed! Badge earned! 🏆');
    } catch { toast.error('Failed to complete challenge'); }
  };

  if (loading) return <div className="loading">🌿</div>;

  const rankMedal = i => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Community</h2>
          <p className="text-gray text-sm">Connect, challenge, and inspire each other</p>
        </div>
        {activeTab === 'forum' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? '✕ Cancel' : '+ New Post'}
          </button>
        )}
      </div>

      <div className="tabs">
        {['forum', 'challenges', 'leaderboard'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'forum' ? '💬 Forum' : t === 'challenges' ? '🏆 Eco-Challenges' : '📊 Leaderboard'}
          </button>
        ))}
      </div>

      {activeTab === 'forum' && (
        <div>
          {showForm && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title">💬 New Discussion</div>
              <form onSubmit={handlePost}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" required value={newPost.title}
                    onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="What's on your mind?" />
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-textarea" required value={newPost.content}
                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))} placeholder="Share your thoughts..." />
                </div>
                <button type="submit" className="btn btn-primary">Post 🌿</button>
              </form>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">💬</span><h3>No posts yet</h3><p>Be the first to start a discussion!</p></div>
          ) : posts.map(post => (
            <div key={post.id} className="forum-post">
              <h3>{post.title}</h3>
              <div className="meta">
                <span>👤 {post.username}</span>
                <span>📅 {new Date(post.created_at).toLocaleDateString()}</span>
                <span>💬 {post.comment_count || post.comments?.length || 0} comments</span>
              </div>
              <p>{post.content}</p>
              <div className="forum-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => handleLike(post.id)}>
                  ❤️ {post.likes}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                  💬 Comment
                </button>
              </div>
              {expandedPost === post.id && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f3f4f6' }}>
                  {(post.comments || []).map((c, i) => (
                    <div key={i} style={{ padding: '10px', background: '#f9fafb', borderRadius: '8px', marginBottom: '8px', fontSize: '14px' }}>
                      <strong>{c.username}</strong>: {c.content}
                    </div>
                  ))}
                  <div className="flex gap-2 mt-4">
                    <input className="form-input" placeholder="Write a comment..." value={comment}
                      onChange={e => setComment(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn btn-primary btn-sm" onClick={() => handleComment(post.id)}>Send</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="grid-3">
          {challenges.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: 'span 3' }}>
              <span className="empty-icon">🏆</span>
              <h3>No challenges available</h3>
              <p>Check back soon for new eco-challenges!</p>
            </div>
          ) : challenges.map(c => (
            <div key={c.id} className="challenge-card">
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌿</div>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <div className="flex gap-2" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
                <span className="badge badge-green">+{c.points} pts</span>
                <span className="badge badge-blue">{c.duration_days} days</span>
              </div>
              {c.completed ? (
                <span className="badge badge-green">✓ Completed!</span>
              ) : c.is_joined ? (
                <button className="btn btn-primary btn-sm btn-full" onClick={() => handleCompleteChallenge(c.id)}>
                  Mark Complete ✓
                </button>
              ) : (
                <button className="btn btn-secondary btn-sm btn-full" onClick={() => handleJoinChallenge(c.id)}>
                  Join Challenge →
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div>
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
            <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Top Eco Warriors</h3>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Users with the most emission reduction and challenge completions</p>
          </div>
          {leaderboard.length === 0 ? (
            <div className="empty-state"><span className="empty-icon">🏆</span><h3>No data yet</h3><p>Start tracking to appear on the leaderboard!</p></div>
          ) : leaderboard.map((u, i) => (
            <div key={u.id} className="leaderboard-item">
              <span className={`rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                {rankMedal(i)}
              </span>
              <div className="user-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{u.first_name ? `${u.first_name} ${u.last_name}` : u.username}</div>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Reduced {u.total_reduction} kg CO₂</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#16a34a' }}>{u.points} pts</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>eco points</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
