import { Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import CityDetail from './pages/CityDetail';
import SavedTrips from './pages/SavedTrips';

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="container header__inner">
          <h1 className="logo">Бюджетный компас</h1>
          <nav className="nav">
            <NavLink to="/" end>Главная</NavLink>
            <NavLink to="/results">Результаты</NavLink>
            <NavLink to="/saved">Сохранённые</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/city/:id" element={<CityDetail />} />
          <Route path="/saved" element={<SavedTrips />} />
        </Routes>
      </main>
      <footer className="footer">Учебный проект · React + TS</footer>
    </div>
  );
}