# 🎨 How to Customize Styles in Lihiket

This project uses **Tailwind CSS** for styling. Here's everything you need to know to customize it.

---

## 📍 Where Styles Are Located

```
client/
├── src/
│   └── styles/
│       └── index.css          ← Global styles & custom CSS classes
├── tailwind.config.js         ← Tailwind configuration (colors, fonts, animations)
└── postcss.config.js          ← PostCSS configuration
```

---

## 🎯 3 Ways to Change Styles

### Method 1: Using Tailwind Utility Classes (Easiest)
This is the most common way. Tailwind provides pre-made utility classes you can combine.

**Example in RegisterForm.jsx:**
```jsx
<input
  type="text"
  className="block w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-2xl 
             text-slate-900 placeholder-slate-400 text-sm focus:outline-none 
             focus:ring-2 border-slate-200 hover:border-primary-300"
/>
```

**Break it down:**
- `w-full` - full width
- `py-2.5` - padding top/bottom
- `bg-transparent` - transparent background
- `border-slate-200` - light gray border
- `rounded-2xl` - rounded corners
- `focus:ring-2` - ring on focus
- `hover:border-primary-300` - changes border color on hover

**Common Tailwind Classes:**

| Class | Effect |
|-------|--------|
| `w-full` | Width 100% |
| `h-10` | Height (40px) |
| `p-4` | Padding all sides (16px) |
| `px-4 py-2` | Padding horizontal & vertical |
| `m-4` | Margin all sides |
| `mx-auto` | Center horizontally |
| `bg-white` | Background white |
| `text-slate-900` | Text color dark slate |
| `rounded-xl` | Rounded corners |
| `shadow-lg` | Large shadow |
| `border border-gray-200` | Border styling |
| `flex items-center justify-between` | Flexbox layout |
| `grid grid-cols-2 gap-4` | Grid layout |
| `opacity-50` | 50% transparency |
| `transition-all duration-200` | Smooth animation |
| `hover:bg-blue-600` | Change on hover |
| `focus:ring-2` | Ring on focus |

---

### Method 2: Modify Global Colors in `tailwind.config.js`

Edit colors, fonts, and animations globally.

**File:** `client/tailwind.config.js`

**Current Primary Color:**
```js
colors: {
  primary: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',    // Main color
    600: '#2563eb',    // Darker variant
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
}
```

**Change to a Different Color (Example: Red):**
```js
colors: {
  primary: {
    50:  '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',    // Changed to red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
}
```

Then save and refresh your browser. All `primary-600`, `primary-500` classes will update!

**Add Custom Color:**
```js
colors: {
  primary: { /* ... */ },
  secondary: {
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  accent: {
    500: '#f59e0b',
    600: '#d97706',
  },
}
```

Then use in components:
```jsx
<button className="bg-secondary-600 text-accent-500">Click me</button>
```

---

### Method 3: Add Custom CSS in `client/src/styles/index.css`

For complex styling or custom animations.

**File:** `client/src/styles/index.css`

**Example: Add a custom animation**
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@layer components {
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  
  .card-hover {
    @apply transition-all duration-300 hover:shadow-2xl hover:-translate-y-1;
  }
}
```

Then use in JSX:
```jsx
<div className="card card-hover">
  Content here bounces and lifts on hover
</div>
```

---

## 🎨 Real Examples - Try These Changes

### Example 1: Change Registration Form Colors

**File:** `client/src/pages/auth/RegisterForm.jsx`

Find this line (around line 165):
```jsx
<label className="block text-xs font-bold uppercase tracking-wider text-primary-600 mb-1.5">
  First Name *
</label>
```

**Change to different color:**
```jsx
<label className="block text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1.5">
  First Name *
</label>
```

**Available colors:**
- `slate-600`, `gray-600`, `red-600`, `emerald-600`, `blue-600`, `purple-600`, `orange-600`, etc.

---

### Example 2: Make Buttons Bigger

**Find:**
```jsx
<button className="w-full py-3.5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600">
```

**Change `py-3.5` to `py-5`:**
```jsx
<button className="w-full py-5 px-4 bg-gradient-to-r from-primary-600 to-indigo-600">
```

---

### Example 3: Change Input Background

**Find:**
```jsx
<input
  className="block w-full pl-10 pr-4 py-2.5 bg-transparent border rounded-2xl"
