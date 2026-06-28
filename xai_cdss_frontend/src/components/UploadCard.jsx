// import React, { useState, useCallback } from "react";
// import { Upload, Image, X, FileImage, AlertCircle } from "lucide-react";

// const UploadCard = ({ onAnalyze, isLoading }) => {
//   const [file, setFile] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [isDragging, setIsDragging] = useState(false);
//   const [error, setError] = useState(null);

//   const handleDragOver = useCallback((e) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e) => {
//     e.preventDefault();
//     setIsDragging(false);
//   }, []);

//   const validateFile = (file) => {
//     const validTypes = ["image/jpeg", "image/png", "image/jpg"];
//     if (!validTypes.includes(file.type)) {
//       setError("Please upload a valid image file (.jpg, .png)");
//       return false;
//     }
//     if (file.size > 10 * 1024 * 1024) {
//       setError("File size must be less than 10MB");
//       return false;
//     }
//     setError(null);
//     return true;
//   };

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     setIsDragging(false);

//     const droppedFile = e.dataTransfer.files[0];
//     if (droppedFile && validateFile(droppedFile)) {
//       setFile(droppedFile);
//       const reader = new FileReader();
//       reader.onload = () => setPreview(reader.result);
//       reader.readAsDataURL(droppedFile);
//     }
//   }, []);

//   const handleFileSelect = (e) => {
//     const selectedFile = e.target.files[0];
//     if (selectedFile && validateFile(selectedFile)) {
//       setFile(selectedFile);
//       const reader = new FileReader();
//       reader.onload = () => setPreview(reader.result);
//       reader.readAsDataURL(selectedFile);
//     }
//   };

//   const handleRemove = () => {
//     setFile(null);
//     setPreview(null);
//     setError(null);
//   };

//   const handleSubmit = () => {
//     if (file) {
//       onAnalyze(file);
//     }
//   };

//   return (
//     <div className="w-full max-w-2xl mx-auto">
//       <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
//         <div className="p-6 md:p-8">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
//               <FileImage className="w-5 h-5 text-primary" />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-foreground">
//                 Upload X-ray Image
//               </h2>
//               <p className="text-sm text-muted-foreground">
//                 Drag and drop or click to upload
//               </p>
//             </div>
//           </div>

//           {!preview ? (
//             <div
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//               className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 cursor-pointer
//                 ${
//                   isDragging
//                     ? "border-primary bg-primary-light"
//                     : "border-border hover:border-primary/50 hover:bg-muted/50"
//                 }`}
//             >
//               <input
//                 type="file"
//                 accept=".jpg,.jpeg,.png"
//                 onChange={handleFileSelect}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               />
//               <div className="flex flex-col items-center gap-4">
//                 <div
//                   className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors
//                   ${isDragging ? "bg-primary/20" : "bg-muted"}`}
//                 >
//                   <Upload
//                     className={`w-8 h-8 transition-colors ${
//                       isDragging ? "text-primary" : "text-muted-foreground"
//                     }`}
//                   />
//                 </div>
//                 <div>
//                   <p className="text-foreground font-medium mb-1">
//                     {isDragging
//                       ? "Drop your image here"
//                       : "Click to upload or drag and drop"}
//                   </p>
//                   <p className="text-sm text-muted-foreground">
//                     Supports JPG, PNG (max 10MB)
//                   </p>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="relative rounded-xl overflow-hidden bg-muted">
//               <img
//                 src={preview}
//                 alt="X-ray preview"
//                 className="w-full h-64 md:h-80 object-contain bg-foreground/5"
//               />
//               <button
//                 onClick={handleRemove}
//                 className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-danger hover:border-danger hover:text-danger-foreground transition-colors"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//               <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border">
//                 <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
//                   {file?.name}
//                 </p>
//               </div>
//             </div>
//           )}

