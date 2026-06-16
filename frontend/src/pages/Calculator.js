import React, { useState, useEffect } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import api from '../utils/api';
import toast from 'react-hot-toast';

const defaultForm = {
  car_km: 0, bike_km: 0, bus_km: 0, train_km: 0, flight_hours: 0,
  electricity_kwh: 0, water_liters: 0,
  food_type: 'non_vegetarian', waste_kg: 0, recycling_percent: 0,
};

export default function Calculator() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    api.get('/carbon-entries/').then(res => {
      const entries = res.data.results || res.data;
      setHistory(entries);
      // Pre-fill form if entry exists for current month
      const now = new Date();
      const current = entries.find(e => e.month === now.getMonth() + 1 && e.year === now.getFullYear());
      if (current) {
        setForm({
          car_km: current.car_km, bike_km: current.bike_km,
          bus_km: current.bus_km, train_km: current.train_km,
          flight_hours: current.flight_hours, electricity_kwh: current.electricity_kwh,
          water_liters: current.water_liters, food_type: current.food_type,
          waste_kg: current.waste_kg, recycling_percent: current.recycling_percent,
        });
      }
    });
  }, []);

  const steps = [
    {
      title: '🚗 Transportation',
      fields: [
        { key: 'car_km', label: 'Car distance (km/month)', icon: '🚗', max: 2000 },
        { key: 'bike_km', label: 'Bike/Motorcycle (km/month)', icon: '🏍️', max: 1000 },
        { key: 'bus_km', label: 'Bus (km/month)', icon: '🚌', max: 1000 },
        { key: 'train_km', label: 'Train (km/month)', icon: '🚆', max: 2000 },
        { key: 'flight_hours', label: 'Flight (hours/month)', icon: '✈️', max: 100 },
      ]
    },
    {
      title: '⚡ Energy & Water',
      fields: [
        { key: 'electricity_kwh', label: 'Electricity (kWh/month)', icon: '💡', max: 1000 },
        { key: 'water_liters', label: 'Water usage (liters/month)', icon: '💧', max: 20000 },
      ]
    },
    {
      title: '🥗 Food & Waste',
      fields: [
        { key: 'waste_kg', label: 'Waste generated (kg/month)', icon: '🗑️', max: 100 },
        { key: 'recycling_percent', label: 'Recycling rate (%)', icon: '♻️', max: 100 },
      ]
    },
  ];

  const handleChange = (key, value) => setForm(p => ({ ...p, [key]: parseFloat(value) || 0 }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Check if entry already exists for this month
      const existing = history.find(e => {
        const now = new Date();
        return e.month === now.getMonth() + 1 && e.year === now.getFullYear();
      });

      let data;
      if (existing) {
        // Update existing entry
        const res = await api.put(`/carbon-entries/${existing.id}/`, form);
        data = res.data;
        setHistory(prev => prev.map(e => e.id === existing.id ? data : e));
        toast.success('Entry updated successfully! 🌿');
      } else {
        // Create new entry
        const res = await api.post('/carbon-entries/', form);
        data = res.data;
        setHistory(prev => [data, ...prev.slice(0, 4)]);
        toast.success('Carbon footprint saved! 🌿');
      }
      setResult(data);
      setStep(3);
    } catch (err) {
      const errData = err.response?.data;
      const msg = errData
        ? Object.values(errData).flat().join(' ')
        : err.message || 'Failed to save. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const radarData = result ? [
    { subject: 'Transport', value: Math.min(100, result.transport_emission / 5) },
    { subject: 'Electricity', value: Math.min(100, result.electricity_emission / 2) },
    { subject: 'Water', value: Math.min(100, result.water_emission * 10) },
    { subject: 'Food', value: Math.min(100, result.food_emission / 2.5) },
    { subject: 'Waste', value: Math.min(100, result.waste_emission * 5) },
  ] : [];

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Carbon Footprint Calculator</h2>
          <p className="text-gray text-sm">Fill in your monthly consumption data</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="flex gap-2" style={{ justifyContent: 'center' }}>
          {['Transport', 'Energy', 'Food', 'Results'].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 700, fontSize: 14,
                background: step === i ? '#16a34a' : step > i ? '#bbf7d0' : '#f3f4f6',
                color: step === i ? 'white' : step > i ? '#166534' : '#9ca3af',
              }}>{i + 1}</div>
              <span style={{ fontSize: 13, fontWeight: 500, color: step === i ? '#16a34a' : '#6b7280' }}>{s}</span>
              {i < 3 && <span style={{ color: '#d1d5db' }}>›</span>}
            </div>
          ))}
        </div>
      </div>

      {step < 3 && (
        <div className="card">
          <div className="card-title">{steps[step].title}</div>
          {step === 0 && history.find(e => { const n = new Date(); return e.month === n.getMonth()+1 && e.year === n.getFullYear(); }) && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              ✏️ You already have an entry for this month. Submitting will <strong>update</strong> it.
            </div>
          )}

          {step === 2 && (
            <div className="form-group">
              <label className="form-label">🥗 Food Type</label>
              <select className="form-select" value={form.food_type} onChange={e => setForm(p => ({ ...p, food_type: e.target.value }))}>
                <option value="vegan">Vegan 🌱</option>
                <option value="vegetarian">Vegetarian 🥦</option>
                <option value="non_vegetarian">Non-Vegetarian 🍖</option>
              </select>
            </div>
          )}

          {steps[step].fields.map(field => (
            <div className="form-group" key={field.key}>
              <label className="form-label">{field.icon} {field.label}: <strong>{form[field.key]}</strong></label>
              <input type="range" className="form-range" min={0} max={field.max}
                value={form[field.key]} onChange={e => handleChange(field.key, e.target.value)} />
              <div className="flex justify-between text-xs text-gray">
                <span>0</span><span>{field.max / 2}</span><span>{field.max}</span>
              </div>
              <input type="number" className="form-input" style={{ marginTop: '8px' }}
                value={form[field.key]} onChange={e => handleChange(field.key, e.target.value)}
                min={0} max={field.max} placeholder="Or type a value" />
            </div>
          ))}

          <div className="flex gap-2 mt-4">
            {step > 0 && <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>}
            {step < 2
              ? <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
              : <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                  {loading ? '⏳ Calculating...' : '🌿 Calculate'}
                </button>
            }
          </div>
        </div>
      )}

      {step === 3 && result && (
        <div>
          <div className="grid-3" style={{ marginBottom: '24px' }}>
            <div className="stat-card" style={{ gridColumn: 'span 1' }}>
              <span className="stat-icon">🌍</span>
              <div className="stat-value">{result.total_emission.toFixed(1)}</div>
              <div className="stat-label">kg CO₂ / month</div>
              <div className="stat-change positive" style={{ marginTop: '8px' }}>≈ {(result.total_emission * 12).toFixed(0)} kg/year</div>
            </div>
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="card-title">📊 Category Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[
                  { label: 'Transport', value: result.transport_emission, icon: '🚗' },
                  { label: 'Electricity', value: result.electricity_emission, icon: '⚡' },
                  { label: 'Water', value: result.water_emission, icon: '💧' },
                  { label: 'Food', value: result.food_emission, icon: '🥗' },
                  { label: 'Waste', value: result.waste_emission, icon: '♻️' },
                ].map(c => (
                  <div key={c.label} style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                    <div style={{ fontSize: 20 }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, color: '#16a34a' }}>{c.value.toFixed(1)} kg</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{c.label}</div>
                    <div className="progress-bar" style={{ marginTop: '6px' }}>
                      <div className="progress-fill" style={{ width: `${Math.min(100, c.value / result.total_emission * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">🕸️ Emission Radar</div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 13 }} />
                <Radar name="Emissions" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <button className="btn btn-secondary" onClick={() => { setStep(0); setResult(null); }}>
            ← Log Another Entry
          </button>
        </div>
      )}

      {history.length > 0 && step !== 3 && (
        <div className="card" style={{ marginTop: '24px' }}>
          <div className="card-title">📜 Recent Entries</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Month/Year', 'Transport', 'Electricity', 'Food', 'Total'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 5).map((e, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px' }}>{e.month}/{e.year}</td>
                  <td style={{ padding: '10px 12px' }}>{e.transport_emission?.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px' }}>{e.electricity_emission?.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px' }}>{e.food_emission?.toFixed(1)}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 700, color: '#16a34a' }}>{e.total_emission?.toFixed(1)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
