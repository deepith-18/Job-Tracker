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
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Building2,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Compass,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Clock,
  Type,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseInterviewMarkdown } from '../../utils/parseInterviewMarkdown';
import { PRESET_SAMPLE_FILES } from '../../data/sampleInterviewNotes';
import { CodeInterpreterViewer } from '../common/CodeInterpreterViewer';
import { MarkdownTextRenderer } from './MarkdownTextRenderer';
import { useCodeQuestions } from '../../hooks/useCodeQuestions';
import { useApplications } from '../../hooks/useApplications';
import { useAuthStore } from '../../store/authStore';
import { addApplication } from '../../firebase/firestore';
import { useToast } from '../ui/ToastContext';
import type {
  CompanyRoundDocument,
  ParsedRoundQuestion,
  QuestionCategoryType,
  CodingLanguage,
  RejectionCategory,
} from '../../types';

const STORAGE_KEY = 'jobtracker_company_rounds_md_doc';
const LIBRARY_STORAGE_KEY = 'jobtracker_company_rounds_library';

export const createEmptyDoc = (): CompanyRoundDocument & { isEmpty?: boolean } => ({
  id: `doc-empty-${Date.now()}`,
  fileName: '',
  company: '',
  role: '',
  interviewDate: '',
  overview: '',
  status: 'Debrief',
  totalRounds: 0,
  totalQuestions: 0,
  theoryQuestionsCount: 0,
  codingQuestionsCount: 0,
  rawMarkdown: '',
  rounds: [],
  companies: [],
  isEmpty: true,
});

type ViewMode = 'reader' | 'cards' | 'stepper';
type ReaderSubMode = 'formatted' | 'structured' | 'raw';
type FontSize = 'sm' | 'md' | 'lg';

