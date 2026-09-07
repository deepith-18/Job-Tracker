import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Brain,
  Code2,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Copy,
  Check,
  Download,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Building2,
  Calendar,
  FileSpreadsheet,
  Edit3,
  Trash2,
  Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseInterviewMarkdown } from '../../utils/parseInterviewMarkdown';
import { PRESET_SAMPLE_FILES } from '../../data/sampleInterviewNotes';
import { CodeInterpreterViewer } from '../common/CodeInterpreterViewer';
import { useCodeQuestions } from '../../hooks/useCodeQuestions';
import { useToast } from '../ui/ToastContext';
import type {
  CompanyRoundDocument,
  ParsedRoundQuestion,
  QuestionCategoryType,
  CodingLanguage,
  RejectionCategory,
} from '../../types';

const STORAGE_KEY = 'jobtracker_company_rounds_md_doc';

export const CompanyRoundNotesMdViewer: React.FC = () => {
  const { addQuestion } = useCodeQuestions();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document state
  const [doc, setDoc] = useState<CompanyRoundDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return parseInterviewMarkdown(PRESET_SAMPLE_FILES[0].markdown, 'Google_L5_Interview_Notes.md');
  });

  // UI state
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyRejectionLessons, setOnlyRejectionLessons] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [savedVaultIds, setSavedVaultIds] = useState<Set<string>>(new Set());
  const [copiedQId, setCopiedQId] = useState<string | null>(null);

  // Paste modal state
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [pasteDocTitle, setPasteDocTitle] = useState('');

  // Edit / Add Question Modal state
  const [editingModalOpen, setEditingModalOpen] = useState(false);
  const [targetRoundNumber, setTargetRoundNumber] = useState<number>(1);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{
    question: string;
    type: QuestionCategoryType;
    category: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    keyConcepts: string;
    answer: string;
    codeSnippet: string;
    codeLanguage: CodingLanguage;
    timeComplexity: string;
    spaceComplexity: string;
    identifiedMistake: string;
    whatToLearn: string;
    followUps: string;
  }>({
    question: '',
    type: 'Theory & Concepts',
    category: 'React & Frontend',
    difficulty: 'Medium',
    keyConcepts: '',
    answer: '',
    codeSnippet: '',
    codeLanguage: 'python',
    timeComplexity: '',
    spaceComplexity: '',
    identifiedMistake: '',
    whatToLearn: '',
    followUps: '',
  });

  // Persist current doc to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      // ignore
    }
  }, [doc]);

  // Handle file upload (.md or text)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content || !content.trim()) {
        addToast('Invalid File', 'The uploaded markdown file is empty.', 'error');
        return;
      }

      const parsed = parseInterviewMarkdown(content, file.name);
      setDoc(parsed);
      setSelectedRound('all');
      setSelectedType('All');
      addToast(
        'Markdown Parsed Successfully',
        `Extracted ${parsed.totalRounds} rounds and ${parsed.totalQuestions} questions (${parsed.theoryQuestionsCount} theory) for ${parsed.company}`,
        'success'
      );
    };
    reader.onerror = () => {
      addToast('Upload Error', 'Failed to read the file.', 'error');
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (!content) return;
      const parsed = parseInterviewMarkdown(content, file.name);
      setDoc(parsed);
      setSelectedRound('all');
      addToast('Markdown Loaded', `Loaded notes for ${parsed.company}`, 'success');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = PRESET_SAMPLE_FILES.find((s) => s.id === sampleId);
    if (!sample) return;
    const parsed = parseInterviewMarkdown(sample.markdown, `${sample.id}.md`);
    setDoc(parsed);
    setSelectedRound('all');
    setSelectedType('All');
    addToast('Sample Loaded', `Loaded ${sample.title}`, 'info');
  };

  const handleSaveToVault = async (q: ParsedRoundQuestion, roundTitle: string) => {
    try {
      await addQuestion({
        title: q.question,
        company: doc.company,
        round: roundTitle,
        difficulty: q.difficulty,
        topic: q.category,
        language: q.codeLanguage || 'python',
        code: q.codeSnippet || `# Theory Question Notes\n# Question: ${q.question}\n\n# Answer Summary:\n"""\n${q.answer}\n"""`,
        timeComplexity: q.timeComplexity || 'O(1) concept',
        spaceComplexity: q.spaceComplexity || 'O(1)',
        approach: q.answer,
        followUps: q.followUps ? q.followUps.join('\n') : undefined,
        isStarred: Boolean(q.isStarred),
      });

      setSavedVaultIds((prev) => new Set(prev).add(q.id));
      addToast(
        'Saved to Question Vault',
        `"${q.question.slice(0, 45)}..." stored in permanent Code Vault`,
        'success'
      );
    } catch {
      addToast('Save Failed', 'Could not save question to vault', 'error');
    }
  };

  const handleCopyQuestion = (q: ParsedRoundQuestion) => {
    const text = `Question: ${q.question}\nType: ${q.type} (${q.category})\nDifficulty: ${q.difficulty}\n\nAnswer / Notes:\n${q.answer}${q.codeSnippet ? `\n\nCode Snippet:\n\`\`\`${q.codeLanguage || ''}\n${q.codeSnippet}\n\`\`\`` : ''}${q.rejectionLearning ? `\n\nIdentified Mistake / Rejection Trap:\n${q.rejectionLearning.identifiedMistake}\n\nWhat to Learn:\n${q.rejectionLearning.whatToLearn}` : ''}`;
    navigator.clipboard.writeText(text);
    setCopiedQId(q.id);
    setTimeout(() => setCopiedQId(null), 2000);
    addToast('Copied to Clipboard', 'Question, notes, and lessons copied.', 'info');
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([doc.rawMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.fileName || `${doc.company}_Interview_Notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Downloaded', `Exported ${doc.fileName}`, 'info');
  };

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteContent.trim()) {
      addToast('Validation Error', 'Please paste markdown content first', 'error');
      return;
    }
    const name = pasteDocTitle.trim() ? `${pasteDocTitle.trim()}.md` : 'Pasted_Interview_Notes.md';
    const parsed = parseInterviewMarkdown(pasteContent, name);
    setDoc(parsed);
    setPasteModalOpen(false);
    setPasteContent('');
    setPasteDocTitle('');
    setSelectedRound('all');
    addToast('Markdown Imported', `Parsed ${parsed.totalRounds} rounds and questions.`, 'success');
  };

  const handleOpenEditModal = (roundNumber: number, q: ParsedRoundQuestion) => {
    setTargetRoundNumber(roundNumber);
    setEditingQuestionId(q.id);
    setEditFormData({
      question: q.question,
      type: q.type,
      category: q.category,
      difficulty: q.difficulty,
      keyConcepts: q.keyConcepts.join(', '),
      answer: q.answer,
      codeSnippet: q.codeSnippet || '',
      codeLanguage: q.codeLanguage || 'python',
      timeComplexity: q.timeComplexity || '',
      spaceComplexity: q.spaceComplexity || '',
      identifiedMistake: q.rejectionLearning?.identifiedMistake || '',
      whatToLearn: q.rejectionLearning?.whatToLearn || '',
      followUps: q.followUps ? q.followUps.join('\n') : '',
    });
    setEditingModalOpen(true);
  };

  const handleOpenAddModal = (roundNumber: number) => {
    setTargetRoundNumber(roundNumber);
    setEditingQuestionId(null);
    setEditFormData({
      question: '',
      type: 'Theory & Concepts',
      category: 'Core CS Fundamentals',
      difficulty: 'Medium',
      keyConcepts: '',
      answer: '',
      codeSnippet: '',
      codeLanguage: 'python',
      timeComplexity: '',
      spaceComplexity: '',
      identifiedMistake: '',
      whatToLearn: '',
      followUps: '',
    });
    setEditingModalOpen(true);
  };

  const handleDeleteQuestion = (roundNumber: number, questionId: string, questionTitle: string) => {
    if (!window.confirm(`Delete question "${questionTitle.slice(0, 40)}..."?`)) return;

    setDoc((prev) => {
      const newRounds = prev.rounds.map((r) => {
        if (r.roundNumber !== roundNumber) return r;
        return {
          ...r,
          questions: r.questions.filter((q) => q.id !== questionId),
        };
      });

      let totalQuestions = 0;
      let theoryQuestionsCount = 0;
      let codingQuestionsCount = 0;

      newRounds.forEach((r) => {
        totalQuestions += r.questions.length;
        r.questions.forEach((q) => {
          if (q.type === 'Theory & Concepts') theoryQuestionsCount++;
          else if (q.type === 'Coding & DSA') codingQuestionsCount++;
        });
      });

      return {
        ...prev,
        rounds: newRounds,
        totalQuestions,
        theoryQuestionsCount,
        codingQuestionsCount,
      };
    });

    addToast('Question Deleted', 'Removed from interview notes.', 'info');
  };

  const handleDeleteRound = (roundNumber: number, roundTitle: string) => {
    if (!window.confirm(`Delete entire round "${roundTitle}" and all its questions?`)) return;

    setDoc((prev) => {
      const newRounds = prev.rounds.filter((r) => r.roundNumber !== roundNumber);
      let totalQuestions = 0;
      let theoryQuestionsCount = 0;
      let codingQuestionsCount = 0;

      newRounds.forEach((r) => {
        totalQuestions += r.questions.length;
        r.questions.forEach((q) => {
          if (q.type === 'Theory & Concepts') theoryQuestionsCount++;
          else if (q.type === 'Coding & DSA') codingQuestionsCount++;
        });
      });

      return {
        ...prev,
        rounds: newRounds,
        totalRounds: newRounds.length,
        totalQuestions,
        theoryQuestionsCount,
        codingQuestionsCount,
      };
    });

    addToast('Round Deleted', `Removed Round ${roundNumber}.`, 'info');
  };

  const handleSaveQuestionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.question.trim() || !editFormData.answer.trim()) {
      addToast('Validation Error', 'Question prompt and Answer / Notes are required.', 'error');
      return;
    }

    const concepts = editFormData.keyConcepts
      .split(/[,;]/)
      .map((c) => c.trim())
      .filter(Boolean);

    const followUps = editFormData.followUps
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    setDoc((prev) => {
      const newRounds = prev.rounds.map((r) => {
        if (r.roundNumber !== targetRoundNumber) return r;

        if (editingQuestionId) {
          // Edit existing question
          const updatedQs = r.questions.map((q) => {
            if (q.id !== editingQuestionId) return q;
            return {
              ...q,
              question: editFormData.question.trim(),
              type: editFormData.type,
              category: editFormData.category.trim(),
              difficulty: editFormData.difficulty,
              keyConcepts: concepts.length > 0 ? concepts : q.keyConcepts,
              answer: editFormData.answer.trim(),
              codeSnippet: editFormData.codeSnippet.trim() ? editFormData.codeSnippet.trim() : undefined,
              codeLanguage: editFormData.codeLanguage,
              timeComplexity: editFormData.timeComplexity.trim() || undefined,
              spaceComplexity: editFormData.spaceComplexity.trim() || undefined,
              followUps: followUps.length > 0 ? followUps : undefined,
              rejectionLearning: editFormData.identifiedMistake.trim() || editFormData.whatToLearn.trim()
                ? {
                    identifiedMistake: editFormData.identifiedMistake.trim() || 'Common conceptual pitfall during interview',
                    whatToLearn: editFormData.whatToLearn.trim() || 'Master the core mechanism and explain trade-offs clearly',
                    category: (editFormData.type === 'Theory & Concepts' ? 'Theory Gap' : 'Complexity Suboptimal') as RejectionCategory,
                    correctiveAction: q.rejectionLearning?.correctiveAction || ['Practice explaining trade-offs before answering'],
                  }
                : q.rejectionLearning,
            };
          });
          return { ...r, questions: updatedQs };
        } else {
          // Add new question
          const newQ: ParsedRoundQuestion = {
            id: `q-user-${Date.now().toString(36)}`,
            questionNumber: r.questions.length + 1,
            question: editFormData.question.trim(),
            type: editFormData.type,
            category: editFormData.category.trim() || 'Core CS Fundamentals',
            difficulty: editFormData.difficulty,
            keyConcepts: concepts.length > 0 ? concepts : ['Interview Note'],
            answer: editFormData.answer.trim(),
            codeSnippet: editFormData.codeSnippet.trim() ? editFormData.codeSnippet.trim() : undefined,
            codeLanguage: editFormData.codeLanguage,
            timeComplexity: editFormData.timeComplexity.trim() || undefined,
            spaceComplexity: editFormData.spaceComplexity.trim() || undefined,
            followUps: followUps.length > 0 ? followUps : undefined,
            rejectionLearning: editFormData.identifiedMistake.trim() || editFormData.whatToLearn.trim()
              ? {
                  identifiedMistake: editFormData.identifiedMistake.trim() || 'Common conceptual trap',
                  whatToLearn: editFormData.whatToLearn.trim() || 'Structure your answer with trade-offs and real-world examples',
                  category: (editFormData.type === 'Theory & Concepts' ? 'Theory Gap' : 'Complexity Suboptimal') as RejectionCategory,
                  correctiveAction: ['Structure answer in 3 parts: definition, mechanics, production trade-offs'],
                }
              : undefined,
          };
          return { ...r, questions: [...r.questions, newQ] };
        }
      });

      let totalQuestions = 0;
      let theoryQuestionsCount = 0;
      let codingQuestionsCount = 0;

      newRounds.forEach((r) => {
        totalQuestions += r.questions.length;
        r.questions.forEach((q) => {
          if (q.type === 'Theory & Concepts') theoryQuestionsCount++;
          else if (q.type === 'Coding & DSA') codingQuestionsCount++;
        });
      });

      return {
        ...prev,
        rounds: newRounds,
        totalQuestions,
        theoryQuestionsCount,
        codingQuestionsCount,
      };
    });

    addToast(
      editingQuestionId ? 'Question Updated' : 'Question Added',
      editingQuestionId ? 'Changes saved to notes.' : 'New question added to round.',
      'success'
    );
    setEditingModalOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtered rounds and questions
  const filteredRounds = useMemo(() => {
    return doc.rounds
      .filter((r) => selectedRound === 'all' || r.roundNumber === selectedRound)
      .map((r) => {
        const matchingQuestions = r.questions.filter((q) => {
          if (onlyRejectionLessons && !q.rejectionLearning) return false;
          if (selectedType !== 'All' && q.type !== selectedType) return false;
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesQ = q.question.toLowerCase().includes(query);
            const matchesAns = q.answer.toLowerCase().includes(query);
            const matchesConcepts = q.keyConcepts.some((c) => c.toLowerCase().includes(query));
            const matchesMistake = q.rejectionLearning?.identifiedMistake.toLowerCase().includes(query);
            const matchesLearn = q.rejectionLearning?.whatToLearn.toLowerCase().includes(query);
            return matchesQ || matchesAns || matchesConcepts || matchesMistake || matchesLearn;
          }
          return true;
        });

        return {
          ...r,
          questions: matchingQuestions,
        };
      })
      .filter((r) => r.questions.length > 0 || !searchQuery.trim());
  }, [doc, selectedRound, selectedType, searchQuery, onlyRejectionLessons]);

  const totalVisibleQuestions = useMemo(() => {
    return filteredRounds.reduce((acc, r) => acc + r.questions.length, 0);
  }, [filteredRounds]);

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto' }}>
      {/* ── Top Header Bar & Upload Controls ── */}
      <div
        className="card"
        style={{
          padding: '20px 24px',
          marginBottom: 20,
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  fontSize: 13,
                  fontWeight: 800,
                  border: '1px solid var(--border)',
                }}
              >
                <Building2 style={{ width: 14, height: 14 }} />
                <span>{doc.company}</span>
              </span>

              <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>
                {doc.role}
              </span>

              {doc.interviewDate && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--t3)' }}>
                  <Calendar style={{ width: 13, height: 13 }} />
                  <span>{doc.interviewDate}</span>
                </span>
              )}

              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: '3px 9px',
                  borderRadius: 12,
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                Retrospective & Mistake Lessons Included
              </span>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginTop: 8, marginBottom: 4 }}>
              Company Round Notes & MD Questions Viewer
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t2)', margin: 0, maxWidth: 680, lineHeight: 1.5 }}>
              Upload any Markdown (<code style={{ color: 'var(--accent)' }}>.md</code>) file from your interviews. 
              Organized round-by-round with full coverage of <strong>theory & conceptual questions</strong>, 
              syntax-highlighted code, and actionable <strong>rejection post-mortem lessons</strong>.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <UploadCloud style={{ width: 16, height: 16 }} />
              <span>Upload .MD File</span>
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--card-hover)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
              }}
            >
              <FileText style={{ width: 15, height: 15, color: 'var(--accent)' }} />
              <span>Paste Markdown</span>
            </button>

            <button
              onClick={handleExportMarkdown}
              className="btn-ghost"
              title="Download clean Markdown"
              style={{
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--border)',
                color: 'var(--t2)',
              }}
            >
              <Download style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* ── Preset Sample Switchers ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Load Sample Debrief:
          </span>
          {PRESET_SAMPLE_FILES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample.id)}
              style={{
                padding: '4px 12px',
                borderRadius: 14,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                background: doc.company.toLowerCase().includes(sample.company.toLowerCase()) ? 'var(--accent-bg)' : 'var(--card)',
                color: doc.company.toLowerCase().includes(sample.company.toLowerCase()) ? 'var(--accent)' : 'var(--t2)',
                border: doc.company.toLowerCase().includes(sample.company.toLowerCase()) ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* ── Drag and Drop Area Dropzone (Collapsible or Compact) ── */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        style={{
          border: '1.5px dashed var(--border)',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 20,
          background: 'rgba(99, 102, 241, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FileSpreadsheet style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>
              Active Document: <span style={{ color: 'var(--accent)' }}>{doc.fileName}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>
              Drag & drop any <code style={{ color: 'var(--t2)' }}>.md</code> file anywhere on this box to parse questions instantaneously.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '3px 10px', borderRadius: 10 }}>
            {doc.totalRounds} Rounds Detected
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)', padding: '3px 10px', borderRadius: 10 }}>
            {doc.theoryQuestionsCount} Theory Questions Covered
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.12)', padding: '3px 10px', borderRadius: 10 }}>
            {doc.codingQuestionsCount} Coding Problems
          </span>
        </div>
      </div>

      {/* ── Rejection Mistake & Growth Retrospective Highlight Panel ── */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          borderRadius: 12,
          marginBottom: 20,
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle style={{ width: 17, height: 17 }} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>
                Rejection Retrospective & Mistake Identifier
              </div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>
                Every question includes actionable lessons detailing why candidates get rejected and how to master the answer.
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnlyRejectionLessons(!onlyRejectionLessons)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              background: onlyRejectionLessons ? '#ef4444' : 'var(--card)',
              color: onlyRejectionLessons ? '#fff' : 'var(--t2)',
              border: onlyRejectionLessons ? '1px solid #ef4444' : '1px solid var(--border)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <Lightbulb style={{ width: 14, height: 14 }} />
            <span>{onlyRejectionLessons ? 'Showing Lessons Only' : 'Filter Questions with Mistake Lessons'}</span>
          </button>
        </div>
      </div>

      {/* ── Search and Filter Controls ── */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {/* Top: Search & Category Pills */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
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
              placeholder="Search theory concepts, questions, mistakes, or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: 36, width: '100%' }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'Theory & Concepts', 'Coding & DSA', 'System Design', 'Behavioral & Leadership'].map((type) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isSelected
                      ? type === 'Theory & Concepts'
                        ? 'rgba(139, 92, 246, 0.2)'
                        : 'var(--accent-bg)'
                      : 'var(--card-hover)',
                    color: isSelected
                      ? type === 'Theory & Concepts'
                        ? '#a855f7'
                        : 'var(--accent)'
                      : 'var(--t2)',
                    border: isSelected
                      ? type === 'Theory & Concepts'
                        ? '1px solid #8b5cf6'
                        : '1px solid var(--accent)'
                      : '1px solid var(--border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {type === 'Theory & Concepts' && <Brain style={{ width: 13, height: 13 }} />}
                  {type === 'Coding & DSA' && <Code2 style={{ width: 13, height: 13 }} />}
                  {type === 'System Design' && <Layers style={{ width: 13, height: 13 }} />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom: Round Switcher Tabs (Round 1, Round 2, Round 3...) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginRight: 4, whiteSpace: 'nowrap' }}>
            Filter by Round:
          </span>

          <button
            onClick={() => setSelectedRound('all')}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              background: selectedRound === 'all' ? 'var(--accent)' : 'var(--card-hover)',
              color: selectedRound === 'all' ? '#fff' : 'var(--t2)',
              border: selectedRound === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
            }}
          >
            All Rounds ({doc.rounds.length})
          </button>

          {doc.rounds.map((round) => {
            const isSelected = selectedRound === round.roundNumber;
            return (
              <button
                key={round.roundNumber}
                onClick={() => setSelectedRound(round.roundNumber)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent)' : 'var(--card-hover)',
                  color: isSelected ? '#fff' : 'var(--t2)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Round {round.roundNumber}</span>
                <span
                  style={{
                    fontSize: 10.5,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--card)',
                    color: isSelected ? '#fff' : 'var(--t3)',
                  }}
                >
                  {round.questions.length} Qs
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Questions List Organized Round by Round ── */}
      {filteredRounds.length === 0 || totalVisibleQuestions === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <Brain style={{ width: 44, height: 44, margin: '0 auto 12px', color: 'var(--t3)' }} />
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>
            No interview questions matched your current filter
          </div>
          <p style={{ fontSize: 13, color: 'var(--t2)', marginTop: 6 }}>
            Try resetting the search query or selecting "All Rounds" and "All Question Types".
          </p>
          <button
            onClick={() => {
              setSelectedRound('all');
              setSelectedType('All');
              setSearchQuery('');
              setOnlyRejectionLessons(false);
            }}
            className="btn btn-primary"
            style={{ marginTop: 14 }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {filteredRounds.map((round) => (
            <div key={round.roundNumber} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Round Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: 'var(--card-hover)',
                  border: '1px solid var(--border)',
                  borderLeft: '4px solid var(--accent)',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'var(--accent-bg)',
                        color: 'var(--accent)',
                      }}
                    >
                      Round {round.roundNumber}
                    </span>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                      {round.roundTitle}
                    </h3>
                  </div>
                  {round.roundNotes && (
                    <div style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 4 }}>
                      {round.roundNotes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => handleOpenAddModal(round.roundNumber)}
                    className="btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      color: 'var(--accent)',
                    }}
                  >
                    <Plus style={{ width: 13, height: 13 }} />
                    <span>Add Question</span>
                  </button>

                  <button
                    onClick={() => handleDeleteRound(round.roundNumber, round.roundTitle)}
                    className="btn-ghost"
                    title="Delete Round"
                    style={{ padding: 6, borderRadius: 6, color: '#ef4444' }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>

                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>
                    {round.questions.length} Questions
                  </span>
                </div>
              </div>

              {/* Questions Cards in this Round */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {round.questions.map((q) => {
                  const isExpanded = !expandedIds.has(q.id); // Expanded by default for easy scanning
                  const isSaved = savedVaultIds.has(q.id);
                  const isTheory = q.type === 'Theory & Concepts';

                  return (
                    <motion.div
                      key={q.id}
                      layout
                      className="card"
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        border: isTheory ? '1.5px solid rgba(139, 92, 246, 0.35)' : '1px solid var(--border)',
                        background: 'var(--card)',
                        boxShadow: 'var(--shadow)',
                      }}
                    >
                      {/* Card Header */}
                      <div
                        style={{
                          padding: '16px 20px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 14,
                          background: isTheory
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, var(--card) 100%)'
                            : 'var(--card)',
                          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {/* Tags & Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                            {/* Distinct Theory / Coding Badge */}
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 5,
                                fontSize: 11.5,
                                fontWeight: 800,
                                padding: '3px 10px',
                                borderRadius: 12,
                                background: isTheory ? 'rgba(139, 92, 246, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                                color: isTheory ? '#8b5cf6' : '#0ea5e9',
                                border: isTheory ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(14, 165, 233, 0.3)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                              }}
                            >
                              {isTheory ? (
                                <>
                                  <Brain style={{ width: 12, height: 12 }} />
                                  <span>Theory & Core Concept</span>
                                </>
                              ) : (
                                <>
                                  <Code2 style={{ width: 12, height: 12 }} />
                                  <span>{q.type}</span>
                                </>
                              )}
                            </span>

                            {/* Category */}
                            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--t2)', background: 'var(--card-hover)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
                              {q.category}
                            </span>

                            {/* Difficulty */}
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: q.difficulty === 'Hard' ? 'rgba(239, 68, 68, 0.12)' : q.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                color: q.difficulty === 'Hard' ? '#ef4444' : q.difficulty === 'Medium' ? '#f59e0b' : '#10b981',
                              }}
                            >
                              {q.difficulty}
                            </span>

                            {/* Complexities */}
                            {q.timeComplexity && (
                              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-bg)', padding: '2px 8px', borderRadius: 6 }}>
                                Time: {q.timeComplexity}
                              </span>
                            )}
                          </div>

                          {/* Question Text */}
                          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, lineHeight: 1.4 }}>
                            {q.question}
                          </h4>

                          {/* Key Concepts Pills */}
                          {q.keyConcepts.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                              {q.keyConcepts.map((concept, cIdx) => (
                                <span
                                  key={cIdx}
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--t3)',
                                    background: 'var(--card-hover)',
                                    padding: '2px 7px',
                                    borderRadius: 4,
                                  }}
                                >
                                  #{concept}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions Top Right */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          {/* Save to Code Vault */}
                          <button
                            onClick={() => handleSaveToVault(q, round.roundTitle)}
                            disabled={isSaved}
                            title="Store in permanent Code & Question Vault"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: isSaved ? 'default' : 'pointer',
                              background: isSaved ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-bg)',
                              color: isSaved ? '#10b981' : 'var(--accent)',
                              border: isSaved ? '1px solid #10b981' : '1px solid var(--accent)',
                            }}
                          >
                            {isSaved ? (
                              <>
                                <CheckCircle2 style={{ width: 13, height: 13 }} />
                                <span>Saved in Vault</span>
                              </>
                            ) : (
                              <>
                                <Sparkles style={{ width: 13, height: 13 }} />
                                <span>Save to Vault</span>
                              </>
                            )}
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyQuestion(q)}
                            title="Copy Question & Notes"
                            className="btn-ghost"
                            style={{ padding: 7, borderRadius: 8, border: '1px solid var(--border)', color: 'var(--t2)' }}
                          >
                            {copiedQId === q.id ? <Check style={{ width: 14, height: 14, color: '#10b981' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                          </button>

                          {/* Edit Question */}
                          <button
                            onClick={() => handleOpenEditModal(round.roundNumber, q)}
                            title="Edit Question & Notes"
                            className="btn-ghost"
                            style={{ padding: 7, borderRadius: 8, border: '1px solid var(--border)', color: 'var(--t2)' }}
                          >
                            <Edit3 style={{ width: 14, height: 14 }} />
                          </button>

                          {/* Delete Question */}
                          <button
                            onClick={() => handleDeleteQuestion(round.roundNumber, q.id, q.question)}
                            title="Delete Question"
                            className="btn-ghost"
                            style={{ padding: 7, borderRadius: 8, border: '1px solid var(--border)', color: '#ef4444' }}
                          >
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>

                          {/* Collapse / Expand */}
                          <button
                            onClick={() => toggleExpand(q.id)}
                            className="btn-ghost"
                            style={{ padding: 7, borderRadius: 8, border: '1px solid var(--border)', color: 'var(--t3)' }}
                          >
                            {isExpanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                          </button>
                        </div>
                      </div>

                      {/* Card Body */}
                      {isExpanded && (
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                          {/* Answer / Theory Explanation Box */}
                          <div
                            style={{
                              background: 'var(--card-hover)',
                              borderRadius: 10,
                              padding: '14px 16px',
                              border: '1px solid var(--border)',
                              fontSize: 13.5,
                              lineHeight: 1.65,
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
                                color: isTheory ? '#8b5cf6' : 'var(--accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: 6,
                              }}
                            >
                              <BookOpen style={{ width: 14, height: 14 }} />
                              <span>{isTheory ? 'Theory Notes & Model Explanation' : 'Approach & Solution Walkthrough'}</span>
                            </div>
                            <div style={{ whiteSpace: 'pre-line' }}>{q.answer}</div>
                          </div>

                          {/* Code Interpreter View (if question has code) */}
                          {q.codeSnippet && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Code2 style={{ width: 14, height: 14, color: 'var(--accent)' }} />
                                <span>Code Implementation (Interpreter View)</span>
                              </div>
                              <CodeInterpreterViewer
                                code={q.codeSnippet}
                                language={q.codeLanguage || 'python'}
                                title={`${q.question.slice(0, 35)}...`}
                              />
                            </div>
                          )}

                          {/* Rejection Retrospective & Mistake Lessons Box */}
                          {q.rejectionLearning && (
                            <div
                              style={{
                                borderRadius: 10,
                                padding: '14px 16px',
                                background: 'rgba(239, 68, 68, 0.04)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 10,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <AlertTriangle style={{ width: 15, height: 15, color: '#ef4444' }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                  Identified Trap / Common Mistake:
                                </span>
                                <span
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: 6,
                                    background: 'rgba(239, 68, 68, 0.12)',
                                    color: '#ef4444',
                                    marginLeft: 'auto',
                                  }}
                                >
                                  {q.rejectionLearning.category}
                                </span>
                              </div>

                              <div style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.5, fontWeight: 500 }}>
                                {q.rejectionLearning.identifiedMistake}
                              </div>

                              <div
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  background: 'rgba(16, 185, 129, 0.06)',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 6,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>
                                  <Lightbulb style={{ width: 13, height: 13 }} />
                                  <span>What to Learn from this Rejection:</span>
                                </div>
                                <div style={{ fontSize: 12.5, color: 'var(--t1)', lineHeight: 1.5 }}>
                                  {q.rejectionLearning.whatToLearn}
                                </div>

                                {q.rejectionLearning.correctiveAction.length > 0 && (
                                  <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {q.rejectionLearning.correctiveAction.map((action, aIdx) => (
                                      <div key={aIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--t2)' }}>
                                        <ArrowRight style={{ width: 11, height: 11, color: '#10b981', flexShrink: 0 }} />
                                        <span>{action}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Follow-up Questions Box */}
                          {q.followUps && q.followUps.length > 0 && (
                            <div
                              style={{
                                background: 'rgba(99, 102, 241, 0.05)',
                                borderRadius: 8,
                                padding: '10px 14px',
                                border: '1px solid rgba(99, 102, 241, 0.18)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', marginBottom: 6 }}>
                                <MessageSquare style={{ width: 13, height: 13 }} />
                                <span>Interviewer Follow-ups & Deep Dive Variations:</span>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--t1)', lineHeight: 1.5 }}>
                                {q.followUps.map((f, fIdx) => (
                                  <li key={fIdx}>{f}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Paste Markdown Modal ── */}
      <AnimatePresence>
        {pasteModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 999,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="card"
              style={{
                width: '100%',
                maxWidth: 720,
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: 24,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    Paste Interview Notes Markdown
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 4 }}>
                    Paste interview questions with rounds (e.g. <code style={{ color: 'var(--accent)' }}>## Round 1</code>) and theory topics.
                  </p>
                </div>
                <button
                  onClick={() => setPasteModalOpen(false)}
                  className="btn-ghost"
                  style={{ padding: 6, borderRadius: 8 }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePasteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                    Company & Role Title (Optional)
                  </label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. Amazon - L6 Principal Frontend (2026)"
                    value={pasteDocTitle}
                    onChange={(e) => setPasteDocTitle(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                    Raw Markdown Content
                  </label>
                  <textarea
                    rows={12}
                    className="inp"
                    placeholder={`# Company Name - Senior Engineer\n\n## Round 1: Technical & Theory Screen\n### Q1: [Theory] Explain React reconciliation and fiber architecture\n**Answer:** React represents virtual DOM as a singly linked list...\n**Mistake:** Did not mention commit phase synchronicity\n**What to Learn:** Master the render vs commit lifecycle\n\n## Round 2: Coding & DSA\n### Q2: [Coding] LRU Cache\n\`\`\`python\nclass LRUCache:\n    ...\n\`\`\``}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 12.5, lineHeight: 1.5 }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setPasteModalOpen(false)}
                    className="btn"
                    style={{ background: 'var(--card-hover)', border: '1px solid var(--border)', color: 'var(--t2)' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Parse & Import Notes
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit / Add Question Modal ── */}
      <AnimatePresence>
        {editingModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 16 }}
              className="card"
              style={{
                width: '100%',
                maxWidth: 760,
                maxHeight: '92vh',
                overflowY: 'auto',
                padding: 26,
                boxShadow: '0 25px 50px rgba(0,0,0,0.6)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                    {editingQuestionId ? 'Edit Question & Notes' : `Add Question to Round ${targetRoundNumber}`}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 4, margin: 0 }}>
                    Customize question prompt, theory explanation, code snippet, and rejection learnings.
                  </p>
                </div>
                <button
                  onClick={() => setEditingModalOpen(false)}
                  className="btn-ghost"
                  style={{ padding: 6, borderRadius: 8 }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveQuestionForm} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Question Prompt */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                    Question Prompt / Title *
                  </label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. How does React Reconciliation work and why is it interruptible?"
                    value={editFormData.question}
                    onChange={(e) => setEditFormData({ ...editFormData, question: e.target.value })}
                    style={{ width: '100%' }}
                    required
                  />
                </div>

                {/* Grid: Type, Category, Difficulty */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                      Question Type
                    </label>
                    <select
                      className="inp"
                      style={{ width: '100%' }}
                      value={editFormData.type}
                      onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as QuestionCategoryType })}
                    >
                      <option value="Theory & Concepts">🧠 Theory & Concepts</option>
                      <option value="Coding & DSA">💻 Coding & DSA</option>
                      <option value="System Design">🏗️ System Design</option>
                      <option value="Behavioral & Leadership">👥 Behavioral & Leadership</option>
                      <option value="General">General Technical</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                      Category / Domain
                    </label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. React & Frontend, Database & SQL"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                      Difficulty
                    </label>
                    <select
                      className="inp"
                      style={{ width: '100%' }}
                      value={editFormData.difficulty}
                      onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Key Concepts */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                    Key Concepts (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="inp"
                    placeholder="e.g. Fiber Architecture, Reconciliation, Time Slicing"
                    value={editFormData.keyConcepts}
                    onChange={(e) => setEditFormData({ ...editFormData, keyConcepts: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Answer / Theory Notes */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                    Model Answer / Theory Notes *
                  </label>
                  <textarea
                    rows={6}
                    className="inp"
                    placeholder="Detailed explanation, architectural trade-offs, and technical rationale..."
                    value={editFormData.answer}
                    onChange={(e) => setEditFormData({ ...editFormData, answer: e.target.value })}
                    style={{ width: '100%', fontSize: 13, lineHeight: 1.5 }}
                    required
                  />
                </div>

                {/* Code Snippet & Language (Optional) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>
                      Code Implementation (Optional)
                    </label>
                    <select
                      className="inp"
                      style={{ width: 'auto', padding: '3px 8px', fontSize: 11.5 }}
                      value={editFormData.codeLanguage}
                      onChange={(e) => setEditFormData({ ...editFormData, codeLanguage: e.target.value as CodingLanguage })}
                    >
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="go">Go</option>
                      <option value="sql">SQL</option>
                      <option value="rust">Rust</option>
                    </select>
                  </div>
                  <textarea
                    rows={6}
                    className="inp"
                    placeholder="// Paste clean code implementation here..."
                    value={editFormData.codeSnippet}
                    onChange={(e) => setEditFormData({ ...editFormData, codeSnippet: e.target.value })}
                    style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>

                {/* Rejection Retrospective Fields */}
                <div
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                    Rejection Retrospective & Mistake Lessons
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--t2)', marginBottom: 3 }}>
                      Identified Trap / Common Mistake
                    </label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. Described Virtual DOM as just a copy without explaining Fiber pointers"
                      value={editFormData.identifiedMistake}
                      onChange={(e) => setEditFormData({ ...editFormData, identifiedMistake: e.target.value })}
                      style={{ width: '100%', fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--t2)', marginBottom: 3 }}>
                      What to Learn from this Rejection
                    </label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. Master the two-phase lifecycle: render (cooperative) vs commit (synchronous)"
                      value={editFormData.whatToLearn}
                      onChange={(e) => setEditFormData({ ...editFormData, whatToLearn: e.target.value })}
                      style={{ width: '100%', fontSize: 12.5 }}
                    />
                  </div>
                </div>

                {/* Follow-ups */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--t2)', marginBottom: 4 }}>
                    Interviewer Follow-ups (one per line)
                  </label>
                  <textarea
                    rows={2}
                    className="inp"
                    placeholder="e.g. How does React 19 handle automatic batching across async promises?"
                    value={editFormData.followUps}
                    onChange={(e) => setEditFormData({ ...editFormData, followUps: e.target.value })}
                    style={{ width: '100%', fontSize: 12 }}
                  />
                </div>

                {/* Submit & Cancel Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingModalOpen(false)}
                    className="btn"
                    style={{ background: 'var(--card-hover)', border: '1px solid var(--border)', color: 'var(--t2)' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingQuestionId ? 'Save Question Changes' : 'Add Question'}
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
