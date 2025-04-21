import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';

// Define the shape of the state
interface AppState {
  pythonCode: string;
  gridSize: number;
  showGrid: boolean;
}

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
// Define the shape of the context value (state + setters)
interface AppContextType extends AppState {
  setPythonCode: Dispatch<SetStateAction<string>>;
  setGridSize: Dispatch<SetStateAction<number>>;
  setShowGrid: Dispatch<SetStateAction<boolean>>;
}

// Create the context with a default value (can be undefined or null, handled in provider/consumer)
const AppContext = createContext<AppContextType | undefined>(undefined);

// Define the props for the provider
interface AppProviderProps {
  children: ReactNode;
}

// Create the provider component
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [pythonCode, setPythonCode] = useState<string>(DEFAULT_PYTHON_CODE);
  const [gridSize, setGridSize] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const value = {
    pythonCode,
    gridSize,
    showGrid,
    setPythonCode,
    setGridSize,
    setShowGrid,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Create a custom hook for easy consumption
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};