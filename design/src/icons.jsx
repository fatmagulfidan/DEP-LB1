// src/icons.jsx — Hand-tuned weather + UI icons.
// Lightweight, single-color, designed to sit on photo backgrounds.
// Exports to window: WeatherIcon, UIIcon.

const WeatherIcon = ({ kind, size = 28, stroke = 1.5, color = 'currentColor' }) => {
  const s = size;
  const sw = stroke;
  const common = {
    width: s, height: s, viewBox: '0 0 32 32',
    fill: 'none', stroke: color, strokeWidth: sw,
    strokeLinecap: 'round', strokeLinejoin: 'round',
  };
  switch (kind) {
    case 'clear':
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="5.5" />
          <g>
            <line x1="16" y1="3" x2="16" y2="6" />
            <line x1="16" y1="26" x2="16" y2="29" />
            <line x1="3" y1="16" x2="6" y2="16" />
            <line x1="26" y1="16" x2="29" y2="16" />
            <line x1="6.5" y1="6.5" x2="8.7" y2="8.7" />
            <line x1="23.3" y1="23.3" x2="25.5" y2="25.5" />
            <line x1="6.5" y1="25.5" x2="8.7" y2="23.3" />
            <line x1="23.3" y1="8.7" x2="25.5" y2="6.5" />
          </g>
        </svg>
      );
    case 'partly_cloudy':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="3.5" />
          <line x1="11" y1="3.5" x2="11" y2="5.5" />
          <line x1="11" y1="16.5" x2="11" y2="18.5" />
          <line x1="3.5" y1="11" x2="5.5" y2="11" />
          <line x1="16.5" y1="11" x2="18.5" y2="11" />
          <line x1="5.7" y1="5.7" x2="7.1" y2="7.1" />
          <line x1="14.9" y1="14.9" x2="16.3" y2="16.3" />
          <path d="M11 22 a4 4 0 0 1 4-4 a5 5 0 0 1 9.6 1.5 a3.5 3.5 0 0 1 0.4 7 L11 26.5 a2.25 2.25 0 0 1 0 -4.5 z" />
        </svg>
      );
    case 'cloudy':
      return (
        <svg {...common}>
          <path d="M8 21 a4.5 4.5 0 0 1 4.5 -4.5 a5.5 5.5 0 0 1 10.5 1.5 a4 4 0 0 1 0.5 8 L8 26 a2.5 2.5 0 0 1 0 -5 z" />
        </svg>
      );
    case 'rain':
      return (
        <svg {...common}>
          <path d="M7 17 a4.5 4.5 0 0 1 4.5 -4.5 a5.5 5.5 0 0 1 10.5 1.5 a4 4 0 0 1 0.5 8 L7 22 a2.5 2.5 0 0 1 0 -5 z" />
          <line x1="11" y1="25" x2="9.5" y2="29" />
          <line x1="16" y1="25" x2="14.5" y2="29" />
          <line x1="21" y1="25" x2="19.5" y2="29" />
        </svg>
      );
    case 'thunderstorm':
      return (
        <svg {...common}>
          <path d="M7 15 a4.5 4.5 0 0 1 4.5 -4.5 a5.5 5.5 0 0 1 10.5 1.5 a4 4 0 0 1 0.5 8 L7 20 a2.5 2.5 0 0 1 0 -5 z" />
          <path d="M16 20 L12.5 26 H16 L13.5 31" />
        </svg>
      );
    case 'snow':
      return (
        <svg {...common}>
          <path d="M7 17 a4.5 4.5 0 0 1 4.5 -4.5 a5.5 5.5 0 0 1 10.5 1.5 a4 4 0 0 1 0.5 8 L7 22 a2.5 2.5 0 0 1 0 -5 z" />
          <circle cx="11" cy="27" r="0.6" fill={color} />
          <circle cx="16" cy="28" r="0.6" fill={color} />
          <circle cx="21" cy="27" r="0.6" fill={color} />
        </svg>
      );
    case 'fog':
      return (
        <svg {...common}>
          <line x1="5" y1="13" x2="27" y2="13" />
          <line x1="7" y1="18" x2="25" y2="18" />
          <line x1="5" y1="23" x2="27" y2="23" />
        </svg>
      );
    case 'windy':
      return (
        <svg {...common}>
          <path d="M5 12 H20 a3 3 0 1 0 -3 -3" />
          <path d="M5 18 H24 a3 3 0 1 1 -3 3" />
          <path d="M5 24 H15" />
        </svg>
      );
    case 'sunrise':
      return (
        <svg {...common}>
          <path d="M5 24 H27" />
          <path d="M9 20 a7 7 0 0 1 14 0" />
          <line x1="16" y1="7" x2="16" y2="14" />
          <polyline points="12,11 16,7 20,11" />
        </svg>
      );
    case 'sunset':
      return (
        <svg {...common}>
          <path d="M5 24 H27" />
          <path d="M9 20 a7 7 0 0 1 14 0" />
          <line x1="16" y1="7" x2="16" y2="14" />
          <polyline points="12,10 16,14 20,10" />
        </svg>
      );
    default:
      return null;
  }
};

