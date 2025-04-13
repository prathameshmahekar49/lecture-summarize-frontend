import React, { useState } from "react";
import axios from "axios";

function App() {
  const [activeTab, setActiveTab] = useState("upload");
  const [audioFile, setAudioFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    mainTopics: [],
    keyPoints: "",
    conclusion: ""
  });

  // Flag to track processing status
  const [isProcessed, setIsProcessed] = useState(false);
  const [isTranscribed, setIsTranscribed] = useState(false);
  const [isSummarized, setIsSummarized] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setAudioFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!audioFile) return;

    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/upload`,formData);
      setTranscription(res.data.transcription);
      setSummary({
        mainTopics: res.data.summary.mainTopics || [],
        keyPoints: res.data.summary.keyPoints || "",
        conclusion: res.data.summary.conclusion || ""
      });
      setIsProcessed(true);
      setIsTranscribed(true);
      setIsSummarized(true);
      setActiveTab("transcription");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const processLecture = () => {
    handleUpload();
  };

  const downloadTranscript = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcript.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadSummary = () => {
    const content = `
Main Topics:
${summary.mainTopics.map(topic => `- ${topic}`).join('\n')}

Key Points:
${summary.keyPoints}

Conclusion:
${summary.conclusion}
    `;
    
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareSummary = () => {
    // Implementation for sharing functionality
    alert("Share functionality would be implemented here");
  };

  // Handle tab changes
  const switchToTab = (tab) => {
    // Only allow switching to tabs that are ready
    if (tab === "upload" || 
        (tab === "transcription" && isTranscribed) || 
        (tab === "summary" && isSummarized)) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold">LectureSummarizer</h1>
        <nav className="flex space-x-6">
          <button className="text-gray-800">Dashboard</button>
          <button className="text-gray-800">History</button>
          <button className="text-gray-800">Settings</button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center">Summarize Your Lectures</h2>
        <p className="text-center text-gray-600 mt-2 mb-8">
          Upload your lecture audio, get transcription and a concise summary in minutes.
        </p>

        {/* Tabs - Using buttons instead of divs for better accessibility */}
        <div className="grid grid-cols-3 gap-0 mb-6">
          <button
            onClick={() => switchToTab("upload")}
            className={`py-3 px-6 text-center cursor-pointer transition-colors ${
              activeTab === "upload" 
                ? "bg-white border border-gray-300 rounded-t font-medium" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => switchToTab("transcription")}
            className={`py-3 px-6 text-center transition-colors ${
              !isTranscribed ? "cursor-not-allowed text-gray-400" : "cursor-pointer"
            } ${
              activeTab === "transcription" 
                ? "bg-white border border-gray-300 rounded-t font-medium" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Transcription
          </button>
          <button
            onClick={() => switchToTab("summary")}
            className={`py-3 px-6 text-center transition-colors ${
              !isSummarized ? "cursor-not-allowed text-gray-400" : "cursor-pointer"
            } ${
              activeTab === "summary" 
                ? "bg-white border border-gray-300 rounded-t font-medium" 
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Summary
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 border border-gray-200 rounded">
          {activeTab === "upload" && (
            <div>
              <h3 className="text-xl font-bold mb-1">Upload Lecture Audio</h3>
              <p className="text-gray-600 mb-6">Supported formats: MP3, WAV, M4A (Max size: 500MB)</p>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="mb-4 bg-gray-100 p-3 rounded-full">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                </div>
                <p className="text-lg mb-1">Drag and drop your audio file</p>
                <p className="text-gray-500 mb-4">Or click to browse from your computer</p>
                <input 
                  type="file" 
                  accept="audio/*" 
                  id="fileInput"
                  onChange={handleFileChange}
                  className="hidden" 
                />
                <label 
                  htmlFor="fileInput" 
                  className="bg-gray-800 text-white py-2 px-4 rounded-md cursor-pointer"
                >
                  Select File
                </label>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="text-gray-600">{fileName || "No file selected"}</p>
                <button 
                  onClick={processLecture} 
                  disabled={!audioFile}
                  className={`py-2 px-6 rounded ${audioFile ? 'bg-gray-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  Process Lecture
                </button>
              </div>
            </div>
          )}

          {activeTab === "transcription" && (
            <div>
              <h3 className="text-xl font-bold mb-1">Lecture Transcription</h3>
              <p className="text-gray-600 mb-6">Full text transcription of your lecture audio</p>
              
              <div className="border border-gray-200 rounded-lg p-10 min-h-40 mb-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <h4 className="text-lg font-medium mt-4">Transcribing your lecture...</h4>
                    <p className="text-gray-500 mt-2">This may take a few minutes depending on the file size</p>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{transcription}</div>
                )}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>{fileName}</span>
                </div>
                <button 
                  onClick={downloadTranscript}
                  className="bg-white border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50"
                >
                  Download Transcript
                </button>
              </div>
            </div>
          )}

          {activeTab === "summary" && (
            <div>
              <h3 className="text-xl font-bold mb-1">Lecture Summary</h3>
              <p className="text-gray-600 mb-6">Concise summary of the key points from your lecture</p>
              
              <div className="mb-6">
                <div className="flex items-center text-green-600 mb-4">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-lg">Summary Complete</span>
                </div>
                
                <h4 className="font-bold mb-2">Main Topics</h4>
                <ul className="list-disc pl-6 mb-4">
                  {summary.mainTopics.map((topic, index) => (
                    <li key={index} className="mb-1">{topic}</li>
                  ))}
                </ul>
                
                <h4 className="font-bold mb-2">Key Points</h4>
                <p className="mb-4">{summary.keyPoints}</p>
                
                <h4 className="font-bold mb-2">Conclusion</h4>
                <p>{summary.conclusion}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <span>{fileName}</span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={downloadSummary}
                    className="bg-white border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Download Summary
                  </button>
                  <button 
                    onClick={shareSummary}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Share Summary
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;