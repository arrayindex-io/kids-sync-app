#!/bin/bash

# Resend API key from application.yml
API_KEY="re_KRCgTUxY_KyEqeVAwRseao9Yo2sAL8p2k"
FROM_EMAIL="onboarding@resend.dev"
TO_EMAIL="arrayindexio@gmail.com"

# Create a JSON payload
JSON_PAYLOAD=$(cat <<EOF
{
  "from": "$FROM_EMAIL",
  "to": "$TO_EMAIL",
  "subject": "Test Email from Kids Sync App",
  "text": "This is a test email sent directly from the Resend API to verify the API key is working."
}
EOF
)

# Send the request to Resend API
echo "Sending test email to $TO_EMAIL..."
echo "Using API key: ${API_KEY:0:10}..."

RESPONSE=$(curl -s -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

echo "Response from Resend API:"
echo "$RESPONSE"

# Check if the response contains an ID (indicating success)
if [[ "$RESPONSE" == *"id"* ]]; then
  echo "Email sent successfully!"
else
  echo "Failed to send email. Please check the API key and try again."
fi 