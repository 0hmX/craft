import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; // Keep Navbar for desktop
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { useIsMobile } from '@/hooks/use-mobile';
import { jsPython, type Interpreter } from '../../submodules/jspython/src/interpreter';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '../context/AppContext'; // Import the context hook

import Header from '../components/Header';
import MobileControls from '../components/MobileControls';
import EditorPanel from '../components/EditorPanel';
import CanvasPanel from '../components/CanvasPanel';
import { theme } from '@/lib/theme';

/**
 * Main application component integrating the code editor and 3D canvas.
 * @returns {JSX.Element} The rendered application UI.
 */
const Index = () => {
  // Get state and setters from AppContext
  const {
    pythonCode,
    gridSize,
    showGrid,
    setPythonCode,
    setGridSize,
    setShowGrid,
  } = useAppContext();

  const [canvasWidth, setCanvasWidth] = useState(500); // Consider making dynamic based on panel size
  const [canvasHeight, setCanvasHeight] = useState(500); // Consider making dynamic based on panel size
  const [pythonInterpreter, setPythonInterpreter] = useState<Interpreter | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [shouldRun, setShouldRun] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<'editor' | 'canvas'>('editor');
  const { toast } = useToast();

  useEffect(() => {
    console.log('Initializing js-python interpreter...');
    const interp = jsPython();
    setPythonInterpreter(interp);
    console.log('js-python interpreter initialized.');

    return () => {
      console.log('Cleaning up js-python interpreter...');
      interp?.cleanUp();
      setPythonInterpreter(null);
    };
  }, []);

  // Update handler to use context setter
  const handleCodeChange = (newCode: string) => {
    setPythonCode(newCode); // Use context setter
    if (error) {
      setError(null); // Keep local error reset logic
    }
  };

  // Update handler to use context setter
  const handleGridSizeChange = (size: number) => {
    setGridSize(Math.max(1, size)); // Use context setter, keep validation
  };

  // Update handler to use context setter
  const handleShowGridChange = (show: boolean) => {
    setShowGrid(show); // Use context setter
  };

  const handleRunCode = () => {
    if (!pythonInterpreter) {
      console.error('Python interpreter not initialized yet.');
      toast({
        title: "Interpreter Error",
        description: "Python interpreter is not ready.",
        variant: "destructive",
      });
      return;
    }
    if (isRunning) {
        console.log('Already running code.');
        return;
    }

    setError(null); // Reset error state

    try {
      // Attempt to parse the code to catch syntax errors early
      pythonInterpreter.parse(pythonCode); // Use pythonCode from context
      console.log('Python code parsed successfully.');

      // If parsing is successful, proceed to run
      console.log('Run button clicked, setting shouldRun=true');
      setIsRunning(true);
      setShouldRun(true); // Trigger run in CanvasPanel

    } catch (err) {
      console.error('Python syntax error:', err);
      const syntaxError = err instanceof Error ? err : new Error(String(err));
      setError(syntaxError);
      toast({
        title: "Syntax Error",
        description: syntaxError.message || 'Invalid Python syntax.',
        variant: "destructive",
      });
      setIsRunning(false); // Ensure isRunning is false if parsing fails
      setShouldRun(false);
    }
  };

  const handleRunComplete = (err?: Error) => {
    console.log('Canvas reported run complete, setting shouldRun=false');
    setShouldRun(false);
    setIsRunning(false);

    if (err) {
      console.error('Error during Python execution:', err);
      setError(err);
      toast({
        title: "Execution Error",
        description: err.message || 'An error occurred while running your code.',
        variant: "destructive",
      });
    } else {
        // Optionally show a success toast
        // toast({ title: "Success", description: "Code executed successfully." });
    }
  };

  const toggleMobileView = () => {
    setMobileView(prev => (prev === 'editor' ? 'canvas' : 'editor'));
  };

  const hasError = error !== null;

  return (
    <div
      className="min-h-screen w-screen overflow-hidden p-4 flex flex-col"
      style={{
        backgroundImage: theme.background.image,
        backgroundSize: theme.background.size,
        backgroundPosition: theme.background.position,
        backgroundAttachment: theme.background.attachment,
      }}
    >
      {/* Pass theme to Header */}
      <Header theme={theme} />

      {/* Show Navbar only on desktop */}
      {!isMobile && (
        <div className="mb-4">
          {/* Pass context values/handlers where needed */}
          <Navbar challengeBattleClick={() => {}} onRunCode={handleRunCode} isRunning={isRunning} error={error} />
        </div>
      )}

      {/* Mobile view controls */}
      {isMobile && (
        <MobileControls
          theme={theme}
          mobileView={mobileView}
          onToggle={toggleMobileView}
          isRunning={isRunning}
          hasError={hasError}
          onRunCode={handleRunCode}
        />
      )}

      {/* Main Content Area (Mobile or Desktop) */}
      <div className={`flex-grow ${isMobile ? 'h-[calc(100vh-220px)]' : 'h-[calc(100vh-180px)]'}`}>
        {isMobile ? (
          // Mobile Layout: Switch between Editor and Canvas
          <div
            className="h-full w-full overflow-hidden rounded-xl"
            style={{ boxShadow: theme.layout.panelShadow }}
          >
            {mobileView === 'editor' ? (
              <EditorPanel
                theme={theme}
                pythonCode={pythonCode} // Use context value
                onCodeChange={handleCodeChange} // Use updated handler
                isMobile={true}
              />
            ) : (
              <CanvasPanel
                theme={theme}
                canvasWidth={canvasWidth} // Adjust width/height for mobile?
                canvasHeight={canvasHeight}
                gridSize={gridSize} // Use context value
                showGrid={showGrid} // Use context value
                pythonCode={pythonCode} // Use context value
                pythonInterpreter={pythonInterpreter}
                shouldRun={shouldRun}
                onRunComplete={handleRunComplete}
                onGridSizeChange={handleGridSizeChange} // Use updated handler
                onShowGridChange={handleShowGridChange} // Use updated handler
                isMobile={true}
              />
            )}
          </div>
        ) : (
          // Desktop Layout: Resizable Panels
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full h-full rounded-xl overflow-hidden" // Ensure group takes full height
            style={{ boxShadow: theme.layout.panelShadow }}
          >
            <ResizablePanel defaultSize={50} minSize={30}>
              <EditorPanel
                theme={theme}
                pythonCode={pythonCode} // Use context value
                onCodeChange={handleCodeChange} // Use updated handler
                isMobile={false}
              />
            </ResizablePanel>

            <ResizableHandle
              withHandle
              className="transition-colors duration-200"
              style={{
                backgroundColor: theme.colors.handleBg,
              }}
            />

            <ResizablePanel defaultSize={50} minSize={30}>
              <CanvasPanel
                theme={theme}
                canvasWidth={canvasWidth}
                canvasHeight={canvasHeight}
                gridSize={gridSize}
                showGrid={showGrid}
                pythonCode={pythonCode}
                pythonInterpreter={pythonInterpreter}
                shouldRun={shouldRun}
                onRunComplete={handleRunComplete}
                onGridSizeChange={handleGridSizeChange}
                onShowGridChange={handleShowGridChange}
                isMobile={false}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
};

export default Index;
