# RM75 Showcase Backend Deployment Guide

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment to Render

### Automatic Deployment (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Render will automatically use the `render.yaml` configuration

### Manual Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   
4. Add environment variables:
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: Your frontend URL
   - `PORT`: `3001` (or leave blank for Render to assign)

5. Deploy!

## Environment Variables

Required environment variables for production:
- `NODE_ENV`: Set to `production`
- `FRONTEND_URL`: Your frontend URL for CORS

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/watches` - Get all watches (supports filtering)
- `GET /api/watches/:id` - Get single watch
- `GET /api/collections` - Get all collections
- `GET /api/collections/:id/watches` - Get watches by collection
- `GET /images/*` - Serve watch images

## Adding Watch Images

1. Place images in `/public/images/`
2. Follow naming convention: `rm-075-XX-[front|back|side].jpg`
3. Optimize images for web before uploading