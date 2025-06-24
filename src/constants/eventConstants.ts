export const EVENT_TYPES = {
  atolye: 'Atölye',
  konferans: 'Konferans',
  sosyal: 'Sosyal',
  egitim: 'Eğitim',
  seminer: 'Seminer'
} as const;

export const EVENT_STATUSES = {
  upcoming: 'Yaklaşan',
  ongoing: 'Devam Eden',
  completed: 'Tamamlandı',
  cancelled: 'İptal Edildi'
} as const;

export const EVENT_TYPE_COLORS = {
  atolye: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  konferans: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  sosyal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  egitim: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  seminer: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
} as const;

export const EVENT_STATUS_COLORS = {
  upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  ongoing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
} as const;

export const EVENT_CALENDAR_COLORS = {
  atolye: 'bg-blue-500',
  konferans: 'bg-purple-500',
  sosyal: 'bg-green-500',
  egitim: 'bg-orange-500',
  seminer: 'bg-red-500'
} as const;

export const SPONSOR_TYPES = {
  ana: 'Ana Sponsor',
  destekci: 'Destekçi',
  medya: 'Medya Sponsoru',
  yerel: 'Yerel Partner'
} as const;

export const SPONSOR_TYPE_COLORS = {
  ana: '🥇',
  destekci: '🤝',
  medya: '📺',
  yerel: '📍'
} as const;

// Type definitions
export type EventType = keyof typeof EVENT_TYPES;
export type EventStatus = keyof typeof EVENT_STATUSES;
export type SponsorType = keyof typeof SPONSOR_TYPES;

// Helper functions
export const getEventTypeLabel = (type: EventType): string => {
  return EVENT_TYPES[type] || type;
};

export const getEventStatusLabel = (status: EventStatus): string => {
  return EVENT_STATUSES[status] || status;
};

export const getEventTypeColor = (type: EventType): string => {
  return EVENT_TYPE_COLORS[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export const getEventStatusColor = (status: EventStatus): string => {
  return EVENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
};

export const getEventCalendarColor = (type: EventType): string => {
  return EVENT_CALENDAR_COLORS[type] || 'bg-gray-500';
};

export const getSponsorTypeLabel = (type: SponsorType): string => {
  return SPONSOR_TYPES[type] || type;
};

export const getSponsorTypeIcon = (type: SponsorType): string => {
  return SPONSOR_TYPE_COLORS[type] || '🤝';
};

// Default values
export const DEFAULT_EVENT_TYPE: EventType = 'seminer';
export const DEFAULT_EVENT_STATUS: EventStatus = 'upcoming';
export const DEFAULT_SPONSOR_TYPE: SponsorType = 'destekci';

// Pagination constants
export const EVENTS_PER_PAGE = 12;
export const EVENTS_PER_PAGE_OPTIONS = [6, 12, 24, 48] as const; 