// Budget formatting
export function formatCurrency(amount: number | undefined, currency = 'USD'): string {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Date formatting
export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// Time since
export function timeSince(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Capitalize
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}

// Budget level label
export function budgetLabel(level: string): string {
  const map: Record<string, string> = {
    budget: '💸 Budget',
    moderate: '💰 Moderate',
    luxury: '💎 Luxury',
  };
  return map[level] || capitalize(level);
}

// Traveler type emoji
export function travelerEmoji(type: string): string {
  const map: Record<string, string> = {
    solo: '🧳',
    couple: '💑',
    family: '👨‍👩‍👧‍👦',
    friends: '👥',
  };
  return map[type] || '✈️';
}

// Activity type color class
export function activityTypeColor(type: string): string {
  const map: Record<string, string> = {
    sightseeing: 'badge-teal',
    food: 'badge-gold',
    culture: 'badge-purple',
    nature: 'badge-green',
    adventure: 'badge-blue',
    entertainment: 'badge-teal',
    shopping: 'badge-purple',
  };
  return map[type?.toLowerCase()] || 'badge-teal';
}

// Trip title generator
export function generateTripTitle(destination: string, days: number): string {
  const prefixes = ['Adventure in', 'Discovering', 'Journey to', 'Exploring', 'Hidden Gems of'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  return `${prefix} ${destination} — ${days} Days`;
}

// Destination flag emoji (approximate)
export function destinationFlag(country: string): string {
  const flags: Record<string, string> = {
    japan: '🇯🇵', japan2: '🇯🇵',
    'new zealand': '🇳🇿',
    switzerland: '🇨🇭',
    'costa rica': '🇨🇷',
    italy: '🇮🇹',
    mexico: '🇲🇽',
    spain: '🇪🇸',
    indonesia: '🇮🇩',
    france: '🇫🇷',
    usa: '🇺🇸',
    india: '🇮🇳',
    thailand: '🇹🇭',
    greece: '🇬🇷',
    portugal: '🇵🇹',
    morocco: '🇲🇦',
  };
  return flags[country.toLowerCase()] || '🌍';
}
