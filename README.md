# IT Knowledge Hub - Power Pages Solution

A complete **IT Knowledge Base management application** built on **Microsoft Power Pages** platform.

## Overview

This solution provides a modern, professional knowledge base for IT departments, allowing staff to create, organize, and search internal documentation, troubleshooting guides, and how-to articles.

## Features

### ✅ Core Features
- **Article Dashboard** - Grid view of all articles with category, status, views, author, and date
- **Article List** - Detailed list view with filtering and sorting
- **Article Detail** - Full article view with Markdown rendering
- **Search** - Keyword search across titles and content
- **Categories** - Organize articles by category (Hardware, Network, Software, Access & Accounts, Troubleshooting, Onboarding/Offboarding, Other)
- **Tags** - Add multiple tags to articles for better discoverability
- **Status Management** - Draft, Published, Needs Review statuses
- **View Tracking** - Track article views
- **User Roles** - Admin users can create/edit/delete, regular users have read-only access

### ✅ Power Pages Specific Features
- **Liquid Templates** - Dynamic content rendering using Power Pages Liquid
- **FetchXML** - Data fetching using Power Pages native queries
- **Web API Ready** - JavaScript prepared for Power Pages Web API integration
- **Theme Toggle** - Dark/Light mode using CSS variables and localStorage
- **Responsive Design** - Works on all screen sizes
- **Pagination** - Native Power Pages pagination with Liquid

## Project Structure

```
Power Pages IT Knowledge Hub/
├── web-pages/
│   ├── Home/                      # Dashboard with article grid
│   │   ├── Home.en-US.webpage.copy.html
│   │   ├── Home.en-US.customcss.css
│   │   └── Home.en-US.customjs.js
│   ├── Articles/                  # Full article list with filters
│   │   ├── Articles.en-US.webpage.copy.html
│   │   ├── Articles.en-US.customcss.css
│   │   └── Articles.en-US.customjs.js
│   ├── Article Detail/            # Single article view
│   │   ├── Article Detail.en-US.webpage.copy.html
│   │   └── Article Detail.en-US.customcss.css
│   ├── Search/                    # Search results page
│   │   ├── Search.en-US.webpage.copy.html
│   │   ├── Search.en-US.customcss.css
│   │   └── Search.en-US.customjs.js
│   ├── My Articles/               # User's own articles (admin only)
│   │   ├── My Articles.en-US.webpage.copy.html
│   │   └── My Articles.en-US.customcss.css
│   ├── New Article/               # Create new article form
│   │   ├── New Article.en-US.webpage.copy.html
│   │   └── New Article.en-US.customcss.css
│   └── Edit Article/              # Edit existing article
│       ├── Edit Article.en-US.webpage.copy.html
│       └── Edit Article.en-US.customcss.css
└── web-templates/                # Power Pages templates
```

## Data Model

The solution uses the following Power Pages entities:

### cr4b3_kbarticle
- **cr4b3_kbarticleid** - Unique identifier
- **cr4b3_title** - Article title
- **cr4b3_summary** - Brief summary
- **cr4b3_body** - Full article content (Markdown supported)
- **cr4b3_category** - Lookup to category
- **cr4b3_status** - Status (100000000=Draft, 100000001=Published, 100000002=Needs Review)
- **cr4b3_tags** - Comma-separated tags
- **cr4b3_viewcount** - Number of views
- **cr4b3_author** - Lookup to user
- **cr4b3_published** - Boolean flag for published articles
- **createdon** - Creation date
- **modifiedon** - Last modified date

### cr4b3_kbcategory
- **cr4b3_kbcategoryid** - Unique identifier
- **cr4b3_name** - Category name

## Pages

### 1. Home (Dashboard)
- Displays article grid with cards
- Shows stats (total articles, categories)
- Search bar with sorting options
- Category filter pills
- Pagination support
- Theme toggle in sidebar

### 2. Articles
- Full list of all articles
- Advanced filtering (category, status)
- Search functionality
- Sorting options (recent, views, title)
- Pagination
- Admin actions (edit, delete)

### 3. Article Detail
- Full article view with Markdown rendering
- Article metadata (author, views, dates)
- Tags display
- Related articles section (placeholder)
- Back to articles link
- Admin actions (edit, delete)

### 4. Search
- Search results page
- Displays articles matching search query
- Maintains search query in URL
- Sorting and pagination

### 5. My Articles (Admin Only)
- User's own articles
- Status filtering
- Search within user's articles
- Quick actions (edit, delete, publish)

### 6. New Article (Admin Only)
- Form to create new article
- Title, category, status, summary, tags, content
- Markdown formatting help
- Tag management (add/remove)

### 7. Edit Article (Admin Only)
- Form to edit existing article
- Pre-filled with article data
- Same fields as New Article
- Delete button

## Styling

### CSS Variables (Theming)
```css
:root {
    --primary: #008080;        /* Teal primary color */
    --primary-light: #00a0a0;
    --primary-dark: #006060;
    --sidebar: #202020;        /* Dark sidebar */
    --bg: #f6f7f9;            /* Light background */
    --card: #ffffff;          /* White cards */
    --text: #1f2937;         /* Dark text */
    --muted: #6b7280;        /* Muted text */
    --border: #e5e7eb;       /* Light border */
}

[data-theme="dark"] {
    --bg: #1a1a1a;           /* Dark background */
    --card: #2a2a2a;         /* Dark cards */
    --text: #f0f0f0;         /* Light text */
    --muted: #a0a0a0;       /* Muted light text */
    --border: #404040;       /* Dark border */
    --sidebar: #121212;      /* Darker sidebar */
}
```

### Theme Toggle
- Uses `data-theme` attribute on `<html>` element
- Persists preference in `localStorage`
- Respects system preference (prefers-color-scheme: dark)
- Toggle buttons in sidebar and navbar

