// src/parts.jsx — Shared visual parts used by Desktop + Mobile.
// Exports to window: SunArc, HourlyStrip, DailyList, MetricChip, MetricGrid,
//   SearchSheet, CityListRow, useUnit, fmt, hoursBetween, sunProgress.

// ---------- helpers ----------
const useUnit = (unit) => {
  return (c) => unit === 'F'
    ? `${Math.round(c * 9/5 + 32)}°`
    : `${Math.round(c)}°`;
};

const fmt = {
  dayShort(date, i18n) {
    return i18n.days[date.getDay()];
  },
  dayLong(date, i18n) {
    return i18n.daysLong[date.getDay()];
  },
  dateLong(date, i18n) {
    return `${i18n.daysLong[date.getDay()]}, ${date.getDate()} ${i18n.months[date.getMonth()]}`;
  },
  hhmm(s) { return s; },
};

const parseHHMM = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

const sunProgress = (rise, set, nowMin) => {
  const r = parseHHMM(rise), s = parseHHMM(set);
  if (nowMin <= r) return 0;
  if (nowMin >= s) return 1;
  return (nowMin - r) / (s - r);
};

const hoursBetween = (rise, set) => {
  const r = parseHHMM(rise), s = parseHHMM(set);
  const mins = s - r;
  return `${Math.floor(mins/60)} sa ${mins%60} dk`;
};

