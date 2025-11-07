'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function TestosteroneTracker() {
  const [measurements, setMeasurements] = useState([]);
  const [date, setDate] = useState('');
  const [level, setLevel] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('testosterone-data');
    if (saved) {
      setMeasurements(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (measurements.length > 0) {
      localStorage.setItem('testosterone-data', JSON.stringify(measurements));
    }
  }, [measurements]);

  const addMeasurement = (e) => {
    e.preventDefault();
    if (!date || !level) return;

    const newMeasurement = {
      id: Date.now(),
      date,
      time: time || '00:00',
      level: parseFloat(level),
      notes,
      timestamp: new Date(`${date}T${time || '00:00'}`).getTime()
    };

    setMeasurements([...measurements, newMeasurement].sort((a, b) => a.timestamp - b.timestamp));
    setDate('');
    setLevel('');
    setTime('');
    setNotes('');
  };

  const deleteMeasurement = (id) => {
    setMeasurements(measurements.filter(m => m.id !== id));
  };

  const chartData = measurements.map(m => ({
    date: format(new Date(m.timestamp), 'dd MMM', { locale: ru }),
    level: m.level,
    fullDate: format(new Date(m.timestamp), 'dd.MM.yyyy HH:mm', { locale: ru })
  }));

  const avgLevel = measurements.length > 0
    ? (measurements.reduce((sum, m) => sum + m.level, 0) / measurements.length).toFixed(1)
    : 0;

  const minLevel = measurements.length > 0
    ? Math.min(...measurements.map(m => m.level))
    : 0;

  const maxLevel = measurements.length > 0
    ? Math.max(...measurements.map(m => m.level))
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <h1 style={{
          color: '#667eea',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontWeight: '700'
        }}>
          📊 Трекер Тестостерона
        </h1>

        {/* Statistics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '15px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Среднее значение</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{avgLevel}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>нмоль/л</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '20px',
            borderRadius: '15px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Минимум</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{minLevel}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>нмоль/л</div>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '15px',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Максимум</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{maxLevel}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>нмоль/л</div>
          </div>
        </div>

        {/* Chart */}
        {measurements.length > 0 && (
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '15px'
          }}>
            <h2 style={{ color: '#667eea', marginBottom: '20px' }}>График изменений</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  stroke="#667eea"
                  style={{ fontSize: '0.85rem' }}
                />
                <YAxis
                  stroke="#667eea"
                  style={{ fontSize: '0.85rem' }}
                  label={{ value: 'нмоль/л', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'white',
                    border: '2px solid #667eea',
                    borderRadius: '10px'
                  }}
                  labelFormatter={(label) => `Дата: ${label}`}
                  formatter={(value) => [`${value} нмоль/л`, 'Уровень']}
                />
                <Legend />
                <ReferenceLine
                  y={12}
                  stroke="#ff6b6b"
                  strokeDasharray="5 5"
                  label={{ value: 'Норма: 12-35', position: 'insideTopRight' }}
                />
                <ReferenceLine
                  y={35}
                  stroke="#ff6b6b"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#667eea"
                  strokeWidth={3}
                  dot={{ fill: '#667eea', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Тестостерон"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Add measurement form */}
        <div style={{
          marginBottom: '30px',
          padding: '25px',
          background: '#f8f9fa',
          borderRadius: '15px'
        }}>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>Добавить измерение</h2>
          <form onSubmit={addMeasurement}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                  Дата *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                  Время
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                  Уровень (нмоль/л) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                  placeholder="12.5"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#555', fontWeight: '500' }}>
                Заметки
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Дополнительная информация..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '1rem',
                  minHeight: '80px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              ✚ Добавить измерение
            </button>
          </form>
        </div>

        {/* Measurements history */}
        <div>
          <h2 style={{ color: '#667eea', marginBottom: '20px' }}>История измерений</h2>
          {measurements.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
              Пока нет данных. Добавьте первое измерение!
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {measurements.slice().reverse().map(m => (
                <div
                  key={m.id}
                  style={{
                    padding: '20px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    borderLeft: `5px solid ${
                      m.level < 12 ? '#ff6b6b' :
                      m.level > 35 ? '#ff6b6b' :
                      '#51cf66'
                    }`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                      {m.level} нмоль/л
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      📅 {format(new Date(m.timestamp), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                    </div>
                    {m.notes && (
                      <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>
                        💬 {m.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      background: m.level < 12 ? '#ffe3e3' : m.level > 35 ? '#ffe3e3' : '#d3f9d8',
                      color: m.level < 12 ? '#c92a2a' : m.level > 35 ? '#c92a2a' : '#2b8a3e'
                    }}>
                      {m.level < 12 ? 'Низкий' : m.level > 35 ? 'Высокий' : 'Норма'}
                    </span>
                    <button
                      onClick={() => deleteMeasurement(m.id)}
                      style={{
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 15px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '12px',
          borderLeft: '5px solid #2196f3'
        }}>
          <h3 style={{ color: '#1976d2', marginBottom: '10px' }}>ℹ️ Справочная информация</h3>
          <p style={{ color: '#555', margin: '5px 0' }}>
            <strong>Нормальный уровень тестостерона:</strong> 12-35 нмоль/л (для мужчин)
          </p>
          <p style={{ color: '#555', margin: '5px 0' }}>
            <strong>Рекомендация:</strong> Измерения лучше проводить утром (7-11 часов)
          </p>
          <p style={{ color: '#555', margin: '5px 0', fontSize: '0.85rem' }}>
            * Данные хранятся локально в вашем браузере
          </p>
        </div>
      </div>
    </div>
  );
}
