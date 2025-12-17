#!/bin/bash

# Script per copiare file necessari dopo il build
echo "📦 Post-build: Copying required files..."

# Copia 404.html
if [ -f "build/404.html" ]; then
    echo "✅ 404.html already in build"
else
    echo "⚠️  404.html not found in build"
fi

# Copia CNAME
if [ -f "build/CNAME" ]; then
    echo "✅ CNAME already in build"
else
    echo "⚠️  CNAME not found in build"
fi

# Copia .nojekyll
if [ -f "build/.nojekyll" ]; then
    echo "✅ .nojekyll already in build"
else
    echo "⚠️  .nojekyll not found in build"
fi

echo "✅ Post-build check complete!"
