# Galaxia React Example

A React + TypeScript example application demonstrating the Galaxia Three.js library for galaxy visualization.

## Features

- 🎮 Interactive 3D galaxy visualization
- 🎨 Multiple galaxy presets (Spiral, Star Cluster, Elliptical, etc.)
- 🎛️ Real-time parameter controls with Leva
- 📊 Performance monitoring with stats display
- 🖱️ Orbit controls for camera manipulation

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. First, build the galaxia-three library:
```bash
cd ../galaxia-three
npm install
npm run build
```

2. Install dependencies:
```bash
cd ../galaxia-react-example
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

### Controls

- **Left Mouse**: Rotate camera
- **Right Mouse**: Pan camera
- **Scroll**: Zoom in/out
- **Parameter Panel**: Adjust galaxy properties in real-time

### Presets

The example includes several galaxy presets:

- **Spiral Galaxy**: Classic spiral structure with density wave distribution
- **Star Cluster**: Dense globular cluster using Gaussian distribution
- **Barred Spiral**: Spiral galaxy with central bar structure
- **Elliptical Galaxy**: Smooth elliptical distribution
- **Dwarf Galaxy**: Small irregular galaxy

### Customization

You can customize galaxies using the parameter controls:

- **Galaxy Properties**: Size, height, particle count, animation speed
- **Distribution**: Algorithm type, random seed
- **Algorithm-specific**: Parameters for each distribution type

## Project Structure

```
src/
├── components/
│   ├── GalaxyScene.tsx      # Main galaxy rendering component
│   ├── ParameterControls.tsx # Leva parameter controls
│   └── PresetSelector.tsx    # Galaxy preset selector
├── utils/
│   └── presets.ts           # Galaxy preset definitions
├── App.tsx                  # Main application component
└── index.tsx               # Application entry point
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Technologies Used

- [React](https://reactjs.org/) - UI framework
- [Three.js](https://threejs.org/) - 3D graphics library
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [Drei](https://github.com/pmndrs/drei) - Useful helpers for R3F
- [Leva](https://github.com/pmndrs/leva) - GUI controls
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

MIT License