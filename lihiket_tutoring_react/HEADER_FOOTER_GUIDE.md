# 📐 Header & Footer Components Guide

Your app now has a professional **Header** and **Footer** that automatically appear on all pages!

---

## 📍 What Was Created

### Files Created:
1. **`client/src/components/layout/Header.jsx`** - Top navigation bar
2. **`client/src/components/layout/Footer.jsx`** - Bottom footer section
3. **Updated `client/src/App.jsx`** - Integrated both components

---

## 🎯 Features

### ✅ Header Features:
- **Logo** with brand name "Lihiket"
- **Navigation Links** (changes based on auth status)
- **User Profile Section** (shows avatar, name, role when logged in)
- **Logout Button** (for authenticated users)
- **Sign In / Sign Up Buttons** (for guests)
- **Mobile Responsive Menu** (hamburger menu on small screens)
- **Auto-hides on auth pages** (login, register, forgot password)

### ✅ Footer Features:
- **Brand Section** with description
- **Quick Links** (Product, Company, Contact)
- **Social Media Icons** (Facebook, Twitter, LinkedIn, Instagram)
- **Contact Information** (Email, Phone, Address)
- **Legal Links** (Privacy Policy, Terms of Service)
- **Copyright** with auto-updating year
- **Auto-hides on auth pages**

---

## 🎨 How to Customize Header

### Change Logo Colors

**File:** `client/src/components/layout/Header.jsx`

Find (Line ~20):
```jsx
<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500">
```

Change colors:
```jsx
// To purple
<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500">

// To green
<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-green-600 to-emerald-500">

// To red
<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red-600 to-orange-500">
```

### Change Brand Name

Find (Line ~23):
```jsx
<span className="text-2xl font-bold text-slate-900">
  Lihiket<span className="text-blue-600">.</span>
</span>
```

Change to:
```jsx
<span className="text-2xl font-bold text-slate-900">
  MyApp<span className="text-purple-600">.</span>
</span>
```

### Add More Navigation Links

Find the **Desktop Navigation** section (Line ~38):
```jsx
<div className="hidden md:flex items-center gap-8">
  {isAuthenticated ? (
    <>
      <Link to="/dashboard" className="...">Dashboard</Link>
      <Link to="/" className="...">Home</Link>
      
      {/* ADD NEW LINK HERE */}
      <Link to="/courses" className="...">Courses</Link>
      
    </>
  ) : (
```

### Change Header Background Color

Find (Line ~12):
```jsx
<header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
```

Change to:
```jsx
// Dark header
<header className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-50">

// Blue header
<header className="bg-blue-600 border-b border-blue-700 shadow-sm sticky top-0 z-50">
```

### Change Login Button Color

Find (Line ~101):
```jsx
<Link
  to="/register"
  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
>
```

Change `bg-blue-600 hover:bg-blue-700` to:
```jsx
className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
```

---

## 🎨 How to Customize Footer

### Change Footer Background Color

Find (Line ~11):
```jsx
<footer className="bg-slate-900 text-slate-400">
```

Change to:
```jsx
// Dark blue
<footer className="bg-slate-800 text-slate-400">

// Darker
<footer className="bg-black text-slate-400">
```

### Change Logo in Footer

Find (Line ~17):
```jsx
<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white">
  <span className="font-bold">L</span>
</div>
```

Change to:
```jsx
<div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white">
  <span className="font-bold">M</span>  {/* Change L to your initial */}
</div>
```

### Update Company Information

Find (Line ~29):
```jsx
<p className="text-sm text-slate-500 mt-2">
  Connecting students with expert tutors for personalized learning experiences.
</p>
```

Change description:
```jsx
<p className="text-sm text-slate-500 mt-2">
  Your app description here. Make it memorable and concise.
</p>
```

### Update Footer Links

Find the **Quick Links** section (Line ~38):
```jsx
<li><Link to="/">Home</Link></li>
<li><a href="#features">Features</a></li>
```

Add/remove/edit as needed.

### Update Contact Information

Find (Line ~74):
```jsx
<li>
  <a href="mailto:info@lihiket.com">info@lihiket.com</a>
</li>
<li>
  <a href="tel:+251911000000">+251 911 000 000</a>
</li>
```

