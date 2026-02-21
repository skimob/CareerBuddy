import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import JobsPage from './pages/JobsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/jobs/:profileId" element={<JobsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
