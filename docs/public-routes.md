## Public GET API Routes

Base URL: `/api`

All endpoints below are public (no Authorization header required). Responses follow `{ success: boolean, data: ... }`.

### Blogs

- GET `/api/blogs`
  - Returns list of blogs.
  - Sample response:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Sample title",
      "excerpt": "Short summary",
      "date": "2025-01-01",
      "thumbnail": "/uploads/abc.jpg",
      "images": ["/uploads/1.jpg", "/uploads/2.jpg"],
      "fullContent": "<p>HTML or rich text</p>",
      "createdAt": "2025-01-01T12:00:00.000Z",
      "updatedAt": "2025-01-02T12:00:00.000Z"
    }
  ]
}
```

- GET `/api/blogs/:id`
  - Returns a single blog by ID.

### Programs

- GET `/api/programs`
  - Returns list of programs.
- GET `/api/programs/slug/:slug`
  - Returns a single program by slug.
- GET `/api/programs/:id`
  - Returns a single program by ID.

Sample item shape:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Program title",
    "slug": "program-title",
    "description": "Details",
    "thumbnail": "/uploads/program.jpg",
    "media": ["/uploads/m1.jpg"],
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-02T12:00:00.000Z"
  }
}
```

### Gallery

- GET `/api/gallery`
  - Returns list of gallery items (images or videos).
- GET `/api/gallery/:id`
  - Returns a single gallery item by ID.

Sample item shape:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Event photo",
    "media": "/uploads/gallery.jpg",
    "category": "event",
    "type": "image",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-02T12:00:00.000Z"
  }
}
```

### Notices

- GET `/api/notices`
  - Returns list of notices.
- GET `/api/notices/:id`
  - Returns a single notice by ID.

Sample item shape:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Holiday Notice",
    "subTitle": "Office closed",
    "date": "2025-01-10",
    "category": "general",
    "fullContent": "Details of the notice...",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-02T12:00:00.000Z"
  }
}
```

### Donation Categories

- GET `/api/donation-categories`
  - Returns list of donation categories.
- GET `/api/donation-categories/slug/:slug`
  - Returns a single donation category by slug.
- GET `/api/donation-categories/:id`
  - Returns a single donation category by ID.

Sample item shape:

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Zakat",
    "slug": "zakat",
    "description": "Details",
    "thumbnail": "/uploads/zakat.jpg",
    "createdAt": "2025-01-01T12:00:00.000Z",
    "updatedAt": "2025-01-02T12:00:00.000Z"
  }
}
```

### Notes

- Media URLs like `/uploads/...` are relative; prepend your CDN/base URL as needed.
- Sorting, filtering, or pagination (if required) can be added via query params later.