// ---------- Sun arc ----------
// Elegant low arc with current position marker.
const SunArc = ({ rise, set, lang, i18n, color = '#fff', mode = 'light', size = 'lg' }) => {
  // Compute "now" minutes from the device clock for a live feel.
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const p = sunProgress(rise, set, nowMin);

  const W = size === 'lg' ? 460 : 320;
  const H = size === 'lg' ? 130 : 100;
  const padX = 28;
  // Arc going from (padX, H-10) up to (W/2, 10) and back down to (W-padX, H-10)
  const start = { x: padX, y: H - 10 };
  const end = { x: W - padX, y: H - 10 };
  const ctrl = { x: W / 2, y: -10 };
  // Quadratic curve point at parameter t
  const pt = (t) => ({
    x: (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * ctrl.x + t * t * end.x,
    y: (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * ctrl.y + t * t * end.y,
  });
  const dot = pt(Math.max(0.001, Math.min(0.999, p)));

  const dim = mode === 'light' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.35)';

  return (
    <div style={{ position: 'relative', color }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`sunArcG-${size}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor={color} stopOpacity="0.15"/>
            <stop offset="50%" stopColor={color} stopOpacity="0.7"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.15"/>
          </linearGradient>
        </defs>
        {/* horizon line */}
        <line x1="0" y1={H-10} x2={W} y2={H-10} stroke={dim} strokeWidth="1" strokeDasharray="2 4"/>
        {/* arc */}
        <path d={`M${start.x},${start.y} Q${ctrl.x},${ctrl.y} ${end.x},${end.y}`}
              stroke={`url(#sunArcG-${size})`} strokeWidth="1.5" fill="none"/>
        {/* sun marker */}
        <circle cx={dot.x} cy={dot.y} r="6" fill={color}/>
        <circle cx={dot.x} cy={dot.y} r="14" fill={color} opacity="0.18"/>
      </svg>
      <div style={{
        position: 'absolute', left: padX - 18, top: H - 4,
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        opacity: 0.85, display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <span style={{ opacity: 0.7 }}>{i18n.sunrise}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{rise}</span>
      </div>
      <div style={{
        position: 'absolute', right: padX - 18, top: H - 4,
        fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
        opacity: 0.85, textAlign: 'right',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <span style={{ opacity: 0.7 }}>{i18n.sunset}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>{set}</span>
      </div>
    </div>
  );
};

// ---------- Hourly strip ----------
const HourlyStrip = ({ hours, toUnit, color = '#fff', compact = false }) => {
  return (
    <div style={{
      display: 'flex', gap: compact ? 14 : 22,
      overflowX: 'auto', paddingBottom: 4,
      scrollbarWidth: 'none', msOverflowStyle: 'none',
    }} className="hide-scrollbar">
      {hours.map((h, i) => (
        <div key={i} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: compact ? 8 : 12, minWidth: compact ? 44 : 56,
          color, opacity: i === 0 ? 1 : 0.92,
        }}>
          <span style={{
            fontSize: compact ? 11 : 12, opacity: 0.75,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>{h.t}</span>
          <WeatherIcon kind={h.c} size={compact ? 22 : 28} stroke={1.3} color={color}/>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: compact ? 18 : 22, fontWeight: 400,
            letterSpacing: '-0.02em',
          }}>{toUnit(h.tempC)}</span>
        </div>
      ))}
    </div>
  );
};

// ---------- Daily list (7-day forecast) ----------
const DailyList = ({ days, toUnit, color = '#fff', i18n, compact = false }) => {
  // compute min/max across all days for the bar
  const allHi = days.map(d => d.hi);
  const allLo = days.map(d => d.lo);
  const max = Math.max(...allHi);
  const min = Math.min(...allLo);
  const range = max - min || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {days.map((d, i) => {
        const isToday = i === 0;
        const startPct = ((d.lo - min) / range) * 100;
        const widthPct = ((d.hi - d.lo) / range) * 100;
        // current temp marker only on today
        return (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: compact ? '64px 32px 1fr 70px' : '88px 36px 1fr 100px',
            alignItems: 'center', gap: compact ? 12 : 18,
            padding: compact ? '12px 0' : '14px 0',
            borderTop: i === 0 ? 'none' : `1px solid ${color === '#fff' ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.08)'}`,
            color,
          }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: compact ? 15 : 17,
              fontStyle: 'italic',
              opacity: isToday ? 1 : 0.95,
            }}>
              {isToday ? i18n.today : fmt.dayLong(d.day, i18n)}
            </div>
            <WeatherIcon kind={d.c} size={compact ? 20 : 24} stroke={1.3} color={color}/>
            <div style={{
              position: 'relative', height: 4,
              background: color === '#fff' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
              borderRadius: 999,
            }}>
              <div style={{
                position: 'absolute', left: `${startPct}%`, width: `${widthPct}%`,
                top: 0, bottom: 0,
                background: `linear-gradient(90deg, ${color === '#fff' ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)'} 0%, ${color === '#fff' ? '#fff' : '#000'} 100%)`,
                borderRadius: 999,
              }}/>
            </div>
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: compact ? 10 : 14,
              fontFamily: 'var(--font-display)', fontSize: compact ? 15 : 17,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ opacity: 0.55 }}>{toUnit(d.lo)}</span>
              <span>{toUnit(d.hi)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Metric chip ----------
const MetricChip = ({ icon, label, value, sub, color = '#fff', compact = false }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', gap: compact ? 6 : 10,
    padding: compact ? '14px 14px' : '18px 18px',
    background: color === '#fff' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${color === '#fff' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.06)'}`,
    borderRadius: 18, color,
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: compact ? 10 : 11, letterSpacing: '0.12em', textTransform: 'uppercase',
      opacity: 0.75,
    }}>
      <UIIcon kind={icon} size={compact ? 13 : 14} color={color}/>
      <span>{label}</span>
    </div>
    <div style={{
      fontFamily: 'var(--font-display)',
      fontSize: compact ? 22 : 28, fontWeight: 400,
      letterSpacing: '-0.02em',
    }}>{value}</div>
    {sub && <div style={{ fontSize: 12, opacity: 0.7 }}>{sub}</div>}
  </div>
);

// ---------- City row (sidebar) ----------
const CityListRow = ({ city, lang, i18n, toUnit, active, onClick, localTime }) => {
  return (
    <button onClick={onClick} style={{
      all: 'unset', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      width: '100%', height: 110,
      padding: 16, borderRadius: 16,
      background: `linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%), url(${window.cityPhoto(city, 0)}) center/cover`,
      position: 'relative', color: '#fff',
      outline: active ? '2px solid #fff' : '1px solid rgba(255,255,255,0.08)',
      outlineOffset: active ? -2 : -1,
      transition: 'transform 220ms ease, outline-color 200ms ease',
      transform: active ? 'scale(1)' : 'scale(1)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 400, lineHeight: 1.05,
            letterSpacing: '-0.01em',
          }}>{city.name[lang]}</div>
          <div style={{ fontSize: 11, opacity: 0.78, marginTop: 2 }}>
            {localTime}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 32, fontWeight: 300, letterSpacing: '-0.03em',
        }}>{toUnit(city.current.temp)}</div>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        fontSize: 12, opacity: 0.85, textTransform: 'lowercase',
      }}>
        <span>{i18n.conditions[city.current.condition]}</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          ↑{toUnit(city.hi)}  ↓{toUnit(city.lo)}
        </span>
      </div>
    </button>
  );
};

Object.assign(window, {
  useUnit, fmt, hoursBetween, sunProgress,
  SunArc, HourlyStrip, DailyList, MetricChip, CityListRow,
});