export const CompanyRoundNotesMdViewer: React.FC = () => {
  const { addQuestion } = useCodeQuestions();
  const { applications } = useApplications();
  const user = useAuthStore((s) => s.user);
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Document state - strictly user data, never auto-injecting fake data
  const [doc, setDoc] = useState<CompanyRoundDocument>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedSaved = JSON.parse(saved);
        // If user explicitly deleted/cleared the document, respect the empty state
        if (parsedSaved.isEmpty || (!parsedSaved.rawMarkdown && (!parsedSaved.rounds || parsedSaved.rounds.length === 0))) {
          return createEmptyDoc();
        }
        // If saved doc has 0 rounds or bad company name, re-parse if rawMarkdown exists
        if (parsedSaved.rawMarkdown && (parsedSaved.totalRounds === 0 || !parsedSaved.rounds || parsedSaved.rounds.length === 0 || parsedSaved.company?.includes('— Intervie'))) {
          return parseInterviewMarkdown(parsedSaved.rawMarkdown, parsedSaved.fileName || 'interview_notes.md');
        }
        return parsedSaved;
      }
    } catch {
      // Fallback
    }
    // Clean initial state: start empty so no unadded fake data appears
    return createEmptyDoc();
  });

  // Multi-Company Library state
  const [library, setLibrary] = useState<Record<string, CompanyRoundDocument>>(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });

  // UI state & View Modes
  const [viewMode, setViewMode] = useState<ViewMode>('reader'); // Default to clean Readme reader
  const [readerSubMode, setReaderSubMode] = useState<ReaderSubMode>('structured'); // Default to rich interactive document
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [selectedRound, setSelectedRound] = useState<number | 'all'>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('All'); // Company isolation filter
  const [stepperRoundIndex, setStepperRoundIndex] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyRejectionLessons, setOnlyRejectionLessons] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [savedVaultIds, setSavedVaultIds] = useState<Set<string>>(new Set());
  const [copiedQId, setCopiedQId] = useState<string | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isAddingApp, setIsAddingApp] = useState(false);

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

  // Automatically heal and re-parse stale or empty-round cached documents (skip if cleared)
  useEffect(() => {
    if (!doc.isEmpty && doc.rawMarkdown && (doc.rounds.length === 0 || doc.totalQuestions === 0 || doc.company.includes('— Intervie'))) {
      const reParsed = parseInterviewMarkdown(doc.rawMarkdown, doc.fileName);
      if (reParsed.rounds.length > 0 || reParsed.company !== doc.company) {
        setDoc(reParsed);
      }
    }
  }, [doc]);

  // Persist current doc to localStorage and update library
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
      if (doc.company && !doc.isEmpty && doc.company !== 'Target Company') {
        setLibrary((prev) => {
          const updated = { ...prev, [doc.company]: doc };
          try {
            localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
      }
    } catch {
      // ignore
    }
  }, [doc]);

  // Distinct companies represented in the active document (for isolation filter)
  const availableCompanies = useMemo(() => {
    const set = new Set<string>();
    if (doc.company && doc.company !== 'Target Company') set.add(doc.company);
    if (doc.companies) {
      doc.companies.forEach((c) => {
        if (c && c !== 'Target Company') set.add(c);
      });
    }
    doc.rounds.forEach((r) => {
      if (r.company && r.company !== 'Target Company') set.add(r.company);
      r.questions.forEach((q) => {
        if (q.company && q.company !== 'Target Company') set.add(q.company);
      });
    });
    return Array.from(set);
  }, [doc]);

  // All companies tracked in the user's debrief library
  const libraryCompanies = useMemo(() => {
    return Object.keys(library).filter((k) => k && !library[k]?.isEmpty && k !== 'Target Company');
  }, [library]);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if company is already tracked in user's applications
  const isCompanyTracked = useMemo(() => {
    if (!doc.company || doc.company === 'Target Company') return false;
    const clean = doc.company.toLowerCase().trim();
    return applications.some((a) => {
      const appComp = a.company.toLowerCase().trim();
      return appComp === clean || clean.includes(appComp) || appComp.includes(clean);
    });
  }, [applications, doc.company]);

  // Add Company to Applications Pipeline
  const handleAddToApplications = async () => {
    if (!user?.uid) {
      addToast('Authentication Required', 'Please log in to add this company to your pipeline', 'error');
      return;
    }
    try {
      setIsAddingApp(true);
      await addApplication(user.uid, {
        company: doc.company,
        role: doc.role || 'Software Engineer',
        status: 'Interview',
        appliedDate: new Date(),
        deadline: null,
        jobLink: '',
        notes: `Imported from debrief notes: ${doc.fileName}`,
        interviewNotes: `Interview Debrief (${doc.rounds.length} rounds, ${doc.totalQuestions} questions):\n${doc.overview || ''}`,
        source: 'Interview Notes',
        rating: 4,
        rejectionReasons: [],
        interviewDates: [doc.interviewDate || new Date().toISOString().split('T')[0]],
      });
      addToast(
        'Company Added to Applications',
        `"${doc.company}" is now tracked under Interview stage in your pipeline!`,
        'success'
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add application';
      addToast('Error', msg, 'error');
    } finally {
      setIsAddingApp(false);
    }
  };

  // Compute Word Count & Estimated Read Time
  const readingStats = useMemo(() => {
    const raw = doc.rawMarkdown || '';
    const words = raw.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { words, minutes };
  }, [doc.rawMarkdown]);

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
      setStepperRoundIndex(0);
      setSelectedType('All');
      setExpandedIds(new Set());
      addToast(
        'Markdown Parsed Successfully',
        `Extracted ${parsed.totalRounds} rounds and ${parsed.totalQuestions} questions for ${parsed.company}`,
        'success'
      );
    };
    reader.onerror = () => {
      addToast('Upload Error', 'Failed to read the file.', 'error');
    };
    reader.readAsText(file);
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
      setStepperRoundIndex(0);
      setExpandedIds(new Set());
      addToast('Markdown Loaded', `Loaded debrief for ${parsed.company}`, 'success');
    };
    reader.readAsText(file);
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = PRESET_SAMPLE_FILES.find((s) => s.id === sampleId);
    if (!sample) return;
    const parsed = parseInterviewMarkdown(sample.markdown, `${sample.id}.md`);
    setDoc(parsed);
    setSelectedRound('all');
    setStepperRoundIndex(0);
    setSelectedType('All');
    setExpandedIds(new Set());
    addToast('Sample Loaded', `Loaded ${sample.title}`, 'info');
  };

  // Delete a single company's debrief notes from library
  const handleDeleteCompany = (compToDelete: string) => {
    if (!window.confirm(`Delete debrief notes for "${compToDelete}" from your library?`)) return;
    const nextLib = { ...library };
    delete nextLib[compToDelete];
    try {
      localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(nextLib));
    } catch {
      // ignore
    }
    setLibrary(nextLib);

    // If currently viewing this company, switch to another available company or clear
    if (doc.company.toLowerCase() === compToDelete.toLowerCase()) {
      const remaining = Object.keys(nextLib).filter((c) => c && c !== 'Target Company');
      if (remaining.length > 0 && nextLib[remaining[0]]) {
        setDoc(nextLib[remaining[0]]);
        setSelectedCompany('All');
        setSelectedRound('all');
        setStepperRoundIndex(0);
        addToast('Company Notes Removed', `Switched to ${remaining[0]}`, 'info');
      } else {
        handleDeleteAll();
      }
    } else {
      addToast('Company Removed', `Removed ${compToDelete} from library`, 'info');
    }
  };

  // Delete entire document library and reset viewer
  const handleDeleteAll = () => {
    const docName = doc.fileName || doc.company || 'all interview debriefs';
    if (!window.confirm(`Are you sure you want to delete all notes and questions for "${docName}"? This will clear all debriefs.`)) {
      return;
    }
    const emptyDoc = createEmptyDoc();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emptyDoc));
      localStorage.removeItem(LIBRARY_STORAGE_KEY);
    } catch {
      // ignore
    }
    setLibrary({});
    setDoc(emptyDoc);
    setSelectedCompany('All');
    setSelectedRound('all');
    setStepperRoundIndex(0);
    setExpandedIds(new Set());
    addToast('All Notes Deleted', 'Debrief notes cleared. You can upload your own markdown file or paste notes.', 'info');
  };

  const handleSaveToVault = async (q: ParsedRoundQuestion, roundTitle: string) => {
    const qCompany = q.company || doc.company || 'Target Company';
    try {
      await addQuestion({
        title: q.question,
        company: qCompany,
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
      addToast('Saved to Question Vault', `[${qCompany}] "${q.question.slice(0, 38)}..." stored in Code Vault`, 'success');
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

  const handleCopyRawMarkdown = () => {
    navigator.clipboard.writeText(doc.rawMarkdown);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
    addToast('Markdown Copied', 'Full document markdown copied to clipboard', 'info');
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
    setStepperRoundIndex(0);
    setExpandedIds(new Set());
    addToast('Markdown Imported', `Parsed ${parsed.totalRounds} rounds and ${parsed.totalQuestions} questions for ${parsed.company}.`, 'success');
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
              rejectionLearning:
                editFormData.identifiedMistake.trim() || editFormData.whatToLearn.trim()
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
            rejectionLearning:
              editFormData.identifiedMistake.trim() || editFormData.whatToLearn.trim()
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

  // Toggle single item expand
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Expand All / Collapse All
  const handleToggleExpandAll = () => {
    const allIds = doc.rounds.flatMap((r) => r.questions.map((q) => q.id));
    if (expandedIds.size === allIds.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(allIds));
    }
  };

  // Filtered rounds and questions
  const filteredRounds = useMemo(() => {
    return doc.rounds
      .filter((r) => {
        if (viewMode === 'stepper') {
          const activeRound = doc.rounds[stepperRoundIndex];
          return activeRound ? r.roundNumber === activeRound.roundNumber : true;
        }
        return selectedRound === 'all' || r.roundNumber === selectedRound;
      })
      .map((r) => {
        const matchingQuestions = r.questions.filter((q) => {
          if (selectedCompany !== 'All') {
            const qComp = (q.company || r.company || doc.company || '').toLowerCase().trim();
            const targetComp = selectedCompany.toLowerCase().trim();
            if (!qComp.includes(targetComp) && !targetComp.includes(qComp)) return false;
          }
          if (onlyRejectionLessons && !q.rejectionLearning) return false;
          if (selectedType !== 'All' && q.type !== selectedType) return false;
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesQ = q.question.toLowerCase().includes(query);
            const matchesAns = q.answer.toLowerCase().includes(query);
            const matchesConcepts = q.keyConcepts.some((c) => c.toLowerCase().includes(query));
            const matchesMistake = q.rejectionLearning?.identifiedMistake.toLowerCase().includes(query);
            const matchesLearn = q.rejectionLearning?.whatToLearn.toLowerCase().includes(query);
            const matchesCompany = (q.company || r.company || doc.company || '').toLowerCase().includes(query);
            return matchesQ || matchesAns || matchesConcepts || matchesMistake || matchesLearn || matchesCompany;
          }
          return true;
        });

        return {
          ...r,
          questions: matchingQuestions,
        };
      })
      .filter((r) => r.questions.length > 0 || (!searchQuery.trim() && selectedCompany === 'All'));
  }, [doc, selectedRound, selectedType, searchQuery, onlyRejectionLessons, viewMode, stepperRoundIndex, selectedCompany]);

  const totalVisibleQuestions = useMemo(() => {
    return filteredRounds.reduce((acc, r) => acc + r.questions.length, 0);
  }, [filteredRounds]);

  const allQuestionsCount = useMemo(() => {
    return doc.rounds.flatMap((r) => r.questions).length;
  }, [doc]);

  const areAllExpanded = expandedIds.size > 0 && expandedIds.size >= allQuestionsCount;

  // Jump to specific round
  const handleJumpToRound = (roundNumber: number) => {
    if (viewMode === 'stepper') {
      const idx = doc.rounds.findIndex((r) => r.roundNumber === roundNumber);
      if (idx !== -1) setStepperRoundIndex(idx);
    } else {
      setSelectedRound(roundNumber);
      const el = document.getElementById(`round-section-${roundNumber}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const getFontSizePixel = () => {
    switch (fontSize) {
      case 'sm':
        return 13;
      case 'lg':
        return 16.5;
      default:
        return 14.5;
    }
  };

  const fontPx = getFontSizePixel();

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{ maxWidth: 1180, margin: '0 auto', position: 'relative' }}
    >
      {/* ── Top Header Bar & Document Summary (Celestial Glass Card) ── */}
      <div
        className="card"
        style={{
          padding: '24px 26px',
          marginBottom: 16,
          background: 'linear-gradient(135deg, var(--card) 0%, var(--card-hover) 100%)',
          border: '1px solid var(--border)',
          borderTop: '3px solid var(--accent)',
          borderRadius: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            {doc.company && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Company Badge with Track Status */}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 14px',
                    borderRadius: 20,
                    background: 'var(--accent-bg)',
                    color: 'var(--accent)',
                    fontSize: 13,
                    fontWeight: 800,
                    border: '1px solid var(--accent)',
                    boxShadow: '0 0 12px var(--accent-glow)',
                  }}
                >
                  <Building2 style={{ width: 14, height: 14 }} />
                  <span>{doc.company}</span>
                </span>

                {/* Add Company to Applications Button if not already tracked */}
                {!isCompanyTracked && (
                  <button
                    onClick={handleAddToApplications}
                    disabled={isAddingApp}
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '4px 12px',
                      borderRadius: 16,
                      fontSize: 12,
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-h) 100%)',
                      boxShadow: '0 2px 8px var(--accent-glow)',
                    }}
                    title="Add this company and role into your active Applications Pipeline"
                  >
                    <Plus style={{ width: 13, height: 13 }} />
                    <span>{isAddingApp ? 'Adding...' : `Add "${doc.company}" to Applications`}</span>
                  </button>
                )}

                {isCompanyTracked && (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: 'var(--success)',
                      background: 'var(--success-bg)',
                      padding: '3px 9px',
                      borderRadius: 12,
                      border: '1px solid var(--success)',
                    }}
                  >
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    <span>Tracked in Applications</span>
                  </span>
                )}

                {doc.role && (
                  <span style={{ fontSize: 13, color: 'var(--t2)', fontWeight: 600 }}>
                    {doc.role}
                  </span>
                )}

                {doc.interviewDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--t3)' }}>
                    <Calendar style={{ width: 13, height: 13 }} />
                    <span>{doc.interviewDate}</span>
                  </span>
                )}

                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: 12,
                    color: 'var(--t3)',
                    background: 'var(--card)',
                    padding: '3px 9px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                  }}
                >
                  <Clock style={{ width: 12, height: 12 }} />
                  <span>~{readingStats.minutes} min read</span>
                  <span style={{ color: 'var(--t3)', opacity: 0.6 }}>•</span>
                  <span>{readingStats.words.toLocaleString()} words</span>
                </span>
              </div>
            )}

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', marginTop: 10, marginBottom: 4 }}>
              Company Round Notes & Readme Viewer
            </h2>
            <p style={{ fontSize: 13, color: 'var(--t2)', margin: 0, maxWidth: 720, lineHeight: 1.5 }}>
              {doc.fileName ? (
                <>Active debrief: <strong style={{ color: 'var(--t1)' }}>{doc.fileName}</strong> ({doc.totalRounds} rounds, {doc.totalQuestions} questions with {doc.theoryQuestionsCount} theory topics).</>
              ) : (
                <>No debrief notes loaded. Upload your .MD notes, paste debrief text, or choose a sample below.</>
              )}
            </p>
          </div>

          {/* Action Buttons (Upload / Paste / Export / Copy) */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
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
                padding: '7px 15px',
                fontSize: 12.5,
                fontWeight: 700,
                boxShadow: '0 2px 8px var(--accent-glow)',
              }}
            >
              <UploadCloud style={{ width: 15, height: 15 }} />
              <span>Upload .MD</span>
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
              }}
            >
              <FileText style={{ width: 14, height: 14, color: 'var(--accent)' }} />
              <span>Paste Notes</span>
            </button>

            <button
              onClick={handleCopyRawMarkdown}
              className="btn-ghost"
              title="Copy entire raw Markdown to clipboard"
              style={{
                padding: 7,
                borderRadius: 8,
                border: '1px solid var(--border)',
                color: copiedRaw ? 'var(--success)' : 'var(--t2)',
                background: 'var(--card)',
              }}
            >
              {copiedRaw ? <Check style={{ width: 15, height: 15 }} /> : <Copy style={{ width: 15, height: 15 }} />}
            </button>

            <button
              onClick={handleExportMarkdown}
              className="btn-ghost"
              title="Download clean Markdown file"
              style={{
                padding: 7,
                borderRadius: 8,
                border: '1px solid var(--border)',
                color: 'var(--t2)',
                background: 'var(--card)',
              }}
            >
              <Download style={{ width: 15, height: 15 }} />
            </button>

            <button
              onClick={handleDeleteAll}
              className="btn-ghost"
              title="Delete entire document and clear all notes"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--danger)',
                background: 'rgba(239, 68, 68, 0.08)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              <span>Delete All</span>
            </button>
          </div>
        </div>

        {/* Your Tracked Company Debriefs */}
        {libraryCompanies.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Building2 style={{ width: 13, height: 13 }} />
              <span>Your Company Debriefs:</span>
            </span>
            {libraryCompanies.map((cName) => {
              const isCurrent = doc.company.toLowerCase() === cName.toLowerCase();
              const compDoc = library[cName];
              return (
                <div key={cName} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <button
                    onClick={() => {
                      if (compDoc) {
                        setDoc(compDoc);
                        setSelectedCompany('All');
                        setSelectedRound('all');
                        setStepperRoundIndex(0);
                        addToast('Switched Company', `Loaded debrief notes for ${cName}`, 'info');
                      }
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: isCurrent ? '14px 0 0 14px' : 14,
                      fontSize: 12,
                      fontWeight: isCurrent ? 800 : 600,
                      cursor: 'pointer',
                      background: isCurrent ? 'var(--accent-bg)' : 'var(--card)',
                      color: isCurrent ? 'var(--accent)' : 'var(--t2)',
                      border: isCurrent ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: isCurrent ? '0 0 10px var(--accent-glow)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title={`Switch to ${cName} debrief notes`}
                  >
                    <span>{cName}</span>
                    {compDoc?.totalQuestions ? (
                      <span style={{ fontSize: 10.5, padding: '1px 5px', borderRadius: 8, background: isCurrent ? 'var(--accent)' : 'var(--card-hover)', color: isCurrent ? '#fff' : 'var(--t3)' }}>
                        {compDoc.totalQuestions} Qs
                      </span>
                    ) : null}
                  </button>
                  {isCurrent && libraryCompanies.length > 1 && (
                    <button
                      onClick={() => handleDeleteCompany(cName)}
                      title={`Remove ${cName} from library`}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '0 14px 14px 0',
                        border: '1.5px solid var(--accent)',
                        borderLeft: 'none',
                        background: 'var(--accent-bg)',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <Trash2 style={{ width: 11, height: 11 }} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Preset Sample Debrief Switchers (Only show when empty so user's workspace stays completely clean) */}
        {doc.isEmpty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Or explore with a sample debrief:
            </span>
            {PRESET_SAMPLE_FILES.map((sample) => (
              <button
                key={sample.id}
                onClick={() => handleLoadSample(sample.id)}
                style={{
                  padding: '3px 11px',
                  borderRadius: 12,
                  fontSize: 11.5,
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
        )}
      </div>

      {/* ── STICKY READING & VIEW CONTROL BAR (Glassmorphic) ── */}
      <div
        style={{
          position: 'sticky',
          top: 70,
          zIndex: 40,
          background: 'var(--nav-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 14,
          padding: '10px 18px',
          marginBottom: 16,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* View Mode Switcher: Readme Reader | Card Studio | Round Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--card)', padding: 3, borderRadius: 10, border: '1px solid var(--border)' }}>
            <button
              onClick={() => setViewMode('reader')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                background: viewMode === 'reader' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'reader' ? '#fff' : 'var(--t2)',
                border: 'none',
                transition: 'all 0.15s ease',
              }}
              title="Clean continuous article reading mode (like Notion or GitHub README)"
            >
              <BookOpen style={{ width: 14, height: 14 }} />
              <span>Readme Reader</span>
            </button>

            <button
              onClick={() => setViewMode('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                background: viewMode === 'cards' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'cards' ? '#fff' : 'var(--t2)',
                border: 'none',
                transition: 'all 0.15s ease',
              }}
              title="Interactive cards view with question actions and collapse controls"
            >
              <LayoutGrid style={{ width: 14, height: 14 }} />
              <span>Card Studio</span>
            </button>

            <button
              onClick={() => {
                setViewMode('stepper');
                setSelectedRound('all');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                background: viewMode === 'stepper' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'stepper' ? '#fff' : 'var(--t2)',
                border: 'none',
                transition: 'all 0.15s ease',
              }}
              title="Step through one round at a time — prevents long vertical scrolling"
            >
              <Compass style={{ width: 14, height: 14 }} />
              <span>Round Stepper</span>
            </button>
          </div>

          {/* Reader Sub-Mode (When in Reader Mode) */}
          {viewMode === 'reader' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--card)', padding: 2, borderRadius: 8, border: '1px solid var(--border)' }}>
              <button
                onClick={() => setReaderSubMode('structured')}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: readerSubMode === 'structured' ? 'var(--accent-bg)' : 'transparent',
                  color: readerSubMode === 'structured' ? 'var(--accent)' : 'var(--t3)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                title="Interactive Document with questions, answers, code runner, vault saving, and edit controls"
              >
                <Sparkles style={{ width: 12, height: 12 }} />
                <span>Interactive Article</span>
              </button>
              <button
                onClick={() => setReaderSubMode('formatted')}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: readerSubMode === 'formatted' ? 'var(--accent-bg)' : 'transparent',
                  color: readerSubMode === 'formatted' ? 'var(--accent)' : 'var(--t3)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                title="Continuous Plain Markdown Text"
              >
                <FileText style={{ width: 12, height: 12 }} />
                <span>Plain Text</span>
              </button>
              <button
                onClick={() => setReaderSubMode('raw')}
                style={{
                  padding: '3px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: readerSubMode === 'raw' ? 'var(--accent-bg)' : 'transparent',
                  color: readerSubMode === 'raw' ? 'var(--accent)' : 'var(--t3)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                }}
                title="Raw Markdown Source"
              >
                <Code2 style={{ width: 12, height: 12 }} />
                <span>Raw MD</span>
              </button>
            </div>
          )}

          {/* Reading Comfort & Density Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {/* Font Size Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'var(--card)', padding: '3px 6px', borderRadius: 8, border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', paddingRight: 2 }}>
                <Type style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px' }} />
              </span>
              {(['sm', 'md', 'lg'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  style={{
                    padding: '2px 7px',
                    borderRadius: 5,
                    fontSize: size === 'sm' ? 11 : size === 'md' ? 12 : 13,
                    fontWeight: fontSize === size ? 800 : 500,
                    background: fontSize === size ? 'var(--accent-bg)' : 'transparent',
                    color: fontSize === size ? 'var(--accent)' : 'var(--t3)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title={`Font size: ${size === 'sm' ? 'Compact' : size === 'md' ? 'Default' : 'Comfort'}`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Cards Mode Specific: Density & Collapse All */}
            {viewMode === 'cards' && (
              <>
                <button
                  onClick={() => setIsCompact(!isCompact)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: isCompact ? 'var(--accent-bg)' : 'var(--card)',
                    color: isCompact ? 'var(--accent)' : 'var(--t2)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  title="Toggle compact list view vs detailed cards"
                >
                  <List style={{ width: 13, height: 13 }} />
                  <span>{isCompact ? 'Compact View' : 'Detailed'}</span>
                </button>

                <button
                  onClick={handleToggleExpandAll}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: 'var(--card)',
                    color: 'var(--t2)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                  }}
                  title={areAllExpanded ? 'Collapse all question details' : 'Expand all question details'}
                >
                  {areAllExpanded ? <Minimize2 style={{ width: 13, height: 13 }} /> : <Maximize2 style={{ width: 13, height: 13 }} />}
                  <span>{areAllExpanded ? 'Collapse All' : 'Expand All'}</span>
                </button>
              </>
            )}

            {/* Mistake filter shortcut */}
            <button
              onClick={() => setOnlyRejectionLessons(!onlyRejectionLessons)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 600,
                background: onlyRejectionLessons ? 'var(--streak-bg)' : 'var(--card)',
                color: onlyRejectionLessons ? 'var(--streak)' : 'var(--t2)',
                border: onlyRejectionLessons ? '1px solid var(--streak)' : '1px solid var(--border)',
                cursor: 'pointer',
              }}
              title="Show only questions that have rejection lessons"
            >
              <Lightbulb style={{ width: 13, height: 13 }} />
              <span>{onlyRejectionLessons ? 'Lessons Only' : 'Filter Lessons'}</span>
            </button>
          </div>
        </div>

        {/* ── QUICK-JUMP TABLE OF CONTENTS (TOC) PILLS ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', marginRight: 4, whiteSpace: 'nowrap' }}>
            Jump to Section:
          </span>

          {viewMode !== 'stepper' && (
            <button
              onClick={() => setSelectedRound('all')}
              style={{
                padding: '3px 10px',
                borderRadius: 14,
                fontSize: 11.5,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: selectedRound === 'all' ? 'var(--accent)' : 'var(--card)',
                color: selectedRound === 'all' ? '#fff' : 'var(--t2)',
                border: selectedRound === 'all' ? '1px solid var(--accent)' : '1px solid var(--border)',
                transition: 'all 0.15s ease',
              }}
            >
              All Sections ({doc.rounds.length})
            </button>
          )}

          {doc.rounds.map((round, idx) => {
            const isRoundActive =
              viewMode === 'stepper'
                ? stepperRoundIndex === idx
                : selectedRound === round.roundNumber;

            return (
              <button
                key={round.roundNumber}
                onClick={() => handleJumpToRound(round.roundNumber)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 14,
                  fontSize: 11.5,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  background: isRoundActive ? 'var(--accent)' : 'var(--card)',
                  color: isRoundActive ? '#fff' : 'var(--t2)',
                  border: isRoundActive ? '1px solid var(--accent)' : '1px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>R{round.roundNumber}: {round.roundTitle.length > 24 ? `${round.roundTitle.slice(0, 22)}...` : round.roundTitle}</span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '0 5px',
                    borderRadius: 8,
                    background: isRoundActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--card-hover)',
                    color: isRoundActive ? '#fff' : 'var(--t3)',
                  }}
                >
                  {round.questions.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Search & Filter Pill Bar ── */}
      <div
        className="card"
        style={{
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search
            style={{
              position: 'absolute',
              left: 11,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 14,
              height: 14,
              color: 'var(--t3)',
            }}
          />
          <input
            type="text"
            className="inp"
            placeholder="Search concepts, questions, theory, mistakes, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, width: '100%', fontSize: 13, height: 34 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {['All', 'Theory & Concepts', 'Coding & DSA', 'System Design', 'Behavioral & Leadership'].map((type) => {
            const isSelected = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: isSelected ? 'var(--accent-bg)' : 'var(--card-hover)',
                  color: isSelected ? 'var(--accent)' : 'var(--t2)',
                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                {type === 'Theory & Concepts' && <Brain style={{ width: 12, height: 12 }} />}
                {type === 'Coding & DSA' && <Code2 style={{ width: 12, height: 12 }} />}
                {type === 'System Design' && <Layers style={{ width: 12, height: 12 }} />}
                <span>{type}</span>
              </button>
            );
          })}
        </div>

        {/* Company Isolation Filter */}
        {availableCompanies.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', borderLeft: '1px solid var(--border)', paddingLeft: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Building2 style={{ width: 12, height: 12 }} />
              <span>Isolate Company:</span>
            </span>
            {['All', ...availableCompanies].map((comp) => {
              const isSelected = selectedCompany === comp;
              return (
                <button
                  key={comp}
                  onClick={() => setSelectedCompany(comp)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent-bg)' : 'var(--card-hover)',
                    color: isSelected ? 'var(--accent)' : 'var(--t2)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Show only questions asked by ${comp === 'All' ? 'any company' : comp}`}
                >
                  {comp === 'All' ? 'All Companies' : comp}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── STEPPER NAVIGATION (Active when viewMode === 'stepper') ── */}
      {viewMode === 'stepper' && (
        <div
          className="card"
          style={{
            padding: '14px 20px',
            marginBottom: 20,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--accent)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            boxShadow: 'var(--shadow)',
          }}
        >
          <button
            onClick={() => setStepperRoundIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepperRoundIndex === 0}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              opacity: stepperRoundIndex === 0 ? 0.4 : 1,
              cursor: stepperRoundIndex === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft style={{ width: 15, height: 15 }} />
            <span>Previous Section</span>
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Section {stepperRoundIndex + 1} of {doc.rounds.length}
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
              {doc.rounds[stepperRoundIndex]?.roundTitle || 'Round Notes'}
            </div>
          </div>

          <button
            onClick={() => setStepperRoundIndex((prev) => Math.min(doc.rounds.length - 1, prev + 1))}
            disabled={stepperRoundIndex >= doc.rounds.length - 1}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              opacity: stepperRoundIndex >= doc.rounds.length - 1 ? 0.4 : 1,
              cursor: stepperRoundIndex >= doc.rounds.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <span>Next Section</span>
            <ChevronRight style={{ width: 15, height: 15 }} />
          </button>
        </div>
      )}

      {/* ── MAIN CONTENT: RENDER ACCORDING TO VIEW MODE ── */}
      {((!doc.rawMarkdown && doc.rounds.length === 0) || doc.isEmpty) ? (
        /* ══════════════════════════════════════════════════════════════
           EMPTY STATE: DOCUMENT IS CLEARED / DELETED
           ══════════════════════════════════════════════════════════════ */
        <div
          className="card"
          style={{
            maxWidth: 760,
            margin: '30px auto',
            padding: '48px 36px',
            textAlign: 'center',
            background: 'var(--card)',
            border: '2px dashed var(--border)',
            borderRadius: 20,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--accent-bg)',
              color: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            <FileText style={{ width: 30, height: 30 }} />
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', margin: '0 0 8px' }}>
            No Interview Notes Loaded
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--t2)', maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
            All debrief notes have been cleared. Upload your own Markdown (.md) notes file, paste raw notes, or load a pre-built sample below.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 20px',
                fontSize: 13,
                fontWeight: 700,
                boxShadow: '0 2px 8px var(--accent-glow)',
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
                gap: 7,
                padding: '9px 18px',
                fontSize: 13,
                fontWeight: 600,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--t1)',
              }}
            >
              <FileText style={{ width: 15, height: 15, color: 'var(--accent)' }} />
              <span>Paste Notes</span>
            </button>
          </div>

          {/* Quick Sample Links */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
              Or explore with a pre-formatted debrief:
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {PRESET_SAMPLE_FILES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleLoadSample(sample.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 16,
                    fontSize: 12,
                    fontWeight: 600,
                    border: '1px solid var(--border)',
                    background: 'var(--page)',
                    color: 'var(--t1)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : viewMode === 'reader' && readerSubMode === 'raw' ? (
        /* ══════════════════════════════════════════════════════════════
           RAW MARKDOWN VIEW
           ══════════════════════════════════════════════════════════════ */
        <div
          className="card"
          style={{
            maxWidth: 920,
            margin: '0 auto',
            padding: 24,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)' }}>
              Raw Markdown ({readingStats.words} words)
            </span>
            <button
              onClick={handleCopyRawMarkdown}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '5px 12px' }}
            >
              {copiedRaw ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
              <span>{copiedRaw ? 'Copied' : 'Copy All'}</span>
            </button>
          </div>
          <pre
            style={{
              padding: 16,
              borderRadius: 10,
              background: 'var(--page)',
              border: '1px solid var(--border)',
              color: 'var(--t1)',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: 12.5,
              lineHeight: 1.6,
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {doc.rawMarkdown}
          </pre>
        </div>
      ) : viewMode === 'reader' && readerSubMode === 'formatted' ? (
        /* ══════════════════════════════════════════════════════════════
           VIEW MODE 1A: CONTINUOUS ARTICLE DOCUMENT READER
           Always renders the full document even if rounds were not split!
           ══════════════════════════════════════════════════════════════ */
        <div
          className="card"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '36px 42px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderTop: '3px solid var(--accent)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 16,
          }}
        >
          {/* Readme Document Header */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              {doc.company || 'Interview Debrief'} • Notes
            </div>
            <h1 style={{ fontSize: 27, fontWeight: 800, color: 'var(--t1)', margin: 0, lineHeight: 1.3 }}>
              {doc.role || 'Software Engineer Notes'}
            </h1>
            {doc.overview && (
              <p style={{ fontSize: fontPx, color: 'var(--t2)', marginTop: 12, lineHeight: 1.65 }}>
                {doc.overview}
              </p>
            )}
          </div>

          {/* Render Full Markdown Text Content with high-fidelity formatting */}
          <MarkdownTextRenderer content={doc.rawMarkdown} fontSize={fontPx} />
        </div>
      ) : filteredRounds.length === 0 || totalVisibleQuestions === 0 ? (
        /* ══════════════════════════════════════════════════════════════
           EMPTY FILTER FALLBACK: Show document instead of dead screen
           ══════════════════════════════════════════════════════════════ */
        <div
          className="card"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '32px 36px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>
                Viewing Full Document
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--t3)', marginTop: 2 }}>
                Current filters yielded 0 card matches. Showing complete debrief notes below.
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedRound('all');
                setSelectedType('All');
                setSearchQuery('');
                setOnlyRejectionLessons(false);
              }}
              className="btn btn-primary"
              style={{ fontSize: 12, padding: '5px 12px' }}
            >
              Reset Filters
            </button>
          </div>
          <MarkdownTextRenderer content={doc.rawMarkdown} fontSize={fontPx} />
        </div>
      ) : viewMode === 'reader' && readerSubMode === 'structured' ? (
        /* ══════════════════════════════════════════════════════════════
           VIEW MODE 1B: STRUCTURED ARTICLE Q&A (Interactive Readme)
           ══════════════════════════════════════════════════════════════ */
        <div
          className="card"
          style={{
            maxWidth: 900,
            margin: '0 auto',
            padding: '36px 42px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderTop: '3px solid var(--accent)',
            boxShadow: 'var(--shadow-lg)',
            borderRadius: 16,
          }}
        >
          {/* Readme Document Header with interactive actions & Table of Contents */}
          <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 24, marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  {doc.company || 'Interview Debrief'} • Interactive Document
                </div>
                <h1 style={{ fontSize: 27, fontWeight: 800, color: 'var(--t1)', margin: 0, lineHeight: 1.3 }}>
                  {doc.role || 'Interview Notes'}
                </h1>
                {doc.overview && (
                  <p style={{ fontSize: fontPx, color: 'var(--t2)', marginTop: 12, lineHeight: 1.65, maxWidth: 760 }}>
                    {doc.overview}
                  </p>
                )}
              </div>

              {/* Action Toolbar on Document Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleOpenAddModal(doc.rounds[0]?.roundNumber || 1)}
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    boxShadow: '0 2px 8px var(--accent-glow)',
                  }}
                  title="Add a new question into this debrief"
                >
                  <Plus style={{ width: 14, height: 14 }} />
                  <span>Add Question</span>
                </button>

                <button
                  onClick={handleDeleteAll}
                  className="btn-ghost"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: 'var(--danger)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  title="Delete all notes, questions, and rounds"
                >
                  <Trash2 style={{ width: 13, height: 13 }} />
                  <span>Delete All</span>
                </button>
              </div>
            </div>

            {/* Jump to Section (TOC Navigation Pills) */}
            {doc.rounds.length > 1 && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                  Jump to Section:
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {doc.rounds.map((r) => (
                    <button
                      key={r.roundNumber}
                      onClick={() => {
                        const el = document.getElementById(`round-section-${r.roundNumber}`);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="btn-ghost"
                      style={{
                        padding: '4px 11px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        background: 'var(--page)',
                        color: 'var(--t2)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Section {r.roundNumber}: {r.roundTitle} ({r.questions.length})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rounds & Questions rendered in clean, flowing document format */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
            {filteredRounds.map((round) => (
              <section
                key={round.roundNumber}
                id={`round-section-${round.roundNumber}`}
                style={{
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: 32,
                }}
              >
                {/* Round Section Header with Add Question button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Section {round.roundNumber}
                    </span>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)', margin: '4px 0 0' }}>
                      {round.roundTitle}
                    </h2>
                    {round.roundNotes && (
                      <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4, fontStyle: 'italic' }}>
                        {round.roundNotes}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>
                      {round.questions.length} Items
                    </span>
                    <button
                      onClick={() => handleOpenAddModal(round.roundNumber)}
                      className="btn-ghost"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 9px',
                        borderRadius: 6,
                        fontSize: 11.5,
                        fontWeight: 600,
                        border: '1px solid var(--border)',
                        color: 'var(--accent)',
                        background: 'var(--card)',
                        cursor: 'pointer',
                      }}
                      title="Add a question into this round"
                    >
                      <Plus style={{ width: 12, height: 12 }} />
                      <span>Add Question</span>
                    </button>
                  </div>
                </div>

                {/* Questions in this round */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {round.questions.map((q) => {
                    const isSaved = savedVaultIds.has(q.id);

                    return (
                      <article
                        key={q.id}
                        style={{
                          padding: '20px 22px',
                          borderRadius: 12,
                          background: 'var(--card-hover)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        {/* Question Title & Badges */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                              {/* Dedicated Company Badge so user immediately knows which company asked this */}
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '2px 9px',
                                  borderRadius: 6,
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: 'var(--accent)',
                                  border: '1px solid rgba(99, 102, 241, 0.28)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                title={`Question asked in interview by ${q.company || round.company || doc.company}`}
                              >
                                <Building2 style={{ width: 11, height: 11 }} />
                                <span>{q.company || round.company || doc.company}</span>
                              </span>

                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  padding: '2px 8px',
                                  borderRadius: 6,
                                  background: 'var(--accent-bg)',
                                  color: 'var(--accent)',
                                }}
                              >
                                {q.type}
                              </span>

                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', background: 'var(--card)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)' }}>
                                {q.category}
                              </span>

                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: q.difficulty === 'Hard' ? 'var(--danger)' : q.difficulty === 'Medium' ? 'var(--warn)' : 'var(--success)',
                                }}
                              >
                                • {q.difficulty}
                              </span>

                              {q.timeComplexity && (
                                <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 4 }}>
                                  [Time: {q.timeComplexity}]
                                </span>
                              )}
                            </div>

                            <h3 style={{ fontSize: fontPx + 2, fontWeight: 800, color: 'var(--t1)', margin: 0, lineHeight: 1.4 }}>
                              {q.question}
                            </h3>
                          </div>

                          {/* Quick Actions (Vault, Copy, Edit, Delete) */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={() => handleSaveToVault(q, round.roundTitle)}
                              disabled={isSaved}
                              title="Save to Code Vault"
                              className="btn-ghost"
                              style={{ padding: 6, borderRadius: 6, color: isSaved ? 'var(--success)' : 'var(--t3)' }}
                            >
                              {isSaved ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Sparkles style={{ width: 14, height: 14 }} />}
                            </button>

                            <button
                              onClick={() => handleCopyQuestion(q)}
                              title="Copy Question & Answer"
                              className="btn-ghost"
                              style={{ padding: 6, borderRadius: 6, color: 'var(--t3)' }}
                            >
                              {copiedQId === q.id ? <Check style={{ width: 14, height: 14, color: 'var(--success)' }} /> : <Copy style={{ width: 14, height: 14 }} />}
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(round.roundNumber, q)}
                              title="Edit Question"
                              className="btn-ghost"
                              style={{ padding: 6, borderRadius: 6, color: 'var(--t3)' }}
                            >
                              <Edit3 style={{ width: 14, height: 14 }} />
                            </button>

                            <button
                              onClick={() => handleDeleteQuestion(round.roundNumber, q.id, q.question)}
                              title="Delete Question"
                              className="btn-ghost"
                              style={{ padding: 6, borderRadius: 6, color: 'var(--danger)' }}
                            >
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </div>

                        {/* Formatted Answer */}
                        <div style={{ marginTop: 12 }}>
                          <MarkdownTextRenderer content={q.answer} fontSize={fontPx} />
                        </div>

                        {/* Optional Code Snippet */}
                        {q.codeSnippet && (
                          <div style={{ marginTop: 14 }}>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Code2 style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                              <span>Implementation ({q.codeLanguage || 'code'})</span>
                            </div>
                            <CodeInterpreterViewer
                              code={q.codeSnippet}
                              language={q.codeLanguage || 'python'}
                              title={q.question}
                            />
                          </div>
                        )}

                        {/* Rejection Retrospective Lesson Callout */}
                        {q.rejectionLearning && (
                          <div
                            style={{
                              marginTop: 16,
                              padding: '12px 16px',
                              borderRadius: 8,
                              background: 'var(--card)',
                              border: '1px solid var(--border)',
                              borderLeft: '3px solid var(--warn)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <AlertTriangle style={{ width: 14, height: 14, color: 'var(--warn)' }} />
                              <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--warn)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                Common Pitfall & Rejection Trap:
                              </span>
                            </div>
                            <p style={{ fontSize: fontPx - 0.5, color: 'var(--t2)', margin: '0 0 8px', lineHeight: 1.5 }}>
                              {q.rejectionLearning.identifiedMistake}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, paddingTop: 6, borderTop: '1px solid var(--border-light)' }}>
                              <Lightbulb style={{ width: 14, height: 14, color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--success)' }}>
                                  Key Learning:
                                </span>
                                <p style={{ fontSize: fontPx - 0.5, color: 'var(--t1)', margin: '2px 0 0', lineHeight: 1.5 }}>
                                  {q.rejectionLearning.whatToLearn}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Follow-ups */}
                        {q.followUps && q.followUps.length > 0 && (
                          <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 6, background: 'var(--card)', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>
                              Interviewer Follow-ups:
                            </div>
                            <ul style={{ margin: 0, paddingLeft: 18, fontSize: fontPx - 1, color: 'var(--t2)', lineHeight: 1.5 }}>
                              {q.followUps.map((f, fIdx) => (
                                <li key={fIdx}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════
           VIEW MODE 2 & 3: CARD STUDIO & ROUND STEPPER
           Supports Compact Mode and Collapse/Expand All controls.
           ══════════════════════════════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {filteredRounds.map((round) => (
            <div key={round.roundNumber} id={`round-section-${round.roundNumber}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Round Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: 12,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderLeft: '4px solid var(--accent)',
                  flexWrap: 'wrap',
                  gap: 10,
                  boxShadow: 'var(--shadow)',
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
                    <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                      {round.roundTitle}
                    </h3>
                  </div>
                  {round.roundNotes && (
                    <div style={{ fontSize: 12.5, color: 'var(--t3)', marginTop: 3 }}>
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
                      gap: 4,
                      padding: '4px 10px',
                      fontSize: 11.5,
                      fontWeight: 600,
                      background: 'var(--card-hover)',
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
                    style={{ padding: 6, borderRadius: 6, color: 'var(--danger)' }}
                  >
                    <Trash2 style={{ width: 13, height: 13 }} />
                  </button>

                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>
                    {round.questions.length} Questions
                  </span>
                </div>
              </div>

              {/* Questions in this Round */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {round.questions.map((q) => {
                  const isExpanded = expandedIds.has(q.id);
                  const isSaved = savedVaultIds.has(q.id);

                  // COMPACT LIST ACCORDION VIEW
                  if (isCompact) {
                    return (
                      <div
                        key={q.id}
                        className="card"
                        style={{
                          padding: '12px 16px',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          boxShadow: 'var(--shadow)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div
                            onClick={() => toggleExpand(q.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, cursor: 'pointer', flexWrap: 'wrap' }}
                          >
                            {/* Company Identifier */}
                            {(q.company || round.company || (doc.company && doc.company !== 'Target Company')) && (
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: 4,
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: 'var(--accent)',
                                  border: '1px solid rgba(99, 102, 241, 0.28)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3.5,
                                  whiteSpace: 'nowrap',
                                }}
                                title={`Company: ${q.company || round.company || doc.company}`}
                              >
                                <Building2 style={{ width: 11, height: 11 }} />
                                <span>{q.company || round.company || doc.company}</span>
                              </span>
                            )}

                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 7px',
                                borderRadius: 4,
                                background: 'var(--accent-bg)',
                                color: 'var(--accent)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {q.type === 'Theory & Concepts' ? 'Theory' : q.type === 'Coding & DSA' ? 'Coding' : q.type}
                            </span>
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)', flex: 1 }}>
                              {q.question}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: q.difficulty === 'Hard' ? 'var(--danger)' : q.difficulty === 'Medium' ? 'var(--warn)' : 'var(--success)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {q.difficulty}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <button
                              onClick={() => toggleExpand(q.id)}
                              className="btn-ghost"
                              style={{ padding: 5, borderRadius: 6, color: 'var(--t3)' }}
                            >
                              {isExpanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details inside compact mode */}
                        {isExpanded && (
                          <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                            <MarkdownTextRenderer content={q.answer} fontSize={fontPx} />
                            {q.codeSnippet && (
                              <div style={{ marginTop: 10 }}>
                                <CodeInterpreterViewer code={q.codeSnippet} language={q.codeLanguage || 'python'} title={q.question} />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // COMFORTABLE DETAILED CARD VIEW
                  return (
                    <motion.div
                      key={q.id}
                      layout
                      className="card"
                      style={{
                        padding: 0,
                        overflow: 'hidden',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
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
                          gap: 12,
                          background: 'var(--card)',
                          borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          {/* Tags & Badges */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                            {/* Dedicated Company Badge */}
                            {(q.company || round.company || (doc.company && doc.company !== 'Target Company')) && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: '2px 9px',
                                  borderRadius: 6,
                                  background: 'rgba(99, 102, 241, 0.12)',
                                  color: 'var(--accent)',
                                  border: '1px solid rgba(99, 102, 241, 0.28)',
                                }}
                                title={`Asked in interview by ${q.company || round.company || doc.company}`}
                              >
                                <Building2 style={{ width: 12, height: 12 }} />
                                <span>{q.company || round.company || doc.company}</span>
                              </span>
                            )}

                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 11,
                                fontWeight: 700,
                                padding: '2px 8px',
                                borderRadius: 6,
                                background: 'var(--accent-bg)',
                                color: 'var(--accent)',
                                textTransform: 'uppercase',
                              }}
                            >
                              {q.type === 'Theory & Concepts' ? <Brain style={{ width: 11, height: 11 }} /> : <Code2 style={{ width: 11, height: 11 }} />}
                              <span>{q.type}</span>
                            </span>

                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', background: 'var(--card-hover)', padding: '2px 7px', borderRadius: 4, border: '1px solid var(--border)' }}>
                              {q.category}
                            </span>

                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: q.difficulty === 'Hard' ? 'var(--danger)' : q.difficulty === 'Medium' ? 'var(--warn)' : 'var(--success)',
                              }}
                            >
                              • {q.difficulty}
                            </span>

                            {q.timeComplexity && (
                              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)' }}>
                                [Time: {q.timeComplexity}]
                              </span>
                            )}
                          </div>

                          {/* Question Text */}
                          <h4 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)', margin: 0, lineHeight: 1.4 }}>
                            {q.question}
                          </h4>

                          {/* Key Concepts Pills */}
                          {q.keyConcepts.length > 0 && (
                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                              {q.keyConcepts.map((concept, cIdx) => (
                                <span
                                  key={cIdx}
                                  style={{
                                    fontSize: 10.5,
                                    fontWeight: 600,
                                    color: 'var(--t3)',
                                    background: 'var(--card-hover)',
                                    padding: '1px 6px',
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
                          <button
                            onClick={() => handleSaveToVault(q, round.roundTitle)}
                            disabled={isSaved}
                            title="Store in permanent Code & Question Vault"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              padding: '4px 10px',
                              borderRadius: 6,
                              fontSize: 11.5,
                              fontWeight: 700,
                              cursor: isSaved ? 'default' : 'pointer',
                              background: isSaved ? 'var(--success-bg)' : 'var(--accent-bg)',
                              color: isSaved ? 'var(--success)' : 'var(--accent)',
                              border: isSaved ? '1px solid var(--success)' : '1px solid var(--accent)',
                            }}
                          >
                            {isSaved ? <CheckCircle2 style={{ width: 12, height: 12 }} /> : <Sparkles style={{ width: 12, height: 12 }} />}
                            <span>{isSaved ? 'In Vault' : 'Vault'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyQuestion(q)}
                            title="Copy Question & Notes"
                            className="btn-ghost"
                            style={{ padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--t2)' }}
                          >
                            {copiedQId === q.id ? <Check style={{ width: 13, height: 13, color: 'var(--success)' }} /> : <Copy style={{ width: 13, height: 13 }} />}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(round.roundNumber, q)}
                            title="Edit Question"
                            className="btn-ghost"
                            style={{ padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--t2)' }}
                          >
                            <Edit3 style={{ width: 13, height: 13 }} />
                          </button>

                          <button
                            onClick={() => handleDeleteQuestion(round.roundNumber, q.id, q.question)}
                            title="Delete Question"
                            className="btn-ghost"
                            style={{ padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--danger)' }}
                          >
                            <Trash2 style={{ width: 13, height: 13 }} />
                          </button>

                          <button
                            onClick={() => toggleExpand(q.id)}
                            className="btn-ghost"
                            style={{ padding: 6, borderRadius: 6, border: '1px solid var(--border)', color: 'var(--t3)' }}
                          >
                            {isExpanded ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
                          </button>
                        </div>
                      </div>

                      {/* Card Body (when expanded) */}
                      {isExpanded && (
                        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                          {/* Answer Box */}
                          <div
                            style={{
                              background: 'var(--card-hover)',
                              borderRadius: 10,
                              padding: '14px 18px',
                              border: '1px solid var(--border)',
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
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                marginBottom: 6,
                              }}
                            >
                              <BookOpen style={{ width: 13, height: 13 }} />
                              <span>Model Answer / Explanation</span>
                            </div>
                            <MarkdownTextRenderer content={q.answer} fontSize={fontPx} />
                          </div>

                          {/* Code Interpreter View */}
                          {q.codeSnippet && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Code2 style={{ width: 13, height: 13, color: 'var(--accent)' }} />
                                <span>Code Implementation ({q.codeLanguage || 'code'})</span>
                              </div>
                              <CodeInterpreterViewer
                                code={q.codeSnippet}
                                language={q.codeLanguage || 'python'}
                                title={q.question}
                              />
                            </div>
                          )}

                          {/* Rejection Retrospective Callout */}
                          {q.rejectionLearning && (
                            <div
                              style={{
                                borderRadius: 10,
                                padding: '14px 16px',
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderLeft: '3px solid var(--warn)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <AlertTriangle style={{ width: 14, height: 14, color: 'var(--warn)' }} />
                                <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--warn)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                                  Identified Mistake / Rejection Trap:
                                </span>
                                <span style={{ fontSize: 10.5, color: 'var(--t3)', marginLeft: 'auto' }}>
                                  {q.rejectionLearning.category}
                                </span>
                              </div>

                              <div style={{ fontSize: fontPx - 0.5, color: 'var(--t1)', lineHeight: 1.5 }}>
                                {q.rejectionLearning.identifiedMistake}
                              </div>

                              <div
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: 8,
                                  background: 'var(--card-hover)',
                                  border: '1px solid var(--border-light)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 4,
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>
                                  <Lightbulb style={{ width: 12, height: 12 }} />
                                  <span>What to Learn:</span>
                                </div>
                                <div style={{ fontSize: fontPx - 1, color: 'var(--t1)', lineHeight: 1.5 }}>
                                  {q.rejectionLearning.whatToLearn}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Follow-ups */}
                          {q.followUps && q.followUps.length > 0 && (
                            <div
                              style={{
                                background: 'var(--card-hover)',
                                borderRadius: 8,
                                padding: '10px 14px',
                                border: '1px solid var(--border-light)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>
                                <MessageSquare style={{ width: 12, height: 12 }} />
                                <span>Follow-up Variations:</span>
                              </div>
                              <ul style={{ margin: 0, paddingLeft: 18, fontSize: fontPx - 1, color: 'var(--t1)', lineHeight: 1.5 }}>
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

      {/* ── FLOATING BACK TO TOP BUTTON ── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 50,
              padding: '9px 16px',
              borderRadius: 20,
              background: 'var(--card)',
              color: 'var(--t1)',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowUp style={{ width: 14, height: 14, color: 'var(--accent)' }} />
            <span>Back to Top</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── PASTE MARKDOWN MODAL ── */}
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
                    Paste interview questions with rounds or general technical questions.
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
                    placeholder="e.g. SecPod Technologies — Software Engineer"
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
                    placeholder={`# SecPod Technologies — Software Engineer\n\n## Round 1: C/C++ & Operating Systems\n### Q1: Explain virtual memory, page faults, and TLB\n**Answer:** Virtual memory allows OS to map virtual addresses to physical pages...\n\n## Round 2: Networking & Security\n### Q2: What is the TCP 3-way handshake and TIME_WAIT state?`}
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

      {/* ── EDIT / ADD QUESTION MODAL ── */}
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
                    {editingQuestionId ? 'Edit Question & Notes' : `Add Question to Section ${targetRoundNumber}`}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--t2)', marginTop: 4, margin: 0 }}>
                    Customize question prompt, explanation, code snippet, and rejection learnings.
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
                    placeholder="e.g. How does virtual memory work and what happens during a page fault?"
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
                      placeholder="e.g. Operating Systems, C / C++, Networking"
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
                    placeholder="e.g. Page Table, TLB, Cache Hit Ratio, Kernel Trap"
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
                      <option value="cpp">C++</option>
                      <option value="python">Python</option>
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
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
                    background: 'var(--card-hover)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--warn)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--warn)', textTransform: 'uppercase' }}>
                    Rejection Retrospective & Mistake Lessons
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--t2)', marginBottom: 3 }}>
                      Identified Trap / Common Mistake
                    </label>
                    <input
                      type="text"
                      className="inp"
                      placeholder="e.g. Stated TLB miss always reads from disk rather than page table in RAM"
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
                      placeholder="e.g. Draw the step-by-step memory hierarchy: CPU -> TLB -> RAM Page Table -> Swap on Disk"
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
                    placeholder="e.g. What is the difference between major and minor page faults?"
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
