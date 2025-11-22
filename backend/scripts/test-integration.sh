#!/bin/bash

# Integration test for /api/answer endpoint

echo "Testing /api/answer endpoint..."
echo ""

# Test with a sample question
response=$(curl -s -X POST http://localhost:3001/api/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "What is retrieval-augmented generation?"}')

# Check if we got a valid JSON response
if echo "$response" | python3 -m json.tool > /dev/null 2>&1; then
  echo "✓ Received valid JSON response"
  echo ""
  echo "Response summary:"
  echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); print(f'Question: {data[\"question\"]}'); print(f'Sources: {len(data[\"sources\"])}'); print(f'Answer blocks: {len(data[\"answer\"][\"blocks\"])}'); print(f'Evidence graph nodes: {len(data[\"evidence_graph\"][\"nodes\"])}'); print(f'Evidence graph edges: {len(data[\"evidence_graph\"][\"edges\"])}')"
  echo ""
  echo "First source:"
  echo "$response" | python3 -c "import sys, json; data = json.load(sys.stdin); src = data['sources'][0]; print(f'  ID: {src[\"id\"]}'); print(f'  Title: {src[\"title\"]}'); print(f'  URL: {src[\"url\"]}'); print(f'  Score: {src.get(\"score\", \"N/A\")}'); print(f'  Snippet: {src[\"snippet\"][:100]}...' if len(src['snippet']) > 100 else f'  Snippet: {src[\"snippet\"]}')"
  exit 0
else
  echo "✗ Failed to get valid JSON response"
  echo "Response:"
  echo "$response"
  exit 1
fi
