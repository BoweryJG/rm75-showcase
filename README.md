# Richard Mille RM-75-01 Ultra-Luxury 3D Showcase

A category-defining, hyper-realistic 3D showcase of the Richard Mille RM-75-01 Flying Tourbillon Sapphire watch collection with real-time Supabase data integration.

## 🎯 Features

### Hyper-Realistic Watch Visualization
- **Quantum-level zoom** (up to 10,000x magnification)
- **Physically accurate materials** with real-time ray tracing
- **Animated flying tourbillon** at exactly 1 RPM
- **Three color variants**: Clear Sapphire, Lilac Pink, Sapphire Blue
- **8K/16K texture support** for microscopic detail

### Real-Time Data Integration
- **Supabase-powered data windows** with holographic projections
- **Live market values**, authentication data, and environmental metrics
- **Configurable data panels** that float in 3D space
- **Glass morphism effects** matching sapphire crystal aesthetic

### Technical Excellence
- **Progressive LOD system** for optimal performance at any zoom level
- **Custom WebGL shaders** for caustics and light dispersion
- **HDR rendering** with advanced post-processing
- **60+ FPS** on high-end GPUs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (optional, will use mock data if not configured)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rm75-showcase.git
cd rm75-showcase
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Configure environment variables:
```bash
# Frontend
cp frontend/.env.example frontend/.env
# Add your Supabase credentials

# Backend
cp backend/.env.example backend/.env
# Configure port and environment
```

5. Start development servers:

In one terminal:
```bash
cd backend
npm run dev
# Server runs on http://localhost:3001
```

In another terminal:
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 🎨 Architecture

```
rm75-showcase/
├── frontend/                    # React + Three.js app
│   ├── src/
│   │   ├── components/
│   │   │   ├── LuxuryWatchShowcase.jsx    # Main 3D showcase
│   │   │   ├── TourbillonMechanism.jsx    # Animated mechanism
│   │   │   ├── SupabaseDataLayer.jsx      # Real-time data
│   │   │   ├── QuantumZoomControls.jsx    # Advanced zoom
│   │   │   └── materials/
│   │   │       └── HyperRealCrystal.jsx   # Custom shaders
│   │   ├── hooks/
│   │   │   └── useSupabase.js             # Data hook
│   │   └── lib/
│   │       └── supabase.js                # Client config
│   └── public/
│       ├── models/                         # 3D models
│       └── textures/                       # 8K/16K textures
└── backend/                                # Express API
    ├── server.js                          # Main server
    ├── routes/                            # API routes
    └── public/images/                     # Watch images
```

## 🌐 Deployment

### Deploy to Render

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Update `render.yaml` with your repository URL

3. Connect to Render and deploy:
   - Create a new Blueprint instance
   - Select your repository
   - Render will automatically deploy both services

### Environment Variables on Render

Backend service:
- `NODE_ENV=production`
- `PORT=3001`

Frontend static site:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

## 🎮 Controls

- **Mouse wheel**: Zoom in/out
- **Click and drag**: Rotate watch
- **Number keys 1-6**: Preset zoom levels
- **+/-**: Fine zoom control
- **0**: Reset view
- **Toggle**: Switch between showcase and data mode

## 🔧 Customization

### Adding New Watch Variants

1. Add variant to materials object in `LuxuryWatchShowcase.jsx`
2. Create texture sets in `public/textures/`
3. Update color selector in `App.jsx`

### Configuring Data Windows

Edit `SupabaseDataLayer.jsx` to customize:
- Panel positions and sizes
- Data types displayed
- Update intervals
- Visual effects

### Performance Tuning

Adjust in `LuxuryWatchShowcase.jsx`:
- `samples` prop on MeshTransmissionMaterial (8-32)
- Shadow map resolution (2048-8192)
- Post-processing effects
- LOD thresholds in QuantumZoomControls

## 📊 Supabase Schema

```sql
CREATE TABLE watches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  variant TEXT NOT NULL,
  market_value DECIMAL,
  authentication JSONB,
  ownership JSONB,
  environmental JSONB,
  movements JSONB,
  social JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time
ALTER TABLE watches REPLICA IDENTITY FULL;
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Richard Mille for creating horological masterpieces
- Three.js community for the amazing 3D library
- Supabase for real-time data infrastructure

---

Built with ❤️ and precision engineering