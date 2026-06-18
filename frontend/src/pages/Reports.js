import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../utils/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Reports() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/reports/?period=${period}`).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [period]);

  const chartData = data?.entries?.map(e => ({
    name: `${MONTHS[e.month - 1]} ${e.year}`,
    Total: e.total_emission,
    Transport: e.transport_emission,
    Electricity: e.electricity_emission,
    Food: e.food_emission,
    Waste: e.waste_emission,
  })).reverse() || [];

  const handlePrint = () => window.print();

  if (loading) return <div className="loading">🌿</div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>Reports & Analytics</h2>
          <p className="text-gray text-sm">Visualize your carbon footprint over time</p>
        </div>
        <div className="flex gap-2">
          <select className="form-select" style={{ width: 'auto' }} value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="monthly">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="btn btn-secondary" onClick={handlePrint}>🖨️ Print Report</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div className="stat-value">{data?.total?.toFixed(1) || '—'}</div>
          <div className="stat-label">Total kg CO₂</div>
          <div className="stat-change positive">All entries combined</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📅</span>
          <div className="stat-value">{data?.average?.toFixed(1) || '—'}</div>
          <div className="stat-label">Avg kg CO₂ / month</div>
          <div className="stat-change positive">{data?.entries?.length || 0} months tracked</div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📋</span>
          <div className="stat-value">{data?.entries?.length || 0}</div>
          <div className="stat-label">Total Entries</div>
          <div className="stat-change positive">Generated: {data?.generated_at}</div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <h3>No data available</h3>
            <p>Log your carbon entries to generate reports</p>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">📈 Monthly Emission Trend</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => `${v?.toFixed(1)} kg CO₂`} />
                <Legend />
                <Line type="monotone" dataKey="Total" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-title">🏗️ Category Breakdown Over Time</div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => `${v?.toFixed(1)} kg CO₂`} />
                <Legend />
                <Bar dataKey="Transport" stackId="a" fill="#22c55e" radius={[0,0,0,0]} />
                <Bar dataKey="Electricity" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Food" stackId="a" fill="#f59e0b" />
                <Bar dataKey="Waste" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-title">📋 Detailed Entry Table</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    {['Period', 'Transport', 'Electricity', 'Food', 'Waste', 'Water', 'Total'].map(h => (
                      <th key={h} style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.entries || []).map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{MONTHS[e.month - 1]} {e.year}</td>
                      <td style={{ padding: '12px' }}>{e.transport_emission?.toFixed(1)}</td>
                      <td style={{ padding: '12px' }}>{e.electricity_emission?.toFixed(1)}</td>
                      <td style={{ padding: '12px' }}>{e.food_emission?.toFixed(1)}</td>
                      <td style={{ padding: '12px' }}>{e.waste_emission?.toFixed(1)}</td>
                      <td style={{ padding: '12px' }}>{e.water_emission?.toFixed(1)}</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#16a34a' }}>{e.total_emission?.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
