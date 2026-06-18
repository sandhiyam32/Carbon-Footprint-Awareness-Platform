import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SEED_ARTICLES = [
  { id: 'seed1', title: 'Understanding Your Carbon Footprint', category: 'Climate Change', content: 'Your carbon footprint is the total greenhouse gas emissions caused by your actions. The average person generates about 4 tons of CO₂ per year. Understanding and reducing this is key to combating climate change.', author_name: 'EcoTeam', created_at: new Date().toISOString(), image_url: '' },
  { id: 'seed2', title: '10 Simple Ways to Go Green at Home', category: 'Sustainable Living', content: 'Switch to LED lighting, use a programmable thermostat, fix leaky faucets, compost food scraps, choose energy-efficient appliances, insulate your home, use cold water for laundry, air-dry clothes, and plant native trees.', author_name: 'GreenLiving', created_at: new Date().toISOString(), image_url: '' },
  { id: 'seed3', title: 'The Impact of Diet on Climate Change', category: 'Food & Environment', content: 'Food production accounts for 26% of global greenhouse gas emissions. A vegan diet produces 50% less emissions than a meat-rich diet. Even reducing meat by 2 days per week makes a significant difference.', author_name: 'FoodEco', created_at: new Date().toISOString(), image_url: '' },
];

const SEED_QUIZZES = [
  { id: 1, question: 'Which mode of transport produces the most CO₂ per km?', option_a: 'Electric car', option_b: 'Commercial flight', option_c: 'Diesel car', option_d: 'Bus', correct: 'b', explanation: 'Commercial flights produce about 255g CO₂/km per passenger, highest among common transport.' },
  { id: 2, question: 'How much CO₂ does a single tree absorb per year?', option_a: '5 kg', option_b: '10 kg', option_c: '22 kg', option_d: '50 kg', correct: 'c', explanation: 'A mature tree absorbs about 22 kg of CO₂ per year through photosynthesis.' },
  { id: 3, question: 'What percentage of global emissions comes from food production?', option_a: '10%', option_b: '26%', option_c: '40%', option_d: '15%', correct: 'b', explanation: 'Food production accounts for approximately 26% of global greenhouse gas emissions.' },
];

