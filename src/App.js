import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, Link } from 'react-router-dom';
import { loadManual, getAvailableManuals } from './dataLoader';

// --- Helper: Format sloka text with line breaks ---
const formatSloka = (text) => {
  return text.replace(/॥/g, '$&\n');
};

// --- Helper: Icon Components ---
const MenuIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const XIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const ImageIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
    <circle cx="9" cy="9" r="2"/>
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const MantraIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-1.5 0-3 1-3 2.5 0 1 0.5 1.5 1 2-0.5 0.5-1 1-1 2 0 1.5 1.5 2.5 3 2.5s3-1 3-2.5c0-1-0.5-1.5-1-2 0.5-0.5 1-1 1-2C15 3 13.5 2 12 2z"/>
    <path d="M8 7c-1 0-2 0.5-2 1.5 0 0.5 0.3 1 0.7 1.3-0.4 0.3-0.7 0.8-0.7 1.3 0 1 1 1.5 2 1.5s2-0.5 2-1.5c0-0.5-0.3-1-0.7-1.3 0.4-0.3 0.7-0.8 0.7-1.3C10 7.5 9 7 8 7z"/>
    <path d="M16 7c-1 0-2 0.5-2 1.5 0 0.5 0.3 1 0.7 1.3-0.4 0.3-0.7 0.8-0.7 1.3 0 1 1 1.5 2 1.5s2-0.5 2-1.5c0-0.5-0.3-1-0.7-1.3 0.4-0.3 0.7-0.8 0.7-1.3C18 7.5 17 7 16 7z"/>
    <path d="M6 12c-0.8 0-1.5 0.3-1.5 1 0 0.3 0.2 0.6 0.5 0.8-0.3 0.2-0.5 0.5-0.5 0.8 0 0.7 0.7 1 1.5 1s1.5-0.3 1.5-1c0-0.3-0.2-0.6-0.5-0.8 0.3-0.2 0.5-0.5 0.5-0.8C7.5 12.3 6.8 12 6 12z"/>
    <path d="M18 12c-0.8 0-1.5 0.3-1.5 1 0 0.3 0.2 0.6 0.5 0.8-0.3 0.2-0.5 0.5-0.5 0.8 0 0.7 0.7 1 1.5 1s1.5-0.3 1.5-1c0-0.3-0.2-0.6-0.5-0.8 0.3-0.2 0.5-0.5 0.5-0.8C19.5 12.3 18.8 12 18 12z"/>
    <path d="M10 16c-1.2 0-2.5 0.5-2.5 1.5 0 0.5 0.4 1 1 1.3-0.6 0.3-1 0.8-1 1.3 0 1 1.3 1.5 2.5 1.5s2.5-0.5 2.5-1.5c0-0.5-0.4-1-1-1.3 0.6-0.3 1-0.8 1-1.3C12.5 16.5 11.2 16 10 16z"/>
    <path d="M14 16c-1.2 0-2.5 0.5-2.5 1.5 0 0.5 0.4 1 1 1.3-0.6 0.3-1 0.8-1 1.3 0 1 1.3 1.5 2.5 1.5s2.5-0.5 2.5-1.5c0-0.5-0.4-1-1-1.3 0.6-0.3 1-0.8 1-1.3C16.5 16.5 15.2 16 14 16z"/>
  </svg>
);

