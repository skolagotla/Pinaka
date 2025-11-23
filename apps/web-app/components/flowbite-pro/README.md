# Flowbite Pro Components

This directory contains Flowbite Pro components and templates integrated into the project.

## Structure

```
flowbite-pro/
├── blocks/              # React blocks from Flowbite Pro
│   ├── application-ui/  # Application UI components
│   ├── ecommerce-ui/    # E-commerce components
│   ├── marketing-ui/    # Marketing components
│   └── publisher-ui/    # Publisher components
├── admin-dashboard/     # Admin dashboard components
└── README.md           # This file
```

## Usage

### Using React Blocks

Import and use Flowbite Pro blocks in your components:

```javascript
// Example: Using a table footer component
import TableFooterButton from '@/components/flowbite-pro/blocks/application-ui/table-footers/button';

export default function MyComponent() {
  return <TableFooterButton />;
}
```

### Using Admin Dashboard Components

```javascript
// Example: Using admin dashboard navbar
import NavbarMain from '@/components/flowbite-pro/admin-dashboard/navbar-main';

export default function AdminLayout() {
  return <NavbarMain />;
}
```

## Available Categories

### Application UI (`blocks/application-ui/`)
- Table components (footers, headers, etc.)
- Form components
- Navigation components
- Dashboard widgets
- And more...

### E-commerce UI (`blocks/ecommerce-ui/`)
- Product cards
- Shopping cart components
- Checkout forms
- Product listings
- And more...

### Marketing UI (`blocks/marketing-ui/`)
- Hero sections
- Feature sections
- Testimonials
- Pricing tables
- Newsletter signups
- And more...

### Publisher UI (`blocks/publisher-ui/`)
- Article layouts
- Blog components
- Content sections
- And more...

## Finding Components

Each category folder contains a `page.tsx` file that maps all examples to their component files. Check these files to find the component you need.

## Notes

- All components use `flowbite-react` which is already installed
- Components are written in TypeScript but work in JavaScript
- Some components require React hooks (useState, useEffect, etc.)
- Components are ready to use - just import and customize as needed

## Customization

You can customize any component by:
1. Copying the component file to your own directory
2. Modifying it to fit your needs
3. Importing from your custom location

## Source

These components are from:
- **React Blocks**: `flowbite-react-blocks-v1.8.0-beta.zip`
- **Admin Dashboard**: `flowbite-pro-nextjs-admin-dashboard-1.3.0.zip`

Both are part of Flowbite Pro and are licensed for use in this project.
