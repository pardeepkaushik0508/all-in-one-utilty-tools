#!/bin/bash
cd '/var/www/html/All-in-One Utility-Tools/frontend'
npm install 2>&1 | tail -3
npm run build 2>&1
echo "BUILD_EXIT:$?"
