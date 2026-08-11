import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { BookOpen, Search, Bookmark } from 'lucide-react';

const TeacherLibraryPage = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teacher/library/catalog');
      if (res.data.success) setBooks(res.data.books || []);
    } catch (err) {
      console.error('Fetch catalog error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.authorNames || []).some((a) => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card">
            <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Teacher Workspace</span>
            <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
              Library Catalog & Resources
            </h1>
            <p className="text-xs text-textMuted mt-0.5">
              Browse available titles, check physical copy availability, and view catalog details.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold text-darkBrown">Catalog Directory</h3>
              <div className="relative max-w-xs w-full">
                <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title or author..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-almond/60 rounded-xl text-xs"
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton count={4} />
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12 text-textMuted text-xs">No books matching search query.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {filteredBooks.map((b) => (
                  <div key={b._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                      {b.categoryId?.name || 'General'}
                    </span>
                    <h4 className="font-bold text-darkBrown text-sm">{b.title}</h4>
                    <div className="text-textMuted font-medium">Author: {(b.authorNames || []).join(', ') || 'N/A'}</div>
                    <div className="pt-2 border-t border-almond/30 flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-success">Available: {b.availableCopies}</span>
                      <span className="text-chestnut">Total: {b.totalCopies}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLibraryPage;
