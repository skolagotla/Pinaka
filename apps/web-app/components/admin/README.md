# Admin Login Illustration

## Using the Custom SVG Illustration (Default)

The login page uses a custom property management-themed SVG illustration that matches Pinaka's branding. This is the default and requires no configuration.

## Using Your Own Custom Image

To replace the SVG with your own image:

### Option 1: Quick Replacement (Recommended)

1. Place your image in `/public/images/admin-login-illustration.svg` (or `.png`, `.jpg`)
2. Update the login page component:

```jsx
// In apps/web-app/app/admin/login/page.jsx
<LoginIllustration 
  className="w-full h-full" 
  useCustomImage={true}
  imageSrc="/images/admin-login-illustration.svg"
/>
```

### Option 2: Direct Image Tag

Replace the `<LoginIllustration />` component with a direct image tag:

```jsx
<img
  src="/images/your-custom-image.svg"
  alt="Pinaka Admin Login"
  className="w-full h-auto max-w-2xl object-contain"
/>
```

## Image Recommendations

- **Format**: SVG (preferred for scalability) or high-resolution PNG/JPG
- **Dimensions**: 800x600px or larger (will scale automatically)
- **Aspect Ratio**: 4:3 or 16:9 works well
- **File Size**: Keep under 500KB for fast loading
- **Theme**: Should match Pinaka's property management branding (blue/indigo colors)

## Current Custom SVG Features

The default SVG illustration includes:
- Modern building silhouettes (property management theme)
- Pinaka brand colors (blue/indigo gradients)
- Professional design elements
- Responsive scaling
- Dark mode compatible