const GuruIcon = (props) => (
<svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c-1.5 0-3 1-3 2.5 0 1 0.5 1.5 1 2-0.5 0.5-1 1-1 2 0 1.5 1.5 2.5 3 2.5s3-1 3-2.5c0-1-0.5-1.5-1-2 0.5-0.5 1-1 1-2C15 3 13.5 2 12 2z"/>
    <path d="M8 7c-1 0-2 0.5-2 1.5 0 0.5 0.3 1 0.7 1.3-0.4 0.3-0.7 0.8-0.7 1.3 0 1 1 1.5 2 1.5s2-0.5 2-1.5c0-0.5-0.3-1-0.7-1.3 0.4-0.3 0.7-0.8 0.7-1.3C10 7.5 9 7 8 7z"/>
    <path d="M16 7c-1 0-2 0.5-2 1.5 0 0.5 0.3 1 0.7 1.3-0.4 0.3-0.7 0.8-0.7 1.3 0 1 1 1.5 2 1.5s2-0.5 2-1.5c0-0.5-0.3-1-0.7-1.3 0.4-0.3 0.7-0.8 0.7-1.3C18 7.5 17 7 16 7z"/>
    <path d="M6 12c-0.8 0-1.5 0.3-1.5 1 0 0.3 0.2 0.6 0.5 0.8-0.3 0.2-0.5 0.5-0.5 0.8 0 0.7 0.7 1 1.5 1s1.5-0.3 1.5-1c0-0.3-0.2-0.6-0.5-0.8 0.3-0.2 0.5-0.5 0.5-0.8C7.5 12.3 6.8 12 6 12z"/>
    <path d="M18 12c-0.8 0-1.5 0.3-1.5 1 0 0.3 0.2 0.6 0.5 0.8-0.3 0.2-0.5 0.5-0.5 0.8 0 0.7 0.7 1 1.5 1s1.5-0.3 1.5-1c0-0.3-0.2-0.6-0.5-0.8 0.3-0.2 0.5-0.5 0.5-0.8C19.5 12.3 18.8 12 18 12z"/>
    <path d="M10 16c-1.2 0-2.5 0.5-2.5 1.5 0 0.5 0.4 1 1 1.3-0.6 0.3-1 0.8-1 1.3 0 1 1.3 1.5 2.5 1.5s2.5-0.5 2.5-1.5c0-0.5-0.4-1-1-1.3 0.6-0.3 1-0.8 1-1.3C12.5 16.5 11.2 16 10 16z"/>
    <path d="M14 16c-1.2 0-2.5 0.5-2.5 1.5 0 0.5 0.4 1 1 1.3-0.6 0.3-1 0.8-1 1.3 0 1 1.3 1.5 2.5 1.5s2.5-0.5 2.5-1.5c0-0.5-0.4-1-1-1.3 0.6-0.3 1-0.8 1-1.3C16.5 16.5 15.2 16 14 16z"/>
  </svg>

);

