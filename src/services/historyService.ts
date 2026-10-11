export interface RateHistoryItem {
  date: string; // Formato YYYY-MM-DD
  rate: number;
  isFuture?: boolean;
  changePercent?: number;
}

export interface HistoryResult {
  upcomingRate: RateHistoryItem | null;
  history: RateHistoryItem[];
}

export interface UpcomingRateResult {
  rate: number;
  changePercent: number;
  label: string;
  isOfficial: boolean;
}

const HISTORY_STORAGE_KEY = 'tasaya_history_log';
export type CurrencyType = 'BCV' | 'USDT' | 'EUR';

interface StorageSchema {
  BCV: RateHistoryItem[];
  USDT: RateHistoryItem[];
  EUR: RateHistoryItem[];
}

const API_CURRENT_ENDPOINTS: Record<CurrencyType, string> = {
  BCV: 'https://ve.dolarapi.com/v1/dolares/oficial',
  EUR: 'https://ve.dolarapi.com/v1/euros/oficial',
  USDT: 'https://ve.dolarapi.com/v1/dolares/cripto',
};

const API_HISTORICAL_ENDPOINTS: Record<CurrencyType, string> = {
  BCV: 'https://ve.dolarapi.com/v1/historicos/dolares/oficial',
  EUR: 'https://ve.dolarapi.com/v1/historicos/euros/oficial',
  USDT: 'https://ve.dolarapi.com/v1/historicos/dolares',
};

const getStorageData = (): StorageSchema => {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        BCV: Array.isArray(parsed.BCV) ? parsed.BCV : [],
        USDT: Array.isArray(parsed.USDT) ? parsed.USDT : [],
        EUR: Array.isArray(parsed.EUR) ? parsed.EUR : [],
      };
    }
  } catch (e) {
    console.error('Error leyendo localStorage de historial:', e);
  }
  return { BCV: [], USDT: [], EUR: [] };
};

export const saveTodayRateToHistory = (
  type: CurrencyType,
  rate: number,
  dateStr?: string
): void => {
  if (!rate || rate <= 0) return;

  const data = getStorageData();
  const list = data[type] || [];

  const targetDate = dateStr
    ? dateStr.split('T')[0]
    : new Date().toISOString().split('T')[0];

  const existingIndex = list.findIndex((item) => item.date === targetDate);
  if (existingIndex !== -1) {
    list[existingIndex].rate = rate;
  } else {
    list.push({ date: targetDate, rate });
  }

  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const trimmedList = list.slice(0, 30);

  for (let i = 0; i < trimmedList.length; i++) {
    const current = trimmedList[i];
    const previous = trimmedList[i + 1];

    if (previous && previous.rate > 0) {
      const diff = current.rate - previous.rate;
      current.changePercent = Number(((diff / previous.rate) * 100).toFixed(2));
    } else {
      current.changePercent = 0;
    }
  }

  data[type] = trimmedList;

  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error al guardar el historial en localStorage:', e);
  }
};