/>
```

**Add background color:**
```jsx
<input
  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl"
/>
```

---

### Example 4: Add Shadow & Hover Effect

**Before:**
```jsx
<div className="bg-white rounded-2xl p-6">
  Card content
</div>
```

**After:**
```jsx
<div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
  Card content
</div>
```

---

## 🎨 Tailwind Color Palette Reference

### Basic Colors (with shades 50-900)
```
slate, gray, zinc, neutral, stone (neutrals)
red, orange, amber, yellow (warm)
lime, green, emerald, teal (cool-warm)
cyan, sky, blue, indigo, violet, purple, fuchsia, pink, rose (cool)
```

### Using Colors
```jsx
// Text colors
<p className="text-red-600">Red text</p>

// Background colors
<div className="bg-blue-50">Light blue background</div>

// Border colors
<input className="border-2 border-green-500" />

// Gradients
<div className="bg-gradient-to-r from-blue-600 to-purple-600">Gradient</div>

// Hover states
<button className="bg-blue-600 hover:bg-blue-700">Button</button>

// Opacity
<div className="bg-blue-600 bg-opacity-50">50% transparent blue</div>
```

---

## ✨ Common Customizations

### 1. Change Primary Theme Color Everywhere

**Edit:** `client/tailwind.config.js`

Replace the entire `primary` object with your color:
```js
primary: {
  50:  '#f0f9ff',    // Lightest
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',    // Main color (cyan)
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c3d66',    // Darkest
}
```

---

### 2. Change Default Font

**Edit:** `client/tailwind.config.js`

```js
fontFamily: {
  sans: ['Poppins', 'system-ui', 'sans-serif'],  // Changed from Inter
}
```

Then add to `client/src/styles/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
```

---

### 3. Change Border Radius (Roundness)

**In components, change:**
```jsx
// Slightly rounded
className="rounded-lg"    // 8px

// More rounded
className="rounded-xl"    // 12px

// Very rounded
className="rounded-2xl"   // 16px

// Pill shape
className="rounded-full"  // 9999px
```

---

### 4. Add Custom Spacing

**Edit:** `client/tailwind.config.js`

```js
theme: {
  extend: {
    spacing: {
      '128': '32rem',
      '144': '36rem',
    }
  }
}
```

Then use:
```jsx
<div className="p-128">Custom padding</div>
```

---

## 🔄 Apply Changes to Entire Pages

### Example: Change All Login Page Inputs to Green

**File:** `client/src/pages/auth/LoginPage.jsx` (or whichever auth file)

Find all `className` on inputs and add `border-green-500`:

```jsx
// Before
<input className="border-slate-200" />

// After
<input className="border-green-500" />
```

---

## 💡 Tips

1. **Use Chrome DevTools**: 
   - Right-click element → Inspect
   - Find the `class` attribute
   - Modify class names to see changes live
   - Copy the working version back to code

2. **Restart server if changes don't appear**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart
   npm run dev
   ```

3. **Use VSCode Tailwind Extension** for autocomplete:
   - Install "Tailwind CSS IntelliSense" extension
   - Get class suggestions as you type

4. **Color Picker**: Use https://tailwindcss.com/docs/customizing-colors to find hex codes

---

## 🔗 Useful Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Color Palette**: https://tailwindcss.com/docs/customizing-colors
- **Cheat Sheet**: https://tailwindcss.com/docs/utility-first
- **Generate Palettes**: https://uicolors.app/create

---

## ❓ Quick Reference

| Want to... | Do this |
|-----------|---------|
| Make text bigger | Change `text-sm` to `text-lg` or `text-xl` |
| Add spacing | Add `p-4` (padding) or `m-4` (margin) |
| Change color | Replace color class like `text-blue-600` |
| Add shadow | Add `shadow-lg` or `shadow-2xl` |
| Make hover effect | Add `hover:bg-blue-700` |
| Make it rounded | Add `rounded-xl` or `rounded-2xl` |
| Make it animated | Add `transition-all duration-300` |
| Center content | Add `flex items-center justify-center` |
| Make it responsive | Add `sm:`, `md:`, `lg:` prefixes like `md:text-lg` |

---

## 🚀 Next Steps

1. Pick a component you want to customize
2. Copy its JSX from the file
3. Change the `className` values
4. Refresh browser to see changes
5. If you like it, save it to the file

**Happy styling! 🎨**
