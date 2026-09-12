import json
import re

log_path = r"C:\Users\Dell\.gemini\antigravity\brain\da2153b1-1984-4b27-b278-83ebb0210412\.system_generated\logs\transcript_full.jsonl"

last_content = None

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get("type") == "GENERIC" and "content" in data:
                c = data["content"]
                if "The above content shows the entire, complete file contents of the requested file" in c and "quiz.html" in c:
                    last_content = c
        except:
            pass

if last_content:
    print(repr(last_content[:500]))
