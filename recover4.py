import json
import re

log_path = r"C:\Users\Dell\.gemini\antigravity\brain\da2153b1-1984-4b27-b278-83ebb0210412\.system_generated\logs\transcript_full.jsonl"

for line in open(log_path, 'r', encoding='utf-8'):
    try:
        data = json.loads(line)
        if data.get("type") == "GENERIC":
            c = data.get("content", "")
            if "quiz.html" in c and "100:" in c:
                print("Found one!")
                lines = c.split('\n')
                extracted = []
                for l in lines:
                    match = re.match(r'^\d+:\s(.*)$', l.strip())
                    if match:
                        extracted.append(match.group(1))
                if extracted:
                    with open("web_version/quiz_recovered.html", "w", encoding="utf-8") as out:
                        out.write("\n".join(extracted))
                    print("Recovered {} lines!".format(len(extracted)))
                    break
    except Exception as e:
        pass