Update with your details:
```jsx
<li>
  <a href="mailto:hello@yourapp.com">hello@yourapp.com</a>
</li>
<li>
  <a href="tel:+1234567890">+1 (234) 567-890</a>
</li>
```

### Change Social Media Links

Find (Line ~91):
```jsx
<a href="#facebook" className="...">
  <FiFacebook className="w-4 h-4" />
</a>
```

Change `#facebook` to your actual URL:
```jsx
<a href="https://facebook.com/yourbrand" className="...">
  <FiFacebook className="w-4 h-4" />
</a>
```

---

## 🔧 Advanced Customization

### Hide Header/Footer on Specific Pages

**In Header.jsx**, modify the `authPages` array:
```jsx
// Current (hides on auth pages)
const authPages = ['/login', '/register', '/forgot-password', '/verify-otp', '/set-new-password', '/pending-approval'];

// Add /dashboard to hide header on dashboard
const authPages = ['/login', '/register', '/forgot-password', '/verify-otp', '/set-new-password', '/pending-approval', '/dashboard'];
```

### Change Header Height

Find in **Header.jsx**:
```jsx
<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
```

Change `py-4` to:
```jsx
py-2     // Smaller
py-6     // Taller
py-8     // Very tall
```

### Add Active State Styling

Header already shows active links. Find (Line ~52):
```jsx
className={`text-sm font-semibold transition-colors ${
  isActive('/dashboard')
    ? 'text-blue-600'
    : 'text-slate-600 hover:text-slate-900'
}`}
```

Change colors to highlight active link differently:
```jsx
? 'text-blue-600 border-b-2 border-blue-600'  // Add underline
? 'bg-blue-100 text-blue-600 rounded-lg px-3 py-1'  // Add background
```

---

## 💻 Example: Complete Header Customization

```jsx
// Change everything about the header
<header className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-700 shadow-lg sticky top-0 z-50">
  <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
    {/* ... */}
    {/* All text changes to white */}
    <Link to="/" className="text-white hover:text-blue-100">Home</Link>
    {/* ... */}
  </nav>
</header>
```

---

## 🔄 What Changed in App.jsx

```jsx
// OLD: Just routes
<Routes>
  <Route path="/" element={<HomePage />} />
  ...
</Routes>

// NEW: Full layout wrapper
<div className="flex flex-col min-h-screen">
  <Header />                    {/* Top navigation */}
  <main className="flex-1">
    <Routes>
      <Route path="/" element={<HomePage />} />
      ...
    </Routes>
  </main>
  <Footer />                    {/* Bottom section */}
</div>
```

---

## 📱 Responsive Design

Both Header and Footer are **fully responsive**:

- **Mobile** (< 768px): Hamburger menu, smaller logo
- **Tablet** (768px - 1024px): Balanced layout
- **Desktop** (> 1024px): Full navigation shown

Use `md:hidden` to hide elements on mobile, `hidden md:flex` to show on desktop.

---

## 🎨 Color Scheme Reference

### Header Current Colors:
- **Background**: `bg-white`
- **Text**: `text-slate-900`
- **Logo**: Blue-to-Indigo gradient
- **Buttons**: Blue (`bg-blue-600`)

### Footer Current Colors:
- **Background**: `bg-slate-900`
- **Text**: `text-slate-400`
- **Links**: Hover to white
- **Icons**: Blue hover effects

---

## ❓ Common Changes

| Want to... | What to Change |
|-----------|-----------------|
| Make header dark | Change `bg-white` to `bg-slate-900` |
| Make header taller | Change `py-4` to `py-6` or `py-8` |
| Change logo color | Change gradient `from-blue-600` |
| Add menu item | Add `<Link>` in navigation section |
| Change footer color | Change `bg-slate-900` |
| Update contact email | Change `info@lihiket.com` |
| Add social links | Update `href` attributes |
| Hide on dashboard | Add `/dashboard` to `authPages` |

---

## 🚀 Next Steps

1. **Customize the header** with your brand colors
2. **Update footer information** with your contact details
3. **Add more navigation links** as features are built
4. **Update social media links** to your profiles
5. **Test on mobile** to see responsive behavior

---

**Your app now looks professional with a complete header and footer! 🎉**