// --- Landing Page Component ---
const LandingPage = () => {
  const [availableManuals, setAvailableManuals] = useState([]);

  useEffect(() => {
    const manuals = getAvailableManuals();
    setAvailableManuals(manuals);
  }, []);

  return (
    <div className="bg-[#FDFDFD] text-[#333333] font-sans min-h-screen">
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Homa Manuals</h1>
          <p className="text-xl text-gray-600">Traditional Fire Ritual Guides</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableManuals.map(manual => (
            <Link
              key={manual.id}
              to={`/${manual.id}`}
              className="block p-6 bg-white border border-[#E0E0E0] rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">{manual.name}</h3>
              <p className="text-gray-600 text-sm">{manual.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Manual Viewer Component ---
const ManualViewer = () => {
  const { manualId } = useParams();
  const navigate = useNavigate();
  const [homamData, setHomamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(0);
  const [activeSubSection, setActiveSubSection] = useState('instructions');
  const [language, setLanguage] = useState('english');
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [availableManuals, setAvailableManuals] = useState([]);
  
  // Translation object for UI text
  const translations = {
    instructions: {
      english: 'Instructions',
      telugu: 'సూచనలు',
      hindi: 'निर्देश'
    },
    guidance: {
      english: 'Guidance',
      telugu: 'మార్గదర్శకత్వం',
      hindi: 'मार्गदर्शन'
    },
    mantra: {
      english: 'Mantra',
      telugu: 'మంత్రం',
      hindi: 'मंत्र'
    },
    visualGuide: {
      english: 'Visual Guide',
      telugu: 'దృశ్య మార్గదర్శిని',
      hindi: 'दृश्य गाइड'
    },
    invocation: {
      english: 'Invocation',
      telugu: 'ప్రార్థన',
      hindi: 'आह्वान'
    },
    step: {
      english: 'Step',
      telugu: 'దశ',
      hindi: 'चरण'
    },
    language: {
      english: 'Language',
      telugu: 'భాష',
      hindi: 'भाषा'
    },
    showInstructions: {
      english: 'Show Instructions',
      telugu: 'సూచనలను చూపించు',
      hindi: 'निर्देश दिखाएं'
    }
  };
  
  const mainContentRef = useRef(null);
  const observer = useRef(null);

  // Load initial data based on URL parameter
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Get available manuals
        const manuals = getAvailableManuals();
        setAvailableManuals(manuals);
        
        // Check if manualId exists
        const manual = manuals.find(m => m.id === manualId);
        if (!manual) {
          // Redirect to landing page if manual not found
          navigate('/');
          return;
        }
        
        const data = await loadManual(manualId);
        setHomamData(data);
        setActiveSectionId(data.sections[0].id);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (manualId) {
      initializeApp();
    }
  }, [manualId, navigate]);

  // Handle manual change via navigation
  const handleManualChange = (newManualId) => {
    navigate(`/${newManualId}`);
  };

  // Effect to handle intersection observer for right sidebar highlighting
  useEffect(() => {
    if (!homamData || !mainContentRef.current) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Handle both new step-based format and legacy format
            const elementId = entry.target.id;
            if (elementId.startsWith('step-')) {
              setActiveSubSection(elementId);
            } else {
              setActiveSubSection(elementId.split('-')[0]);
            }
          }
        });
      },
      { root: mainContentRef.current, rootMargin: "-40% 0px -60% 0px", threshold: 0 }
    );

    const { current: currentObserver } = observer;
    const elements = mainContentRef.current.querySelectorAll('.content-section');
    elements.forEach((el) => currentObserver.observe(el));

    return () => currentObserver.disconnect();
  }, [activeSectionId, homamData]);

  const handleSectionChange = (id) => {
    setActiveSectionId(id);
    setLeftSidebarOpen(false);
    if(mainContentRef.current) mainContentRef.current.scrollTop = 0;
  };
  
  const handleNavigation = (direction) => {
    if (!homamData) return;
    
    const currentIndex = homamData.sections.findIndex(s => s.id === activeSectionId);
    if (direction === 'next' && currentIndex < homamData.sections.length - 1) {
      handleSectionChange(homamData.sections[currentIndex + 1].id);
    } else if (direction === 'prev' && currentIndex > 0) {
      handleSectionChange(homamData.sections[currentIndex - 1].id);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="bg-[#FDFDFD] text-[#333333] font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97706] mx-auto mb-4"></div>
          <p className="text-lg">Loading manual...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-[#FDFDFD] text-[#333333] font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!homamData) {
    return (
      <div className="bg-[#FDFDFD] text-[#333333] font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">No manual data available</p>
        </div>
      </div>
    );
  }

  const activeSection = homamData.sections.find(s => s.id === activeSectionId);
  const currentIndex = homamData.sections.findIndex(s => s.id === activeSectionId);

  // Safety check - if activeSection is not found, return error state
  if (!activeSection) {
    return (
      <div className="bg-[#FDFDFD] text-[#333333] font-sans min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-lg">Section not found. Please select a valid section.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FDFDFD] text-[#333333] font-sans">
      <div className="relative flex w-full min-h-screen">
        
        {/* --- Left Sidebar (Main Navigation) --- */}
        <aside className={`fixed lg:sticky top-0 z-30 h-screen w-72 bg-[#FDFDFD] border-r border-[#E0E0E0] transition-transform transform ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex-shrink-0`}>
          <div className="p-6">
            <div className="mb-4">
              <Link to="/" className="text-sm text-[#D97706] hover:text-[#B45309] font-medium">
                ← Back to Home
              </Link>
            </div>
            <h2 className="text-xl font-bold">{homamData.title[language]}</h2>
            <p className="text-sm text-gray-600 mt-1">by {homamData.author[language]}</p>
            
            {availableManuals.length > 1 && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Manual:</label>
                <select 
                  value={manualId} 
                  onChange={(e) => handleManualChange(e.target.value)}
                  className="w-full text-sm rounded border-gray-300 shadow-sm focus:border-[#FFDAB9] focus:ring focus:ring-[#FFDAB9] focus:ring-opacity-50"
                >
                  {availableManuals.map(manual => (
                    <option key={manual.id} value={manual.id}>
                      {manual.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <nav className="p-4">
            <ul>
              {homamData.sections.map(section => (
                <li key={section.id}>
                  <button onClick={() => handleSectionChange(section.id)}
                     className={`w-full text-left block px-4 py-2 rounded-md text-sm font-medium transition-colors ${section.id === activeSectionId ? 'bg-[#FFDAB9] text-[#333333]' : 'hover:bg-gray-100'}`}>
                    {section.title[language]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* --- Main Content --- */}
        <main ref={mainContentRef} className="flex-1 w-full h-screen overflow-y-auto p-6 md:p-10 lg:p-12">
          <header className="mb-8">
            {/* Source link banner */}
            {homamData.source && (
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-orange-800 font-medium">
                    {language === 'telugu' ? 'మూల గ్రంథం' : language === 'hindi' ? 'मूल ग्रंथ' : 'Source Manual'}:
                  </span>
                  <a 
                    href={homamData.source} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:text-orange-800 font-medium underline transition-colors"
                  >
                    {language === 'telugu' ? 'PDF ఇక్కడ చూడండి' : language === 'hindi' ? 'PDF यहाँ देखें' : 'View Original PDF'}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <button className="lg:hidden z-40" onClick={() => setLeftSidebarOpen(!isLeftSidebarOpen)}>
                {isLeftSidebarOpen ? <XIcon /> : <MenuIcon />}
              </button>
              <div className="flex-1 text-center">
                {activeSectionId === 0 ? (
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{homamData.title[language]}</h1>
                    <p className="text-lg text-gray-600">by {homamData.author[language]}</p>
                  </div>
                ) : (
                  <h1 className="text-3xl font-bold">{activeSection.title[language]}</h1>
                )}
              </div>
               <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label htmlFor="language-select" className="text-sm font-medium hidden sm:block">{translations.language[language]}:</label>
                  <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-md border-gray-300 shadow-sm focus:border-[#FFDAB9] focus:ring focus:ring-[#FFDAB9] focus:ring-opacity-50">
                    <option value="english">English</option>
                    <option value="telugu">Telugu</option>
                    <option value="hindi">हिन्दी</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    id="instructions-toggle" 
                    type="checkbox" 
                    checked={showInstructions} 
                    onChange={(e) => setShowInstructions(e.target.checked)}
                    className="rounded border-gray-300 text-[#FFDAB9] shadow-sm focus:border-[#FFDAB9] focus:ring focus:ring-[#FFDAB9] focus:ring-opacity-50"
                  />
                  <label htmlFor="instructions-toggle" className="text-sm font-medium hidden sm:block">{translations.showInstructions[language]}</label>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-3xl mx-auto">
            {activeSectionId === 0 ? (
              // Landing page content - check if it has steps or old format
              <div className="space-y-8">
                <div className="prose prose-lg mx-auto">
                  <div className="space-y-6">
                    {activeSection.steps ? (
                      // New schema format
                      activeSection.steps.map((step, stepIndex) => (
                        <div key={stepIndex}>
                          {step.instructions[language].map((inst, i) => (
                            <p key={i} className="text-lg leading-relaxed mb-4">{inst}</p>
                          ))}
                        </div>
                      ))
                    ) : (
                      // Legacy format
                      activeSection.instructions && activeSection.instructions[language].map((inst, i) => (
                        <p key={i} className="text-lg leading-relaxed mb-4">{inst}</p>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Show first step's sloka if available in new format, or legacy sloka */}
                {activeSection.steps ? (
                  activeSection.steps[0]?.slokas && (
                    <div className="bg-[#FFF8E1] p-8 rounded-lg border border-[#E0E0E0] shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MantraIcon className="text-amber-600" />
                        {translations.invocation[language]}
                      </h3>
                      <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                        {formatSloka(activeSection.steps[0].slokas[language === 'hindi' ? 'devanagari' : language])}
                      </p>
                    </div>
                  )
                ) : (
                  activeSection.slokas && (
                    <div className="bg-[#FFF8E1] p-8 rounded-lg border border-[#E0E0E0] shadow-sm">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MantraIcon className="text-amber-600" />
                        {translations.invocation[language]}
                      </h3>
                      <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                        {formatSloka(activeSection.slokas[language === 'hindi' ? 'devanagari' : language])}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              // Regular section content - handle both new and legacy formats
              <>
                {activeSection.steps ? (
                  // New schema format with steps
                  activeSection.steps.map((step, stepIndex) => (
                    <div key={stepIndex} id={`step-${stepIndex}`} className="content-section mb-12">
                      <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2">
                        {translations.step[language]} {stepIndex + 1}
                      </h3>
                      
                      {/* Diagram if available */}
                      {(step.diagram || step.diagram_placeholder) && step.diagram_placeholder !== "No diagram for this step." && (
                        <div className="mb-6">
                          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                            <ImageIcon className="text-gray-600" />
                            {translations.visualGuide[language]}
                          </h4>
                          <div className="bg-gray-100 border border-[#E0E0E0] rounded-lg flex items-center justify-center" style={{minHeight: '300px'}}>
                            {step.diagram ? (
                              <>
                                <img 
                                  src={process.env.PUBLIC_URL + step.diagram} 
                                  alt="Ritual diagram" 
                                  className="max-w-full max-h-full object-contain"
                                  style={{maxHeight: '400px'}}
                                  onError={(e) => {
                                    console.error('Error loading diagram:', e.target.src);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                                <p className="text-gray-500 p-4 text-center" style={{display: 'none'}}>Diagram not available</p>
                              </>
                            ) : (
                              <p className="text-gray-500 p-4 text-center">{step.diagram_placeholder}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Instructions */}
                      {showInstructions && (
                        <div className="mb-6">
                          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                            <GuruIcon className="text-blue-600" /> {translations.instructions[language]}
                          </h4>
                          <ul className="list-disc list-inside space-y-3 pl-2 leading-relaxed">
                            {step.instructions[language].map((inst, i) => (
                              <li key={i}>{inst}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Slokas if available */}
                      {step.slokas && (
                        <div className="mb-6">
                          <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                            <MantraIcon className="text-amber-600" />
                            {translations.mantra[language]}
                          </h4>
                          <div className="bg-[#FFF8E1] p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
                            <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                              {formatSloka(step.slokas[language === 'hindi' ? 'devanagari' : language])}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Legacy format
                  <>
                    {(activeSection.diagram || activeSection.diagram_placeholder) && activeSection.diagram_placeholder !== "No diagram for this section." && (
                      <div id="diagram" className="content-section mb-12">
                        <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2 flex items-center gap-2">
                          <ImageIcon className="text-gray-600" />
                          {translations.visualGuide[language]}
                        </h3>
                        <div className="bg-gray-100 border border-[#E0E0E0] rounded-lg flex items-center justify-center" style={{minHeight: '300px'}}>
                          {activeSection.diagram ? (
                            <>
                              <img 
                                src={process.env.PUBLIC_URL + activeSection.diagram} 
                                alt="Ritual diagram" 
                                className="max-w-full max-h-full object-contain"
                                style={{maxHeight: '400px'}}
                                onError={(e) => {
                                  console.error('Error loading diagram:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <p className="text-gray-500 p-4 text-center" style={{display: 'none'}}>Diagram not available</p>
                            </>
                          ) : (
                            <p className="text-gray-500 p-4 text-center">{activeSection.diagram_placeholder}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {showInstructions && (
                      <div id="instructions" className="content-section mb-12">
                        <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2 flex items-center gap-2">
                          <GuruIcon className="text-blue-600" />
                          {translations.instructions[language]}
                        </h3>
                        <ul className="list-disc list-inside space-y-3 pl-2 leading-relaxed">
                          {activeSection.instructions && activeSection.instructions[language].map((inst, i) => <li key={i}>{inst}</li>)}
                        </ul>
                      </div>
                    )}

                    {activeSection.slokas && (
                      <div id="sloka" className="content-section mb-12">
                        <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2 flex items-center gap-2">
                          <MantraIcon className="text-amber-600" />
                          {translations.mantra[language]}
                        </h3>
                        <div className="bg-[#FFF8E1] p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
                          <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                            {formatSloka(activeSection.slokas[language === 'hindi' ? 'devanagari' : language])}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* --- Sequential Navigation --- */}
            <div className="mt-16 pt-6 border-t border-[#E0E0E0] flex justify-between items-center">
              <button onClick={() => handleNavigation('prev')} disabled={currentIndex === 0}
                className="px-5 py-2 text-sm font-medium bg-white border border-[#E0E0E0] rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Previous
              </button>
              <span className="text-sm text-gray-500">{currentIndex + 1} of {homamData.sections.length}</span>
              <button onClick={() => handleNavigation('next')} disabled={currentIndex === homamData.sections.length - 1}
                className="px-5 py-2 text-sm font-medium bg-white border border-[#E0E0E0] rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                Next
              </button>
            </div>
          </div>
        </main>
        
        {/* --- Right Sidebar (Intra-Section Navigation) --- */}
        {activeSectionId !== 0 && (
          <aside className="hidden xl:block w-64 flex-shrink-0 sticky top-0 h-screen border-l border-[#E0E0E0] p-8">
              <h4 className="font-semibold mb-4">On this page</h4>
              <ul className="space-y-3">
                {activeSection.steps ? (
                  // New schema format - show steps
                  activeSection.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>
                      <a 
                        href={`#step-${stepIndex}`} 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          document.getElementById(`step-${stepIndex}`)?.scrollIntoView({ behavior: 'smooth' }); 
                        }} 
                        className={`text-sm ${activeSubSection === `step-${stepIndex}` ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                      >
                        {translations.step[language]} {stepIndex + 1}
                      </a>
                    </li>
                  ))
                ) : (
                  // Legacy format - show traditional sections
                  <>
                    {activeSection.instructions && (
                      <li>
                        <a 
                          href="#instructions" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            document.getElementById('instructions')?.scrollIntoView({ behavior: 'smooth' }); 
                          }} 
                          className={`text-sm flex items-center gap-2 ${activeSubSection === 'instructions' ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          <GuruIcon className="w-4 h-4" />
                          {translations.guidance[language]}
                        </a>
                      </li>
                    )}
                    {activeSection.slokas && (
                      <li>
                        <a 
                          href="#sloka" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            document.getElementById('sloka')?.scrollIntoView({ behavior: 'smooth' }); 
                          }} 
                          className={`text-sm flex items-center gap-2 ${activeSubSection === 'sloka' ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          <MantraIcon className="w-4 h-4" />
                           {translations.mantra[language]}
                        </a>
                      </li>
                    )}
                    {(activeSection.diagram || activeSection.diagram_placeholder) && activeSection.diagram_placeholder !== "No diagram for this section." && (
                      <li>
                        <a 
                          href="#diagram" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            document.getElementById('diagram')?.scrollIntoView({ behavior: 'smooth' }); 
                          }}
                          className={`text-sm flex items-center gap-2 ${activeSubSection === 'diagram' ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          <ImageIcon className="w-4 h-4" />
                          {translations.visualGuide[language]}
                        </a>
                      </li>
                    )}
                  </>
                )}
              </ul>
          </aside>
        )}
      </div>
    </div>
  );
};

// --- Main App Component with Routing ---
export default function App() {
  return (
    <Router basename="/homa-vidhanam">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:manualId" element={<ManualViewer />} />
      </Routes>
    </Router>
  );
}
