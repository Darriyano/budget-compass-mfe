export type CityId = string;

export type BudgetBreakdown = {
flights: number;
lodging: number;
food: number;
local: number; // транспорт и развлечения
buffer: number;
};


export type City = {
id: CityId;
name: string;
country: string;
lat: number;
lng: number;
avgDailyCost: number; // усредненная дневная стоимость
mockBudget: BudgetBreakdown; // базовое распределение
image?: string;
};


export type SearchParams = {
budget: number;
startDate: string;
endDate: string;
origin: string;
prefCulture: number; // 0..100
prefNature: number;
prefParty: number;
};


export type SavedTrip = {
id: string; // uuid
cityId: CityId;
params: SearchParams;
adjustedBudget: BudgetBreakdown;
total: number;
savedAt: string;
};