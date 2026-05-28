// src/mobile.jsx — Mobile "Atmosfer" weather app (iOS frame).
// Full-bleed photo hero with scrollable content overlay.
// Exports to window: MobileApp.

const MobileApp = ({ t, lang, cities, activeId, setActiveId }) => {
  const i18n = window.I18N[lang];
  const city = cities.find(c => c.id === activeId) || cities[0];
  const toUnit = useUnit(t.unit);

  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const localTime = `${hh}:${mm}`;

  const hero = window.cityPhoto(city, 0);
  const [prevHero, setPrevHero] = React.useState(hero);
  const [fadeKey, setFadeKey] = React.useState(0);
  React.useEffect(() => {
    setFadeKey(k => k + 1);
    const id = setTimeout(() => setPrevHero(hero), 650);
    return () => clearTimeout(id);
  }, [hero]);

  const [screen, setScreen] = React.useState('home'); // 'home' | 'list' | 'search'
  const [searchQ, setSearchQ] = React.useState('');
  const searchResults = searchQ.trim()
    ? cities.filter(c =>
        c.name.tr.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.name.en.toLowerCase().includes(searchQ.toLowerCase()))
    : cities;

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden', color: '#fff',
      fontFamily: 'var(--font-body)',
      background: '#000',
    }}>
      {/* HERO bg */}
      <div key={`mprev-${prevHero}`} style={{
        position: 'absolute', inset: 0,
        background: `url(${prevHero}) center/cover`,
      }}/>
      <div key={`mhero-${hero}-${fadeKey}`} style={{
        position: 'absolute', inset: 0,
        background: `url(${hero}) center/cover`,
        animation: 'heroFade 650ms ease both',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: t.bgStyle === 'minimal'
          ? 'linear-gradient(180deg, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.92) 100%)'
          : t.bgStyle === 'gradient'
            ? `linear-gradient(180deg, ${t.palette[0]}cc 0%, ${t.palette[1]}cc 100%)`
            : t.bgStyle === 'mesh'
              ? 'radial-gradient(ellipse at 20% 10%, rgba(0,0,0,0.05), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(0,0,0,0.65), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.82) 100%)',
      }}/>

      {/* Content */}
      {screen === 'home' && (
        <div style={{
          position: 'relative', height: '100%',
          overflowY: 'auto', WebkitOverflowScrolling: 'touch',
        }} className="hide-scrollbar">
          {/* Top bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 20px 6px 20px',
          }}>
            <button onClick={() => setScreen('list')} style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 12, opacity: 0.85,
              letterSpacing: '0.06em', textTransform: 'uppercase',
            }}>
              <UIIcon kind="menu" size={16} color="#fff"/>
              <span>{i18n.myCities}</span>
            </button>
            <button onClick={() => setScreen('search')} style={{
              all: 'unset', cursor: 'pointer', opacity: 0.85,
            }}>
              <UIIcon kind="search" size={18} color="#fff"/>
            </button>
          </div>

          {/* Hero block */}
          <div style={{
            padding: '24px 20px 12px 20px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', opacity: 0.7,
            }}>{city.region[lang]}</div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 42, fontWeight: 300,
              letterSpacing: '-0.02em',
              margin: '6px 0 2px 0',
            }}>{city.name[lang]}</h1>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 124, fontWeight: 200,
              letterSpacing: '-0.06em', lineHeight: 1,
              marginTop: 12, marginLeft: 12,
              textShadow: '0 4px 24px rgba(0,0,0,0.35)',
            }}>{toUnit(city.current.temp)}</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18, fontStyle: 'italic',
              marginTop: 6, opacity: 0.95,
            }}>{i18n.conditions[city.current.condition]}</div>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 16,
              fontSize: 13, opacity: 0.78, marginTop: 8,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span>↑ {toUnit(city.hi)}</span>
              <span>↓ {toUnit(city.lo)}</span>
              <span>{i18n.feelsLike} {toUnit(city.current.feels)}</span>
            </div>
          </div>

          {/* Glass card stack */}
          <div style={{
            padding: '12px 14px 28px 14px',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {/* Hourly */}
            <div style={glassCard}>
              <div style={cardLabel}>{i18n.hourly}</div>
              <HourlyStrip hours={city.hourly} toUnit={toUnit} color="#fff" compact/>
            </div>

            {/* Sun arc */}
            <div style={glassCard}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div style={cardLabel}>{i18n.daylight}</div>
                <div style={{
                  fontSize: 11, opacity: 0.7,
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                }}>{hoursBetween(city.sun.rise, city.sun.set)}</div>
              </div>
              <div style={{ marginTop: 4, display: 'grid', placeItems: 'center' }}>
                <SunArc rise={city.sun.rise} set={city.sun.set} lang={lang} i18n={i18n} size="md"/>
              </div>
            </div>

            {/* Daily */}
            <div style={glassCard}>
              <div style={cardLabel}>{i18n.sevenDay}</div>
              <div style={{ marginTop: 4 }}>
                <DailyList days={city.daily} toUnit={toUnit} color="#fff" i18n={i18n} compact/>
              </div>
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <MetricChip icon="drop" label={i18n.humidity}
                value={`${city.current.humidity}%`} color="#fff" compact/>
              <MetricChip icon="wind" label={i18n.wind}
                value={`${city.current.wind}`} sub="km/sa" color="#fff" compact/>
              <MetricChip icon="sun-small" label={i18n.uv}
                value={`${city.current.uv}`}
                sub={city.current.uv >= 7 ? (lang==='tr'?'yüksek':'high') : (lang==='tr'?'orta':'mod')}
                color="#fff" compact/>
              <MetricChip icon="eye" label={i18n.visibility}
                value={`${city.current.visibility}`} sub="km" color="#fff" compact/>
            </div>
          </div>
        </div>
      )}

      {/* City list screen */}
      {screen === 'list' && (
        <div style={{
          position: 'relative', height: '100%',
          padding: '14px 16px 24px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto',
        }} className="hide-scrollbar">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 4,
          }}>
            <button onClick={() => setScreen('home')} style={{
              all: 'unset', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontSize: 13, opacity: 0.85,
            }}>
              <UIIcon kind="chevron-left" size={16} color="#fff"/>
              <span style={{ fontFamily: 'var(--font-display)' }}>
                {lang==='tr'?'Geri':'Back'}
              </span>
            </button>
            <button onClick={() => setScreen('search')} style={{
              all: 'unset', cursor: 'pointer',
            }}>
              <UIIcon kind="search" size={18} color="#fff"/>
            </button>
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300,
            margin: '4px 0 8px 0', letterSpacing: '-0.02em',
          }}>{i18n.myCities}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cities.map(c => (
              <CityListRow key={c.id}
                city={c} lang={lang} i18n={i18n} toUnit={toUnit}
                active={c.id === activeId}
                onClick={() => { setActiveId(c.id); setScreen('home'); }}
                localTime={localTime}/>
            ))}
          </div>
        </div>
      )}

      {/* Search screen */}
      {screen === 'search' && (
        <div style={{
          position: 'relative', height: '100%',
          padding: '14px 16px 24px 16px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: 14,
          }}>
            <UIIcon kind="search" size={16} color="rgba(255,255,255,0.7)"/>
            <input autoFocus
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              placeholder={i18n.search}
              style={{
                all: 'unset', flex: 1, color: '#fff', fontSize: 14,
                fontFamily: 'var(--font-body)',
              }}/>
            <button onClick={() => setScreen('home')} style={{
              all: 'unset', cursor: 'pointer',
              fontSize: 13, opacity: 0.85,
              fontFamily: 'var(--font-display)',
            }}>{lang==='tr'?'İptal':'Cancel'}</button>
          </div>
          <div style={{
            flex: 1, overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 8,
          }} className="hide-scrollbar">
            {searchResults.map(c => (
              <button key={c.id} onClick={() => { setActiveId(c.id); setScreen('home'); setSearchQ(''); }}
                style={{
                  all: 'unset', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 12, width: '100%', boxSizing: 'border-box',
                  padding: 10, borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: `url(${window.cityPhoto(c, 0)}) center/cover`,
                  flexShrink: 0,
                }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontFamily: 'var(--font-display)' }}>{c.name[lang]}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{c.region[lang]}</div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300,
                }}>{toUnit(c.current.temp)}</div>
              </button>
            ))}
            {searchQ && searchResults.length === 0 && (
              <div style={{ padding: 24, color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>
                {lang==='tr'?'Sonuç yok':'No results'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const glassCard = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.16)',
  borderRadius: 18,
  padding: '14px 16px',
};

const cardLabel = {
  fontSize: 10, letterSpacing: '0.18em',
  textTransform: 'uppercase', opacity: 0.7,
  marginBottom: 10,
};

window.MobileApp = MobileApp;
