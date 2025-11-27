
const USAGE_KEY = 'prescriber_ai_usage_limits';

interface UsageData {
  lastTimestamp: number;
  dailyCount: number;
  date: string; // YYYY-MM-DD to track daily reset
}

const MAX_DAILY_SUGGESTIONS = 10;
const COOLDOWN_SECONDS = 300; // 5 minutes

const getUsageData = (): UsageData => {
  const stored = localStorage.getItem(USAGE_KEY);
  const today = new Date().toISOString().split('T')[0];
  
  if (!stored) {
    return { lastTimestamp: 0, dailyCount: 0, date: today };
  }

  const data: UsageData = JSON.parse(stored);
  
  // If stored date is different from today, reset daily count
  if (data.date !== today) {
    // Keep timestamp to enforce cooldown across midnight if needed, but reset count
    return { 
        lastTimestamp: data.lastTimestamp, 
        dailyCount: 0, 
        date: today 
    };
  }
  
  return data;
};

export const getUsageInfo = () => {
  const data = getUsageData();
  const now = Date.now();
  const secondsSinceLast = Math.floor((now - data.lastTimestamp) / 1000);
  
  const cooldownRemaining = Math.max(0, COOLDOWN_SECONDS - secondsSinceLast);
  const dailyRemaining = Math.max(0, MAX_DAILY_SUGGESTIONS - data.dailyCount);
  
  return {
    cooldownRemaining,
    dailyRemaining,
    isDailyLimitReached: dailyRemaining === 0,
    canRequest: cooldownRemaining === 0 && dailyRemaining > 0
  };
};

export const canRequestSuggestion = (): boolean => {
  const info = getUsageInfo();
  return info.canRequest;
};

export const recordSuggestionUsage = () => {
  const data = getUsageData();
  // Ensure we work with fresh data in case of race conditions (simplified for localStorage)
  const today = new Date().toISOString().split('T')[0];
  
  // If day changed during session, reset count logic applies here too
  const currentCount = data.date === today ? data.dailyCount : 0;

  const newData: UsageData = {
    lastTimestamp: Date.now(),
    dailyCount: currentCount + 1,
    date: today
  };
  
  localStorage.setItem(USAGE_KEY, JSON.stringify(newData));
};

export const formatCountdown = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
