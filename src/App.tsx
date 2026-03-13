import { useState, useCallback } from 'react';
import type { Element } from './types/element';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetail } from './components/ElementDetail';
import { CategoryLegend } from './components/CategoryLegend';
import './App.css';

function App() {
  const [selected, setSelected] = useState<Element | null>(null);

  const handleClose = useCallback(() => setSelected(null), []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">The Periodic Table</h1>
        <p className="app-subtitle">Click any element to explore</p>
      </header>

      <PeriodicTable onElementClick={setSelected} />
      <CategoryLegend />
      <ElementDetail element={selected} onClose={handleClose} />
    </div>
  );
}

export default App;
