# IT Knowledge Hub

A modern, internal knowledge base management application for IT departments. Built with React, TypeScript, Express, and SQLite.

## Features

- **Article Management**: Create, edit, delete, and organize knowledge base articles
- **Rich Text Content**: Full Markdown support with syntax highlighting
- **Categories & Tags**: Organize articles by category and tag for easy discovery
- **Search & Filter**: Search across titles, tags, and content; filter by category, tag, and status
- **User Roles**: Admin (full access) and Viewer (read-only) roles
- **View Tracking**: Track which articles are most viewed
- **Modern UI**: Clean, professional interface with dark sidebar and card-based layout

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (via better-sqlite3)
- **Markdown**: react-markdown with remark-gfm and rehype-highlight

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

1. Clone the repository:
```bash
cd it-knowledge-hub
```

2. Install all dependencies:
```bash
npm run install:all
```

Or install separately:
```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install

# Client dependencies
cd ../client && npm install
```

### Development

Run both server and client in development mode:
```bash
npm run dev
```

Or run separately:
```bash
# In one terminal
npm run dev:server

# In another terminal
npm run dev:client
```

- Server runs on: http://localhost:3001
- Client runs on: http://localhost:3000

### Production

1. Build the client:
```bash
npm run build:client
```

2. Start the server:
```bash
npm start
```

## Project Structure

```
it-knowledge-hub/
├── server/                 # Backend API
│   ├── index.js           # Express server with SQLite
│   └── package.json
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## API Endpoints

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create a new category

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create a new user

### Articles
- `GET /api/articles` - List articles (with optional filters)
- `GET /api/articles/:id` - Get a single article (increments view count)
- `POST /api/articles` - Create a new article
- `PUT /api/articles/:id` - Update an article
- `DELETE /api/articles/:id` - Delete an article

### Stats
- `GET /api/stats` - Get dashboard statistics

## Default Data

The application seeds the following default data on first run:

- **Categories**: Hardware, Network, Software, Access & Accounts, Troubleshooting, Onboarding/Offboarding, Other
- **Admin User**: Admin (role: admin)

## Customization

### Adding Custom Categories

1. Navigate to Settings page
2. Scroll to Categories section
3. Enter category name and click "Create Category"

### Creating Users

1. Navigate to Settings page
2. Scroll to Users section
3. Enter user name, select role, and click "Create User"

### Markdown Support

The article editor supports full Markdown syntax:

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

- List item
- Another item

1. Numbered item
2. Another numbered item

[Link](https://example.com)

`inline code`

```javascript
// Code block
const example = 'code';
```

> Blockquote

| Table | Header |
|-------|--------|
| Cell  | Data   |
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT
