import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import './i18n';
import Home from './pages/Home';
import BaziInput from './pages/BaziInput';
import Report from './pages/Report';
import Compatibility from './pages/Compatibility';
import Pricing from './pages/Pricing';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Refund from './pages/Refund';
import Auth from './pages/Auth';
import Account from './pages/Account';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<BaziInput />} />
        <Route path="/report" element={<Report />} />
        <Route path="/compatibility" element={<Compatibility />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/account" element={<Account />} />
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
