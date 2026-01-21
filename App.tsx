import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Download, FileText, Camera, Settings, Moon, Sun } from 'lucide-react';
import { PhotoEntry } from './types';
import { PhotoUploader } from './components/PhotoUploader';
import { EntryList } from './components/EntryList';
import { generatePDF } from './services/pdfService';

const App: React.FC = () => {
  // Theme Management
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Global Project Settings
  const [projectTitle, setProjectTitle] = useState("My Photo Project");
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);

  // State for the new entry form
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentDescription, setCurrentDescription] = useState<string>('');
  
  // State for the list of entries
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers
  const handleAddEntry = useCallback(() => {
    if (!currentImage || !currentDescription.trim()) {
      alert("Please add both a photo and a description.");
      return;
    }

    const newEntry: PhotoEntry = {
      id: crypto.randomUUID(),
      imageSrc: currentImage,
      description: currentDescription.trim(),
      timestamp: Date.now(),
    };

    setEntries(prev => [...prev, newEntry]);
    
    // Reset form
    setCurrentImage(null);
    setCurrentDescription('');
  }, [currentImage, currentDescription]);

  const handleRemoveEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleGeneratePDF = useCallback(async () => {
    if (entries.length === 0) return;
    setIsGenerating(true);
    setTimeout(() => {
      try {
        generatePDF(entries, projectTitle, companyLogo);
      } catch (error) {
        console.error("PDF Generation failed:", error);
        alert("Failed to generate PDF. Please check your inputs.");
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  }, [entries, projectTitle, companyLogo]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Camera className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">PhotoLog Creator</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleGeneratePDF}
              disabled={entries.length === 0 || isGenerating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all ${
                entries.length === 0
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:transform active:scale-95'
              }`}
            >
              {isGenerating ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Settings & Editor */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            
            {/* 1. Project Settings Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 transition-colors">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Settings size={20} className="text-slate-500 dark:text-slate-400" />
                Project Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Title</label>
                  <input 
                    type="text" 
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                    placeholder="e.g. Site Inspection 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Logo (Header)</label>
                  <PhotoUploader 
                    imageSrc={companyLogo} 
                    onImageSelect={setCompanyLogo} 
                    onClear={() => setCompanyLogo(null)}
                    label="Upload Logo"
                    heightClass="h-32"
                  />
                </div>
              </div>
            </div>

            {/* 2. Add Entry Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 sticky top-24 transition-colors">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-500" />
                Add Photo Entry
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Photo
                  </label>
                  <PhotoUploader 
                    imageSrc={currentImage} 
                    onImageSelect={setCurrentImage} 
                    onClear={() => setCurrentImage(null)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                    placeholder="Write a detailed description..."
                    className="w-full h-32 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                  <div className="text-right mt-1">
                     <span className="text-xs text-slate-400 dark:text-slate-500">{currentDescription.length} chars</span>
                  </div>
                </div>

                <button
                  onClick={handleAddEntry}
                  disabled={!currentImage || !currentDescription.trim()}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    !currentImage || !currentDescription.trim()
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                      : 'bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 shadow-md'
                  }`}
                >
                  Add Entry
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: List */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="text-slate-400 dark:text-slate-500" />
                Entries ({entries.length})
              </h2>
              {entries.length > 0 && (
                <button 
                  onClick={() => {
                    if(confirm("Are you sure you want to clear all entries?")) {
                      setEntries([]);
                    }
                  }}
                  className="text-sm text-red-500 hover:text-red-600 hover:underline transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl">
              <EntryList entries={entries} onRemove={handleRemoveEntry} />
            </div>

            {/* Preview Hint */}
            {entries.length > 0 && (
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
                <p>
                  <strong>Ready to export:</strong> {projectTitle} - {entries.length} items.
                  <br/>
                  The final PDF will contain a header with your logo and title, and 4 photos per page.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;