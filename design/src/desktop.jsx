// src/desktop.jsx — Desktop "Atmosfer" weather app.
// Two-column: photographic city list (left), full-bleed hero detail (right).
// Exports to window: DesktopApp.

const DesktopApp = ({ t, lang, cities, activeId, setActiveId, onSearch }) => {
  const i18n = window.I18N[lang];
  const city = cities.find(c => c.id === activeId) || cities[0];
  const toUnit = useUnit(t.unit);

  // Live clock
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const localTime = `${hh}:${mm}`;

  const hero = window.cityPhoto(city, 0);
  // Cross-fade hero when city changes
  const [prevHero, setPrevHero] = React.useState(hero);
  const [fadeKey, setFadeKey] = React.useState(0);
  React.useEffect(() => {
    setPrevHero((p) => p);
    setFadeKey(k => k + 1);
    const id = setTimeout(() => setPrevHero(hero), 650);
    return () => clearTimeout(id);
  }, [hero]);

  // Search state
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQ, setSearchQ] = React.useState('');
  const searchResults = searchQ.trim()
    ? cities.filter(c =>
        c.name.tr.toLowerCase().includes(searchQ.toLowerCase()) ||
        c.name.en.toLowerCase().includes(searchQ.toLowerCase()))
    : [];

  return (
    <div style={{
      width: '100%', height: '100%', display: 'grid',
      gridTemplateColumns: '340px 1fr',
      background: '#0a0a0a', color: '#fff',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden',
    }}>
      {/* SIDEBAR */}
      <aside style={{
        background: 'rgba(10, 10, 12, 0.92)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        height: '100%', overflow: 'hidden',
      }}>
        {/* Wordmark */}
        <div style={{
          padding: '22px 22px 18px 22px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22, fontWeight: 400,
            letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'linear-gradient(135deg, #FFD27A 0%, #F2884B 100%)',
              boxShadow: '0 0 16px rgba(242, 136, 75, 0.6)',
            }}/>
            {i18n.appName}
            <span style={{
              fontSize: 10, opacity: 0.45, marginLeft: 4,
              fontFamily: 'var(--font-body)', letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>· {city.region[lang].split('·')[0].trim()}</span>
          </div>
          <button onClick={() => setSearchOpen(true)} style={{
            all: 'unset', cursor: 'pointer',
            width: 32, height: 32, borderRadius: '50%',
            display: 'grid', placeItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <UIIcon kind="plus" size={16} color="#fff"/>
          </button>
        </div>

        {/* Search input */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          <button onClick={() => setSearchOpen(true)} style={{
            all: 'unset', cursor: 'text', width: '100%', boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 13,
          }}>
            <UIIcon kind="search" size={15} color="rgba(255,255,255,0.55)"/>
            {i18n.search}
          </button>
        </div>

        {/* Section label */}
        <div style={{
          padding: '0 22px 10px 22px',
          fontSize: 10, letterSpacing: '0.18em',
          textTransform: 'uppercase', opacity: 0.45,
        }}>
          {i18n.myCities} · {cities.length}
        </div>

        {/* City list */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '0 12px 16px 12px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }} className="hide-scrollbar">
          {cities.map(c => (
            <CityListRow
              key={c.id}
              city={c} lang={lang} i18n={i18n} toUnit={toUnit}
              active={c.id === activeId}
              onClick={() => setActiveId(c.id)}
              localTime={localTime}
            />
          ))}
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        position: 'relative', overflow: 'hidden',
        height: '100%',
      }}>
        {/* Previous hero (fade-out) */}
        <div key={`prev-${prevHero}`} style={{
          position: 'absolute', inset: 0,
          background: `url(${prevHero}) center/cover`,
        }}/>
        {/* New hero (fade-in) */}
        <div key={`hero-${hero}-${fadeKey}`} style={{
          position: 'absolute', inset: 0,
          background: `url(${hero}) center/cover`,
          animation: 'heroFade 650ms ease both',
        }}/>
        {/* Scrim */}
        <div style={{
          position: 'absolute', inset: 0,
          background: t.bgStyle === 'minimal'
            ? 'linear-gradient(180deg, rgba(10,10,12,0.85) 0%, rgba(10,10,12,0.92) 100%)'
            : t.bgStyle === 'gradient'
              ? `linear-gradient(180deg, ${t.palette[0]}cc 0%, ${t.palette[1]}cc 100%)`
              : t.bgStyle === 'mesh'
                ? 'radial-gradient(ellipse at 20% 30%, rgba(0,0,0,0.05), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(0,0,0,0.65), transparent 60%), linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)'
                : 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.78) 100%)',
        }}/>

        {/* Content overlay */}
        <div style={{
          position: 'relative', height: '100%',
          display: 'grid', gridTemplateRows: 'auto 1fr auto',
          padding: '32px 40px 28px 40px',
          color: '#fff',
        }}>
          {/* Top bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          }}>
            <div>
              <div style={{
                fontSize: 11, letterSpacing: '0.18em',
                textTransform: 'uppercase', opacity: 0.7,
              }}>
                <UIIcon kind="pin" size={11} color="#fff"/>
                <span style={{ marginLeft: 6 }}>{city.region[lang]}</span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 64, fontWeight: 300,
                letterSpacing: '-0.03em', lineHeight: 1,
                margin: '12px 0 4px 0',
              }}>{city.name[lang]}</h1>
              <div style={{
                fontSize: 13, opacity: 0.78,
                fontStyle: 'italic', fontFamily: 'var(--font-display)',
              }}>
                {fmt.dateLong(new Date(), i18n)} · {localTime}
              </div>
            </div>

            {/* Big temp */}
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 168, fontWeight: 200, lineHeight: 0.9,
                letterSpacing: '-0.06em',
                textShadow: '0 4px 24px rgba(0,0,0,0.35)',
              }}>{toUnit(city.current.temp)}</div>
              <div style={{
                display: 'flex', gap: 14, justifyContent: 'flex-end',
                marginTop: 8,
                fontSize: 14, opacity: 0.9,
                textTransform: 'lowercase',
              }}>
                <span style={{ fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: 18 }}>
                  {i18n.conditions[city.current.condition]}
                </span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>{i18n.feelsLike} {toUnit(city.current.feels)}</span>
              </div>
              <div style={{
                display: 'flex', gap: 18, justifyContent: 'flex-end',
                marginTop: 6, fontSize: 13, opacity: 0.7,
              }}>
                <span><UIIcon kind="arrow-up" size={11} color="#fff"/> {toUnit(city.hi)}</span>
                <span><UIIcon kind="arrow-down" size={11} color="#fff"/> {toUnit(city.lo)}</span>
              </div>
            </div>
          </div>

          {/* Middle: hourly + sun arc */}
          <div style={{
            alignSelf: 'center',
            display: 'grid', gridTemplateColumns: '1.6fr 1fr',
            gap: 28, alignItems: 'center',
            marginTop: 20,
          }}>
            <div style={{
              padding: '22px 24px',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 22,
            }}>
              <div style={{
                fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', opacity: 0.65, marginBottom: 16,
              }}>{i18n.hourly}</div>
              <HourlyStrip hours={city.hourly} toUnit={toUnit} color="#fff"/>
            </div>
            <div style={{
              padding: '22px 24px',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 22,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 4,
              }}>
                <div style={{
                  fontSize: 10, letterSpacing: '0.2em',
                  textTransform: 'uppercase', opacity: 0.65,
                }}>{i18n.daylight}</div>
                <div style={{ fontSize: 12, opacity: 0.7, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {hoursBetween(city.sun.rise, city.sun.set)}
                </div>
              </div>
              <SunArc rise={city.sun.rise} set={city.sun.set} lang={lang} i18n={i18n} size="md"/>
            </div>
          </div>

          {/* Bottom: forecast + metrics */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr',
            gap: 28, alignItems: 'stretch',
            marginTop: 22,
          }}>
            <div style={{
              padding: '18px 24px',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 22,
            }}>
              <div style={{
                fontSize: 10, letterSpacing: '0.2em',
                textTransform: 'uppercase', opacity: 0.65, marginBottom: 6,
              }}>{i18n.sevenDay}</div>
              <DailyList days={city.daily} toUnit={toUnit} color="#fff" i18n={i18n}/>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}>
              <MetricChip icon="drop" label={i18n.humidity}
                value={`${city.current.humidity}%`} color="#fff"/>
              <MetricChip icon="wind" label={i18n.wind}
                value={`${city.current.wind}`} sub="km/sa" color="#fff"/>
              <MetricChip icon="sun-small" label={i18n.uv}
                value={`${city.current.uv}`}
                sub={city.current.uv >= 7 ? (lang==='tr'?'yüksek':'high') : (lang==='tr'?'orta':'moderate')}
                color="#fff"/>
              <MetricChip icon="eye" label={i18n.visibility}
                value={`${city.current.visibility}`} sub="km" color="#fff"/>
            </div>
          </div>
        </div>

        {/* Search sheet */}
        {searchOpen && (
          <div onClick={() => setSearchOpen(false)} style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(8px)',
            display: 'grid', placeItems: 'flex-start center',
            paddingTop: 80, zIndex: 10,
          }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: 480, maxWidth: '90%',
              background: 'rgba(20,20,24,0.92)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '14px 18px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}>
                <UIIcon kind="search" size={16} color="rgba(255,255,255,0.6)"/>
                <input autoFocus
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder={i18n.search}
                  style={{
                    all: 'unset', flex: 1, color: '#fff',
                    fontSize: 15, fontFamily: 'var(--font-body)',
                  }}/>
                <button onClick={() => setSearchOpen(false)} style={{
                  all: 'unset', cursor: 'pointer', opacity: 0.6,
                }}>
                  <UIIcon kind="close" size={16} color="#fff"/>
                </button>
              </div>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {(searchQ ? searchResults : cities).map(c => (
                  <button key={c.id} onClick={() => { setActiveId(c.id); setSearchOpen(false); setSearchQ(''); }}
                    style={{
                      all: 'unset', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: 14, width: '100%', boxSizing: 'border-box',
                      padding: '12px 18px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: `url(${window.cityPhoto(c, 0)}) center/cover`,
                      flexShrink: 0,
                    }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: '#fff', fontFamily: 'var(--font-display)' }}>{c.name[lang]}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{c.region[lang]}</div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 20,
                      color: '#fff', fontWeight: 300,
                    }}>{toUnit(c.current.temp)}</div>
                  </button>
                ))}
                {searchQ && searchResults.length === 0 && (
                  <div style={{ padding: 24, color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center' }}>
                    {lang === 'tr' ? 'Sonuç yok' : 'No results'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

window.DesktopApp = DesktopApp;
