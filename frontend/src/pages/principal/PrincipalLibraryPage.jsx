import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';
import StatCard from '../../components/common/StatCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  BookOpen,
  Bookmark,
  Users,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  DollarSign,
  BarChart2,
  Layers,
  Search,
  Tag,
  Clock,
  AlertCircle,
} from 'lucide-react';

const PrincipalLibraryPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'books' | 'copies' | 'categories' | 'members' | 'issues' | 'fines'
  const [loading, setLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data states
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [issues, setIssues] = useState([]);
  const [fines, setFines] = useState([]);

  // Modals & Form States
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isbn13, setIsbn13] = useState('');
  const [selectedCatId, setSelectedCatId] = useState('');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catCode, setCatCode] = useState('');

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [memType, setMemType] = useState('student');
  const [memNo, setMemNo] = useState('');
  const [studentIdInput, setStudentIdInput] = useState('');

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueMemberId, setIssueMemberId] = useState('');
  const [issueCopyId, setIssueCopyId] = useState('');
  const [allCopies, setAllCopies] = useState([]);

  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, cRes, mRes, iRes, fRes] = await Promise.all([
        api.get('/principal/library/books'),
        api.get('/principal/library/categories'),
        api.get('/principal/library/members'),
        api.get('/principal/library/issues'),
        api.get('/principal/library/fines'),
      ]);

      if (bRes.data.success) setBooks(bRes.data.books || []);
      if (cRes.data.success) setCategories(cRes.data.categories || []);
      if (mRes.data.success) setMembers(mRes.data.members || []);
      if (iRes.data.success) setIssues(iRes.data.issues || []);
      if (fRes.data.success) setFines(fRes.data.fines || []);
    } catch (err) {
      console.error('Fetch library data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBook = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/library/books', {
        title: bookTitle,
        authorNames: [authorName],
        isbn13,
        categoryId: selectedCatId || undefined,
      });
      if (res.data.success) {
        setIsBookModalOpen(false);
        setBookTitle('');
        setAuthorName('');
        setIsbn13('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add book.');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/library/categories', {
        name: catName,
        code: catCode,
      });
      if (res.data.success) {
        setIsCategoryModalOpen(false);
        setCatName('');
        setCatCode('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to add category.');
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const res = await api.post('/principal/library/issues', {
        memberId: issueMemberId,
        bookCopyId: issueCopyId,
      });
      if (res.data.success) {
        setIsIssueModalOpen(false);
        setIssueMemberId('');
        setIssueCopyId('');
        fetchData();
      }
    } catch (err) {
      setFormError(err.customMessage || 'Failed to issue book.');
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      const res = await api.post(`/principal/library/issues/${issueId}/return`, { returnCondition: 'good' });
      if (res.data.success) fetchData();
    } catch (err) {
      alert(err.customMessage || 'Failed to return book.');
    }
  };

  const handlePayFine = async (fineId) => {
    try {
      const res = await api.post(`/principal/library/fines/${fineId}/pay`, { paymentReference: 'CASH' });
      if (res.data.success) fetchData();
    } catch (err) {
      alert(err.customMessage || 'Failed to pay fine.');
    }
  };

  const totalCopiesCount = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const issuedCopiesCount = issues.filter((i) => i.status === 'issued' || i.status === 'overdue').length;
  const pendingFinesCount = fines.filter((f) => f.status === 'pending').length;

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onMobileClose={() => setIsMobileSidebarOpen(false)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 border border-almond/40 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-chestnut uppercase tracking-wider">Library & Resource Center</span>
              <h1 className="text-2xl font-black text-darkBrown tracking-tight mt-1">
                Library Management
              </h1>
              <p className="text-xs text-textMuted mt-0.5">
                Manage master catalog, physical copy accession barcodes, borrower memberships, issue/return circulation, and fines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="px-4 py-2 bg-chestnut hover:bg-darkBrown text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Book Title</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-almond/40 pb-2 overflow-x-auto text-xs font-bold">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart2 },
              { id: 'books', label: 'Book Catalog', icon: BookOpen },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'members', label: 'Memberships', icon: Users },
              { id: 'issues', label: 'Issue & Returns', icon: ArrowRightLeft },
              { id: 'fines', label: 'Fines Ledger', icon: DollarSign },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-chestnut text-white shadow-sm'
                      : 'bg-white text-textMuted hover:bg-surface hover:text-darkBrown border border-almond/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <StatCard title="Master Titles" value={books.length} subtitle="Cataloged titles" icon={BookOpen} color="chestnut" />
                <StatCard title="Total Copies" value={totalCopiesCount} subtitle="Physical book copies" icon={Bookmark} color="morning" />
                <StatCard title="Active Loans" value={issuedCopiesCount} subtitle="Currently borrowed" icon={ArrowRightLeft} color="success" />
                <StatCard title="Pending Fines" value={pendingFinesCount} subtitle="Unpaid fine records" icon={DollarSign} color="warning" />
              </div>
            </div>
          )}

          {/* TAB 2: BOOK CATALOG */}
          {activeTab === 'books' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Master Book Catalog ({books.length})</h3>

              {loading ? (
                <LoadingSkeleton count={4} />
              ) : books.length === 0 ? (
                <div className="text-center py-12 text-textMuted text-xs">No books added to catalog yet.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  {books.map((b) => (
                    <div key={b._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-chestnut/10 text-chestnut uppercase">
                        {b.categoryId?.name || 'General'}
                      </span>
                      <h4 className="font-bold text-darkBrown text-sm">{b.title}</h4>
                      <div className="text-textMuted font-medium">Author: {(b.authorNames || []).join(', ') || 'N/A'}</div>
                      <div className="text-textMuted font-mono text-[11px]">ISBN: {b.isbn13 || 'N/A'}</div>
                      <div className="pt-2 border-t border-almond/30 flex items-center justify-between text-[11px] font-mono font-bold">
                        <span className="text-success">Available: {b.availableCopies}</span>
                        <span className="text-chestnut">Total: {b.totalCopies}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-darkBrown">Book Categories ({categories.length})</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="px-3.5 py-1.5 bg-chestnut text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {categories.map((c) => (
                  <div key={c._id} className="p-4 bg-surface rounded-2xl border border-almond/50 space-y-1">
                    <div className="flex items-center justify-between font-bold text-darkBrown">
                      <span>{c.name}</span>
                      <span className="font-mono text-[10px] text-chestnut bg-chestnut/10 px-2 py-0.5 rounded">{c.code}</span>
                    </div>
                    <p className="text-textMuted text-[11px]">{c.description || 'No description'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MEMBERSHIPS */}
          {activeTab === 'members' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Library Memberships ({members.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Member No</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Borrowing Limit</th>
                      <th className="py-3 px-4">Current Loans</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {members.map((m) => (
                      <tr key={m._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold font-mono text-chestnut">{m.membershipNumber}</td>
                        <td className="py-3 px-4 uppercase font-bold text-[10px]">{m.memberType}</td>
                        <td className="py-3 px-4 font-bold text-darkBrown">
                          {m.studentId?.name || m.teacherId?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono">{m.borrowingLimit} Books</td>
                        <td className="py-3 px-4 font-mono font-bold">{m.currentIssuedCount}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            m.status === 'active' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: CIRCULATION ISSUES & RETURNS */}
          {activeTab === 'issues' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Circulation Loans & Returns ({issues.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Issue No</th>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {issues.map((i) => (
                      <tr key={i._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-darkBrown">{i.issueNumber}</td>
                        <td className="py-3 px-4 font-bold text-chestnut">{i.bookId?.title}</td>
                        <td className="py-3 px-4 text-textMuted">
                          {i.memberId?.studentId?.name || i.memberId?.teacherId?.name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-textMuted">{new Date(i.dueDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            i.status === 'returned' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                          }`}>
                            {i.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {i.status === 'issued' && (
                            <button
                              onClick={() => handleReturnBook(i._id)}
                              className="px-3 py-1 bg-chestnut hover:bg-darkBrown text-white rounded-lg text-[10px] font-bold shadow-sm"
                            >
                              Return Book
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: FINES LEDGER */}
          {activeTab === 'fines' && (
            <div className="bg-white rounded-2xl border border-almond/40 shadow-card p-5 space-y-4">
              <h3 className="text-base font-bold text-darkBrown">Library Fine Ledger ({fines.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-almond/30 text-[11px] font-bold text-textMuted uppercase bg-surface/50">
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-almond/20">
                    {fines.map((f) => (
                      <tr key={f._id} className="hover:bg-surface/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-darkBrown">
                          {f.memberId?.studentId?.name || f.memberId?.teacherId?.name || 'Member'}
                        </td>
                        <td className="py-3 px-4 uppercase font-mono text-[10px]">{f.fineType}</td>
                        <td className="py-3 px-4 font-mono font-bold">₹{(f.amountMinor / 100).toFixed(2)}</td>
                        <td className="py-3 px-4 text-textMuted">{f.reason}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            f.status === 'paid' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
                          }`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {f.status === 'pending' && (
                            <button
                              onClick={() => handlePayFine(f._id)}
                              className="px-2.5 py-1 bg-success text-white rounded-lg text-[10px] font-bold shadow-sm"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ADD BOOK MODAL */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Add Master Book Title</h3>
            {formError && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleCreateBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fundamentals of Physics"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. H.C. Verma"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">ISBN-13</label>
                <input
                  type="text"
                  placeholder="978-3-16-148410-0"
                  value={isbn13}
                  onChange={(e) => setIsbn13(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md"
                >
                  Save Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-darkBrown/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-almond/50 space-y-4">
            <h3 className="text-base font-bold text-darkBrown">Add Book Category</h3>
            {formError && <div className="p-3 bg-danger/10 text-danger text-xs rounded-xl">{formError}</div>}

            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-darkBrown mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science & Technology"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-darkBrown mb-1">Category Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SCI"
                  value={catCode}
                  onChange={(e) => setCatCode(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-almond/60 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border border-almond text-textMuted rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-chestnut hover:bg-darkBrown text-white font-bold rounded-xl shadow-md"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrincipalLibraryPage;