## JavaScript Features

### Theme Management
```javascript
// Toggle theme
document.documentElement.setAttribute('data-theme', 'dark');
localStorage.setItem('kb-theme', 'dark');

// Check preference
const savedTheme = localStorage.getItem('kb-theme') || 
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
```

### Tag Management
- Add tags by typing and pressing Enter
- Remove tags by clicking ×
- Tags stored as comma-separated values

### Form Validation
- Required fields validation
- Error/success message display
- Loading states

## Power Pages Integration

### FetchXML Queries
All data fetching uses Power Pages native FetchXML:
```liquid
{% fetchxml articles %}
<fetch version="1.0" mapping="logical" count="12" page="1">
   <entity name="cr4b3_kbarticle">
      <attribute name="cr4b3_title" />
      <filter>
         <condition attribute="cr4b3_published" operator="eq" value="1" />
      </filter>
      <order attribute="modifiedon" descending="true" />
   </entity>
</fetch>
{% endfetchxml %}
```

### Pagination
- Uses `page` and `count` parameters
- Calculates total pages from `total_record_count`
- Maintains all filter parameters in pagination links

### Web API (Ready for Implementation)
The JavaScript includes placeholders for Web API calls:
```javascript
// Create article
fetch('/cr4b3_kbarticles', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(data)
});

// Update article
fetch('/cr4b3_kbarticles(' + articleId + ')', {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify(data)
});

// Delete article
fetch('/cr4b3_kbarticles(' + articleId + ')', {
    method: 'DELETE'
});
```

## Markdown Support

The article content supports Markdown formatting:
- Headings (`#`, `##`, `###`)
- Text formatting (`**bold**`, `*italic*`, `~~strikethrough~~`)
- Lists (`- item`, `1. numbered`)
- Links (`[text](url)`)
- Images (`![alt](url)`)
- Code blocks (``` ```)
- Inline code (`` `code` ``)
- Blockquotes (`> quote`)
- Tables
- Horizontal rules (`---`)

## User Roles

- **System Administrator / System Customizer**: Full access
  - Create, edit, delete articles
  - Publish/unpublish articles
  - View all articles (including drafts)
  - Access My Articles page
  
- **Other Users**: Read-only access
  - View published articles only
  - Search and filter
  - Cannot create, edit, or delete

## Setup Instructions

### Prerequisites
- Microsoft Power Pages portal
- Dataverse environment
- Custom entities: `cr4b3_kbarticle`, `cr4b3_kbcategory`

### Installation
1. Import the custom entities into your Dataverse environment
2. Create the Power Pages site
3. Upload the web pages and templates
4. Configure the site navigation
5. Set up proper permissions for user roles

### Custom Entities Setup

#### cr4b3_kbcategory
```
- Display Name: KB Category
- Primary Field: cr4b3_name (Text)
```

#### cr4b3_kbarticle
```
- Display Name: KB Article
- Fields:
  - cr4b3_title (Text, Required)
  - cr4b3_summary (Text, Optional)
  - cr4b3_body (Multiple lines of text, Rich text)
  - cr4b3_category (Lookup to cr4b3_kbcategory)
  - cr4b3_status (Choice: 100000000=Draft, 100000001=Published, 100000002=Needs Review)
  - cr4b3_tags (Text, Comma-separated)
  - cr4b3_viewcount (Whole Number, Default: 0)
  - cr4b3_author (Lookup to systemuser)
  - cr4b3_published (Two Options, Default: No)
```

## Default Categories

The solution expects the following categories (can be customized):
- Hardware
- Network
- Software
- Access & Accounts
- Troubleshooting
- Onboarding/Offboarding
- Other

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Accessibility

- Keyboard navigation support
- ARIA labels on interactive elements
- Semantic HTML structure
- High contrast colors
- Responsive design for all screen sizes

## Customization

### Adding New Categories
1. Navigate to the cr4b3_kbcategory entity
2. Create a new category record
3. The category will automatically appear in the filter dropdowns

### Modifying Status Values
Update the status choice values in the cr4b3_kbarticle entity:
- 100000000 = Draft
- 100000001 = Published
- 100000002 = Needs Review

### Changing Theme Colors
Edit the CSS variables in any of the `.customcss.css` files:
```css
:root {
    --primary: #008080;  /* Change to your preferred color */
    --sidebar: #202020;
    /* ... */
}
```

## Testing

### Test Cases
1. **Home Page**: Verify article grid displays correctly
2. **Search**: Test search functionality with various queries
3. **Filters**: Test category and status filtering
4. **Pagination**: Verify pagination works across multiple pages
5. **Theme Toggle**: Test dark/light mode switching
6. **Article Creation**: Create a new article and verify it appears
7. **Article Editing**: Edit an article and verify changes
8. **Article Deletion**: Delete an article and verify it's removed
9. **Responsive Design**: Test on mobile, tablet, and desktop
10. **Accessibility**: Test keyboard navigation and screen reader support

## Limitations

- Web API calls are simulated (need to be implemented with actual Power Pages Web API)
- View count increment is simulated (needs Web API implementation)
- User authentication relies on Power Pages built-in authentication
- Article content uses basic HTML rendering (Markdown would need a library or custom parsing)

## Future Enhancements

- [ ] Implement actual Web API calls for CRUD operations
- [ ] Add Markdown parsing library for proper rendering
- [ ] Implement view count tracking via Web API
- [ ] Add article versioning/history
- [ ] Add comments/discussion to articles
- [ ] Add article ratings/feedback
- [ ] Implement advanced search with filters
- [ ] Add export/print functionality
- [ ] Add bookmarking/favorites

## License

MIT
