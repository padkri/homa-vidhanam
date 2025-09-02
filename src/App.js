import React, { useState, useEffect, useRef } from 'react';
import { loadManual, getAvailableManuals, getDefaultManualId } from './dataLoader';

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

export default function App() {
  const [homamData, setHomamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState(0);
  const [activeSubSection, setActiveSubSection] = useState('instructions');
  const [language, setLanguage] = useState('english');
  const [isLeftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [availableManuals, setAvailableManuals] = useState([]);
  const [currentManualId, setCurrentManualId] = useState('');
  
  const mainContentRef = useRef(null);
  const observer = useRef(null);

  // Load initial data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        
        // Get available manuals
        const manuals = getAvailableManuals();
        setAvailableManuals(manuals);
        
        // Load default manual
        const defaultManualId = getDefaultManualId();
        setCurrentManualId(defaultManualId);
        
        const data = await loadManual(defaultManualId);
        setHomamData(data);
        setActiveSectionId(data.sections[0].id);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Load different manual when selection changes
  const handleManualChange = async (manualId) => {
    try {
      setLoading(true);
      const data = await loadManual(manualId);
      setHomamData(data);
      setCurrentManualId(manualId);
      setActiveSectionId(data.sections[0].id);
      if(mainContentRef.current) mainContentRef.current.scrollTop = 0;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-xl font-bold">{homamData.title[language]}</h2>
            <p className="text-sm text-gray-600 mt-1">by {homamData.author[language]}</p>
            
            {availableManuals.length > 1 && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Manual:</label>
                <select 
                  value={currentManualId} 
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
          <header className="flex items-center justify-between mb-8">
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
             <div className="flex items-center space-x-2">
              <label htmlFor="language-select" className="text-sm font-medium hidden sm:block">Language:</label>
              <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-md border-gray-300 shadow-sm focus:border-[#FFDAB9] focus:ring focus:ring-[#FFDAB9] focus:ring-opacity-50">
                <option value="english">English</option>
                <option value="telugu">Telugu</option>
                <option value="hindi">हिन्दी</option>
              </select>
            </div>
          </header>

          <div className="max-w-3xl mx-auto">
            {activeSectionId === 0 ? (
              // Landing page content - check if it has steps or old format
              <div className="text-center space-y-8">
                <div className="prose prose-lg mx-auto">
                  <div className="space-y-4">
                    {activeSection.steps ? (
                      // New schema format
                      activeSection.steps.map((step, stepIndex) => (
                        <div key={stepIndex}>
                          {step.instructions[language].map((inst, i) => (
                            <p key={i} className="text-lg leading-relaxed">{inst}</p>
                          ))}
                        </div>
                      ))
                    ) : (
                      // Legacy format
                      activeSection.instructions && activeSection.instructions[language].map((inst, i) => (
                        <p key={i} className="text-lg leading-relaxed">{inst}</p>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Show first step's sloka if available in new format, or legacy sloka */}
                {activeSection.steps ? (
                  activeSection.steps[0]?.slokas && (
                    <div className="bg-[#FFF8E1] p-8 rounded-lg border border-[#E0E0E0] shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Invocation</h3>
                      <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                        {activeSection.steps[0].slokas[language === 'hindi' ? 'devanagari' : language]}
                      </p>
                    </div>
                  )
                ) : (
                  activeSection.slokas && (
                    <div className="bg-[#FFF8E1] p-8 rounded-lg border border-[#E0E0E0] shadow-sm">
                      <h3 className="text-xl font-semibold mb-4">Invocation</h3>
                      <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                        {activeSection.slokas[language === 'hindi' ? 'devanagari' : language]}
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
                        Step {stepIndex + 1}
                      </h3>
                      
                      {/* Instructions */}
                      <div className="mb-6">
                        <h4 className="text-lg font-medium mb-3">Instructions</h4>
                        <ul className="list-disc list-inside space-y-3 pl-2 leading-relaxed">
                          {step.instructions[language].map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Slokas if available */}
                      {step.slokas && (
                        <div className="mb-6">
                          <h4 className="text-lg font-medium mb-3">Sloka</h4>
                          <div className="bg-[#FFF8E1] p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
                            <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                              {step.slokas[language === 'hindi' ? 'devanagari' : language]}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Diagram if available */}
                      {step.diagram_placeholder && step.diagram_placeholder !== "No diagram for this step." && (
                        <div className="mb-6">
                          <h4 className="text-lg font-medium mb-3">Diagram</h4>
                          <div className="bg-gray-100 border border-[#E0E0E0] rounded-lg h-60 flex items-center justify-center">
                            <p className="text-gray-500">{step.diagram_placeholder}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // Legacy format
                  <>
                    <div id="instructions" className="content-section mb-12">
                      <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2">Instructions</h3>
                      <ul className="list-disc list-inside space-y-3 pl-2 leading-relaxed">
                        {activeSection.instructions && activeSection.instructions[language].map((inst, i) => <li key={i}>{inst}</li>)}
                      </ul>
                    </div>

                    {activeSection.slokas && (
                      <div id="sloka" className="content-section mb-12">
                        <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2">Sloka</h3>
                        <div className="bg-[#FFF8E1] p-6 rounded-lg border border-[#E0E0E0] shadow-sm">
                          <p className="whitespace-pre-wrap leading-loose font-serif text-lg">
                            {activeSection.slokas[language === 'hindi' ? 'devanagari' : language]}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeSection.diagram_placeholder && activeSection.diagram_placeholder !== "No diagram for this section." && (
                      <div id="diagram" className="content-section">
                        <h3 className="text-2xl font-semibold mb-4 border-b border-[#E0E0E0] pb-2">Diagram</h3>
                        <div className="bg-gray-100 border border-[#E0E0E0] rounded-lg h-60 flex items-center justify-center">
                          <p className="text-gray-500">{activeSection.diagram_placeholder}</p>
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
                        Step {stepIndex + 1}
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
                          className={`text-sm ${activeSubSection === 'instructions' ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          Instructions
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
                          className={`text-sm ${activeSubSection === 'sloka' ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          Sloka
                        </a>
                      </li>
                    )}
                    {activeSection.diagram_placeholder && activeSection.diagram_placeholder !== "No diagram for this section." && (
                      <li>
                        <a 
                          href="#diagram" 
                          onClick={(e) => { 
                            e.preventDefault(); 
                            document.getElementById('diagram')?.scrollIntoView({ behavior: 'smooth' }); 
                          }} 
                          className={`text-sm ${activeSubSection === 'diagram' ? 'text-[#D97706] font-semibold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          Diagram
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
}
