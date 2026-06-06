// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Header from '../components/Header';
// import UploadCard from '../components/UploadCard';
// import LoadingState from '../components/LoadingState';
// import DiagnosisResult from '../components/DiagnosisResult';
// import ExplainabilitySection from '../components/ExplainabilitySection';
// import ModelMetrics from '../components/ModelMetrics';
// import { ArrowLeft, RefreshCw } from 'lucide-react';

// const API_BASE_URL = 'http://127.0.0.1:8000';

// const Index = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [results, setResults] = useState(null);
//   const [metrics, setMetrics] = useState(null);
//   const [originalImage, setOriginalImage] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch model metrics on component mount
//     fetchModelMetrics();
//   }, []);

//   const fetchModelMetrics = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/model/metrics`);
//       setMetrics(response.data);
//     } catch (err) {
//       console.log('Could not fetch model metrics:', err.message);
//       // Use mock metrics for demo if backend is unavailable
//       setMetrics({
//         accuracy: 0.924,
//         precision: 0.918,
//         recall: 0.931,
//         auc: 0.956,
//         inference_time: 127
//       });
//     }
//   };

//   const handleAnalyze = async (file) => {
//     setIsLoading(true);
//     setError(null);

//     // Store original image for comparison
//     const reader = new FileReader();
//     reader.onload = () => setOriginalImage(reader.result);
//     reader.readAsDataURL(file);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await axios.post(`${API_BASE_URL}/predict`, formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       setResults(response.data);
//     } catch (err) {
//       console.error('Prediction error:', err);

//       // Demo mode: show mock results if backend is unavailable
//       if (err.code === 'ERR_NETWORK') {
//         setResults({
//           prediction: Math.random() > 0.5 ? 'Pneumonia' : 'Normal',
//           confidence: 0.85 + Math.random() * 0.12,
//           gradcam_image: originalImage,
//           feature_maps: [originalImage, originalImage, originalImage, originalImage]
//         });
//         setError('Demo mode: Backend unavailable. Showing simulated results.');
//       } else {
//         setError(err.response?.data?.message || 'An error occurred during analysis. Please try again.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setResults(null);
//     setOriginalImage(null);
//     setError(null);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />

//       <main className="container mx-auto px-4 py-8 md:py-12">
//         {/* Error Banner */}
//         {error && (
//           <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-warning-light border border-warning/30 text-center">
//             <p className="text-sm text-warning">{error}</p>
//           </div>
//         )}

//         {/* Main Content */}
//         {!results && !isLoading && (
//           <div className="space-y-12">
//             {/* Hero Section */}
//             <div className="text-center max-w-2xl mx-auto">
//               <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
//                 AI-Powered Pneumonia Detection
//               </h2>
//               <p className="text-muted-foreground">
//                 Upload a chest X-ray image to receive an AI-assisted diagnosis with
//                 explainable visualizations that highlight the reasoning behind the model's decision.
//               </p>
//             </div>

//             {/* Upload Section */}
//             <UploadCard onAnalyze={handleAnalyze} isLoading={isLoading} />

//             {/* Model Metrics Section */}
//             {metrics && (
//               <div className="max-w-4xl mx-auto">
//                 <ModelMetrics metrics={metrics} />
//               </div>
//             )}
//           </div>
//         )}

//         {/* Loading State */}
//         {isLoading && <LoadingState />}

//         {/* Results View */}
//         {results && !isLoading && (
//           <div className="space-y-6">
//             {/* Back Button */}
//             <div className="max-w-4xl mx-auto">
//               <button
//                 onClick={handleReset}
//                 className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 <span className="font-medium">New Analysis</span>
//               </button>
//             </div>

//             {/* Results Grid */}
//             <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
//               {/* Diagnosis Result */}
//               <DiagnosisResult
//                 prediction={results.prediction}
//                 confidence={results.confidence}
//               />

//               {/* Explainability */}
//               <div className="md:col-span-2">
//                 <ExplainabilitySection
//                   gradcamImage={results.gradcam_image}
//                   featureMaps={results.feature_maps}
//                   originalImage={originalImage}
//                 />
//               </div>

//               {/* Model Metrics */}
//               {metrics && (
//                 <div className="md:col-span-2">
//                   <ModelMetrics metrics={metrics} />
//                 </div>
//               )}
//             </div>

//             {/* Analyze Another Button */}
//             <div className="max-w-4xl mx-auto text-center pt-6">
//               <button
//                 onClick={handleReset}
//                 className="inline-flex items-center gap-2 px-6 py-3 rounded-xl medical-gradient text-primary-foreground font-semibold shadow-medical hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
//               >
//                 <RefreshCw className="w-5 h-5" />
//                 Analyze Another X-ray
//               </button>
//             </div>
//           </div>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="border-t border-border bg-card mt-12">
//         <div className="container mx-auto px-4 py-6">
//           <p className="text-center text-sm text-muted-foreground">
//             Explainable AI Clinical Decision Support System • For Research and Educational Purposes Only
//           </p>
//         </div>
//       </footer>
//     </div>
//   );
// };