const UIIcon = ({ kind, size = 20, color = 'currentColor', strokeWidth = 1.5 }) => {
  const c = { width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'search':
      return <svg {...c}><circle cx="11" cy="11" r="6.5"/><line x1="16" y1="16" x2="20.5" y2="20.5"/></svg>;
    case 'plus':
      return <svg {...c}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
    case 'chevron-right':
      return <svg {...c}><polyline points="9,5 16,12 9,19"/></svg>;
    case 'chevron-left':
      return <svg {...c}><polyline points="15,5 8,12 15,19"/></svg>;
    case 'menu':
      return <svg {...c}><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="14" y2="17"/></svg>;
    case 'dots':
      return <svg {...c}><circle cx="6" cy="12" r="1.2" fill={color}/><circle cx="12" cy="12" r="1.2" fill={color}/><circle cx="18" cy="12" r="1.2" fill={color}/></svg>;
    case 'pin':
      return <svg {...c}><path d="M12 21 c-4 -5 -6 -8 -6 -11 a6 6 0 1 1 12 0 c0 3 -2 6 -6 11 z"/><circle cx="12" cy="10" r="2"/></svg>;
    case 'drop':
      return <svg {...c}><path d="M12 3 c4 5 6 8 6 11 a6 6 0 1 1 -12 0 c0 -3 2 -6 6 -11 z"/></svg>;
    case 'wind':
      return <svg {...c}><path d="M3 9 H15 a3 3 0 1 0 -3 -3"/><path d="M3 15 H19 a3 3 0 1 1 -3 3"/></svg>;
    case 'gauge':
      return <svg {...c}><path d="M5 18 a8 8 0 1 1 14 0"/><line x1="12" y1="18" x2="15" y2="11"/><circle cx="12" cy="18" r="1" fill={color}/></svg>;
    case 'eye':
      return <svg {...c}><path d="M2 12 s4 -7 10 -7 s10 7 10 7 s-4 7 -10 7 s-10 -7 -10 -7 z"/><circle cx="12" cy="12" r="3"/></svg>;
    case 'sun-small':
      return <svg {...c}><circle cx="12" cy="12" r="3.5"/><line x1="12" y1="3" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="21"/><line x1="3" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="21" y2="12"/></svg>;
    case 'close':
      return <svg {...c}><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>;
    case 'arrow-up':
      return <svg {...c}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="6,11 12,5 18,11"/></svg>;
    case 'arrow-down':
      return <svg {...c}><line x1="12" y1="5" x2="12" y2="19"/><polyline points="6,13 12,19 18,13"/></svg>;
    default:
      return null;
  }
};

Object.assign(window, { WeatherIcon, UIIcon });
