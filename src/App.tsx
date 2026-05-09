import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './i18n';
import Home from './pages/Home';
import BaziInput from './pages/BaziInput';
import Report from './pages/Report';
import Compatibility from './pages/Compatibility';
import Pricing from './pages/Pricing';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<BaziInput />} />
        <Route path="/report" element={<Report />} />
        <Route path="/compatibility" element={<Compatibility />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
