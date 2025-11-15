// @ts-nocheck
// Sailing Icons and Flags
export const VENUE_ICONS = {
    harbor: '⚓',
    yacht_club: '🏴',
    marina: '⛵',
    bay: '🌊',
    ocean: '🌊',
};
export const INFO_ICONS = {
    wind: '💨',
    weather: '⛅',
    tide: '🌊',
    current: '〰️',
    temperature: '🌡️',
};
const COUNTRY_FLAGS = {
    US: '🇺🇸',
    GB: '🇬🇧',
    FR: '🇫🇷',
    DE: '🇩🇪',
    IT: '🇮🇹',
    ES: '🇪🇸',
    AU: '🇦🇺',
    NZ: '🇳🇿',
    CA: '🇨🇦',
    BR: '🇧🇷',
};
export function getCountryFlag(countryCode) {
    return COUNTRY_FLAGS[countryCode.toUpperCase()] || '🏁';
}
export const getFlag = getCountryFlag;
