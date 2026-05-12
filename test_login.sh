#!/bin/bash
# Test login for 724454241@qq.com

API_URL="https://bazi-reading.onrender.com/api"

echo "Testing login for 724454241@qq.com..."
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"724454241@qq.com","password":"您的密码"}' \
  | jq .

echo ""
echo "Done."