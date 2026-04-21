import { Routes, Route } from 'react-router-dom';
import AppShell from './components/shell/AppShell';
import { QuoteLogProvider } from './context/QuoteLogStore';
import QuoteLog from './pages/QuoteLog';
import NewRFP from './pages/NewRFP';
import RFPDetail from './pages/RFPDetail';
import TodoList from './pages/TodoList';
import UWWorkspace from './pages/UWWorkspace';

export default function App() {
  return (
    <QuoteLogProvider>
      <AppShell>
        <Routes>
          <Route path="/"          element={<QuoteLog />} />
          <Route path="/new-rfp"   element={<NewRFP />} />
          <Route path="/rfp/:id"   element={<RFPDetail />} />
          <Route path="/todo"      element={<TodoList />} />
          <Route path="/workspace" element={<UWWorkspace />} />
        </Routes>
      </AppShell>
    </QuoteLogProvider>
  );
}
