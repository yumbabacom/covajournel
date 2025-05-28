# 🚀 CovaJournel - Production Deployment Guide

This guide will help you deploy CovaJournel to production with proper environment configuration.

## 📋 Prerequisites

- MongoDB Atlas account (or MongoDB server)
- Vercel/Netlify/Railway account (for hosting)
- Domain name (optional but recommended)

## 🔧 Environment Setup

### 1. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account
   - Create a new cluster

2. **Configure Database:**
   - Create a database named `covajournal`
   - Create a database user with read/write permissions
   - Whitelist your application's IP addresses (or use 0.0.0.0/0 for all IPs)

3. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 2. Environment Variables

Create a `.env.local` file (for local development) or set environment variables in your hosting platform:

```env
# Required Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/covajournal?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production

# Optional Variables
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
DEFAULT_ADMIN_EMAIL=admin@your-domain.com
DEFAULT_ADMIN_PASSWORD=change-this-password
ENABLE_REGISTRATION=true
```

### 3. Generate Secrets

Generate secure secrets for JWT and NextAuth:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate NextAuth Secret
openssl rand -base64 32
```

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Repository:**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Select the `yumbabacom/covajournel` repository

2. **Configure Environment Variables:**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all required environment variables from `.env.example`

3. **Deploy:**
   - Vercel will automatically deploy your application
   - Your app will be available at `https://your-app-name.vercel.app`

4. **Custom Domain (Optional):**
   - Go to Settings → Domains
   - Add your custom domain
   - Update `NEXTAUTH_URL` to your custom domain

### Option 2: Railway

1. **Connect Repository:**
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub
   - Select your repository

2. **Configure Environment Variables:**
   - In Railway dashboard, go to Variables
   - Add all required environment variables

3. **Deploy:**
   - Railway will automatically deploy
   - Your app will be available at the provided Railway URL

### Option 3: Netlify

1. **Connect Repository:**
   - Go to [Netlify](https://netlify.com)
   - Import from Git
   - Select your repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables:**
   - Go to Site settings → Environment variables
   - Add all required variables

## 🔐 Security Checklist

### Production Security Setup

1. **Strong Secrets:**
   - Use strong, random JWT_SECRET (32+ characters)
   - Use strong, random NEXTAUTH_SECRET
   - Change default admin password

2. **Database Security:**
   - Use MongoDB Atlas with proper authentication
   - Restrict IP access if possible
   - Use strong database passwords

3. **Environment Variables:**
   - Never commit `.env.local` to Git
   - Use platform-specific environment variable settings
   - Rotate secrets regularly

4. **HTTPS:**
   - Ensure your domain uses HTTPS
   - Update NEXTAUTH_URL to use https://

## 📊 Post-Deployment Setup

### 1. Create Admin User

After deployment, create your first admin user:

```bash
# SSH into your server or use your platform's console
node scripts/create-admin.js
```

Or use the setup endpoint:
- Visit: `https://your-domain.com/setup`
- Follow the setup wizard

### 2. Test Core Features

1. **Authentication:**
   - Register a new user
   - Login/logout functionality
   - Admin panel access

2. **Trading Features:**
   - Add a test trade
   - Upload trade images
   - View trading journal
   - Check analytics dashboard

3. **Admin Features:**
   - Access admin panel
   - View all users
   - Monitor system health

### 3. Configure Monitoring

1. **Error Tracking:**
   - Set up Sentry for error monitoring
   - Add SENTRY_DSN to environment variables

2. **Analytics:**
   - Add Google Analytics
   - Set GOOGLE_ANALYTICS_ID

3. **Uptime Monitoring:**
   - Use services like UptimeRobot
   - Monitor your application's availability

## 🔄 Continuous Deployment

### Automatic Deployments

Most platforms support automatic deployments:

1. **Vercel/Netlify:**
   - Automatically deploys on Git push to main branch
   - Preview deployments for pull requests

2. **Railway:**
   - Automatic deployments on Git push
   - Environment-specific deployments

### Manual Deployment

If using a VPS or custom server:

```bash
# Clone repository
git clone https://github.com/yumbabacom/covajournel.git
cd covajournel

# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection:**
   - Check MongoDB URI format
   - Verify database user permissions
   - Check IP whitelist settings

2. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check NEXTAUTH_URL matches your domain
   - Ensure NEXTAUTH_SECRET is configured

3. **File Upload Issues:**
   - Check file size limits
   - Verify upload directory permissions
   - Check allowed file types

### Environment Variable Validation

The application includes environment validation. Check logs for:
- Missing required variables
- Invalid configuration values
- Database connection issues

## 📞 Support

If you encounter issues:

1. Check the application logs
2. Verify all environment variables are set correctly
3. Test database connectivity
4. Check the GitHub repository for updates

## 🎉 Success!

Once deployed successfully, your CovaJournel application will be:
- ✅ Accessible via your production URL
- ✅ Connected to MongoDB for data persistence
- ✅ Secured with proper authentication
- ✅ Ready for professional trading journal use

**Happy Trading! 📈**
