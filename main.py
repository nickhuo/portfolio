import msgpack
import json

def parse_roam_json(data):
    """Parse Roam Research JSON structure"""
    pages = []
    for page in data:
        parsed_page = {
            "title": page.get("title", ""),
            "create-time": page.get("create-time", ""),
            "user": page.get(":create/user", {}).get(":user/uid", ""),
            "children": []
        }
        
        # Parse children blocks
        if "children" in page:
            for child in page["children"]:
                block = {
                    "string": child.get("string", ""),
                    "uid": child.get("uid", ""),
                    "create-time": child.get("create-time", ""),
                    "edit-time": child.get("edit-time", ""),
                    "refs": [ref.get("uid", "") for ref in child.get("refs", [])]
                }
                parsed_page["children"].append(block)
        
        pages.append(parsed_page)
    
    return pages

# Read the Roam export JSON
with open('NickHuo-2025-01-01-18-34-52.json', 'r', encoding='utf-8') as f:
    roam_data = json.load(f)

# Parse the structure
parsed_data = parse_roam_json(roam_data)

# Save the parsed data
with open('parsed_roam.json', 'w', encoding='utf-8') as f:
    json.dump(parsed_data, f, indent=2, ensure_ascii=False)
