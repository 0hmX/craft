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

// Import the new components
import Header from '../components/Header';
import MobileControls from '../components/MobileControls';
import EditorPanel from '../components/EditorPanel';
import CanvasPanel from '../components/CanvasPanel';
// ControlBar is used within CanvasPanel, no direct import needed here

/**
 * @typedef {object} ThemeColors
 * @property {string} primary - Primary interactive color (e.g., buttons).
 * @property {string} secondary - Secondary background/accent color.
 * @property {string} background - Main background color/image.
 * @property {string} panelBg - Background for code editor and canvas panels.
 * @property {string} textPrimary - Primary text color, often on dark backgrounds.
 * @property {string} textSecondary - Secondary text color, often for labels.
 * @property {string} textHeader - Color for the main header text (original).
 * @property {string} bloodRed - Deep red color for the styled header.
 * @property {string} border - Border color for panels and elements.
 * @property {string} inputBg - Background color for input fields.
 * @property {string} inputBorder - Border color for input fields.
 * @property {string} checkboxAccent - Accent color for checkboxes.
 * @property {string} handleBg - Background color for the resizable handle.
 * @property {string} shadow - Default box shadow color/value.
 * @property {string} textShadow - Default text shadow color/value.
 * @property {string} bloodShadowDark - Darker shadow for blood effect.
 * @property {string} bloodShadowMid - Mid-tone shadow for blood effect.
 * @property {string} bloodShadowLight - Lighter shadow for blood effect.
 */

/**
 * @typedef {object} ThemeFonts
 * @property {string} primary - Primary font family for UI text.
 * @property {string} header - Font family specifically for the main header.
 */

/**
 * @typedef {object} ThemeLayout
 * @property {string} borderRadius - Standard border radius for panels.
 * @property {string} padding - Standard padding value.
 * @property {string} controlBarHeight - Minimum height for the control bar.
 * @property {string} panelShadow - Shadow for main panels.
 * @property {string} buttonPadding - Padding for standard buttons.
 */

/**
 * @typedef {object} ThemeBackground
 * @property {string} image - URL for the background image.
 * @property {string} size - Background size property.
 * @property {string} position - Background position property.
 * @property {string} attachment - Background attachment property.
 */

/**
 * @typedef {object} Theme
 * @property {ThemeColors} colors - Color palette.
 * @property {ThemeFonts} fonts - Font families.
 * @property {ThemeLayout} layout - Layout properties like padding and border radius.
 * @property {ThemeBackground} background - Background image properties.
 */

/**
 * Theme object defining the visual style of the application.
 * @type {Theme}
 */
const theme = {
  colors: {
    primary: 'rgba(139, 69, 19, 0.8)', // SaddleBrown-ish, semi-transparent
    secondary: 'rgba(210, 180, 140, 0.85)', // Tan-ish, semi-transparent
    panelBg: 'rgba(57, 52, 43, 0.9)', // Dark Olive/Brown, semi-transparent
    textPrimary: '#FFF8DC', // Cornsilk
    textSecondary: '#5D3A1A', // Darker Brown for labels
    textHeader: '#A0522D', // Sienna (original)
    bloodRed: '#8b0000', // DarkRed
    border: 'rgba(139, 69, 19, 0.5)', // SaddleBrown-ish, more transparent
    inputBg: '#FFF8DC', // Cornsilk (approximates amber-50)
    inputBorder: '#8B4513', // SaddleBrown (approximates amber-700)
    checkboxAccent: '#8B4513', // SaddleBrown (approximates amber-700)
    handleBg: 'rgba(139, 69, 19, 0.3)', // SaddleBrown-ish, very transparent
    shadow: 'rgba(0,0,0,0.15)',
    textShadow: 'rgba(0,0,0,0.3)',
    // Colors for the blood drip text shadow effect
    bloodShadowDark: 'rgba(50, 0, 0, 0.8)',
    bloodShadowMid: 'rgba(100, 0, 0, 0.6)',
    bloodShadowLight: 'rgba(139, 0, 0, 0.4)',
  },
  fonts: {
    primary: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
    header: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
  },
  layout: {
    borderRadius: '0.75rem', // Corresponds to rounded-xl
    padding: '1rem', // Corresponds to p-4
    controlBarHeight: '60px',
    panelShadow: '0 8px 32px rgba(0,0,0,0.15)',
    buttonPadding: '0.5rem 1.5rem',
  },
  background: {
    image: 'url("/bg.png")',
    size: 'cover',
    position: 'center',
    attachment: 'fixed',
  },
};

/**
 * Default Python code provided in the editor.
 * @type {string}
 */
