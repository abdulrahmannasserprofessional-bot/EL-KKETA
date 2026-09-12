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
    # Extract the file lines
    lines = last_content.split('\n')
    extracted = []
    for l in lines:
        match = re.match(r'^\d+:\s(.*)$', l)
        if match:
            extracted.append(match.group(1))
    
    if extracted:
        with open("web_version/quiz_recovered.html", "w", encoding="utf-8") as out:
            out.write("\n".join(extracted))
        print("Recovered {} lines!".format(len(extracted)))
    else:
        print("Could not parse lines")
else:
    print("Could not find view_file output")
