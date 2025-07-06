const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://rm75-showcase.onrender.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for watch images
app.use('/images', express.static(path.join(__dirname, 'public/images'), {
  maxAge: '1d',
  etag: true
}));

// Watch data - In production, this could come from a database
const watchData = {
  models: [
    {
      id: 'rm-075-01',
      name: 'RM 75-01 Automatic Tourbillon',
      collection: 'Racing',
      material: 'Carbon TPT',
      movement: 'Automatic',
      limitedEdition: true,
      price: 'Price on Request',
      features: [
        'Automatic tourbillon movement',
        'Carbon TPT case',
        '50-hour power reserve',
        'Water resistant to 50m'
      ],
      images: [
        '/images/rm-075-01-front.jpg',
        '/images/rm-075-01-back.jpg',
        '/images/rm-075-01-side.jpg'
      ],
      specifications: {
        case: {
          material: 'Carbon TPT',
          dimensions: '50.00 x 42.70 x 16.90 mm',
          waterResistance: '50 meters'
        },
        movement: {
          type: 'Automatic',
          caliber: 'RM75-01',
          powerReserve: '50 hours',
          frequency: '28,800 vph'
        },
        dial: {
          material: 'Sapphire crystal',
          features: ['Skeletonized', 'Luminescent hands']
        },
        strap: {
          material: 'Rubber',
          clasp: 'Titanium folding clasp'
        }
      }
    },
    {
      id: 'rm-075-02',
      name: 'RM 75-02 Manual Winding',
      collection: 'Classic',
      material: 'Rose Gold',
      movement: 'Manual',
      limitedEdition: false,
      price: 'Price on Request',
      features: [
        'Manual winding movement',
        'Rose gold case',
        '70-hour power reserve',
        'Ultra-thin profile'
      ],
      images: [
        '/images/rm-075-02-front.jpg',
        '/images/rm-075-02-back.jpg',
        '/images/rm-075-02-side.jpg'
      ],
      specifications: {
        case: {
          material: '18k Rose Gold',
          dimensions: '48.00 x 40.30 x 13.84 mm',
          waterResistance: '30 meters'
        },
        movement: {
          type: 'Manual winding',
          caliber: 'RM75-02',
          powerReserve: '70 hours',
          frequency: '21,600 vph'
        },
        dial: {
          material: 'Sapphire crystal',
          features: ['Skeletonized', 'Gold hands']
        },
        strap: {
          material: 'Alligator leather',
          clasp: 'Rose gold folding clasp'
        }
      }
    }
  ],
  collections: [
    {
      id: 'racing',
      name: 'Racing',
      description: 'Inspired by motorsports, featuring lightweight materials and shock resistance'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Timeless elegance with traditional complications and precious materials'
    },
    {
      id: 'sport',
      name: 'Sport',
      description: 'Built for extreme conditions with advanced materials and protection'
    }
  ]
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all watches
app.get('/api/watches', (req, res) => {
  const { collection, movement, material } = req.query;
  let filteredWatches = watchData.models;

  if (collection) {
    filteredWatches = filteredWatches.filter(
      watch => watch.collection.toLowerCase() === collection.toLowerCase()
    );
  }

  if (movement) {
    filteredWatches = filteredWatches.filter(
      watch => watch.movement.toLowerCase() === movement.toLowerCase()
    );
  }

  if (material) {
    filteredWatches = filteredWatches.filter(
      watch => watch.material.toLowerCase().includes(material.toLowerCase())
    );
  }

  res.json({
    success: true,
    count: filteredWatches.length,
    data: filteredWatches
  });
});

// Get single watch by ID
app.get('/api/watches/:id', (req, res) => {
  const watch = watchData.models.find(w => w.id === req.params.id);
  
  if (!watch) {
    return res.status(404).json({
      success: false,
      message: 'Watch not found'
    });
  }

  res.json({
    success: true,
    data: watch
  });
});

// Get all collections
app.get('/api/collections', (req, res) => {
  res.json({
    success: true,
    data: watchData.collections
  });
});

// Get watches by collection
app.get('/api/collections/:id/watches', (req, res) => {
  const collectionId = req.params.id;
  const watches = watchData.models.filter(
    watch => watch.collection.toLowerCase() === collectionId.toLowerCase()
  );

  res.json({
    success: true,
    collection: watchData.collections.find(c => c.id === collectionId),
    count: watches.length,
    data: watches
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});