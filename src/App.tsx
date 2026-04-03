import React, { useState, useEffect, useRef } from 'react';

interface User {
  name: string;
  email: string;
  disability: string;
  biometricEnabled: boolean;
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  connections: string[];
}

interface GoalTask {
  id: string;
  title: string;
  completed: boolean;
  subTasks: GoalTask[];
}

type AppState = 'login' | 'dashboard' | 'ai-terminal' | 'touch-typing' | 'mind-map' | 'goal-breakdown' | 'progress-track';

export default function App() {
  const [currentView, setCurrentView] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [faceRecognitionActive, setFaceRecognitionActive] = useState(false);
  const [aiTerminalInput, setAiTerminalInput] = useState('');
  const [aiTerminalOutput, setAiTerminalOutput] = useState<string[]>(['Inclusive Learning Platform AI Terminal v2.0', 'Type "help" for available commands', '']);
  const [typingLesson, setTypingLesson] = useState(1);
  const [typingProgress, setTypingProgress] = useState(0);
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([
    { id: '1', text: 'Main Goal', x: 400, y: 300, connections: ['2', '3'] },
    { id: '2', text: 'Task 1', x: 200, y: 200, connections: ['1'] },
    { id: '3', text: 'Task 2', x: 600, y: 200, connections: ['1'] }
  ]);
  const [goalTasks, setGoalTasks] = useState<GoalTask[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');

  // Login Form States
  const [loginName, setLoginName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginProfile, setLoginProfile] = useState('');

  // Global Key Listener for Touch Typing Mode
  useEffect(() => {
    if (currentView !== 'touch-typing') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && e.target === document.body) e.preventDefault();
      
      if (e.key.length === 1) {
        const targetText = "The quick brown fox jumps over the lazy dog";
        if (targetText[typingProgress] === e.key || targetText[typingProgress] === e.key.toLowerCase()) {
          setTypingProgress(prev => {
            const next = prev + 1;
            if (next >= targetText.length) {
              setTypingLesson(l => Math.min(l + 1, 10));
              return 0;
            }
            return next;
          });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, typingProgress]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      speechRecognitionRef.current = new SpeechRecognition();
      speechRecognitionRef.current.continuous = true;
      speechRecognitionRef.current.interimResults = true;
      speechRecognitionRef.current.lang = 'en-US';

      speechRecognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeechText(transcript);
      };

      speechRecognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    }
  }, []);

  // Face Recognition Simulation
  const startFaceRecognition = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setFaceRecognitionActive(true);
        
        // Simulate face recognition after 3 seconds
        setTimeout(() => {
          setFaceRecognitionActive(false);
          stream.getTracks().forEach(track => track.stop());
          
          // Auto-fill user data
          setUser({
            name: 'Alex Johnson',
            email: 'alex.johnson@student.edu',
            disability: 'dyspraxia',
            biometricEnabled: true
          });
          setCurrentView('dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  // Touch ID Simulation
  const handleTouchIdAuth = () => {
    // Simulate Touch ID authentication
    setTimeout(() => {
      setUser({
        name: 'Alex Johnson',
        email: 'alex.johnson@student.edu',
        disability: 'dyspraxia',
        biometricEnabled: true
      });
      setCurrentView('dashboard');
    }, 1500);
  };

  // Magic Link Login
  const handleMagicLinkLogin = () => {
    // Simulate magic link sent
    setAiTerminalOutput(prev => [...prev, '📧 Magic link sent to your email! Check your inbox.', '']);
    setTimeout(() => {
      setUser({
        name: 'Alex Johnson',
        email: 'alex.johnson@student.edu',
        disability: 'dyspraxia',
        biometricEnabled: false
      });
      setCurrentView('dashboard');
    }, 3000);
  };

  // AI Terminal Commands
  const handleAiTerminalCommand = (command: string) => {
    const newOutput = [...aiTerminalOutput, `> ${command}`];
    
    switch (command.toLowerCase().trim()) {
      case 'help':
        newOutput.push(
          'Available commands:',
          '  navigate <page> - Navigate to different sections',
          '  schedule - View your daily schedule',
          '  remind <task> - Set a reminder',
          '  type <text> - Speak the text aloud',
          '  focus <minutes> - Start a focus timer',
          '  break - Take a mindful break',
          '  clear - Clear the terminal'
        );
        break;
      case 'schedule':
        newOutput.push(
          'Today\'s Schedule:',
          '  9:00 AM - Morning check-in',
          '  10:00 AM - Touch typing practice',
          '  2:00 PM - Mind mapping session',
          '  4:00 PM - Goal breakdown workshop'
        );
        break;
      case 'break':
        newOutput.push(
          '🌱 Mindful Break Time!',
          '  • Close your eyes for 30 seconds',
          '  • Take 5 deep breaths',
          '  • Stretch your arms and shoulders',
          '  • Drink some water'
        );
        break;
      case 'clear':
        setAiTerminalOutput(['Inclusive Learning Platform AI Terminal v2.0', '']);
        setAiTerminalInput('');
        return;
      default:
        if (command.startsWith('navigate ')) {
          const page = command.replace('navigate ', '').trim();
          const pageMap: Record<string, AppState> = {
            'typing': 'touch-typing',
            'mindmap': 'mind-map',
            'goals': 'goal-breakdown',
            'terminal': 'ai-terminal',
            'dashboard': 'dashboard'
          };
          if (pageMap[page]) {
            setCurrentView(pageMap[page]);
            newOutput.push(`Navigating to ${page}... ✓`);
          } else {
            newOutput.push(`Unknown page: ${page}. Try "help" for available pages.`);
          }
        } else if (command.startsWith('remind ')) {
          const reminder = command.replace('remind ', '').trim();
          newOutput.push(`⏰ Reminder set: "${reminder}"`);
        } else if (command.startsWith('type ')) {
          const text = command.replace('type ', '').trim();
          // Simulate text-to-speech
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.8; // Slower for better comprehension
            speechSynthesis.speak(utterance);
            newOutput.push(`🗣️ Speaking: "${text}"`);
          }
        } else if (command.startsWith('focus ')) {
          const minutes = command.replace('focus ', '').trim();
          newOutput.push(`🎯 Focus timer set for ${minutes} minutes. Stay focused!`);
        } else {
          newOutput.push(`Command not recognized: "${command}". Type "help" for available commands.`);
        }
    }
    
    newOutput.push('');
    setAiTerminalOutput(newOutput);
    setAiTerminalInput('');
  };

  // Speech Recognition Toggle
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      speechRecognitionRef.current?.start();
      setIsRecording(true);
      setSpeechText('');
    }
  };

  // Touch Typing Progress
  const handleTypingKeyPress = (key: string) => {
    const targetText = "The quick brown fox jumps over the lazy dog";
    if (targetText[typingProgress] === key) {
      setTypingProgress(prev => prev + 1);
      if (typingProgress + 1 >= targetText.length) {
        setTypingLesson(prev => Math.min(prev + 1, 10));
        setTypingProgress(0);
      }
    }
  };

  // Mind Map Node Management
  const addMindMapNode = () => {
    const newNode: MindMapNode = {
      id: Date.now().toString(),
      text: 'New Idea',
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      connections: []
    };
    setMindMapNodes(prev => [...prev, newNode]);
  };

  const removeMindMapNode = (nodeId: string) => {
    setMindMapNodes(prev => prev.filter(node => node.id !== nodeId));
  };

  // Goal Breakdown with AI
  const breakDownGoal = (goal: string) => {
    // Simulate AI goal breakdown
    const brokenTasks: GoalTask[] = [
      {
        id: '1',
        title: 'Research Phase',
        completed: false,
        subTasks: [
          { id: '1-1', title: 'Gather requirements', completed: false, subTasks: [] },
          { id: '1-2', title: 'Study best practices', completed: false, subTasks: [] },
          { id: '1-3', title: 'Interview stakeholders', completed: false, subTasks: [] }
        ]
      },
      {
        id: '2',
        title: 'Planning Phase',
        completed: false,
        subTasks: [
          { id: '2-1', title: 'Create timeline', completed: false, subTasks: [] },
          { id: '2-2', title: 'Allocate resources', completed: false, subTasks: [] },
          { id: '2-3', title: 'Set milestones', completed: false, subTasks: [] }
        ]
      },
      {
        id: '3',
        title: 'Implementation Phase',
        completed: false,
        subTasks: [
          { id: '3-1', title: 'Start with prototype', completed: false, subTasks: [] },
          { id: '3-2', title: 'Regular progress checks', completed: false, subTasks: [] },
          { id: '3-3', title: 'Quality testing', completed: false, subTasks: [] }
        ]
      }
    ];
    setGoalTasks(brokenTasks);
  };

  const toggleTaskCompletion = (taskId: string, parentId?: string) => {
    if (parentId) {
      setGoalTasks(prev => prev.map(task => 
        task.id === parentId 
          ? {
              ...task,
              subTasks: task.subTasks.map(subTask =>
                subTask.id === taskId ? { ...subTask, completed: !subTask.completed } : subTask
              )
            }
          : task
      ));
    } else {
      setGoalTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      ));
    }
  };

  // Login Page Component
  const LoginPage = () => (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#3C2415' }}>
            Inclusive Learning Platform
          </h1>
          <p className="text-xl md:text-2xl" style={{ color: '#3C2415' }}>
            Designed with care for students with dyspraxia and other learning differences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Biometric Authentication */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3C2415' }}>
              🔐 Biometric Login
            </h2>
            
            {/* Face Recognition */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#3C2415' }}>
                Face Recognition
              </h3>
              <div className="camera-container w-full h-64 mb-4 relative bg-gray-800 rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover absolute top-0 left-0 z-10"
                  style={{ opacity: faceRecognitionActive ? 1 : 0 }}
                />
                {!faceRecognitionActive && (
                  <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 bg-gray-800 z-0">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">📷</div>
                      <p>Camera ready for face recognition</p>
                    </div>
                  </div>
                )}
                <div className="camera-overlay"></div>
              </div>
              <button
                onClick={startFaceRecognition}
                className="magnetic-button w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl text-lg transition-all duration-300"
                style={{ backgroundColor: '#4A90E2' }}
              >
                {faceRecognitionActive ? '🔄 Recognizing Face...' : '👤 Start Face Recognition'}
              </button>
            </div>

            {/* Touch ID */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#3C2415' }}>
                Touch ID Authentication
              </h3>
              <button
                onClick={handleTouchIdAuth}
                className="magnetic-button w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-3 transition-all duration-300"
                style={{ backgroundColor: '#4A90E2' }}
              >
                <span className="text-2xl">👆</span>
                Touch ID Authentication
              </button>
            </div>

            {/* Magic Link */}
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: '#3C2415' }}>
                Magic Link (Password-Free)
              </h3>
              <button
                onClick={handleMagicLinkLogin}
                className="magnetic-button w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-3 transition-all duration-300"
                style={{ backgroundColor: '#4A90E2' }}
              >
                <span className="text-2xl">✉️</span>
                Send Login Link to Email
              </button>
            </div>
          </div>

          {/* User Details & Disability Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#3C2415' }}>
              👤 Your Details
            </h2>
            
            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2" style={{ color: '#3C2415' }}>
                Full Name
              </label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                style={{ minHeight: '44px' }}
              />
            </div>

            {/* Email Input */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2" style={{ color: '#3C2415' }}>
                Email Address
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your.email@school.edu"
                className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-all"
                style={{ minHeight: '44px' }}
              />
            </div>

            {/* Disability Selection */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3" style={{ color: '#3C2415' }}>
                Select Your Learning Profile
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: 'hearing', label: '🔇 Hearing Impairment', desc: 'Enhanced visual feedback and captions' },
                  { id: 'visual', label: '👁️ Visually Impaired', desc: 'Screen reader friendly with high contrast' },
                  { id: 'dyspraxia', label: '🤲 Dyspraxia', desc: 'Larger targets and reduced motor demands' },
                  { id: 'adhd', label: '⚡ ADHD', desc: 'Focus aids and break reminders' }
                ].map((disability) => (
                  <button
                    key={disability.id}
                    onClick={() => setLoginProfile(disability.id)}
                    className={`magnetic-button p-4 text-left border-2 rounded-xl transition-all duration-300 ${
                      loginProfile === disability.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div className="font-semibold text-lg" style={{ color: '#3C2415' }}>
                      {disability.label}
                    </div>
                    <div className="text-sm opacity-70" style={{ color: '#3C2415' }}>
                      {disability.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (loginName && loginEmail && loginProfile) {
                  setUser({
                    name: loginName,
                    email: loginEmail,
                    disability: loginProfile,
                    biometricEnabled: false
                  });
                  setCurrentView('dashboard');
                } else {
                  alert('Please fill out all details!');
                }
              }}
              className="magnetic-button w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl text-xl mt-4 shadow-lg transition-all"
              style={{ backgroundColor: '#22c55e' }}
            >
              🚀 Login Now
            </button>
          </div>
        </div>

        {/* History Card */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#3C2415' }}>
            📚 Pick Up Where You Left
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Touch Typing - Lesson 5', progress: 75, time: 'Last accessed: 2 hours ago' },
              { title: 'Mind Map: Science Project', progress: 40, time: 'Last accessed: Yesterday' },
              { title: 'Goal: Learn JavaScript', progress: 60, time: 'Last accessed: 3 days ago' }
            ].map((item, index) => (
              <div
                key={index}
                className="magnetic-button p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-300"
              >
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#3C2415' }}>
                  {item.title}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%`, backgroundColor: '#4A90E2' }}
                  ></div>
                </div>
                <p className="text-sm" style={{ color: '#3C2415' }}>{item.progress}% complete</p>
                <p className="text-xs opacity-60 mt-1" style={{ color: '#3C2415' }}>{item.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Dashboard Component
  const Dashboard = () => (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#3C2415' }}>
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-lg" style={{ color: '#3C2415' }}>
              Your personalized learning dashboard for today
            </p>
          </div>
          <button
            onClick={() => setCurrentView('login')}
            className="magnetic-button mt-4 md:mt-0 px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-blue-500 transition-all"
            style={{ color: '#3C2415' }}
          >
            🚪 Sign Out
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: '🤖 AI Assistant',
              desc: 'Natural language commands and speech recognition',
              action: () => setCurrentView('ai-terminal'),
              color: 'from-purple-500 to-pink-500'
            },
            {
              title: '⌨️ Touch Typing',
              desc: 'Master typing with the TypeWiz learning system',
              action: () => setCurrentView('touch-typing'),
              color: 'from-blue-500 to-cyan-500'
            },
            {
              title: '🧠 Mind Mapping',
              desc: 'Visual organization with Coggle-style interface',
              action: () => setCurrentView('mind-map'),
              color: 'from-green-500 to-emerald-500'
            },
            {
              title: '🎯 Goal Breakdown',
              desc: 'AI-powered task decomposition',
              action: () => setCurrentView('goal-breakdown'),
              color: 'from-orange-500 to-red-500'
            },
            {
              title: '🎙️ Speech Input',
              desc: 'Dragon Professional quality speech-to-text',
              action: toggleSpeechRecognition,
              color: 'from-indigo-500 to-purple-500'
            },
            {
              title: '📊 Progress Track',
              desc: 'Visual progress and achievements',
              action: () => setCurrentView('progress-track'),
              color: 'from-teal-500 to-blue-500'
            }
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="magnetic-button p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-left"
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: '#3C2415' }}>
                {item.title}
              </h3>
              <p style={{ color: '#3C2415' }}>{item.desc}</p>
              {item.title.includes('Speech') && (
                <div className="mt-3">
                  <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'} inline-block mr-2`}></div>
                  <span className="text-sm" style={{ color: '#3C2415' }}>
                    {isRecording ? 'Recording...' : 'Click to start'}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Speech Recognition Display */}
        {speechText && (
          <div className="mt-8 bg-white rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-3" style={{ color: '#3C2415' }}>
              🎙️ Speech Recognition (Dragon Professional)
            </h3>
            <div className="bg-gray-100 rounded-xl p-4 min-h-[100px]">
              <p className="text-lg" style={{ color: '#3C2415' }}>
                {speechText || 'Start speaking to see your words appear here...'}
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={toggleSpeechRecognition}
                className="magnetic-button px-6 py-3 rounded-xl text-white font-semibold flex-1"
                style={{ backgroundColor: isRecording ? '#ef4444' : '#4A90E2' }}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([speechText], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Speech_Note_${new Date().toLocaleDateString().replace(/\//g, '-')}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="magnetic-button px-6 py-3 rounded-xl text-white font-semibold flex-1"
                style={{ backgroundColor: '#10B981' }}
              >
                ⬇️ Download Note
              </button>
              <button
                onClick={() => setSpeechText('')}
                className="magnetic-button px-6 py-3 rounded-xl text-white font-semibold flex-1"
                style={{ backgroundColor: '#F59E0B' }}
              >
                🧹 Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // AI Terminal Component
  const AiTerminal = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#3C2415' }}>
            🤖 AI Assistant Terminal
          </h1>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="magnetic-button px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="ai-terminal h-96 mb-4 overflow-y-auto">
          {aiTerminalOutput.map((line, index) => (
            <div key={index} className="mb-1 whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>

        <div className="flex items-center bg-gray-900 rounded-xl p-4">
          <span className="text-green-400 mr-2 font-mono">{'>'}</span>
          <input
            type="text"
            value={aiTerminalInput}
            onChange={(e) => setAiTerminalInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAiTerminalCommand(aiTerminalInput);
              }
            }}
            className="ai-input flex-1 text-lg font-mono"
            placeholder="Enter natural language command..."
            autoFocus
          />
          <button
            onClick={() => handleAiTerminalCommand(aiTerminalInput)}
            className="magnetic-button ml-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            Execute
          </button>
        </div>

        <div className="mt-6 bg-white rounded-xl p-4">
          <h3 className="font-bold mb-2" style={{ color: '#3C2415' }}>
            💡 Example Commands:
          </h3>
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {[
              'help - Show all commands',
              'navigate typing - Go to typing practice',
              'remind stretch in 30 minutes',
              'type hello world - Speak text aloud',
              'focus 25 - Start 25-min focus timer',
              'schedule - View today\'s schedule',
              'break - Mindful break exercises'
            ].map((cmd, index) => (
              <div key={index} className="font-mono bg-gray-100 p-2 rounded">
                {cmd}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Touch Typing Component
  const TouchTyping = () => {
    const targetText = "The quick brown fox jumps over the lazy dog";
    const keyboardLayout = [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm']
    ];

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold" style={{ color: '#3C2415' }}>
              ⌨️ TypeWiz - Touch Typing Mastery
            </h1>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="magnetic-button px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Progress */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold" style={{ color: '#3C2415' }}>
                Lesson {typingLesson} of 10
              </h2>
              <span className="text-lg font-semibold" style={{ color: '#3C2415' }}>
                {Math.round((typingProgress / targetText.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="h-4 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(typingProgress / targetText.length) * 100}%`,
                  backgroundColor: '#4A90E2'
                }}
              ></div>
            </div>
            <div className="text-center">
              <p className="text-lg mb-2" style={{ color: '#3C2415' }}>
                Type the following text:
              </p>
              <div className="text-2xl font-mono p-4 bg-gray-100 rounded-xl">
                {targetText.split('').map((char, index) => (
                  <span
                    key={index}
                    className={`${
                      index < typingProgress
                        ? 'text-green-600 bg-green-100'
                        : index === typingProgress
                        ? 'text-blue-600 bg-blue-100 animate-pulse'
                        : 'text-gray-600'
                    } px-1 rounded`}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Virtual Keyboard */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-4" style={{ color: '#3C2415' }}>
              Virtual Keyboard - Click the keys or use your physical keyboard
            </h3>
            <div className="space-y-3">
              {keyboardLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-2">
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleTypingKeyPress(key)}
                      className={`keyboard-key bg-gray-200 hover:bg-blue-500 hover:text-white text-lg font-semibold ${
                        targetText[typingProgress] === key ? 'bg-blue-200 border-2 border-blue-500' : ''
                      }`}
                      style={{ minWidth: '44px', minHeight: '44px' }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              ))}
            </div>
            
            {/* Space bar */}
            <div className="flex justify-center mt-3">
              <button
                onClick={() => handleTypingKeyPress(' ')}
                className="keyboard-key bg-gray-200 hover:bg-blue-500 hover:text-white text-lg font-semibold px-8"
                style={{ minHeight: '44px', minWidth: '200px' }}
              >
                SPACE
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-lg" style={{ color: '#3C2415' }}>
                💡 <strong>Tip:</strong> Focus on accuracy first, then speed. Proper finger placement is key!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mind Map Component
  const MindMap = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#3C2415' }}>
            🧠 Interactive Mind Map
          </h1>
          <div className="flex gap-3">
            <button
              onClick={addMindMapNode}
              className="magnetic-button px-4 py-2 text-white rounded-xl hover:shadow-lg transition-all"
              style={{ backgroundColor: '#4A90E2' }}
            >
              ➕ Add Node
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="magnetic-button px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#3C2415' }}>
              Your Ideas Canvas
            </h2>
            <div className="text-sm" style={{ color: '#3C2415' }}>
              💡 Drag nodes to move • Edit text directly • Hover for options
            </div>
          </div>
          
          <div className="relative h-[600px] rounded-xl border-2 border-gray-200 overflow-hidden" style={{ 
            backgroundColor: '#f8fafc',
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}>
            {/* SVG for curved connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {mindMapNodes.map(node =>
                node.connections.map(connectionId => {
                  const connectedNode = mindMapNodes.find(n => n.id === connectionId);
                  if (!connectedNode) return null;
                  
                  // Calculate bezier curve points
                  const midX = (node.x + connectedNode.x) / 2;
                  
                  return (
                    <path
                      key={`${node.id}-${connectionId}`}
                      d={`M ${node.x} ${node.y} C ${midX} ${node.y}, ${midX} ${connectedNode.y}, ${connectedNode.x} ${connectedNode.y}`}
                      stroke="#4A90E2"
                      strokeWidth="3"
                      fill="none"
                      className="opacity-60 transition-all duration-300"
                    />
                  );
                })
              )}
            </svg>

            {/* Mind Map Nodes */}
            {mindMapNodes.map((node, index) => (
              <div
                key={node.id}
                className="absolute shadow-lg cursor-move select-none group transition-shadow hover:shadow-2xl"
                style={{
                  left: node.x - 75,
                  top: node.y - 30,
                  width: '150px',
                  backgroundColor: index === 0 ? '#4A90E2' : 'white',
                  borderRadius: '12px',
                  border: index === 0 ? 'none' : '2px solid #e2e8f0',
                  color: index === 0 ? 'white' : '#3C2415',
                  zIndex: index === 0 ? 10 : 1
                }}
                draggable
                onDragEnd={(e) => {
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (rect) {
                    const newX = e.clientX - rect.left;
                    const newY = e.clientY - rect.top;
                    setMindMapNodes(prev =>
                      prev.map(n => n.id === node.id ? { ...n, x: newX, y: newY } : n)
                    );
                  }
                }}
              >
                <div className="p-3">
                  <input
                    type="text"
                    value={node.text}
                    onChange={(e) => {
                      setMindMapNodes(prev =>
                        prev.map(n => n.id === node.id ? { ...n, text: e.target.value } : n)
                      );
                    }}
                    className={`w-full text-center font-bold bg-transparent border-none focus:outline-none focus:ring-0 ${index === 0 ? 'text-white placeholder-blue-200' : 'text-gray-800'}`}
                    placeholder="Idea..."
                    autoFocus={node.text === 'New Idea'}
                  />
                </div>
                {index !== 0 && (
                  <button
                    onClick={() => removeMindMapNode(node.id)}
                    className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 flex items-center justify-center shadow-md"
                    title="Delete Node"
                  >
                    ×
                  </button>
                )}
                <button
                    onClick={() => {
                      const rootNode = mindMapNodes[0];
                      if(rootNode && !node.connections.includes(rootNode.id) && index !== 0) {
                         setMindMapNodes(prev => prev.map(n => {
                            if(n.id === node.id) return {...n, connections: [...n.connections, rootNode.id]};
                            if(n.id === rootNode.id && !n.connections.includes(node.id)) return {...n, connections: [...n.connections, node.id]};
                            return n;
                         }));
                      }
                    }}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 flex items-center justify-center shadow-md"
                    title="Connect to Main Idea"
                  >
                    🔗
                  </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Goal Breakdown Component
  const GoalBreakdown = () => {
    const [newGoal, setNewGoal] = useState('');

    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold" style={{ color: '#3C2415' }}>
              🎯 AI Goal Breakdown Assistant
            </h1>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="magnetic-button px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Goal Input */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#3C2415' }}>
              Enter Your Big Goal
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., 'Learn web development and build a portfolio' or 'Complete my science project'"
                className="flex-1 p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                style={{ color: '#3C2415', minHeight: '44px' }}
              />
              <button
                onClick={() => {
                  if (newGoal.trim()) {
                    breakDownGoal(newGoal);
                    setNewGoal('');
                  }
                }}
                className="magnetic-button px-6 py-4 text-white rounded-xl font-semibold text-lg"
                style={{ backgroundColor: '#4A90E2', minHeight: '44px' }}
              >
                🤖 Break Down
              </button>
            </div>
            <p className="text-sm mt-2 opacity-70" style={{ color: '#3C2415' }}>
              💡 Our AI will analyze your goal and break it into manageable, smaller tasks with clear steps
            </p>
          </div>

          {/* Broken Down Tasks */}
          {goalTasks.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#3C2415' }}>
                📋 Your Goal Breakdown
              </h2>
              
              <div className="space-y-6">
                {goalTasks.map((phase, phaseIndex) => (
                  <div key={phase.id} className="border-l-4 border-blue-500 pl-6">
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => toggleTaskCompletion(phase.id)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          phase.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {phase.completed && '✓'}
                      </button>
                      <h3 className={`text-xl font-bold ${phase.completed ? 'line-through opacity-60' : ''}`} style={{ color: '#3C2415' }}>
                        Phase {phaseIndex + 1}: {phase.title}
                      </h3>
                    </div>
                    
                    <div className="ml-11 space-y-3">
                      {phase.subTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`task-card flex items-center gap-3 p-3 rounded-xl border ${
                            task.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          } hover:shadow-md transition-all`}
                        >
                          <button
                            onClick={() => toggleTaskCompletion(task.id, phase.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-blue-500'
                            }`}
                          >
                            {task.completed && '✓'}
                          </button>
                          <span className={`flex-1 ${task.completed ? 'line-through opacity-60' : ''}`} style={{ color: '#3C2415' }}>
                            {task.title}
                          </span>
                        </div>
                      ))}
                      
                      {/* Add new sub-task button */}
                      <button
                        onClick={() => {
                          const newTask: GoalTask = {
                            id: `${phase.id}-${Date.now()}`,
                            title: 'New task',
                            completed: false,
                            subTasks: []
                          };
                          setGoalTasks(prev =>
                            prev.map(p =>
                              p.id === phase.id
                                ? { ...p, subTasks: [...p.subTasks, newTask] }
                                : p
                            )
                          );
                        }}
                        className="magnetic-button ml-9 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all"
                        style={{ minHeight: '44px' }}
                      >
                        ➕ Add New Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Summary */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#3C2415' }}>
                  📊 Progress Summary
                </h3>
                {(() => {
                  const totalTasks = goalTasks.reduce((acc, phase) => acc + 1 + phase.subTasks.length, 0);
                  const completedTasks = goalTasks.reduce((acc, phase) => 
                    acc + (phase.completed ? 1 : 0) + phase.subTasks.filter(task => task.completed).length, 0
                  );
                  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  
                  return (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span style={{ color: '#3C2415' }}>
                          {completedTasks} of {totalTasks} tasks completed
                        </span>
                        <span className="font-bold text-lg" style={{ color: '#4A90E2' }}>
                          {progressPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${progressPercentage}%`,
                            backgroundColor: '#4A90E2'
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Progress Track Component
  const ProgressTrack = () => (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#3C2415' }}>
            📊 Progress Track
          </h1>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="magnetic-button px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3C2415' }}>Your Achievements</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
              <div className="text-2xl mb-1">🎯</div>
              <h3 className="font-bold text-yellow-800">Goal Crusher</h3>
              <p className="text-sm text-yellow-700">You completed 5 goals this week!</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400">
              <div className="text-2xl mb-1">⌨️</div>
              <h3 className="font-bold text-blue-800">Type Master</h3>
              <p className="text-sm text-blue-700">Reached Lesson {typingLesson} in Touch Typing!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#3C2415' }}>Activity History</h2>
          <div className="space-y-4">
             <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🧠</span>
                <div>
                  <h4 className="font-semibold text-gray-800">Mind Map Created</h4>
                  <p className="text-sm text-gray-500">Today at 10:30 AM</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl">🤖</span>
                <div>
                  <h4 className="font-semibold text-gray-800">AI Command Used</h4>
                  <p className="text-sm text-gray-500">Yesterday at 2:15 PM</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render logic
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#B0E0E6' }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {currentView === 'login' && <LoginPage />}
      {currentView === 'dashboard' && <Dashboard />}
      {currentView === 'ai-terminal' && <AiTerminal />}
      {currentView === 'touch-typing' && <TouchTyping />}
      {currentView === 'mind-map' && <MindMap />}
      {currentView === 'goal-breakdown' && <GoalBreakdown />}
      {currentView === 'progress-track' && <ProgressTrack />}
    </div>
  );
}
