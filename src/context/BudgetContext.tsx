import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { BudgetBreakdown, SavedTrip, SearchParams } from '../types';


const LS_KEY = 'budget-compass.savedTrips.v1';


type Ctx = {
params: SearchParams;
setParams: (p: Partial<SearchParams>) => void;
adjusted: BudgetBreakdown;
setAdjusted: (b: Partial<BudgetBreakdown>) => void;
saved: SavedTrip[];
saveTrip: (t: Omit<SavedTrip, 'id' | 'savedAt'>) => void;
removeTrip: (id: string) => void;
};


const defaultParams: SearchParams = {
budget: 1000,
startDate: new Date().toISOString().slice(0,10),
endDate: new Date(Date.now()+1000*60*60*24*5).toISOString().slice(0,10),
origin: 'Москва',
prefCulture: 50,
prefNature: 50,
prefParty: 50,
};


const defaultBudget: BudgetBreakdown = { flights: 35, lodging: 30, food: 20, local: 10, buffer: 5 };


const BudgetContext = createContext<Ctx | null>(null);


export const BudgetProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
const [params, setParamsState] = useState<SearchParams>(defaultParams);
const [adjusted, setAdjustedState] = useState<BudgetBreakdown>(defaultBudget);
const [saved, setSaved] = useState<SavedTrip[]>([]);


useEffect(() => {
try { const raw = localStorage.getItem(LS_KEY); if (raw) setSaved(JSON.parse(raw)); } catch {}
}, []);
useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(saved)); }, [saved]);


const setParams = (p: Partial<SearchParams>) => setParamsState(prev => ({ ...prev, ...p }));
const setAdjusted = (b: Partial<BudgetBreakdown>) => setAdjustedState(prev => ({ ...prev, ...b }));


const saveTrip: Ctx['saveTrip'] = (t) => {
const id = crypto.randomUUID();
const savedAt = new Date().toISOString();
setSaved(prev => [{ id, savedAt, ...t }, ...prev]);
};
const removeTrip = (id: string) => setSaved(prev => prev.filter(x => x.id !== id));


const value = useMemo(() => ({ params, setParams, adjusted, setAdjusted, saved, saveTrip, removeTrip }), [params, adjusted, saved]);
return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};


export const useBudget = () => {
const ctx = useContext(BudgetContext);
if (!ctx) throw new Error('useBudget must be used within BudgetProvider');
return ctx;
};