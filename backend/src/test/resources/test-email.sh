#!/bin/bash

# Test the email service by sending a POST request to the test endpoint
curl -X POST \
  http://localhost:8080/api/test/email \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "arrayindexio@gmail.com"
  }'

echo "" 