// export default Index;

import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import UploadCard from "../components/UploadCard";
import LoadingState from "../components/LoadingState";
import DiagnosisResult from "../components/DiagnosisResult";
import ExplainabilitySection from "../components/ExplainabilitySection";
import ModelMetrics from "../components/ModelMetrics";
import { ArrowLeft, RefreshCw } from "lucide-react";

const API_BASE_URL = "https://kingno3l-hybrid-xai-cdss-backend.hf.space";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch actual metrics from the backend with a fallback if the backend is offline
  useEffect(() => {
    const fetchModelMetrics = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/model/metrics`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        setMetrics({
          accuracy: data.accuracy,
          precision: data.precision,
          recall: data.recall,
          auc: data.auc,
          inference_time: data.inference_time_ms || 127
        });
      } catch (err) {
        console.log("Could not fetch model metrics, using fallback:", err.message);
        setMetrics({
          accuracy: 0.924,
          precision: 0.918,
          recall: 0.931,
          auc: 0.956,
          inference_time: 127,
        });
      }
    };
    fetchModelMetrics();
  }, []);

  const handleAnalyze = async (file) => {
    setIsLoading(true);
    setError(null);

    // 1. Create a preview of the original image for comparison
    const reader = new FileReader();
    reader.onload = () => setOriginalImage(reader.result);
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // 2. Call the API
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Server returned an error");
      }

      const data = await response.json();
      console.log("API Data:", data); // Check console to see raw data

      // 3. Map API data to your App's state format
      // We must add "data:image/png;base64," to the image string so it displays
      const formattedResults = {
        prediction: data.prediction,
        confidence: data.confidence,
        gradcam_image: data.explainability?.gradcam_overlay
          ? `data:image/png;base64,${data.explainability.gradcam_overlay}`
          : null,
        feature_maps: data.explainability?.intrinsic_maps
          ? data.explainability.intrinsic_maps.map((map) => `data:image/png;base64,${map}`)
          : [],
      };

      // 4. Setting this state triggers the view to switch
      setResults(formattedResults);
    } catch (err) {
      console.error("Prediction error:", err);
      setError("Could not connect to the server. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setOriginalImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-center text-red-600">
            {error}
          </div>
        )}

        {/* VIEW 1: UPLOAD CARD & CLINICAL INTRO GRID (Shown when no results) */}
        {!results && !isLoading && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Split Screen Grid */}
            <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
              
              {/* Left Column: Medical Practitioner Banner & Lab Details */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-card border border-border rounded-2xl overflow-hidden shadow-lg relative group">
                {/* Background Image of Black Practitioners */}
                <div className="relative h-64 lg:h-full min-h-[320px] w-full">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80" 
                    alt="Clinical Radiologists Analyzing Chest X-Ray" 
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.85] contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                  
                  {/* Overlay text on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span className="px-3 py-1 text-xs font-bold bg-blue-600 text-white rounded-full uppercase tracking-wider shadow-md inline-block mb-3">
                      Clinical Imaging Unit
                    </span>
                    <h3 className="text-xl font-bold tracking-tight text-white mb-2">
                      Onyilo Veritas Diagnostics Lab
                    </h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      Assisting radiologists and clinicians with deep learning analysis for rapid diagnosis of thoracic pathology.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Title, Upload Card, and CDSS Controls */}
              <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-3.5 w-3.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                      Diagnostic System Online
                    </span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    Chest Radiography Interpretation Engine
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Upload a high-resolution Chest X-ray scan. The system will automatically diagnose pathological patterns and display visual Grad-CAM overlays to support diagnostic decisions.
                  </p>
                </div>

                <UploadCard onAnalyze={handleAnalyze} isLoading={isLoading} />
              </div>
            </div>

            {metrics && (
              <div className="max-w-6xl mx-auto">
                <ModelMetrics metrics={metrics} />
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: LOADING STATE */}
        {isLoading && <LoadingState />}

        {/* VIEW 3: RESULTS (Shown when results exist) */}
        {results && !isLoading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">New Analysis</span>
              </button>
            </div>

            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
              {/* The Diagnosis Result Card you shared earlier */}
              <DiagnosisResult
                prediction={results.prediction}
                confidence={results.confidence}
              />

              <div className="md:col-span-2">
                <ExplainabilitySection
                  gradcamImage={results.gradcam_image}
                  featureMaps={results.feature_maps}
                  originalImage={originalImage}
                />
              </div>

              {metrics && (
                <div className="md:col-span-2">
                  <ModelMetrics metrics={metrics} />
                </div>
              )}
            </div>

            <div className="max-w-4xl mx-auto text-center pt-6">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Analyze Another X-ray
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            For Research and Educational Purposes Only
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
