# code-buster

A React + TypeScript application deployed on GitHub Pages.

## Development

Install dependencies:
```bash
npm install
```

Run development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Deployment

### Automatic Deployment (Recommended)

This project uses GitHub Actions for automatic deployment. Every push to the `main` branch will trigger a deployment.

**Setup Steps:**
1. Go to your repository Settings → Pages
2. Under "Build and deployment", set Source to "GitHub Actions"
3. Push your code to the `main` branch
4. The site will be available at: `https://chunyang.github.io/code-buster/`

### Manual Deployment

You can also deploy manually:
```bash
npm run deploy
```

This will build and push to the `gh-pages` branch.

## License

See LICENSE file for details.
