import { AppProvider } from './state/AppContext';
import { TonnetzCanvas } from './components/TonnetzCanvas';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { ChordWheel } from './components/ChordWheel';
// Note: CSS is imported in _app.tsx due to Next.js global CSS restrictions

function App() {
  return (
    <AppProvider>
      <div className="tonnetz-app-container">
      <div className="app">
        <header className="app-header">
          <h1>Tonnetz Lattice</h1>
          <span className="subtitle">Neo-Riemannian Harmonic Space</span>
        </header>

        <main className="app-main">
          <LeftSidebar />

          <div className="canvas-container">
            <TonnetzCanvas className="tonnetz-canvas" />
          </div>

          <RightSidebar />
        </main>
      </div>
      </div>
      <ChordWheel />
    </AppProvider>
  );
}

export default App;
