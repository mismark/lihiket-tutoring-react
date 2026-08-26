# 📧 Email Configuration Guide - Standard SMTP Setup

Your email service has been switched from **Brevo** to standard **SMTP** (works with any email provider).

---

## ✨ What Changed

| Before | After |
|--------|-------|
| Brevo API service | Standard SMTP (nodemailer) |
| Brevo API key | Gmail / SendGrid / any SMTP |
| Limited provider | Works with ANY email provider |

---

## 🚀 Setup Options

### Option 1: Gmail (Free & Recommended) ✅

#### Step 1: Enable 2-Step Verification
1. Go to **https://myaccount.google.com/security**
2. Click **2-Step Verification**
3. Follow the steps to enable it

#### Step 2: Generate App Password
1. Go to **https://myaccount.google.com/apppasswords**
2. Select **Mail** and **Windows Computer** (or your device)
3. Google will generate a **16-character password**
4. Copy this password

#### Step 3: Update `.env` File

**File:** `server/.env`

```env
# Email (SMTP) — Gmail Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx  # ← 16-character app password (no spaces)
SENDER_EMAIL=noreply@lihiket.com
SENDER_NAME=Lihiket Tutoring
```

**Example:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=john.doe@gmail.com
SMTP_PASS=abcdabcdabcdabcd
SENDER_EMAIL=noreply@lihiket.com
SENDER_NAME=Lihiket Tutoring
```

#### Step 4: Restart Server
```bash
npm run dev
```

Done! ✅ Real emails will now send from your Gmail account!

---

### Option 2: SendGrid

#### Step 1: Create SendGrid Account
1. Go to **https://sendgrid.com**
2. Sign up for free account
3. Verify your email

#### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create new API Key (Full Access)
3. Copy the key

#### Step 3: Update `.env` File

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=SG.your-api-key-here
SENDER_EMAIL=noreply@lihiket.com
SENDER_NAME=Lihiket Tutoring
```

---

### Option 3: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SENDER_EMAIL=noreply@lihiket.com
SENDER_NAME=Lihiket Tutoring
```

---

### Option 4: Custom SMTP Server

```env
SMTP_HOST=your-smtp-host.com
SMTP_PORT=587  # or 465 for SSL
SMTP_SECURE=false  # true if using port 465
SMTP_USER=your-username
SMTP_PASS=your-password
SENDER_EMAIL=noreply@lihiket.com
SENDER_NAME=Lihiket Tutoring
```

---

## 📋 SMTP Settings Reference

### Common SMTP Ports
| Port | Usage | Security |
|------|-------|----------|
| **587** | Standard SMTP | TLS (SMTP_SECURE=false) |
| **465** | SSL SMTP | SSL (SMTP_SECURE=true) |
| **25** | Legacy | Rarely used |

### Common SMTP Hosts
| Provider | SMTP Host | Port | Secure |
|----------|-----------|------|--------|
| Gmail | smtp.gmail.com | 587 | false |
| SendGrid | smtp.sendgrid.net | 587 | false |
| Outlook | smtp-mail.outlook.com | 587 | false |
| Yahoo | smtp.mail.yahoo.com | 587 | false |
| Office365 | smtp.office365.com | 587 | false |
| Amazon SES | email-smtp.region.amazonaws.com | 587 | false |

---

## ✅ Testing

### Test 1: Start the Server
```bash
npm run dev
```

### Test 2: Trigger Password Reset
1. Go to **http://localhost:5174/login**
2. Click **Forgot Password**
3. Enter any registered email
4. Check the terminal output:
   - ✅ **If emails work:** You'll see "✅ Email sent successfully: [messageId]"
   - ⚠️ **If not configured:** You'll see "[MOCK EMAIL SERVICE]" message

### Test 3: Check Inbox
- Check the email inbox for the OTP code
- Use the OTP to reset your password

---

## 🔒 Security Notes

### Never Commit `.env` Files
```bash
# .env is already in .gitignore
# Never push credentials to GitHub!
```

### Gmail App Password
- ⚠️ NOT your regular Gmail password
- ⚠️ Only works with 2-Step Verification enabled
- ✅ Can be revoked anytime from Account Settings

### SendGrid API Keys
- Can be deleted/revoked from dashboard
- Can limit to specific IP addresses
- Can restrict to email sending only

---

## 🆘 Troubleshooting

### Gmail: "Invalid username or password"
```
✅ Solution: 
1. Use App Password, NOT your Gmail password
2. Remove spaces from the password
3. Enable 2-Step Verification first
4. Wait 30 seconds after creating app password
```

### Gmail: "The application does not have permission"
```
✅ Solution:
1. Enable 2-Step Verification: https://myaccount.google.com/security
2. Go to https://myaccount.google.com/apppasswords (requires 2FA)
3. Generate new App Password
4. Use that instead
```

### SendGrid: "550 Authentication failed"
```
✅ Solution:
1. SMTP_USER must be exactly: apikey
2. SMTP_PASS must start with: SG.
3. Verify API key is not expired
```

### "Connection timed out"
```
✅ Solutions:
1. Check SMTP_HOST spelling
2. Verify SMTP_PORT (usually 587)
3. Check firewall/antivirus isn't blocking SMTP
4. Verify internet connection
```

### "No authentication methods available"
```
✅ Solution:
1. Check SMTP_USER and SMTP_PASS are set
2. Remove trailing spaces in .env
3. Restart server after changing .env
4. Verify SMTP_PORT matches the service
```

---

## 📧 Email Flow

### Current Flow (After Setup)

```
1. User clicks "Forgot Password"
2. Enters email address
3. Backend generates 4-digit OTP
4. Email server connects via SMTP
5. Email sends from your account
6. User receives OTP in inbox
7. User enters OTP to reset password
```

### What Happens Without SMTP Config

```
[MOCK EMAIL SERVICE] message appears in console
Email is NOT sent
OTP is NOT in user's inbox
User cannot complete password reset
```

---

## 🎯 Recommended Setup (Gmail)

**For development/testing:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
SENDER_EMAIL=noreply@lihiket.com
SENDER_NAME=Lihiket Tutoring
```

**For production:**
- Use SendGrid or Amazon SES for better reliability
- Use a dedicated sending domain
- Enable DKIM/SPF/DMARC authentication
- Monitor email delivery rates

---

## ✨ Next Steps

1. **Choose an email provider** (Gmail recommended for testing)
2. **Get SMTP credentials**
3. **Update** `server/.env`
4. **Restart** the server: `npm run dev`
5. **Test** by triggering forgot password flow
6. **Verify** email arrives in inbox

---

**Your email system is now ready to use with any SMTP provider! 🚀**
