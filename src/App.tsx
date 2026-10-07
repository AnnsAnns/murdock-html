import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { API_BASE, GITHUB_REPO, GITHUB_REPO_URL, PRIVACY_URL } from './api/config';
import { AuthProvider } from './auth/AuthContext';
import { FiltersProvider } from './components/FiltersContext';
import { NavBar } from './components/NavBar';
import { ToastProvider } from './components/Toast';
import { ApplicationResultsPage } from './pages/ApplicationResultsPage';
import { JobListPage } from './pages/JobListPage';
import { JobPage } from './pages/JobPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <FiltersProvider>
        <AuthProvider>
          <ToastProvider>
            <div className="app">
              <NavBar />

              <main className="app-main">
                <Routes>
                  <Route path="/" element={<JobListPage />} />

                  <Route path="/details/branch/:branch" element={<JobPage />} />
                  <Route path="/details/branch/:branch/:tab" element={<JobPage />} />
                  <Route path="/details/tag/:tag" element={<JobPage />} />
                  <Route path="/details/tag/:tag/:tab" element={<JobPage />} />
                  <Route path="/details/commit/:commit" element={<JobPage />} />
                  <Route path="/details/commit/:commit/:tab" element={<JobPage />} />
                  <Route path="/details/pr/:prnum" element={<JobPage />} />
                  <Route path="/details/pr/:prnum/:tab" element={<JobPage />} />

                  <Route
                    path="/details/:uid/builds/:application"
                    element={<ApplicationResultsPage type="builds" />}
                  />
                  <Route
                    path="/details/:uid/tests/:application"
                    element={<ApplicationResultsPage type="tests" />}
                  />

                  <Route path="/details/:uid" element={<JobPage />} />
                  <Route path="/details/:uid/:tab" element={<JobPage />} />

                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              <footer className="app-footer">
                <a href={GITHUB_REPO_URL} target="_blank" rel="noreferrer noopener">
                  {GITHUB_REPO}
                </a>
                <a href={`${API_BASE}/api`} target="_blank" rel="noreferrer noopener">
                  API
                </a>
                <a href={PRIVACY_URL} target="_blank" rel="noreferrer noopener">
                  Privacy policy
                </a>
              </footer>
            </div>
          </ToastProvider>
        </AuthProvider>
      </FiltersProvider>
    </BrowserRouter>
  );
}
