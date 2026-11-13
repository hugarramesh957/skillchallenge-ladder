import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import challengeService from '../services/challengeService';
import DifficultyBadge from '../components/DifficultyBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export const ChallengeManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const initialFormState = {
    title: '',
    description: '',
    problemStatement: '',
    instructions: '',
    difficulty: 'Beginner',
    category: 'Frontend',
    skillsInput: '',
    estimatedMinutes: 60,
    deliverablesInput: '',
    hintsInput: '',
    prerequisites: [],
    isPublished: true,
  };

  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError('');
      // Reviewers can see all challenges including unpublished
      const res = await challengeService.getChallenges({ sort: 'oldest' });
      setChallenges(res.data?.challenges || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch challenges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialFormState);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingId(c._id);
    setForm({
      title: c.title || '',
      description: c.description || '',
      problemStatement: c.problemStatement || '',
      instructions: c.instructions || '',
      difficulty: c.difficulty || 'Beginner',
      category: c.category || 'Frontend',
      skillsInput: (c.skills || []).join(', '),
      estimatedMinutes: c.estimatedMinutes || 60,
      deliverablesInput: (c.deliverables || []).join('\n'),
      hintsInput: (c.hints || []).join('\n'),
      prerequisites: (c.prerequisites || []).map((p) => p._id || p),
      isPublished: c.isPublished ?? true,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.problemStatement.trim()) errs.problemStatement = 'Problem statement is required';
    if (!form.instructions.trim()) errs.instructions = 'Instructions are required';
    if (form.estimatedMinutes < 5) errs.estimatedMinutes = 'Duration must be at least 5 mins';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        problemStatement: form.problemStatement.trim(),
        instructions: form.instructions.trim(),
        difficulty: form.difficulty,
        category: form.category.trim(),
        skills: form.skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter((s) => s.length > 0),
        estimatedMinutes: Number(form.estimatedMinutes),
        deliverables: form.deliverablesInput
          .split('\n')
          .map((d) => d.trim())
          .filter((d) => d.length > 0),
        hints: form.hintsInput
          .split('\n')
          .map((h) => h.trim())
          .filter((h) => h.length > 0),
        prerequisites: form.prerequisites,
        isPublished: form.isPublished,
      };

      if (editingId) {
        await challengeService.updateChallenge(editingId, payload);
        setSuccess('Challenge updated successfully!');
      } else {
        await challengeService.createChallenge(payload);
        setSuccess('Challenge created successfully!');
      }

      setIsModalOpen(false);
      await fetchChallenges();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save challenge. Please check requirements.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${title}"?`
    );
    if (!confirmed) return;

    try {
      setError('');
      await challengeService.deleteChallenge(id);
      setSuccess(`Challenge "${title}" deleted successfully.`);
      await fetchChallenges();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete challenge.');
    }
  };

  const togglePrerequisite = (prereqId) => {
    setForm((prev) => {
      const exists = prev.prerequisites.includes(prereqId);
      return {
        ...prev,
        prerequisites: exists
          ? prev.prerequisites.filter((id) => id !== prereqId)
          : [...prev.prerequisites, prereqId],
      };
    });
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading challenge repository..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Curriculum Management</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Challenge Management
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            Create, edit, organize prerequisite trees, and configure difficulty ladders.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="self-start sm:self-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Challenge</span>
        </button>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Challenges Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">
            All Curriculum Challenges ({challenges.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Prerequisites</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {challenges.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                    {c.title}
                  </td>
                  <td className="py-3.5 px-4">
                    <DifficultyBadge difficulty={c.difficulty} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {c.prerequisites?.length || 0} required
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.isPublished
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c._id, c.title)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Challenge' : 'Create New Challenge'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Challenge Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Build an Interactive Calculator"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief summary for catalogue cards..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.description}</p>
                )}
              </div>

              {/* Problem Statement */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Problem Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={form.problemStatement}
                  onChange={(e) => setForm({ ...form, problemStatement: e.target.value })}
                  placeholder="Contextual learning problem to solve..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                />
                {formErrors.problemStatement && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.problemStatement}</p>
                )}
              </div>

              {/* Detailed Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Instructions <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder="Step-by-step implementation guide..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20"
                />
                {formErrors.instructions && (
                  <p className="mt-1 text-xs text-rose-600">{formErrors.instructions}</p>
                )}
              </div>

              {/* Difficulty & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty Tier
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g. Frontend, Backend, Database"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Skills & Estimated Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Skills (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.skillsInput}
                    onChange={(e) => setForm({ ...form, skillsInput: e.target.value })}
                    placeholder="HTML5, CSS3, Flexbox"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Est. Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    value={form.estimatedMinutes}
                    onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Deliverables (One per line) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expected Deliverables (One per line)
                </label>
                <textarea
                  rows={2}
                  value={form.deliverablesInput}
                  onChange={(e) => setForm({ ...form, deliverablesInput: e.target.value })}
                  placeholder="Semantic HTML document&#10;Accessible navigation bar&#10;Passed W3C validation"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Hints (One per line) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hints for Students (One per line)
                </label>
                <textarea
                  rows={2}
                  value={form.hintsInput}
                  onChange={(e) => setForm({ ...form, hintsInput: e.target.value })}
                  placeholder="Consider mobile-first styling&#10;Use CSS Grid for 3-column layouts"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Prerequisites Multi-Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prerequisites Required for Unlocking
                </label>
                <div className="border border-slate-200 rounded-xl p-3 max-h-36 overflow-y-auto space-y-1.5 bg-slate-50/50">
                  {challenges
                    .filter((c) => c._id !== editingId)
                    .map((c) => {
                      const isSelected = form.prerequisites.includes(c._id);
                      return (
                        <label
                          key={c._id}
                          className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-slate-100 p-1.5 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePrerequisite(c._id)}
                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-semibold">{c.title}</span>
                          <span className="text-[10px] text-slate-400">({c.difficulty})</span>
                        </label>
                      );
                    })}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Checked challenges must be approved for a student before this challenge unlocks.
                </p>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700">
                  Publish to Catalogue immediately
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingId ? 'Save Changes' : 'Create Challenge'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeManagement;

