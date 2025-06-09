# Rugplay Logger Documentation

This directory contains the documentation website for the Rugplay Logger project, built with Jekyll and the Just the Docs theme.

## Local Development

To run the documentation site locally:

### Prerequisites

- Ruby 3.0 or higher
- Bundler gem

### Setup

1. Install dependencies:
   ```bash
   bundle install
   ```

2. Serve the site locally:
   ```bash
   bundle exec jekyll serve
   ```

3. Open your browser to `http://localhost:4000`

### Building for Production

To build the static site:

```bash
bundle exec jekyll build
```

The built site will be in the `_site/` directory.

## Documentation Structure

- `index.md` - Homepage with project overview
- `api.md` - Complete API reference
- `configuration.md` - Configuration guide
- `events.md` - WebSocket event types reference
- `examples.md` - Usage examples and recipes

## Contributing to Documentation

1. Edit the relevant `.md` files
2. Test locally with `bundle exec jekyll serve`
3. Submit a pull request

## Deployment

This documentation is automatically deployed to GitHub Pages via GitHub Actions when changes are pushed to the `main` branch in the `docs/` directory.
