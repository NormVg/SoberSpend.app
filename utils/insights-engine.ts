import { Expense } from '@/types';

const COLORS = ['#00FFFF', '#DFFF00', '#FF85A2', '#00FFFF', '#DFFF00'];

export function getSpendingTrends(expenses: Expense[]) {
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Sort expenses by date
  const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sorted.length === 0) {
    return [
      { label: 'MON', height: 10, color: COLORS[0] },
      { label: 'TUE', height: 10, color: COLORS[1] },
      { label: 'WED', height: 10, color: COLORS[2] },
      { label: 'THU', height: 10, color: COLORS[3] },
      { label: 'FRI', height: 10, color: COLORS[4] },
    ];
  }

  // Get last 5 distinct days of spending, or last 5 calendar days
  const today = new Date();
  const last5Days = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (4 - i));
    return d;
  });

  const amounts = last5Days.map(day => {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const end = start + 86400000;
    const dailySpend = sorted.filter(e => {
       const t = new Date(e.date).getTime();
       return t >= start && t < end;
    }).reduce((sum, e) => sum + e.amount, 0);
    return dailySpend;
  });

  const maxAmount = Math.max(...amounts, 1); // prevent division by zero

  return amounts.map((amount, i) => ({
    label: days[last5Days[i].getDay()],
    height: Math.max((amount / maxAmount) * 100, 5), // min height 5%
    color: COLORS[i % COLORS.length]
  }));
}

export function getCriticalWindow(expenses: Expense[]) {
  if (expenses.length === 0) return { time: '8PM', subtitle: 'NO DATA YET. START SPENDING.' };

  const hourCounts = new Array(24).fill(0);
  expenses.forEach(e => {
    const hour = new Date(e.date).getHours();
    hourCounts[hour] += e.amount;
  });

  let maxHour = 0;
  let maxSpend = 0;
  hourCounts.forEach((spend, hour) => {
    if (spend > maxSpend) {
      maxSpend = spend;
      maxHour = hour;
    }
  });

  const timeAmPm = maxHour >= 12 ? (maxHour === 12 ? '12PM' : `${maxHour - 12}PM`) : (maxHour === 0 ? '12AM' : `${maxHour}AM`);

  return {
    time: timeAmPm,
    subtitle: `IMPULSE BUYS ARE HIGHEST AROUND ${timeAmPm}.`
  };
}

export function getPattern(expenses: Expense[]) {
  if (expenses.length === 0) {
    return {
      title: 'NO PATTERN',
      description: 'Spend some money first.',
      badge: 'GHOST',
      color: '#333333',
      bars: [10, 10, 10, 10, 10, 10, 10]
    };
  }

  const daysSpend = new Array(7).fill(0); // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  expenses.forEach(e => {
    const day = new Date(e.date).getDay();
    daysSpend[day] += e.amount;
  });

  const maxPatternSpend = Math.max(...daysSpend, 1);
  const bars = daysSpend.map(s => Math.max((s / maxPatternSpend) * 100, 5));
  // Shift to Mon-Sun for visual
  const visualBars = [...bars.slice(1), bars[0]];

  const weekendSpend = daysSpend[0] + daysSpend[5] + daysSpend[6]; // Sun, Fri, Sat
  const weekdaySpend = daysSpend[1] + daysSpend[2] + daysSpend[3] + daysSpend[4];

  if (weekendSpend > weekdaySpend * 1.5) {
    return {
      title: 'WEEKEND OVERSPENDER',
      description: 'Your spending spikes significantly on weekends.',
      badge: 'PATTERN DETECTED',
      color: '#FF85A2',
      bars: visualBars
    };
  } else if (weekdaySpend > weekendSpend * 2) {
    return {
      title: 'MIDWEEK SPLURGE',
      description: 'You burn through cash mostly during the work week.',
      badge: 'WORKAHOLIC',
      color: '#DFFF00',
      bars: visualBars
    };
  }

  return {
    title: 'CONSISTENT BLEED',
    description: 'You spend money equally every single day.',
    badge: 'STEADY',
    color: '#00FFFF',
    bars: visualBars
  };
}
