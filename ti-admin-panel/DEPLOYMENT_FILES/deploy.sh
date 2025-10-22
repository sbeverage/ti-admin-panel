#!/bin/bash

# Deployment Script for Live Admin Panel
# This script helps you deploy the updated configuration to your live admin panel

echo "🚀 Starting Live Admin Panel Deployment..."

# Check if backend is accessible
echo "📡 Testing backend connection..."
if curl -s https://thrive-backend-final.eba-fxvg5pyf.us-east-1.elasticbeanstalk.com/health > /dev/null; then
    echo "✅ Backend is accessible"
else
    echo "❌ Backend is not accessible. Please check if it's running."
    exit 1
fi

# Test API endpoint
echo "🔍 Testing API endpoint..."
if curl -s -H "X-Admin-Secret: thrive-admin-super-secret-2024" \
        -H "Content-Type: application/json" \
        https://thrive-backend-final.eba-fxvg5pyf.us-east-1.elasticbeanstalk.com/api/admin/vendors > /dev/null; then
    echo "✅ API endpoint is working"
else
    echo "❌ API endpoint is not working. Please check the configuration."
    exit 1
fi

echo "📋 Configuration files ready for deployment:"
echo "   - api-config.js (API configuration)"
echo "   - env-production.txt (Environment variables)"
echo "   - package.json (Updated proxy configuration)"

echo ""
echo "📝 Next steps:"
echo "1. Copy these files to your live admin panel server"
echo "2. Update your API configuration with the new settings"
echo "3. Update your environment variables"
echo "4. Update your package.json proxy setting"
echo "5. Build and deploy your admin panel"
echo "6. Test all features"

echo ""
echo "🎯 Your live admin panel is ready to connect to the new backend!"