const DEFAULT_PYTHON_CODE =
`# Copyright (c) 2025 0hmX
# SPDX-License-Identifier: MIT

"""
**This are the python vars and function you can use**

Utilities:
print: Output to console
range: Generate number array (start, stop, step)
len: Get length

Basic Arithmetic:
mod: Modulo (remainder)
div: Division

Math Functions:
max: Maximum value
min: Minimum value
abs: Absolute value
round: Round to nearest int
floor: Round down to int
ceil: Round up to int
random: Random float 0-1
sqrt: Square root
sin: Sine (radians)
cos: Cosine (radians)
tan: Tangent (radians)
asin: Arcsine (radians)
acos: Arccosine (radians)
atan: Arctangent (radians)
atan2: Arctangent (y/x, radians)
pow: Power (base^exponent)
log: Natural log (base E)
exp: E^x
log10: Base-10 log
log2: Base-2 log
log1p: Natural log (1+x)
hypot: Hypotenuse

Constants:
PI: Pi constant
E: Euler's number (base E)
1e: Alias for E
EULER: Alias for E
LN2: Natural log of 2
LN10: Natural log of 10
LOG2E: Base-2 log of E
LOG10E: Base-10 log of E
SQRT1_2: Square root of 1/2
SQRT2: Square root of 2
TAU: Tau constant (2*PI)
"""

def clamp(value, min_val, max_val):
    return max(min_val, min(max_val, value))

def draw(X, Y, Z, GRID_SIZE):
    center_coord = (GRID_SIZE - 1) / 2.0
    center_x = center_coord
    center_y = center_coord
    center_z = center_coord

    dx = X - center_x
    dy = Y - center_y
    dz = Z - center_z

    major_radius = GRID_SIZE * 0.35
    minor_radius = GRID_SIZE * 0.12

    if major_radius <= 0 or minor_radius <= 0:
        return False

    dist_xy = sqrt(pow(dx, 2) + pow(dy, 2))
    epsilon = 1e-6
    torus_check = pow(dist_xy - major_radius, 2) + pow(dz, 2)

    if torus_check <= pow(minor_radius, 2) + epsilon:
        angle_major = atan2(dy, dx) + PI
        ring_x = major_radius * cos(angle_major)
        ring_y = major_radius * sin(angle_major)
        vec_x = dx - ring_x
        vec_y = dy - ring_y
        vec_z = dz
        radial_vec_component = vec_x * cos(angle_major) + vec_y * sin(angle_major)
        angle_minor = atan2(vec_z, radial_vec_component) + PI

        r_comp = floor(clamp((angle_major / (2 * PI)) * 255, 0, 255))
        g_comp = floor(clamp((angle_minor / (2 * PI)) * 255, 0, 255))
        blue_factor = clamp((dz / (minor_radius + epsilon)) * 0.5 + 0.5, 0, 1)
        b_comp = floor(clamp(100 + blue_factor * 155, 0, 255))

        # Return RGB values as a list [R, G, B]
        return "rgb(" + r_comp + "," + g_comp + "," + b_comp + ")"
    else:
        return False
`;

/**
 * Main application component integrating the code editor and 3D canvas.
 * @returns {JSX.Element} The rendered application UI.
 */
const Index = () => {
  const [pythonCode, setPythonCode] = useState(DEFAULT_PYTHON_CODE);
  const [gridSize, setGridSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
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

  const handleCodeChange = (newCode: string) => {
    setPythonCode(newCode);
    if (error) {
      setError(null);
    }
  };

  const handleGridSizeChange = (size: number) => {
    setGridSize(Math.max(1, size)); // Ensure size is at least 1
  };

  const handleShowGridChange = (show: boolean) => {
    setShowGrid(show);
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
      pythonInterpreter.parse(pythonCode);
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
                pythonCode={pythonCode}
                onCodeChange={handleCodeChange}
                isMobile={true}
              />
            ) : (
              <CanvasPanel
                theme={theme}
                canvasWidth={canvasWidth} // Adjust width/height for mobile?
                canvasHeight={canvasHeight}
                gridSize={gridSize}
                showGrid={showGrid}
                pythonCode={pythonCode}
                pythonInterpreter={pythonInterpreter}
                shouldRun={shouldRun}
                onRunComplete={handleRunComplete}
                onGridSizeChange={handleGridSizeChange}
                onShowGridChange={handleShowGridChange}
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
                pythonCode={pythonCode}
                onCodeChange={handleCodeChange}
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
                canvasWidth={canvasWidth} // Consider adjusting based on panel size
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