export default function Education() {
  const [activeTab, setActiveTab] = useState('articles');
  const [articles, setArticles] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizState, setQuizState] = useState({});
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [articleForm, setArticleForm] = useState({ title: '', content: '', category: '', image_url: '' });
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/articles/'), api.get('/quizzes/')]).then(([a, q]) => {
      const apiArticles = a.data.results || a.data;
      setArticles([...SEED_ARTICLES, ...apiArticles]);
      setQuizzes(q.data.results || q.data);
    }).catch(() => {
      setArticles(SEED_ARTICLES);
      setQuizzes([]);
    }).finally(() => setLoading(false));
  }, []);

  const handleAnswer = async (quiz, option) => {
    if (quizState[quiz.id]) return;
    try {
      const { data } = await api.post('/quizzes/answer/', { quiz_id: quiz.id, answer: option });
      setQuizState(p => ({ ...p, [quiz.id]: { ...data, selected: option } }));
    } catch {
      const seed = SEED_QUIZZES.find(q => q.id === quiz.id);
      if (seed) {
        const correct = seed.correct === option;
        setQuizState(p => ({ ...p, [quiz.id]: { correct, correct_option: seed.correct, explanation: seed.explanation, selected: option } }));
      }
    }
  };

  const handleAddArticle = async e => {
    e.preventDefault();
    try {
      const { data } = await api.post('/articles/', articleForm);
      setArticles(prev => [...prev, data]);
      setShowArticleForm(false);
      setArticleForm({ title: '', content: '', category: '', image_url: '' });
      toast.success('Article posted!');
    } catch { toast.error('Failed to post article'); }
  };

  const displayQuizzes = quizzes.length > 0 ? quizzes : SEED_QUIZZES;

  if (loading) return <div className="loading">🌿</div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Education Hub</h2>
          <p className="text-gray text-sm">Learn, quiz, and grow your eco-knowledge</p>
        </div>
        {activeTab === 'articles' && (
          <button className="btn btn-primary" onClick={() => setShowArticleForm(!showArticleForm)}>
            {showArticleForm ? '✕ Cancel' : '+ Write Article'}
          </button>
        )}
      </div>

      <div className="tabs">
        {['articles', 'quizzes', 'resources'].map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'articles' ? '📰 Articles' : t === 'quizzes' ? '🧩 Quizzes' : '📚 Resources'}
          </button>
        ))}
      </div>

      {activeTab === 'articles' && (
        <div>
          {showArticleForm && (
            <div className="card" style={{ marginBottom: '24px' }}>
              <div className="card-title">✍️ Write an Article</div>
              <form onSubmit={handleAddArticle}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" required value={articleForm.title}
                      onChange={e => setArticleForm(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input className="form-input" placeholder="e.g. Climate Change" required value={articleForm.category}
                      onChange={e => setArticleForm(p => ({ ...p, category: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea className="form-textarea" required value={articleForm.content}
                    onChange={e => setArticleForm(p => ({ ...p, content: e.target.value }))} />
                </div>
                <button type="submit" className="btn btn-primary">Publish Article</button>
              </form>
            </div>
          )}

          {selectedArticle ? (
            <div className="card">
              <button className="btn btn-secondary btn-sm" style={{ marginBottom: '16px' }} onClick={() => setSelectedArticle(null)}>← Back</button>
              <span className="badge badge-green" style={{ marginBottom: '12px' }}>{selectedArticle.category}</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>{selectedArticle.title}</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                By {selectedArticle.author_name} · {new Date(selectedArticle.created_at).toLocaleDateString()}
              </p>
              <p style={{ lineHeight: 1.8, color: '#374151' }}>{selectedArticle.content}</p>
            </div>
          ) : (
            <div className="grid-3">
              {articles.map((a, i) => (
                <div key={a.id || i} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                  onClick={() => setSelectedArticle(a)}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  <div style={{ height: '80px', background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', marginBottom: '16px' }}>
                    {a.category?.includes('Climate') ? '🌍' : a.category?.includes('Food') ? '🥗' : '🌿'}
                  </div>
                  <span className="badge badge-green" style={{ marginBottom: '8px' }}>{a.category}</span>
                  <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>{a.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.content}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                    By {a.author_name} · {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div>
          <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧩</div>
            <h3 style={{ fontWeight: 700, fontSize: '18px' }}>Test Your Eco-Knowledge!</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Answer questions and learn interesting climate facts.</p>
          </div>
          {displayQuizzes.map((quiz, i) => {
            const state = quizState[quiz.id];
            return (
              <div className="card" key={quiz.id} style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
                  Q{i + 1}. {quiz.question}
                </div>
                {['a', 'b', 'c', 'd'].map(opt => {
                  const text = quiz[`option_${opt}`];
                  const cls = state
                    ? state.correct_option === opt ? 'correct' : state.selected === opt ? 'wrong' : ''
                    : '';
                  return (
                    <button key={opt} className={`quiz-option ${cls}`} onClick={() => handleAnswer(quiz, opt)} disabled={!!state}>
                      <strong>{opt.toUpperCase()}.</strong> {text}
                    </button>
                  );
                })}
                {state && (
                  <div style={{ padding: '12px', borderRadius: '8px', background: state.correct ? '#f0fdf4' : '#fee2e2', marginTop: '8px' }}>
                    <strong>{state.correct ? '✅ Correct!' : '❌ Wrong!'}</strong>
                    <p style={{ fontSize: '13px', marginTop: '4px' }}>{state.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="grid-2">
          {[
            { icon: '🌡️', title: 'Climate Change Basics', desc: 'Understanding global warming, greenhouse gases, and their effects on our planet.', link: 'https://climate.nasa.gov' },
            { icon: '♻️', title: 'Recycling Guide', desc: 'Learn what can be recycled and how to reduce household waste effectively.', link: 'https://www.epa.gov/recycle' },
            { icon: '☀️', title: 'Renewable Energy', desc: 'Explore solar, wind, and other clean energy options for your home.', link: 'https://www.energy.gov/eere/renewable-energy' },
            { icon: '🌊', title: 'Ocean Conservation', desc: 'How carbon emissions affect our oceans and what you can do to help.', link: 'https://ocean.si.edu/ocean-life/fish/ocean-and-climate' },
            { icon: '🌳', title: 'Tree Planting Initiatives', desc: 'Join global tree planting programs to offset your carbon footprint.', link: 'https://onetreeplanted.org' },
            { icon: '🏙️', title: 'Sustainable Cities', desc: 'Learn how cities around the world are becoming greener and smarter.', link: 'https://www.unep.org/explore-topics/cities' },
          ].map((r, i) => (
            <a key={i} href={r.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', gap: '16px', alignItems: 'flex-start' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <span style={{ fontSize: '36px' }}>{r.icon}</span>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937' }}>{r.title}</h3>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{r.desc}</p>
                  <span style={{ fontSize: '12px', color: '#16a34a', marginTop: '8px', display: 'block' }}>Learn more →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