//           {error && (
//             <div className="mt-4 p-3 rounded-lg bg-danger-light border border-danger/20 flex items-center gap-2">
//               <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
//               <p className="text-sm text-danger">{error}</p>
//             </div>
//           )}

//           <button
//             onClick={handleSubmit}
//             disabled={!file || isLoading}
//             className={`w-full mt-6 py-3.5 px-6 rounded-xl font-semibold text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2
//               ${
//                 file && !isLoading
//                   ? "medical-gradient shadow-medical hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
//                   : "bg-muted text-muted-foreground cursor-not-allowed"
//               }`}
//           >
//             {isLoading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
//                 <span>Analyzing...</span>
//               </>
//             ) : (
//               <>
//                 <Image className="w-5 h-5" />
//                 <span>Analyze X-ray</span>
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UploadCard;

import React, { useState, useCallback } from "react";
import { Upload, Image, X, FileImage, AlertCircle } from "lucide-react";

const UploadCard = ({ onAnalyze, isLoading }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [cold, setCold] = useState(50);
  const [environment, setEnvironment] = useState(50);
  const [immunity, setImmunity] = useState(75);
  const [smoking, setSmoking] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (.jpg, .png)");
      return false;
    }
    setError(null);
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(droppedFile);
    }
  }, []);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setCold(50);
    setEnvironment(50);
    setImmunity(75);
    setSmoking(false);
  };

  // This passes the file up to Index.jsx
  const handleSubmit = () => {
    if (file) {
      onAnalyze(file, { cold, environment, immunity, smoking });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
              <FileImage className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Upload X-ray Image
              </h2>
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to upload
              </p>
            </div>
          </div>

          {/* Upload Area */}
          {!preview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-all duration-200 cursor-pointer
                ${
                  isDragging
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
            >
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    isDragging ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <Upload
                    className={`w-8 h-8 transition-colors ${
                      isDragging ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">
                    {isDragging
                      ? "Drop your image here"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 md:h-80 object-contain bg-foreground/5"
                />
                {!isLoading && (
                  <button
                    onClick={handleRemove}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-danger hover:border-danger hover:text-danger-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Symptom Sliders for Hybrid CDSS */}
              <div className="p-5 rounded-xl border border-border/80 bg-muted/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Hybrid clinical symptoms & environment inputs
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cold Exposure Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Cold Exposure</span>
                      <span className="text-foreground">{cold}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cold}
                      onChange={(e) => setCold(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-muted-foreground">Exposure to low temperatures or seasonal chills.</p>
                  </div>

                  {/* Environmental Quality Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Environment (Pollution / Air Index)</span>
                      <span className="text-foreground">{environment}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={environment}
                      onChange={(e) => setEnvironment(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-muted-foreground">Air particulate levels, indoor ventilation quality.</p>
                  </div>

                  {/* Patient Immunity Level Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">Patient Immunity Level</span>
                      <span className="text-foreground">{immunity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={immunity}
                      onChange={(e) => setImmunity(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[10px] text-muted-foreground">Body immune defense capability (vaccines, health baseline).</p>
                  </div>

                  {/* Smoking Checkbox */}
                  <div className="flex flex-col justify-center space-y-1">
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="smoking"
                        checked={smoking}
                        onChange={(e) => setSmoking(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="smoking" className="text-xs font-semibold text-muted-foreground cursor-pointer select-none">
                        Patient has History of Smoking
                      </label>
                    </div>
                    <p className="text-[10px] text-muted-foreground pt-1">Checks for compromised airway cilia and defenses.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={handleSubmit}
            disabled={!file || isLoading}
            className={`w-full mt-6 py-3.5 px-6 rounded-xl font-semibold text-primary-foreground transition-all duration-200 flex items-center justify-center gap-2
              ${
                file && !isLoading
                  ? "bg-blue-600 hover:bg-blue-700 shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Image className="w-5 h-5" />
                <span>Analyze X-ray</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadCard;
