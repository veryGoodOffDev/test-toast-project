import { ToastProvider, useToast } from './context/ToastContext';
import './App.css';

const TriggerButtons = () => {
  const { addToast } = useToast();

  return (
    <div className="card">
      <h2>Test Controls</h2>
      <div className="buttons-grid">
        <button
          className="btn-success"
          onClick={() => addToast({ message: 'Успех!', type: 'success' })}
        >
          Success Toast
        </button>

        <button
          className="btn-error"
          onClick={() =>
            addToast({ message: 'Ошибка!', type: 'error', duration: 5000 })
          }
        >
          Error (5s)
        </button>

        <button
          className="btn-warning"
          onClick={() =>
            addToast({ message: 'Предупрежение', type: 'warning' })
          }
        >
          Warning
        </button>
      </div>
      <p style={{ marginTop: 20, color: '#888' }}>
        Наведите курсор на тост, чтобы приостановить таймер.
      </p>
    </div>
  );
};

const AppContent = () => {
  return (
    <div className="app-layout">
      <header className="header">
        <h1>Система управления тостами</h1>
      </header>

      <main className="content">
        <TriggerButtons />
        <div className="dummy-content">
          <p>Основная область содержимого</p>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;