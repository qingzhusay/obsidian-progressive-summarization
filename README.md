# Obsidian Plugin Template

A clean template for Obsidian plugin development, modified from the official sample plugin.

## Development Setup

1. Clone to local development folder
```bash
git clone https://github.com/qingzhusay/obsidian-sample-plugin.git
```

2. Install dependencies
```bash
npm install
```

3. Start development mode
```bash
npm run dev
```

## Development Workflow

1. Testing in Obsidian
- Clone the repo to `.obsidian/plugins/your-plugin-name`
- Enable plugin in Obsidian settings
- Plugin will auto-reload after code changes

2. Code Quality
```bash
npm run lint        # Run ESLint
npm run build      # Build production version
```

## Version Release Process

1. Update Version
```bash
# Update minAppVersion in manifest.json first， then run one of:
npm version patch   # Update patch version (1.0.0 -> 1.0.1)
npm version minor   # Update minor version (1.0.0 -> 1.1.0)
npm version major   # Update major version (1.0.0 -> 2.0.0)
```

2. Create GitHub Release
- Create tag with new version number (no 'v' prefix)
- Upload required files:
  - main.js
  - manifest.json
  - styles.css

3. Submit to Community Plugins
- Follow [plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- Submit PR to [obsidian-releases](https://github.com/obsidianmd/obsidian-releases)
- Include in PR:
  - Plugin name and description
  - GitHub repository URL
  - Author information

## Manual Installation

Copy these files to `VaultFolder/.obsidian/plugins/your-plugin-id/`:
- main.js
- manifest.json
- styles.css

## Support Development

If you find this plugin useful, you can support me via:
- [Ko-fi](https://ko-fi.com/qingzhu)
- [GitHub Sponsors](https://github.com/sponsors/qingzhusay)

## API Documentation

- [Obsidian Plugin API](https://github.com/obsidianmd/obsidian-api)
- [Plugin Development Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)

## License

[ISC License](LICENSE) © Qing Zhu