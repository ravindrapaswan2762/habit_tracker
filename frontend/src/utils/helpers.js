export function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  } catch (e) {
    return dateStr;
  }
}

export const COLOR_THEMES = {
  blue: {
    name: 'Blue',
    bg: 'bg-[#EBF3FE]',
    border: 'border-[#C8DCFB]',
    text: 'text-[#1E40AF]',
    tagBg: 'bg-[#D9E9FC]',
    tagText: 'text-[#1D4ED8]',
    dot: 'bg-blue-500',
    ring: 'focus:ring-blue-400',
    checkBg: 'bg-[#3B82F6]',
    checkBorder: 'border-[#3B82F6]'
  },
  pink: {
    name: 'Pink',
    bg: 'bg-[#FFE8EC]',
    border: 'border-[#FFCCD8]',
    text: 'text-[#9F1239]',
    tagBg: 'bg-[#FED2DC]',
    tagText: 'text-[#BE123C]',
    dot: 'bg-rose-500',
    ring: 'focus:ring-rose-400',
    checkBg: 'bg-[#F43F5E]',
    checkBorder: 'border-[#F43F5E]'
  },
  yellow: {
    name: 'Yellow',
    bg: 'bg-[#FEF6D8]',
    border: 'border-[#FDE89C]',
    text: 'text-[#854D0E]',
    tagBg: 'bg-[#FEECA7]',
    tagText: 'text-[#A16207]',
    dot: 'bg-amber-500',
    ring: 'focus:ring-amber-400',
    checkBg: 'bg-[#EAB308]',
    checkBorder: 'border-[#EAB308]'
  },
  green: {
    name: 'Green',
    bg: 'bg-[#E4F9ED]',
    border: 'border-[#BAEED0]',
    text: 'text-[#065F46]',
    tagBg: 'bg-[#C8F4DC]',
    tagText: 'text-[#047857]',
    dot: 'bg-emerald-500',
    ring: 'focus:ring-emerald-400',
    checkBg: 'bg-[#10B981]',
    checkBorder: 'border-[#10B981]'
  },
  purple: {
    name: 'Purple',
    bg: 'bg-[#F2EDFE]',
    border: 'border-[#DDD3FD]',
    text: 'text-[#5B21B6]',
    tagBg: 'bg-[#E3DAFC]',
    tagText: 'text-[#6D28D9]',
    dot: 'bg-purple-500',
    ring: 'focus:ring-purple-400',
    checkBg: 'bg-[#5B4DFC]',
    checkBorder: 'border-[#5B4DFC]'
  }
};

export function getTheme(colorName) {
  const key = (colorName || 'blue').toLowerCase();
  return COLOR_THEMES[key] || COLOR_THEMES.blue;
}
