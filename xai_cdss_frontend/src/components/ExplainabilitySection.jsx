import React, { useState } from 'react';
import { Eye, Layers, ZoomIn, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const ExplainabilitySection = ({ gradcamImage, featureMaps, originalImage }) => {
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

  const handlePrevFeature = () => {
    setSelectedFeatureIndex((prev) => 
      prev === 0 ? (featureMaps?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextFeature = () => {
    setSelectedFeatureIndex((prev) => 
      prev === (featureMaps?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Grad-CAM Visualization */}
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Grad-CAM Visualization</h2>
                <p className="text-sm text-muted-foreground">Model attention heatmap</p>
              </div>
            </div>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              {showOriginal ? 'Show Heatmap' : 'Show Original'}
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-foreground/5">
            <img
              src={showOriginal ? originalImage : gradcamImage}
              alt={showOriginal ? "Original X-ray" : "Grad-CAM visualization"}
              className="w-full h-64 md:h-80 object-contain transition-opacity duration-300"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border">
              <p className="text-xs font-medium text-muted-foreground">
                {showOriginal ? 'Original Image' : 'Grad-CAM Overlay'}
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-muted/50 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Grad-CAM</strong> (Gradient-weighted Class Activation Mapping) 
              highlights regions influencing the model's decision. Warmer colors (red/yellow) indicate 
              areas of higher importance.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Maps */}
      {featureMaps && featureMaps.length > 0 && (
        <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Intrinsic Feature Maps</h2>
                <p className="text-sm text-muted-foreground">
                  Intermediate layer activations ({featureMaps.length} maps)
                </p>
              </div>
            </div>

            {/* Feature Map Carousel */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden bg-foreground/5">
                <img
                  src={featureMaps[selectedFeatureIndex]}
                  alt={`Feature map ${selectedFeatureIndex + 1}`}
                  className="w-full h-48 md:h-64 object-contain"
                />
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={handlePrevFeature}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <button
                onClick={handleNextFeature}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-accent transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>

              {/* Index Badge */}
              <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border">
                <p className="text-xs font-medium text-muted-foreground">
                  {selectedFeatureIndex + 1} / {featureMaps.length}
                </p>
              </div>
            </div>

            {/* Thumbnail Grid */}
            <div className="mt-4 grid grid-cols-4 md:grid-cols-6 gap-2">
              {featureMaps.slice(0, 6).map((map, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedFeatureIndex(index)}
                  className={`rounded-lg overflow-hidden border-2 transition-all ${
                    selectedFeatureIndex === index 
                      ? 'border-primary shadow-medical' 
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <img
                    src={map}
                    alt={`Feature map ${index + 1}`}
                    className="w-full h-12 md:h-16 object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-muted/50 flex items-start gap-3">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Feature maps</strong> show intermediate representations 
                learned by convolutional layers. These visualizations help understand what patterns the 
                model detects at different abstraction levels.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainabilitySection;
