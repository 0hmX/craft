import React from 'react';
import Canvas from './Canvas'; // Assuming Canvas is in the same dir or adjust path
import ControlBar from './ControlBar';
import { type Interpreter } from '../../submodules/jspython/src/interpreter'; // Adjust path as needed
import { Theme } from '@/lib/theme';


interface CanvasPanelProps {
  theme: Theme;
  canvasWidth: number;
  canvasHeight: number;
  gridSize: number;
  showGrid: boolean;
  pythonCode: string;
  pythonInterpreter: Interpreter | null;
  shouldRun: boolean;
  onRunComplete: (err?: Error) => void;
  onGridSizeChange: (size: number) => void;
  onShowGridChange: (show: boolean) => void;
  isMobile?: boolean; // Optional flag
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({
  theme,
  canvasWidth,
  canvasHeight,
  gridSize,
  showGrid,
  pythonCode,
  pythonInterpreter,
  shouldRun,
  onRunComplete,
  onGridSizeChange,
  onShowGridChange,
  isMobile = false, // Default to false
}) => {
  const panelClasses = `relative h-full overflow-hidden border ${
    isMobile ? 'rounded-xl' : 'rounded-r-xl' // Adjust rounding based on context
  }`;
  const borderStyle = isMobile ? {} : { borderLeftWidth: 0 }; // No left border on desktop right panel

  return (
    <div
      className={panelClasses}
      style={{
        backgroundColor: theme.colors.panelBg,
        borderColor: theme.colors.border,
        ...borderStyle,
      }}
    >
      <div className="flex h-full flex-col">
        <div className="flex-grow flex items-center justify-center overflow-hidden p-2">
          <Canvas
            width={canvasWidth}
            height={canvasHeight}
            gridSize={gridSize}
            showGrid={showGrid}
            pythonCode={pythonCode}
            pythonInterpreter={pythonInterpreter}
            shouldRun={shouldRun}
            onRunComplete={onRunComplete}
          />
        </div>
        <ControlBar
          theme={theme}
          gridSize={gridSize}
          showGrid={showGrid}
          onGridSizeChange={onGridSizeChange}
          onShowGridChange={onShowGridChange}
          isMobile={isMobile}
        />
      </div>
    </div>
  );
};

export default CanvasPanel;