#!/bin/bash

# Script to update your live admin panel configuration
# This script will help you update the configuration files

echo "🚀 Updating Live Admin Panel Configuration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the admin panel directory"
    exit 1
fi

echo "📋 Configuration changes needed:"
echo ""
echo "1. API Base URL:"
echo "   OLD: https://api.forpurposetechnologies.com/api/admin"
echo "   NEW: https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin"
echo ""
echo "2. Admin Secret:"
echo "   OLD: test-key"
echo "   NEW: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e"
echo ""
echo "3. Proxy Configuration:"
echo "   OLD: https://api.forpurposetechnologies.com"
echo "   NEW: https://mdqgndyhzlnwojtubouh.supabase.co"
echo ""

# Test backend connection
echo "🔍 Testing backend connection..."
if curl -s https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/health > /dev/null; then
    echo "✅ Backend is accessible"
else
    echo "❌ Backend is not accessible. Please check if it's running."
    exit 1
fi

# Test API endpoint
echo "🔍 Testing API endpoint..."
if curl -s -H "X-Admin-Secret: 6f5c7ad726f7f9b145ab3f7f58c4f9a301a746406f3e16f6ae438f36e7dcfe0e" \
        -H "Content-Type: application/json" \
        -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A" \
        -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kcWduZHloemxud29qdHVib3VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NjE3MTksImV4cCI6MjA3NzUzNzcxOX0.h3VxeP8bhJ5bM6vGmQBmNLZFfJLm2lMhHqQ3B2jFj0A" \
        https://mdqgndyhzlnwojtubouh.supabase.co/functions/v1/api/admin/vendors > /dev/null; then
    echo "✅ API endpoint is working"
else
    echo "❌ API endpoint is not working. Please check the configuration."
    exit 1
fi

echo ""
echo "📝 Next steps for your live admin panel:"
echo "1. Update your API configuration file with the new base URL and secret"
echo "2. Update your environment variables"
echo "3. Update your package.json proxy setting"
echo "4. Build and deploy your admin panel"
echo "5. Test all features"
echo ""
echo "🎯 Your live admin panel is ready to connect to the new backend!"









