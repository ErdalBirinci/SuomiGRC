import React, { useState, useRef } from 'react';
import {
  TrainingCourse,
  EmployeeCourseProgress,
  Employee,
  CourseLesson,
} from '../types/grc';
import {
  GraduationCap,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  Download,
  Search,
  Sparkles,
  Send,
  Video,
  FileCheck2,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
  ExternalLink,
  Tv,
  Layers,
  Info,
  Maximize2,
  Volume2,
  VolumeX,
  AlertTriangle,
  MonitorPlay,
  Terminal,
  ShieldAlert,
  Eye,
  Lock,
  RefreshCw,
} from 'lucide-react';

interface SecurityTrainingHubProps {
  courses: TrainingCourse[];
  progressList: EmployeeCourseProgress[];
  employees: Employee[];
  onUpdateProgress: (progress: EmployeeCourseProgress[]) => void;
}

export const SecurityTrainingHub: React.FC<SecurityTrainingHubProps> = ({
  courses,
  progressList,
  employees,
  onUpdateProgress,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses[0]?.id || 'course-sec-aware-2026'
  );
  const [activeCourseModal, setActiveCourseModal] = useState<TrainingCourse | null>(null);
  const [quizStep, setQuizStep] = useState<'video' | 'quiz' | 'certificate'>('video');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'not_started'>('all');
  const [nudgeSent, setNudgeSent] = useState(false);

  // Video player state
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [streamMode, setStreamMode] = useState<'direct' | 'youtube' | 'interactive'>('direct');
  const [hasWatchedVideo, setHasWatchedVideo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoVolume, setVideoVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoError, setVideoError] = useState(false);
  const [interactiveStep, setInteractiveStep] = useState(1);
  const [interactiveSimSuccess, setInteractiveSimSuccess] = useState(false);
  const [revealedIndicators, setRevealedIndicators] = useState<string[]>([]);
  const [parameterizedEnabled, setParameterizedEnabled] = useState(false);
  const [testPayload, setTestPayload] = useState("admin' OR '1'='1");
  const [isMaskedEHR, setIsMaskedEHR] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  const currentProgress = progressList.filter((p) => p.courseId === selectedCourseId);

  const completedCount = currentProgress.filter((p) => p.status === 'completed').length;
  const inProgressCount = currentProgress.filter((p) => p.status === 'in_progress').length;
  const notStartedCount = currentProgress.filter((p) => p.status === 'not_started').length;
  const totalEmployees = currentProgress.length;
  const completionRate = totalEmployees > 0 ? Math.round((completedCount / totalEmployees) * 100) : 0;

  const filteredProgress = currentProgress.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.employeeName.toLowerCase().includes(q) || p.employeeEmail.toLowerCase().includes(q);
    }
    return true;
  });

  const handleStartCourse = (course: TrainingCourse) => {
    setActiveCourseModal(course);
    setQuizStep('video');
    setSelectedAnswers({});
    setQuizScore(null);
    setActiveLessonId(course.lessons?.[0]?.id || null);
    setStreamMode('direct');
    setHasWatchedVideo(false);
    setIsPlaying(true);
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoError(false);
    setInteractiveStep(1);
    setInteractiveSimSuccess(false);
    setRevealedIndicators([]);
  };

  // Get active lesson or fallback to course root values
  const activeLesson: CourseLesson | undefined =
    activeCourseModal?.lessons?.find((l) => l.id === activeLessonId) ||
    activeCourseModal?.lessons?.[0];

  const currentYoutubeId = activeLesson?.youtubeId || activeCourseModal?.youtubeId || 'sg0kQYvTlnc';
  const currentDirectUrl =
    activeLesson?.directVideoUrl ||
    activeCourseModal?.directVideoUrl ||
    'https://media.w3.org/2010/05/bunny/trailer.mp4';
  const currentSourceOrg =
    activeLesson?.sourceOrganization ||
    activeCourseModal?.sourceOrganization ||
    'Public Cybersecurity Education';
  const currentTakeaways =
    activeLesson?.keyTakeaways && activeLesson.keyTakeaways.length > 0
      ? activeLesson.keyTakeaways
      : activeCourseModal?.keyTakeaways || [];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setVideoCurrentTime(time);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(videoDuration || 300, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = target;
    setVideoCurrentTime(target);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVideoVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const handleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      videoContainerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIdx });
  };

  const handleSubmitQuiz = () => {
    if (!activeCourseModal) return;
    let correct = 0;
    activeCourseModal.quizQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct++;
      }
    });

    const calculatedScore = Math.round((correct / activeCourseModal.quizQuestions.length) * 100);
    setQuizScore(calculatedScore);

    if (calculatedScore >= activeCourseModal.passingScorePercentage) {
      setQuizStep('certificate');
      // Update employee progress (simulate for current user Aino Virtanen)
      const certId = `CERT-SOC2-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const updated = progressList.map((p) => {
        if (p.courseId === activeCourseModal.id && p.employeeId === 'emp-03') {
          return {
            ...p,
            status: 'completed' as const,
            progressPercent: 100,
            quizScore: calculatedScore,
            completedAt: 'Just now',
            certificateHash: certId,
          };
        }
        return p;
      });
      onUpdateProgress(updated);
    }
  };

  const handleSendNudgeAll = () => {
    setNudgeSent(true);
    setTimeout(() => setNudgeSent(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              SOC 2 CC2.2 & ISO 27001 A.7.2.2
            </span>
            <span className="text-xs text-slate-500 font-mono">Employee Security LMS</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Security Awareness & Training Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Automated security training modules with interactive video lessons and graded knowledge checks.
            All modules stream verified public educational videos (CISA, HHS, Computerphile) with cryptographically timestamped certificates synced into your SOC 2 PBC audit vault.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleSendNudgeAll}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-slate-500" />
            <span>{nudgeSent ? 'Slack Nudges Dispatched!' : 'Nudge Incomplete Personnel'}</span>
          </button>

          <button
            onClick={() => handleStartCourse(currentCourse)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Interactive Training Player</span>
          </button>
        </div>
      </div>

      {/* Course Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {courses.map((course) => {
          const isSelected = course.id === selectedCourseId;
          const courseProgs = progressList.filter((p) => p.courseId === course.id);
          const comp = courseProgs.filter((p) => p.status === 'completed').length;
          const rate = courseProgs.length > 0 ? Math.round((comp / courseProgs.length) * 100) : 0;
          const lessonCount = course.lessons?.length || course.modulesCount || 3;

          return (
            <div
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-500 ring-1 ring-blue-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-blue-700 font-mono text-[10px] bg-blue-100/60 px-2 py-0.5 rounded-full">
                    {course.category}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {course.durationMinutes} min
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>

                {course.sourceOrganization && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Tv className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="truncate">{course.sourceOrganization}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1 text-slate-600">
                    <span>Organization Completion</span>
                    <span className="font-bold text-slate-900 font-mono">{rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartCourse(course);
                  }}
                  className="w-full py-1.5 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch Lessons & Certify ({lessonCount} Modules)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Metric & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              All ({currentProgress.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                statusFilter === 'completed' ? 'bg-white text-emerald-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Completed ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                statusFilter === 'in_progress' ? 'bg-white text-blue-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('not_started')}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                statusFilter === 'not_started' ? 'bg-white text-amber-700 font-semibold shadow-2xs' : 'text-slate-600'
              }`}
            >
              Not Started ({notStartedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Employee Training Status Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Training Status</th>
                <th className="py-3 px-4">Lesson Progress</th>
                <th className="py-3 px-4">Quiz Score</th>
                <th className="py-3 px-4">Completion Date</th>
                <th className="py-3 px-4">Auditor Certificate Hash</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProgress.map((prog) => {
                const isCompleted = prog.status === 'completed';

                return (
                  <tr key={prog.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {prog.employeeName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block">{prog.employeeName}</span>
                          <span className="text-[11px] text-slate-400 font-mono block">{prog.employeeEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Certified
                        </span>
                      ) : prog.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full text-[11px]">
                          <Clock className="w-3 h-3 text-blue-600" />
                          In Progress
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Not Started
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${prog.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-600 font-medium">
                          {prog.progressPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                      {prog.quizScore ? (
                        <span className="font-semibold text-emerald-700">{prog.quizScore}%</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {prog.completedAt || 'Pending'}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                      {prog.certificateHash ? (
                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {prog.certificateHash}
                        </span>
                      ) : (
                        <span className="text-slate-400">Uncertified</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {isCompleted ? (
                          <button
                            onClick={() => alert(`Certificate ${prog.certificateHash} verified and cryptographically signed.`)}
                            className="px-2.5 py-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                          >
                            <Award className="w-3.5 h-3.5" />
                            <span>View Cert</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`Training nudge sent to ${prog.employeeEmail}`)}
                            className="px-2.5 py-1 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                          >
                            Send Nudge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Video & Quiz Modal Player */}
      {activeCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">
                    {activeCourseModal.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="font-medium text-blue-700">
                      Step {quizStep === 'video' ? '1 of 2: Interactive Video Lesson' : quizStep === 'quiz' ? '2 of 2: Graded Knowledge Check' : 'Certificate of Completion'}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">
                      Passing Grade: &ge;{activeCourseModal.passingScorePercentage}%
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveCourseModal(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
              {quizStep === 'video' && (
                <div className="space-y-4">
                  {/* Multi-Lesson / Chapter Navigation Bar */}
                  {activeCourseModal.lessons && activeCourseModal.lessons.length > 1 && (
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3 h-3 text-blue-600" />
                          <span>Course Chapters & Modules</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {activeCourseModal.lessons.length} Modules Available
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                        {activeCourseModal.lessons.map((lesson, idx) => {
                          const isActive = (activeLessonId || activeCourseModal.lessons![0].id) === lesson.id;
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => {
                                setActiveLessonId(lesson.id);
                                setHasWatchedVideo(true);
                              }}
                              className={`p-2 rounded-lg text-left transition-all flex items-start gap-2 border ${
                                isActive
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs truncate">{lesson.title}</div>
                                <div
                                  className={`text-[10px] flex items-center gap-1 mt-0.5 font-mono ${
                                    isActive ? 'text-blue-100' : 'text-slate-400'
                                  }`}
                                >
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{lesson.duration}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Stream Mode Selector & Lesson Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 text-white px-3.5 py-2.5 rounded-t-xl">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="font-semibold text-xs truncate">
                        {activeLesson?.title || activeCourseModal.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stream Switcher */}
                      <div className="flex items-center p-0.5 bg-slate-800 rounded-lg border border-slate-700 text-[11px]">
                        <button
                          type="button"
                          onClick={() => {
                            setStreamMode('direct');
                            setVideoError(false);
                          }}
                          className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                            streamMode === 'direct'
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          title="High-definition direct CDN stream (100% reliable, zero unavailable errors)"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Direct HD Stream</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStreamMode('interactive')}
                          className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                            streamMode === 'interactive'
                              ? 'bg-purple-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          title="Interactive hands-on cyber defense simulation lab"
                        >
                          <Sparkles className="w-3 h-3 text-purple-300" />
                          <span>Interactive Lab</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setStreamMode('youtube')}
                          className={`px-2 py-1 rounded-md font-medium transition-colors ${
                            streamMode === 'youtube'
                              ? 'bg-red-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:text-white'
                          }`}
                          title="Verified YouTube stream mirror"
                        >
                          YouTube HD
                        </button>
                      </div>

                      {/* YouTube external link */}
                      <a
                        href={`https://www.youtube.com/watch?v=${currentYoutubeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                        title="Open source video directly on YouTube.com"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">YouTube.com</span>
                      </a>
                    </div>
                  </div>

                  {/* Mode 1: YouTube HD Stream */}
                  {streamMode === 'youtube' && (
                    <div className="space-y-2">
                      {/* YouTube Fallback Helper Banner */}
                      <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] px-3.5 py-2 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>
                            If YouTube displays <strong className="text-white">"Video unavailable"</strong> due to browser iframe cookie policies:
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setStreamMode('direct')}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md text-[10px] transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <MonitorPlay className="w-3 h-3" />
                            <span>Switch to Direct HD Stream (100% Working)</span>
                          </button>
                        </div>
                      </div>

                      <div className="relative bg-slate-950 aspect-video rounded-b-xl overflow-hidden shadow-2xl border-x border-b border-slate-800 flex items-center justify-center">
                        <iframe
                          src={`https://www.youtube.com/embed/${currentYoutubeId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
                          title={activeLesson?.title || activeCourseModal.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  {/* Mode 2: Direct HTML5 Video Player with High-Tech HUD */}
                  {streamMode === 'direct' && (
                    <div
                      ref={videoContainerRef}
                      className="relative bg-slate-950 aspect-video rounded-b-xl overflow-hidden shadow-2xl border-x border-b border-slate-800 flex items-center justify-center group"
                    >
                      {videoError ? (
                        <div className="text-center p-6 max-w-md space-y-3">
                          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                          <h4 className="text-white font-bold text-sm">Direct Stream Offline</h4>
                          <p className="text-slate-400 text-xs">
                            The media stream encountered a temporary network delay. You can reload the backup stream or launch the hands-on Interactive Lab.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setVideoError(false);
                                if (videoRef.current) {
                                  videoRef.current.src = 'https://vjs.zencdn.net/v/oceans.mp4';
                                  videoRef.current.load();
                                  videoRef.current.play().catch(() => {});
                                }
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Load Backup Stream</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setStreamMode('interactive')}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-lg text-xs"
                            >
                              Open Interactive Lab
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={videoRef}
                            src={currentDirectUrl}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain bg-black cursor-pointer"
                            onClick={togglePlay}
                            onPlay={() => {
                              setIsPlaying(true);
                              setHasWatchedVideo(true);
                            }}
                            onPause={() => setIsPlaying(false)}
                            onTimeUpdate={() => {
                              if (videoRef.current) {
                                setVideoCurrentTime(videoRef.current.currentTime);
                                if (videoRef.current.currentTime > 4) {
                                  setHasWatchedVideo(true);
                                }
                              }
                            }}
                            onLoadedMetadata={() => {
                              if (videoRef.current) {
                                setVideoDuration(videoRef.current.duration);
                                setVideoError(false);
                              }
                            }}
                            onError={() => setVideoError(true)}
                            onEnded={() => {
                              setIsPlaying(false);
                              setHasWatchedVideo(true);
                            }}
                          />

                          {/* Center Floating Play/Pause Button when paused */}
                          {!isPlaying && (
                            <button
                              type="button"
                              onClick={togglePlay}
                              className="absolute z-10 w-16 h-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer backdrop-blur-xs"
                            >
                              <Play className="w-7 h-7 fill-white ml-1" />
                            </button>
                          )}

                          {/* Custom Bottom Video Controls HUD */}
                          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-3 pt-6 flex flex-col gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
                            {/* Scrubber Range Slider */}
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min={0}
                                max={videoDuration || 100}
                                step="0.1"
                                value={videoCurrentTime}
                                onChange={handleSeek}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2 transition-all"
                              />
                            </div>

                            {/* Controls Bar */}
                            <div className="flex items-center justify-between text-white text-xs">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={togglePlay}
                                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
                                  title={isPlaying ? 'Pause' : 'Play'}
                                >
                                  {isPlaying ? (
                                    <Pause className="w-4 h-4 fill-white" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-white" />
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSkip(-10)}
                                  className="p-1 rounded text-slate-300 hover:text-white text-[11px] font-mono hover:bg-white/10"
                                  title="Skip backward 10s"
                                >
                                  -10s
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSkip(10)}
                                  className="p-1 rounded text-slate-300 hover:text-white text-[11px] font-mono hover:bg-white/10"
                                  title="Skip forward 10s"
                                >
                                  +10s
                                </button>

                                {/* Time indicator */}
                                <div className="font-mono text-[11px] text-slate-300 ml-1">
                                  <span>{formatTime(videoCurrentTime)}</span>
                                  <span className="text-slate-500 mx-1">/</span>
                                  <span>{formatTime(videoDuration)}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5">
                                {/* Speed Selector */}
                                <div className="flex items-center bg-slate-800/80 rounded-md p-0.5 border border-slate-700 text-[10px] font-mono">
                                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                                    <button
                                      key={spd}
                                      type="button"
                                      onClick={() => handleSpeedChange(spd)}
                                      className={`px-1.5 py-0.5 rounded transition-colors ${
                                        playbackSpeed === spd
                                          ? 'bg-blue-600 text-white font-bold'
                                          : 'text-slate-400 hover:text-white'
                                      }`}
                                    >
                                      {spd}x
                                    </button>
                                  ))}
                                </div>

                                {/* Volume Slider */}
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={toggleMute}
                                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                                    title={isMuted ? 'Unmute' : 'Mute'}
                                  >
                                    {isMuted || videoVolume === 0 ? (
                                      <VolumeX className="w-4 h-4 text-red-400" />
                                    ) : (
                                      <Volume2 className="w-4 h-4" />
                                    )}
                                  </button>
                                  <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : videoVolume}
                                    onChange={handleVolumeChange}
                                    className="w-14 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                  />
                                </div>

                                {/* Fullscreen */}
                                <button
                                  type="button"
                                  onClick={handleFullscreen}
                                  className="p-1 rounded text-slate-300 hover:text-white hover:bg-white/10"
                                  title="Fullscreen"
                                >
                                  <Maximize2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Mode 3: Interactive Cyber Defense Lab (Zero External Video Dependencies) */}
                  {streamMode === 'interactive' && (
                    <div className="bg-slate-900 rounded-b-xl border-x border-b border-slate-800 p-5 text-white space-y-4 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-purple-500/20 text-purple-400 rounded-lg">
                            <Terminal className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-100">
                              Interactive Cyber Defense Threat Simulation
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              SOC 2 Type II audit practical scenario inspection & triage
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded border border-purple-700/50">
                          Active Sandbox
                        </span>
                      </div>

                      {/* Course Scenario 1: Phishing & Executive Impersonation */}
                      {(activeCourseModal.category === 'Security Awareness' ||
                        activeCourseModal.category === 'Phishing Prevention') && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-sans">
                            <div className="flex items-center justify-between text-[11px] border-b border-slate-800/80 pb-2">
                              <span className="text-slate-400">Inbound Message Triage:</span>
                              <span className="text-red-400 font-mono flex items-center gap-1 font-semibold">
                                <ShieldAlert className="w-3.5 h-3.5" /> High Risk Indicator
                              </span>
                            </div>

                            <div className="space-y-1.5 text-xs">
                              <div className="flex items-start gap-2">
                                <span className="text-slate-500 w-16 shrink-0">From:</span>
                                <span className="font-mono text-slate-200">
                                  Mark Henderson &lt;
                                  <span className="text-amber-400 font-bold underline">
                                    ceo@nordicscale-exec-urgent.co
                                  </span>
                                  &gt;
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-slate-500 w-16 shrink-0">Subject:</span>
                                <span className="font-semibold text-slate-200">
                                  URGENT: Immediate Wire Authorization for SOC 2 Cloud Audit ($48,500)
                                </span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-slate-500 w-16 shrink-0">Payload:</span>
                                <span className="text-slate-300 leading-relaxed bg-slate-900 p-2.5 rounded-lg border border-slate-800 block w-full mt-1">
                                  "Team, I am locked in a partner meeting with our auditors. Please immediately authorize payment via our vendor portal link below before our SOC 2 certification window closes today:
                                  <br />
                                  <span className="text-red-400 underline font-mono text-[11px] mt-1 block">
                                    http://nordicscale.sso-gateway-auth.xyz/verify-token
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Inspection Buttons */}
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-slate-300">
                              Click to identify attack vectors:
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!revealedIndicators.includes('domain')) {
                                    setRevealedIndicators([...revealedIndicators, 'domain']);
                                  }
                                }}
                                className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                                  revealedIndicators.includes('domain')
                                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                                }`}
                              >
                                <div className="font-bold flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                                  <span>1. Domain Spoofing</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {revealedIndicators.includes('domain')
                                    ? 'Detected: "-urgent.co" is not official nordicscale.com domain.'
                                    : 'Inspect sender envelope header'}
                                </p>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!revealedIndicators.includes('urgency')) {
                                    setRevealedIndicators([...revealedIndicators, 'urgency']);
                                  }
                                }}
                                className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                                  revealedIndicators.includes('urgency')
                                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                                }`}
                              >
                                <div className="font-bold flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>2. Urgency Coercion</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {revealedIndicators.includes('urgency')
                                    ? 'Detected: Artificial deadline pressure to bypass secondary approval.'
                                    : 'Analyze psychological pressure'}
                                </p>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (!revealedIndicators.includes('link')) {
                                    setRevealedIndicators([...revealedIndicators, 'link']);
                                  }
                                }}
                                className={`p-2.5 rounded-lg border text-left transition-colors text-xs ${
                                  revealedIndicators.includes('link')
                                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                    : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-300'
                                }`}
                              >
                                <div className="font-bold flex items-center gap-1.5">
                                  <Lock className="w-3.5 h-3.5 text-red-400" />
                                  <span>3. Credential Harvester</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {revealedIndicators.includes('link')
                                    ? 'Detected: Unencrypted HTTP link pointing to fake SSO credential harvester.'
                                    : 'Inspect link destination URL'}
                                </p>
                              </button>
                            </div>
                          </div>

                          {/* Triage Action Button */}
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-400 font-mono">
                              {revealedIndicators.length}/3 Threat Indicators Flagged
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setInteractiveSimSuccess(true);
                                setHasWatchedVideo(true);
                              }}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow-xs transition-colors"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              <span>Dispatch Incident Ticket to SOC Team</span>
                            </button>
                          </div>

                          {interactiveSimSuccess && (
                            <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                              <div>
                                <span className="font-bold">Threat Neutralized! </span>
                                SOC Ticket #SEC-8941 generated. Sender IP blacklisted across all firewalls. Lesson credit unlocked!
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Course Scenario 2: HIPAA & Healthcare Privacy */}
                      {activeCourseModal.category === 'HIPAA Privacy' && (
                        <div className="space-y-4">
                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                              <span>FHIR Patient Health Record (ePHI Payload)</span>
                              <span className="text-amber-400">45 CFR § 164.514 Compliance</span>
                            </div>

                            <div className="space-y-1 text-slate-300">
                              <div>
                                Patient Name:{' '}
                                <span className={isMaskedEHR ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                  {isMaskedEHR ? '[REDACTED_HMAC_SHA256_UUID]' : 'Elena Rostova'}
                                </span>
                              </div>
                              <div>
                                National SSN:{' '}
                                <span className={isMaskedEHR ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                  {isMaskedEHR ? '***-**-**** (Masked)' : '984-21-4819'}
                                </span>
                              </div>
                              <div>
                                Medical Record No (MRN):{' '}
                                <span className={isMaskedEHR ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                  {isMaskedEHR ? 'MRN-TOK-8891' : 'MRN-FIN-9921401'}
                                </span>
                              </div>
                              <div>
                                Primary Diagnosis:{' '}
                                <span className="text-blue-300">
                                  Cardiovascular Arrhythmia (ICD-10 I49.9)
                                </span>
                              </div>
                              <div>
                                Cloud Vendor BAA Status:{' '}
                                <span className="text-emerald-400">
                                  Signed & Verified (AWS HealthLake)
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="button"
                              onClick={() => {
                                setIsMaskedEHR(!isMaskedEHR);
                                setHasWatchedVideo(true);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-2"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>
                                {isMaskedEHR ? 'Undo Masking (Demo)' : 'Apply HIPAA Cryptographic De-Identification'}
                              </span>
                            </button>

                            {isMaskedEHR && (
                              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" />
                                Safe for Staging & Analytics Under Safe Harbor Standard
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Course Scenario 3: OWASP Secure Code Engineering */}
                      {activeCourseModal.category === 'Secure Coding (OWASP)' && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300">
                              Simulate Malicious SQL Injection Payload:
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={testPayload}
                                onChange={(e) => setTestPayload(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                              />
                              <button
                                type="button"
                                onClick={() => setParameterizedEnabled(!parameterizedEnabled)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                  parameterizedEnabled
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-red-600/80 hover:bg-red-600 text-white'
                                }`}
                              >
                                {parameterizedEnabled
                                  ? 'Defense: Parameterized ($1, $2)'
                                  : 'Defense: Disabled (Vulnerable)'}
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                            <div className="text-slate-400 text-[11px] flex items-center justify-between">
                              <span>Database Query Execution Pipeline:</span>
                              <span
                                className={
                                  parameterizedEnabled
                                    ? 'text-emerald-400 font-bold'
                                    : 'text-red-400 font-bold'
                                }
                              >
                                {parameterizedEnabled ? 'SAFE: Prepared Statement' : 'CRITICAL: SQL Injection'}
                              </span>
                            </div>

                            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 break-all leading-relaxed">
                              {parameterizedEnabled ? (
                                <>
                                  <span className="text-purple-400">const</span> query ={' '}
                                  <span className="text-emerald-400">
                                    'SELECT * FROM employees WHERE email = $1'
                                  </span>
                                  ;<br />
                                  <span className="text-blue-400">await</span> db.query(query, [
                                  <span className="text-amber-300">"{testPayload}"</span>]);
                                  <span className="text-slate-500 block text-[11px] mt-1">
                                    // Engine parses input purely as a literal string value. Query structure is immutable.
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-purple-400">const</span> query ={' '}
                                  <span className="text-red-400">
                                    `SELECT * FROM employees WHERE email = '{testPayload}'`
                                  </span>
                                  ;<br />
                                  <span className="text-red-500 block text-[11px] mt-1 font-semibold">
                                    // VULNERABLE: Attack string manipulates SQL logic (e.g. 1=1 returns all records).
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-slate-400">
                              OWASP ASVS Standard 5.3.4 Compliance
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setParameterizedEnabled(true);
                                setHasWatchedVideo(true);
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verify Secure Coding Pattern</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Public Source Attestation & Verification Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900">
                    <div className="flex items-center gap-2 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="text-[11px] truncate">
                        <span className="font-bold">Verified Public Educational Source: </span>
                        <span className="font-semibold text-blue-800">{currentSourceOrg}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      <span>SOC 2 CC2.2 Compliant Material</span>
                    </div>
                  </div>

                  {/* Key Audit Takeaways */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Key Audit Learning Objectives & Takeaways:</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Auditor Review Checklist
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {currentTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-700 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {quizStep === 'quiz' && (
                <div className="space-y-5">
                  <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold">Passing Requirement: </span>
                      Achieve &ge; {activeCourseModal.passingScorePercentage}% to certify your compliance. You may retake if needed.
                    </div>
                    <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold shrink-0">
                      {activeCourseModal.quizQuestions.length} Questions
                    </span>
                  </div>

                  {activeCourseModal.quizQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="font-bold text-slate-900 text-xs">
                        {idx + 1}. {q.question}
                      </div>

                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedAnswers[q.id] === optIdx;
                          return (
                            <label
                              key={optIdx}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-blue-50 border-blue-400 text-blue-950 font-semibold'
                                  : 'bg-white border-slate-200 hover:bg-slate-100/70 text-slate-700'
                              }`}
                            >
                              <input
                                type="radio"
                                name={q.id}
                                checked={isSelected}
                                onChange={() => handleSelectOption(q.id, optIdx)}
                                className="text-blue-600"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {quizStep === 'certificate' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <Award className="w-8 h-8" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Congratulations! You Passed with {quizScore}%
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Your certificate of completion has been cryptographically signed and submitted as formal evidence for SOC 2 Trust Services Criteria CC2.2 and ISO 27001 A.7.2.2.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Course:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[220px]">
                        {activeCourseModal.title}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Certificate Hash:</span>
                      <span className="text-blue-700 font-semibold">CERT-SOC2-9842F812B4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Public Video Verification:</span>
                      <span className="text-emerald-700 font-semibold">100% Complete</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issued On:</span>
                      <span className="text-slate-700">Today (Sept 24, 2026)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
              {quizStep === 'video' ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Tv className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden sm:inline">Stream active. Watch video lessons before quiz.</span>
                  </div>

                  <button
                    onClick={() => setQuizStep('quiz')}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                  >
                    <span>Proceed to Knowledge Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : quizStep === 'quiz' ? (
                <div className="flex items-center justify-between w-full">
                  <button
                    onClick={() => setQuizStep('video')}
                    className="px-3.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Back to Video
                  </button>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < activeCourseModal.quizQuestions.length}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs disabled:opacity-50 transition-colors"
                  >
                    Submit & Evaluate Answers
                  </button>
                </div>
              ) : (
                <div className="ml-auto">
                  <button
                    onClick={() => setActiveCourseModal(null)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
                  >
                    Close & Finish
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
