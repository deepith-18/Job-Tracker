import React, { useState, useMemo } from 'react';
import {
  Code2,
  Search,
  Star,
  Plus,
  Copy,
  Check,
  Building2,
  Tag,
  Clock,
  HardDrive,
  Trash2,
  Edit3,
  Lightbulb,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Cloud,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCodeQuestions } from '../../hooks/useCodeQuestions';
import { useApplications } from '../../hooks/useApplications';
import { useToast } from '../ui/ToastContext';
import type { InterviewCodeQuestion, CodingLanguage } from '../../types';

const LANGUAGE_LABELS: Record<CodingLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  go: 'Go',
  sql: 'SQL',
  rust: 'Rust',
};

const TOPIC_SUGGESTIONS = [
  'All',
  'Data Structures & Design',
  'Async & Concurrency',
  'Arrays & Prefix Sum',
  'Trees & Graphs',
  'Dynamic Programming',
  'System Design & Concurrency',
  'SQL & Database',
  'Web & React',
];

interface CodeQuestionVaultProps {
  initialCompanyFilter?: string;
  onNavigateToApplications?: () => void;
}

export const CodeQuestionVault: React.FC<CodeQuestionVaultProps> = ({
  initialCompanyFilter = 'All',
}) => {
  const { questions, loading, addQuestion, updateQuestion, deleteQuestion, toggleStar } =
    useCodeQuestions();
  const { applications } = useApplications();
  const { addToast } = useToast();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState(initialCompanyFilter);
  const [topicFilter, setTopicFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [languageFilter, setLanguageFilter] = useState<string>('All');
  const [starredOnly, setStarredOnly] = useState(false);

  // Expanded cards state (keep all open by default for effortless scanning, allow collapsing)
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<InterviewCodeQuestion | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    round: 'Technical Round 1',
    difficulty: 'Medium' as InterviewCodeQuestion['difficulty'],
    topic: 'Data Structures & Design',
    language: 'python' as CodingLanguage,
    code: '',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    approach: '',
    followUps: '',
    isStarred: false,
  });

  // Collect unique company names from both logged questions and active user applications
  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => q.company && set.add(q.company));
    applications.forEach((a) => a.company && set.add(a.company));
    return Array.from(set).sort();
  }, [questions, applications]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (starredOnly && !q.isStarred) return false;
      if (companyFilter !== 'All' && q.company.toLowerCase() !== companyFilter.toLowerCase())
        return false;
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) return false;
      if (topicFilter !== 'All' && q.topic !== topicFilter) return false;
      if (languageFilter !== 'All' && q.language !== languageFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesCompany = q.company.toLowerCase().includes(query);
        const matchesTopic = q.topic.toLowerCase().includes(query);
        const matchesCode = q.code.toLowerCase().includes(query);
        const matchesApproach = q.approach.toLowerCase().includes(query);
        return matchesTitle || matchesCompany || matchesTopic || matchesCode || matchesApproach;
      }

      return true;
    });
  }, [
    questions,
    starredOnly,
    companyFilter,
    difficultyFilter,
    topicFilter,
    languageFilter,
    searchQuery,
  ]);

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      addToast('Copied', 'Code snippet copied to clipboard', 'info');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      addToast('Copy Failed', 'Unable to access clipboard', 'error');
    }
  };

  const openAddModal = (prefilledCompany?: string) => {
    setEditingQuestion(null);
    setFormData({
      title: '',
      company: prefilledCompany || (uniqueCompanies[0] || 'Google'),
      round: 'Technical Round 1',
      difficulty: 'Medium',
      topic: 'Data Structures & Design',
      language: 'python',
      code: '',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      approach: '',
      followUps: '',
      isStarred: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (q: InterviewCodeQuestion) => {
    setEditingQuestion(q);
    setFormData({
      title: q.title,
      company: q.company,
      round: q.round,
      difficulty: q.difficulty,
      topic: q.topic,
      language: q.language,
      code: q.code,
      timeComplexity: q.timeComplexity || '',
      spaceComplexity: q.spaceComplexity || '',
      approach: q.approach,
      followUps: q.followUps || '',
      isStarred: q.isStarred,
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.code.trim()) {
      addToast('Validation Error', 'Title and code snippet are required', 'error');
      return;
    }

    if (editingQuestion) {
      updateQuestion(editingQuestion.id, {
        title: formData.title.trim(),
        company: formData.company.trim(),
        round: formData.round.trim(),
        difficulty: formData.difficulty,
        topic: formData.topic.trim(),
        language: formData.language,
        code: formData.code.trim(),
        timeComplexity: formData.timeComplexity.trim(),
        spaceComplexity: formData.spaceComplexity.trim(),
        approach: formData.approach.trim(),
        followUps: formData.followUps.trim(),
        isStarred: formData.isStarred,
      });
      addToast('Question Updated', `Saved changes to "${formData.title}"`, 'success');
    } else {
      addQuestion({
        title: formData.title.trim(),
        company: formData.company.trim(),
        round: formData.round.trim(),
        difficulty: formData.difficulty,
        topic: formData.topic.trim(),
        language: formData.language,
        code: formData.code.trim(),
        timeComplexity: formData.timeComplexity.trim(),
        spaceComplexity: formData.spaceComplexity.trim(),
        approach: formData.approach.trim(),
        followUps: formData.followUps.trim(),
        isStarred: formData.isStarred,
      });
      addToast('Question Stored', `Added "${formData.title}" to Code Vault`, 'success');
    }

    setModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete question "${title}" from your Code Vault?`)) {
      deleteQuestion(id);
      addToast('Deleted', 'Question removed from Code Vault', 'info');
    }
  };

  // Stats calculation
  const totalCount = questions.length;
  const starredCount = questions.filter((q) => q.isStarred).length;
  const hardCount = questions.filter((q) => q.difficulty === 'Hard').length;
  const mediumCount = questions.filter((q) => q.difficulty === 'Medium').length;

  return (
    <div className="pb" style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* ── Summary & Metrics Bar ── */}
      <div
        className="vault-metrics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Code2 style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>
              {totalCount}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Questions & Code Logged
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
            border: starredOnly ? '1px solid #f59e0b' : '1px solid var(--border)',
            cursor: 'pointer',
          }}
          onClick={() => setStarredOnly(!starredOnly)}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(245, 158, 11, 0.12)',
              color: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star style={{ width: 22, height: 22, fill: '#f59e0b' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f59e0b', lineHeight: 1.2 }}>
              {starredCount}
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Starred Must-Know (⭐)
            </div>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 10,
              background: starredOnly ? '#f59e0b' : 'var(--card)',
              color: starredOnly ? '#000' : 'var(--t3)',
            }}
          >
            {starredOnly ? 'Active' : 'Filter'}
          </span>
        </div>

        <div
          className="card"
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2 }}>
              {mediumCount} <span style={{ fontSize: 14, color: 'var(--t3)' }}>Med</span> /{' '}
              {hardCount} <span style={{ fontSize: 14, color: 'var(--t3)' }}>Hard</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t2)', fontWeight: 600 }}>
              Technical Depth Ratio
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: 20,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Top Row: Search & Add button */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 200 }}>
              <Search
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 15,
                  height: 15,
                  color: 'var(--t3)',
                }}
              />
              <input
                type="text"
                className="inp"
                placeholder="Search question title, company, code, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 36, width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginLeft: 'auto' }}>
              {/* Cloud Sync Status */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: 10,
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  border: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}
              >
                <Cloud style={{ width: 14, height: 14 }} />
                <span>{loading ? 'Syncing...' : 'Cloud Synced'}</span>
              </div>

              {/* Add Question Button */}
              <button
                onClick={() => openAddModal()}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus style={{ width: 15, height: 15 }} />
                <span>Store Code Question</span>
              </button>
            </div>
          </div>

          {/* Bottom Filter Selects & Star Toggle */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="inp"
              style={{ width: 'auto', flex: '1 1 140px', minWidth: 120 }}
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="All">All Companies ({uniqueCompanies.length})</option>
              {uniqueCompanies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              className="inp"
              style={{ width: 'auto', flex: '1 1 120px', minWidth: 110 }}
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              className="inp"
              style={{ width: 'auto', flex: '1 1 120px', minWidth: 110 }}
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
            >
              <option value="All">All Languages</option>
              {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setStarredOnly(!starredOnly)}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                padding: '6px 12px',
                background: starredOnly ? 'rgba(245, 158, 11, 0.15)' : 'var(--card)',
                color: starredOnly ? '#f59e0b' : 'var(--t2)',
                border: starredOnly ? '1px solid #f59e0b' : '1px solid var(--border)',
                whiteSpace: 'nowrap',
              }}
            >
              <Star
                style={{
                  width: 15,
                  height: 15,
                  fill: starredOnly ? '#f59e0b' : 'none',
                }}
              />
              <span>Important Only</span>
            </button>
          </div>
        </div>

        {/* Topic Pills */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {TOPIC_SUGGESTIONS.map((topic) => {
            const isSelected = topicFilter === topic;
            return (
              <button
                key={topic}
                onClick={() => setTopicFilter(topic)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 16,
                  fontSize: 12,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: isSelected ? 'var(--accent-bg)' : 'var(--card-hover)',
                  color: isSelected ? 'var(--accent)' : 'var(--t2)',
                  transition: 'all 0.15s ease',
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Question Cards List ── */}
      {filteredQuestions.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: 'center',
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <Code2 style={{ width: 44, height: 44, margin: '0 auto 14px', color: 'var(--t3)' }} />
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--t1)' }}>
            No interview code questions found
          </div>
          <div style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6, maxWidth: 440, margin: '6px auto 18px' }}>
            {searchQuery || starredOnly || companyFilter !== 'All'
              ? 'Try adjusting your search query, difficulty filters, or clearing the Starred filter.'
              : 'Store questions and coding solutions asked during your live rounds for rapid pre-interview review.'}
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setStarredOnly(false);
              setCompanyFilter('All');
              setTopicFilter('All');
              setDifficultyFilter('All');
              setLanguageFilter('All');
            }}
            className="btn btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredQuestions.map((q) => {
            const isCollapsed = collapsedIds.has(q.id);
            const isCopied = copiedId === q.id;

            // Difficulty color accents
            const diffColor =
              q.difficulty === 'Hard'
                ? '#ef4444'
                : q.difficulty === 'Medium'
                ? '#f59e0b'
                : '#10b981';

            return (
              <motion.div
                key={q.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="card"
                style={{
                  background: 'var(--card)',
                  border: q.isStarred
                    ? '1px solid rgba(245, 158, 11, 0.4)'
                    : '1px solid var(--border)',
                  borderRadius: 16,
                  overflow: 'hidden',
                  boxShadow: q.isStarred
                    ? '0 0 20px rgba(245, 158, 11, 0.05)'
                    : 'var(--shadow-sm)',
                }}
              >
                {/* ── Card Header ── */}
                <div
                  className="vault-card-header-responsive"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 14,
                    borderBottom: !isCollapsed ? '1px solid var(--border)' : 'none',
                    background: 'var(--card)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Tags row */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginBottom: 8,
                      }}
                    >
                      {/* Company Pill */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 8,
                          background: 'var(--accent-bg)',
                          color: 'var(--accent)',
                        }}
                      >
                        <Building2 style={{ width: 13, height: 13 }} />
                        <span>{q.company}</span>
                      </span>

                      {/* Round tag */}
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: 'var(--t2)',
                          background: 'var(--card-hover)',
                          padding: '3px 8px',
                          borderRadius: 6,
                          border: '1px solid var(--border)',
                        }}
                      >
                        {q.round}
                      </span>

                      {/* Difficulty */}
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: `${diffColor}18`,
                          color: diffColor,
                          border: `1px solid ${diffColor}40`,
                        }}
                      >
                        {q.difficulty}
                      </span>

                      {/* Topic Tag */}
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11.5,
                          color: 'var(--t3)',
                        }}
                      >
                        <Tag style={{ width: 12, height: 12 }} />
                        <span>{q.topic}</span>
                      </span>
                    </div>

                    {/* Question Title */}
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: 'var(--t1)',
                        lineHeight: 1.35,
                        margin: 0,
                      }}
                    >
                      {q.title}
                    </h3>
                  </div>

                  {/* Top Right Action Icons */}
                  <div
                    className="vault-card-actions-responsive"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                  >
                    {/* Star / Bookmark Button */}
                    <button
                      onClick={() => toggleStar(q.id)}
                      title={q.isStarred ? 'Unstar Question' : 'Mark as Important (⭐)'}
                      style={{
                        background: q.isStarred ? 'rgba(245, 158, 11, 0.15)' : 'var(--card-hover)',
                        border: q.isStarred ? '1px solid #f59e0b' : '1px solid var(--border)',
                        color: q.isStarred ? '#f59e0b' : 'var(--t3)',
                        padding: '6px 10px',
                        borderRadius: 8,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: 12,
                        fontWeight: 700,
                        transition: 'all 0.15s',
                      }}
                    >
                      <Star
                        style={{
                          width: 14,
                          height: 14,
                          fill: q.isStarred ? '#f59e0b' : 'none',
                        }}
                      />
                      <span>{q.isStarred ? 'Important' : 'Star'}</span>
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => openEditModal(q)}
                      title="Edit Question"
                      className="btn-ghost"
                      style={{
                        padding: 7,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        color: 'var(--t2)',
                      }}
                    >
                      <Edit3 style={{ width: 14, height: 14 }} />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(q.id, q.title)}
                      title="Delete Question"
                      className="btn-ghost"
                      style={{
                        padding: 7,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        color: 'var(--danger)',
                      }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>

                    {/* Collapse / Expand Toggle */}
                    <button
                      onClick={() => toggleCollapse(q.id)}
                      title={isCollapsed ? 'Expand Question' : 'Collapse Question'}
                      className="btn-ghost"
                      style={{
                        padding: 7,
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        color: 'var(--t3)',
                      }}
                    >
                      {isCollapsed ? (
                        <ChevronDown style={{ width: 15, height: 15 }} />
                      ) : (
                        <ChevronUp style={{ width: 15, height: 15 }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Card Body (Collapsible) ── */}
                {!isCollapsed && (
                  <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Complexity Badges & Approach Strip */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 12,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      {q.timeComplexity && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: 'var(--card-hover)',
                            border: '1px solid var(--border)',
                            color: 'var(--t1)',
                          }}
                        >
                          <Clock style={{ width: 12, height: 12, color: 'var(--accent)' }} />
                          <span>Time: {q.timeComplexity}</span>
                        </span>
                      )}

                      {q.spaceComplexity && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 6,
                            background: 'var(--card-hover)',
                            border: '1px solid var(--border)',
                            color: 'var(--t1)',
                          }}
                        >
                          <HardDrive style={{ width: 12, height: 12, color: '#06b6d4' }} />
                          <span>Space: {q.spaceComplexity}</span>
                        </span>
                      )}
                    </div>

                    {/* Approach & Explanation Box */}
                    {q.approach && (
                      <div
                        style={{
                          background: 'var(--card-hover)',
                          borderRadius: 10,
                          padding: '12px 14px',
                          border: '1px solid var(--border)',
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: 'var(--t1)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 800,
                            color: 'var(--accent)',
                            marginBottom: 4,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <Lightbulb style={{ width: 14, height: 14 }} />
                          <span>Optimal Approach & Notes</span>
                        </div>
                        {q.approach}
                      </div>
                    )}

                    {/* Follow-up Questions Box */}
                    {q.followUps && (
                      <div
                        style={{
                          background: 'rgba(99, 102, 241, 0.06)',
                          borderRadius: 10,
                          padding: '10px 14px',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          fontSize: 12.5,
                          lineHeight: 1.5,
                          color: 'var(--t1)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: 'var(--accent)',
                            marginBottom: 4,
                          }}
                        >
                          <MessageSquare style={{ width: 13, height: 13 }} />
                          <span>Interviewer Follow-ups & Variations</span>
                        </div>
                        {q.followUps}
                      </div>
                    )}

                    {/* ── Syntax Code Snippet Box ── */}
                    <div
                      style={{
                        borderRadius: 12,
                        background: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Code Header Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 14px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: '#ef4444',
                              display: 'inline-block',
                            }}
                          />
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: '#f59e0b',
                              display: 'inline-block',
                            }}
                          />
                          <span
                            style={{
                              width: 9,
                              height: 9,
                              borderRadius: '50%',
                              background: '#10b981',
                              display: 'inline-block',
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              color: '#94a3b8',
                              marginLeft: 8,
                              textTransform: 'uppercase',
                            }}
                          >
                            {LANGUAGE_LABELS[q.language] || q.language}
                          </span>
                        </div>

                        {/* 1-Click Copy Code Button */}
                        <button
                          onClick={() => handleCopyCode(q.id, q.code)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 10px',
                            borderRadius: 6,
                            background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                            border: isCopied ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: isCopied ? '#34d399' : '#e2e8f0',
                            fontSize: 11.5,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check style={{ width: 12, height: 12 }} />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy style={{ width: 12, height: 12 }} />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Content */}
                      <pre
                        style={{
                          margin: 0,
                          padding: '14px 18px',
                          overflowX: 'auto',
                          fontSize: 13,
                          lineHeight: 1.55,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                          color: '#e2e8f0',
                        }}
                      >
                        <code>{q.code}</code>
                      </pre>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Question Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.7)',
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
            }}
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 18,
                padding: '20px 18px',
                width: '100%',
                maxWidth: 680,
                maxHeight: '92vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 18,
                }}
              >
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--t1)',
                  }}
                >
                  <Code2 style={{ width: 20, height: 20, color: 'var(--accent)' }} />
                  <span>{editingQuestion ? 'Edit Code Question' : 'Store New Code Question'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-ghost"
                  style={{ borderRadius: '50%', padding: 6, color: 'var(--t3)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Title & Importance */}
                <div>
                  <label className="lbl">Question Title / Problem Name *</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. Design LRU Cache, Subarray Sum Equals K, Promise.all"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {/* Company & Round */}
                <div className="modal-form-grid" style={{ gap: 12 }}>
                  <div>
                    <label className="lbl">Company Asked At</label>
                    <input
                      type="text"
                      className="inp"
                      list="company-suggestions"
                      placeholder="e.g. Google, Amazon, Stripe"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                    <datalist id="company-suggestions">
                      {uniqueCompanies.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="lbl">Interview Round</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. Technical Round 1, System Design, OA"
                      value={formData.round}
                      onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    />
                  </div>
                </div>

                {/* Difficulty, Topic & Language */}
                <div className="modal-form-grid" style={{ gap: 12 }}>
                  <div>
                    <label className="lbl">Difficulty</label>
                    <select
                      className="inp"
                      value={formData.difficulty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          difficulty: e.target.value as InterviewCodeQuestion['difficulty'],
                        })
                      }
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="lbl">Topic / Category</label>
                    <input
                      type="text"
                      className="inp"
                      list="topic-suggestions"
                      value={formData.topic}
                      onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    />
                    <datalist id="topic-suggestions">
                      {TOPIC_SUGGESTIONS.filter((t) => t !== 'All').map((t) => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="lbl">Language</label>
                    <select
                      className="inp"
                      value={formData.language}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          language: e.target.value as CodingLanguage,
                        })
                      }
                    >
                      {Object.entries(LANGUAGE_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Time & Space Complexity */}
                <div className="modal-form-grid" style={{ gap: 12 }}>
                  <div>
                    <label className="lbl">Time Complexity</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. O(N log N), O(1)"
                      value={formData.timeComplexity}
                      onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="lbl">Space Complexity</label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. O(N), O(1)"
                      value={formData.spaceComplexity}
                      onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })}
                    />
                  </div>
                </div>

                {/* Code Snippet Editor */}
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <label className="lbl" style={{ margin: 0 }}>
                      Code Implementation / Solution Snippet *
                    </label>
                    <span style={{ fontSize: 11.5, color: 'var(--t3)' }}>
                      Supports indentation & comments
                    </span>
                  </div>
                  <textarea
                    className="inp"
                    rows={8}
                    placeholder="// Paste or write the solution code asked in the interview..."
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      fontSize: 13,
                      lineHeight: 1.5,
                      tabSize: 2,
                    }}
                  />
                </div>

                {/* Approach & Explanation */}
                <div>
                  <label className="lbl">Optimal Approach & Solution Explanation</label>
                  <textarea
                    className="inp"
                    rows={3}
                    placeholder="Key algorithmic intuition, data structures used, edge cases..."
                    value={formData.approach}
                    onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                  />
                </div>

                {/* Interviewer Follow-ups */}
                <div>
                  <label className="lbl">Interviewer Follow-ups & Scale Questions</label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. Asked how to scale to 10M QPS, multi-threaded safety, etc."
                    value={formData.followUps}
                    onChange={(e) => setFormData({ ...formData, followUps: e.target.value })}
                  />
                </div>

                {/* Starred / Important Checkbox */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: formData.isStarred ? 'rgba(245, 158, 11, 0.12)' : 'var(--card-hover)',
                    border: formData.isStarred ? '1px solid #f59e0b' : '1px solid var(--border)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isStarred}
                    onChange={(e) => setFormData({ ...formData, isStarred: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: '#f59e0b' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star
                      style={{
                        width: 15,
                        height: 15,
                        color: '#f59e0b',
                        fill: formData.isStarred ? '#f59e0b' : 'none',
                      }}
                    />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
                      Mark as ⭐ Important / High-Yield Question
                    </span>
                  </div>
                </label>

                {/* Modal Footer Buttons */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingQuestion ? 'Save Changes' : 'Store Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
