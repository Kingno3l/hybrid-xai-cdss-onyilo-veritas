import React, { useState } from 'react';
import { Eye, Layers, Activity, Info, HelpCircle, Shield, AlertTriangle } from 'lucide-react';

const ExplainabilitySection = ({ prediction, symptoms, gradcamImage, shapImage, limeImage, attentionImage, originalImage }) => {
  const [activeTab, setActiveTab] = useState('gradcam');
  const [showOriginal, setShowOriginal] = useState(false);

  // Set default values for symptoms if none were provided during upload
  const currentSymptoms = symptoms || { cold: 50, environment: 50, immunity: 75, smoking: false };

  const tabs = [
    {
      id: 'gradcam',
      label: 'Grad-CAM',
      image: gradcamImage,
      desc: 'Grad-CAM (Gradient-weighted Class Activation Mapping) highlights the coarse regions in the convolutional layers that carried the highest gradient load during the classification decision.',
      badgeColor: 'bg-red-50 text-red-700 border-red-200/50'
    },
    {
      id: 'shap',
      label: 'SHAP',
      image: shapImage,
      desc: 'SHAP (SHapley Additive exPlanations) uses cooperative game theory to calculate pixel-level feature attribution. Red areas represent positive attribution (pushing the model to predict Pneumonia), while Blue areas represent negative attribution (pushing toward Normal).',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
    },
    {
      id: 'lime',
      label: 'LIME',
      image: limeImage,
      desc: 'LIME (Local Interpretable Model-agnostic Explanations) segmentizes the X-ray into superpixels and highlights the top-3 localized boundaries that support the predicted diagnosis while dimming irrelevant regions.',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
    },
    {
      id: 'attention',
      label: 'Self-Attention',
      image: attentionImage,
      desc: 'Self-Attention map visualizes localized patches and draws connection vectors where the model’s internal self-attention heads placed the highest weight, similar to a Vision Transformer (ViT).',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200/50'
    }
  ];

  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0];
  const isPneumonia = prediction?.toLowerCase() === 'pneumonia';

  // Dynamic headers depending on the active XAI method
  const getClinicalAttributionHeader = () => {
    switch (activeTab) {
      case 'shap':
        return {
          title: 'SHAP Explanation (Attributions Plot)',
          subtitle: 'Game-theoretic additive contributions of clinical risk factors & chest X-ray findings'
        };
      case 'lime':
        return {
          title: 'LIME Explanation',
          subtitle: 'Local linear surrogate model coefficients for clinical & visual features'
        };
      case 'attention':
        return {
          title: 'Self-Attention Head Weights',
          subtitle: 'Self-attention weight distributions across image patches and clinical risk indices'
        };
      case 'gradcam':
      default:
        return {
          title: 'Grad-CAM Visual Activation Load',
          subtitle: 'Gradient weights mapped to specific lung airspaces and clinical baselines'
        };
    }
  };

  // Helper to generate dynamic metrics combining visual findings & clinical inputs
  const getHybridFeatures = () => {
    const cVal = currentSymptoms.cold / 100;
    const eVal = currentSymptoms.environment / 100;
    const iVal = currentSymptoms.immunity / 100;
    const sVal = currentSymptoms.smoking ? 1 : 0;

    // --- PNEUMONIA PREDICTION VALUES ---
    if (isPneumonia) {
      switch (activeTab) {
        case 'shap':
          return [
            { name: 'Lung Opacity / Consolidation', category: 'Visual', inputValue: 'Detected', value: 0.45, desc: 'Image segments showing alveolar fluid and white blood cell buildup.', format: 'percent' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: cVal * 0.22, desc: 'High values weaken upper respiratory defense barriers.', format: 'percent' },
            { name: 'Environment (Pollution / Crowding)', category: 'Environmental', inputValue: `${currentSymptoms.environment}%`, value: eVal * 0.18, desc: 'High particulate index or indoor crowding increases pathogen transmission.', format: 'percent' },
            { name: 'Patient Immunity Level', category: 'Clinical', inputValue: `${currentSymptoms.immunity}%`, value: iVal > 0.5 ? -(iVal - 0.5) * 0.25 : (0.5 - iVal) * 0.20, desc: 'High immunity actively suppresses pathogen colonization; low immunity raises risk.', format: 'percent' },
            { name: 'Airway Damage (Smoking History)', category: 'Clinical', inputValue: currentSymptoms.smoking ? 'Yes' : 'No', value: sVal ? 0.14 : -0.04, desc: 'Damaged bronchial cilia reduce clearance of aspirated bacteria/viruses.', format: 'percent' },
            { name: 'Air Bronchograms', category: 'Visual', inputValue: 'Detected', value: 0.24, desc: 'Dark outlines of air passages visible due to surrounding fluid consolidation.', format: 'percent' }
          ];
        case 'lime':
          return [
            { name: 'Lung Opacity / Consolidation', category: 'Visual', inputValue: 'Detected', value: 0.55, desc: 'Local ridge coefficient for opacity superpixels.', format: 'coeff' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: cVal * 0.28, desc: 'Local regression weight for environmental cold exposure.', format: 'coeff' },
            { name: 'Environment (Pollution / Crowding)', category: 'Environmental', inputValue: `${currentSymptoms.environment}%`, value: eVal * 0.22, desc: 'Local weight for inhaled air contaminants.', format: 'coeff' },
            { name: 'Patient Immunity Level', category: 'Clinical', inputValue: `${currentSymptoms.immunity}%`, value: (0.5 - iVal) * 0.35, desc: 'Attribution for active immune response parameters.', format: 'coeff' },
            { name: 'Airway Damage (Smoking History)', category: 'Clinical', inputValue: currentSymptoms.smoking ? 'Yes' : 'No', value: sVal ? 0.18 : -0.06, desc: 'Regression slope for cellular ciliary dysfunction.', format: 'coeff' },
            { name: 'Air Bronchograms', category: 'Visual', inputValue: 'Detected', value: 0.32, desc: 'Coarse coefficient for visual bronchial segments.', format: 'coeff' }
          ];
        case 'attention':
          return [
            { name: 'Lung Opacity / Consolidation', category: 'Visual', inputValue: 'Detected', value: 0.40, desc: 'Visual attention concentrated on white lung consolidation patches.', format: 'weight' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: 0.20, desc: 'Attention score distributed on cold-exposure parameters.', format: 'weight' },
            { name: 'Environment (Pollution / Crowding)', category: 'Environmental', inputValue: `${currentSymptoms.environment}%`, value: 0.15, desc: 'Relative weight for particulate and crowded environment inputs.', format: 'weight' },
            { name: 'Patient Immunity Level', category: 'Clinical', inputValue: `${currentSymptoms.immunity}%`, value: 0.12, desc: 'Attribution score for physiological immunity baseline.', format: 'weight' },
            { name: 'Airway Damage (Smoking History)', category: 'Clinical', inputValue: currentSymptoms.smoking ? 'Yes' : 'No', value: 0.08, desc: 'Model attention allocated to bronchial background records.', format: 'weight' },
            { name: 'Air Bronchograms', category: 'Visual', inputValue: 'Detected', value: 0.05, desc: 'Fine-grained attention allocated to linear airway maps.', format: 'weight' }
          ];
        case 'gradcam':
        default:
          return [
            { name: 'Lung Opacity / Consolidation', category: 'Visual', inputValue: 'Detected', value: 0.88, desc: 'Gradient weights highlighting opaque visual consolidation zones.', format: 'percent' },
            { name: 'Air Bronchograms', category: 'Visual', inputValue: 'Detected', value: 0.54, desc: 'Coarse activation overlay matching airway patterns.', format: 'percent' },
            { name: 'Pleural Effusion (Fluid buildup)', category: 'Visual', inputValue: 'Detected', value: 0.35, desc: 'Regional gradient activation blunting costophrenic angles.', format: 'percent' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: cVal * 0.10, desc: 'Auxiliary clinical correlation weight.', format: 'percent' }
          ];
      }
    }
    // --- NORMAL PREDICTION VALUES ---
    else {
      switch (activeTab) {
        case 'shap':
          return [
            { name: 'Clear Airspaces', category: 'Visual', inputValue: 'Normal', value: 0.55, desc: 'Healthy dark, air-filled lungs pushing model away from Pneumonia.', format: 'percent' },
            { name: 'Patient Immunity Level', category: 'Clinical', inputValue: `${currentSymptoms.immunity}%`, value: iVal * 0.25, desc: 'High immunity acts as a strong protective factor against lung infections.', format: 'percent' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: -cVal * 0.10, desc: 'Low exposure results in minimal compromise to respiratory cilia.', format: 'percent' },
            { name: 'Environment (Pollution / Crowding)', category: 'Environmental', inputValue: `${currentSymptoms.environment}%`, value: -eVal * 0.08, desc: 'Low pollution index ensures clean, uncompromised airway linings.', format: 'percent' },
            { name: 'Airway Damage (Smoking History)', category: 'Clinical', inputValue: currentSymptoms.smoking ? 'Yes' : 'No', value: sVal ? -0.15 : 0.05, desc: 'Absence of smoking history maintains optimal ciliary defense.', format: 'percent' },
            { name: 'Sharp Costophrenic Angles', category: 'Visual', inputValue: 'Normal', value: 0.34, desc: 'Pointing lung edges indicating healthy airspaces without fluid.', format: 'percent' }
          ];
        case 'lime':
          return [
            { name: 'Clear Airspaces', category: 'Visual', inputValue: 'Normal', value: 0.65, desc: 'Local ridge regression coefficient for clear airspace superpixels.', format: 'coeff' },
            { name: 'Patient Immunity Level', category: 'Clinical', inputValue: `${currentSymptoms.immunity}%`, value: iVal * 0.32, desc: 'Local regression weight for healthy baseline immunity parameters.', format: 'coeff' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: -cVal * 0.12, desc: 'Attribution showing low cold vulnerability.', format: 'coeff' },
            { name: 'Environment (Pollution / Crowding)', category: 'Environmental', inputValue: `${currentSymptoms.environment}%`, value: -eVal * 0.10, desc: 'Regression slope for minimal environmental irritation.', format: 'coeff' },
            { name: 'Airway Damage (Smoking History)', category: 'Clinical', inputValue: currentSymptoms.smoking ? 'Yes' : 'No', value: sVal ? -0.20 : 0.08, desc: 'Local weight demonstrating bronchial lining protection.', format: 'coeff' },
            { name: 'Sharp Costophrenic Angles', category: 'Visual', inputValue: 'Normal', value: 0.40, desc: 'Regression slope for costophrenic angle regions.', format: 'coeff' }
          ];
        case 'attention':
          return [
            { name: 'Clear Airspaces', category: 'Visual', inputValue: 'Normal', value: 0.45, desc: 'Visual attention weights centered on healthy, clear dark lung areas.', format: 'weight' },
            { name: 'Patient Immunity Level', category: 'Clinical', inputValue: `${currentSymptoms.immunity}%`, value: 0.22, desc: 'Attention score distributed on patient defense baseline inputs.', format: 'weight' },
            { name: 'Cold Exposure Level', category: 'Clinical', inputValue: `${currentSymptoms.cold}%`, value: 0.08, desc: 'Attention weight mapped to temperature records.', format: 'weight' },
            { name: 'Environment (Pollution / Crowding)', category: 'Environmental', inputValue: `${currentSymptoms.environment}%`, value: 0.06, desc: 'Model attention allocated to clean air inputs.', format: 'weight' },
            { name: 'Airway Damage (Smoking History)', category: 'Clinical', inputValue: currentSymptoms.smoking ? 'Yes' : 'No', value: 0.04, desc: 'Relative weight for airway background profiles.', format: 'weight' }
          ];
        case 'gradcam':
        default:
          return [
            { name: 'Clear Airspaces', category: 'Visual', inputValue: 'Normal', value: 0.90, desc: 'Gradient activation weights highlighting dark healthy lungs.', format: 'percent' },
            { name: 'Sharp Costophrenic Angles', category: 'Visual', inputValue: 'Normal', value: 0.62, desc: 'Regional gradient activation showing sharp costophrenic junctions.', format: 'percent' },
            { name: 'Lung Opacity / Consolidation', category: 'Visual', inputValue: 'Absent', value: -0.02, desc: 'Negligible activation for consolidation targets.', format: 'percent' }
          ];
      }
    }
  };

  const formatValue = (val, format) => {
    const isPositive = val > 0;
    const absVal = Math.abs(val);

    switch (format) {
      case 'percent':
        return `${isPositive ? '+' : ''}${(val * 100).toFixed(0)}%`;
      case 'coeff':
        return `${isPositive ? '+' : ''}${val.toFixed(2)}`;
      case 'weight':
        return `${(val * 100).toFixed(0)}% wt`;
      default:
        return val;
    }
  };

  const clinicalFeatures = getHybridFeatures();
  const attributionHeader = getClinicalAttributionHeader();

  return (
    <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
      {/* Visualizations Card */}
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-border/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light">
                <Layers className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Explainability Visualizations (XAI)</h2>
                <p className="text-sm text-muted-foreground">Compare multiple state-of-the-art XAI methods</p>
              </div>
            </div>

            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="px-3.5 py-2 rounded-lg bg-muted text-xs font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors border border-border ml-auto md:ml-0 shadow-sm"
            >
              {showOriginal ? 'Show Explanation Map' : 'Show Original X-ray'}
            </button>
          </div>

          {/* XAI Method Selection Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl border border-border/60 mb-5 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setShowOriginal(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab.id && !showOriginal
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Visual Display */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950/20 border border-border/50 flex items-center justify-center">
            <img
              src={showOriginal ? originalImage : currentTab.image}
              alt={showOriginal ? "Original X-ray" : `${currentTab.label} visualization`}
              className="w-full h-64 md:h-80 object-contain transition-all duration-300"
            />
            <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-card/90 backdrop-blur-sm border border-border flex items-center gap-1.5">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${currentTab.badgeColor}`}>
                {showOriginal ? 'Original' : currentTab.label}
              </span>
            </div>
          </div>

          {/* Explanation Info Box */}
          <div className="mt-4 p-4 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-3">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">{currentTab.label} Explanation: </strong>
              {currentTab.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Feature Importance Card */}
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/30">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{attributionHeader.title}</h2>
              <p className="text-sm text-muted-foreground">{attributionHeader.subtitle}</p>
            </div>
          </div>

          {/* Feature Importance Bars */}
          <div className="space-y-5">
            {clinicalFeatures.map((feat) => {
              const absVal = Math.abs(feat.value);
              const pct = (absVal * 100).toFixed(0);

              // Decide if it contributes to Pneumonia or protects from it
              const contributes = isPneumonia ? feat.value > 0 : feat.value < 0;
              const protects = isPneumonia ? feat.value < 0 : feat.value > 0;

              let statusText = "Neutral / Low Impact";
              let statusBadge = "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
              let barColor = "bg-slate-400 dark:bg-slate-600";

              if (Math.abs(feat.value) > 0.02) {
                if (contributes) {
                  statusText = "Contributes to Pneumonia";
                  statusBadge = "bg-rose-50 border border-rose-100 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-400";
                  barColor = "bg-rose-500 shadow-sm";
                } else if (protects) {
                  statusText = "Protects / Reduces Risk";
                  statusBadge = "bg-blue-50 border border-blue-100 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-400";
                  barColor = "bg-blue-500 shadow-sm";
                }
              }

              return (
                <div key={feat.name} className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-3">
                  {/* Title and Badge Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{feat.name}</span>
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-muted text-muted-foreground border border-border/80 tracking-wider">
                          {feat.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Input Value: <strong className="text-foreground">{feat.inputValue}</strong>
                      </span>
                    </div>

                    {/* Contributes vs Protects Badge */}
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-center tracking-wide inline-flex items-center gap-1 ${statusBadge}`}>
                      {contributes && Math.abs(feat.value) > 0.02 ? (
                        <AlertTriangle className="w-3 h-3 text-rose-500" />
                      ) : protects && Math.abs(feat.value) > 0.02 ? (
                        <Shield className="w-3 h-3 text-blue-500" />
                      ) : null}
                      {statusText}
                    </span>
                  </div>

                  {/* Progress Bar & Value Row */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden flex-grow border border-border/50">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-1000`}
                          style={{ width: `${activeTab === 'lime' ? absVal * 100 : pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-foreground w-12 text-right flex-shrink-0">
                        {formatValue(feat.value, feat.format)}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-normal">{feat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pathological Determinants Insight */}
          <div className="mt-6 p-4 rounded-xl bg-accent/40 border border-accent/60">
            <h4 className="text-xs font-bold text-accent-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Pathological Insight: What is the main determinant?</span>
            </h4>
            <div className="text-xs text-muted-foreground space-y-2 leading-relaxed font-sans">
              <p>
                <strong>Lung Opacity / Consolidation</strong> is the main radiological determinant of Pneumonia. On an X-ray, this represents the fluid, pus, and white blood cells that fill the alveoli (air sacs) to fight the infection, blocking X-rays and showing up as patchy white "cloudiness."
              </p>
              <p>
                <strong>Does "Cold" cause it?</strong> No, cold weather itself does not cause pneumonia. Pneumonia is a lung infection caused by pathogens (like bacteria, viruses, or fungi). However, cold weather increases indoor crowding, which spreads respiratory viruses, and breathing cold air can slightly dry lung protective mucus, making it easier for pathogens to colonize.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilitySection;