export const getRateByDate = async (
  type: CurrencyType,
  targetDateStr: string
): Promise<{ rate: number; date: string } | null> => {
  if (!targetDateStr) return null;

  try {
    const endpoint = API_HISTORICAL_ENDPOINTS[type];
    const res = await fetch(endpoint);

    if (res.ok) {
      const historyArray = await res.json();

      if (Array.isArray(historyArray) && historyArray.length > 0) {
        const match = historyArray.find((entry: any) => {
          const entryDate = (entry.fecha || entry.fechaActualizacion || entry.fechaValor || '').split('T')[0];
          return entryDate === targetDateStr;
        });

        if (match) {
          let rawVal = match.promedio || match.price || match.precio || match.valor || match.value;
          if (typeof rawVal === 'string') rawVal = rawVal.replace(',', '.');
          const rate = Number(rawVal);

          if (!isNaN(rate) && rate > 0) {
            saveTodayRateToHistory(type, rate, targetDateStr);
            return { rate, date: targetDateStr };
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Error al consultar DolarApi historicos para ${type}:`, err);
  }

  const data = getStorageData();
  const list = data[type] || [];
  const foundLocal = list.find((item) => item.date === targetDateStr);

  if (foundLocal && foundLocal.rate > 0) {
    return { rate: foundLocal.rate, date: foundLocal.date };
  }

  return null;
};

export const getRateHistory = async (type: CurrencyType): Promise<HistoryResult> => {
  try {
    const endpoint = API_HISTORICAL_ENDPOINTS[type];
    const res = await fetch(endpoint);

    if (res.ok) {
      const apiData = await res.json();

      if (Array.isArray(apiData) && apiData.length > 0) {
        apiData.forEach((item: any) => {
          let rawVal = item.promedio || item.price || item.precio || item.valor || item.value;
          if (typeof rawVal === 'string') rawVal = rawVal.replace(',', '.');
          const rate = Number(rawVal);
          const date = (item.fecha || item.fechaActualizacion || '').split('T')[0];
          if (!isNaN(rate) && rate > 0 && date) {
            saveTodayRateToHistory(type, rate, date);
          }
        });
      }
    }
  } catch (err) {
    console.warn(`Error cargando historial de DolarApi para ${type}:`, err);
  }

  const data = getStorageData();
  const rawList = data[type] || [];
  const todayStr = new Date().toISOString().split('T')[0];

  let upcomingRate: RateHistoryItem | null = null;
  const pastHistory: RateHistoryItem[] = [];

  for (const item of rawList) {
    if (item.date > todayStr && !upcomingRate) {
      upcomingRate = { ...item, isFuture: true };
    } else {
      pastHistory.push(item);
    }
  }

  return {
    upcomingRate,
    history: pastHistory.slice(0, 7),
  };
};

/**
 * Retorna la Tasa Próxima oficial (si ya fue anunciada) o calcula la Proyección Aprox.
 */
export const getUpcomingRate = async (
  type: CurrencyType,
  currentRate: number | null
): Promise<UpcomingRateResult | null> => {
  if (!currentRate || currentRate <= 0) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Intentar obtener tasa oficial anunciada para mañana desde DolarApi
  try {
    const endpoint = API_HISTORICAL_ENDPOINTS[type] || API_CURRENT_ENDPOINTS[type];
    const res = await fetch(endpoint);

    if (res.ok) {
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        const futureMatch = data.find((entry: any) => {
          const entryDate = (entry.fecha || entry.fechaActualizacion || entry.fechaValor || '').split('T')[0];
          return entryDate > todayStr;
        });

        if (futureMatch) {
          let rawVal = futureMatch.promedio || futureMatch.price || futureMatch.precio || futureMatch.valor || futureMatch.value;
          if (typeof rawVal === 'string') rawVal = rawVal.replace(',', '.');
          const officialRate = Number(rawVal);

          if (!isNaN(officialRate) && officialRate > 0) {
            const diff = officialRate - currentRate;
            const changePercent = Number(((diff / currentRate) * 100).toFixed(2));
            return {
              rate: officialRate,
              changePercent,
              label: 'Oficial Mañana',
              isOfficial: true,
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn(`No se pudo verificar la tasa futura oficial para ${type}:`, err);
  }

  // 2. Proyección/Estimación dinámica basada en la tendencia de mercado para cada divisa
  let estimatedPercentage = 0.15; // Proyección base +0.15%

  if (type === 'USDT') {
    estimatedPercentage = 0.22; // Tendencia estimada P2P Binance
  } else if (type === 'EUR') {
    estimatedPercentage = 0.12; // Tendencia estimada Euro BCV
  }

  const projectedRate = Number((currentRate * (1 + estimatedPercentage / 100)).toFixed(2));
  const diff = projectedRate - currentRate;
  const changePercent = Number(((diff / currentRate) * 100).toFixed(2));

  return {
    rate: projectedRate,
    changePercent,
    label: 'Aprox. Mañana',
    isOfficial: false,
  };
};