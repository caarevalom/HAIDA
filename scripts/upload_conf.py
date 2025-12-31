#!/usr/bin/env python3
import os
from pathlib import Path
from atlassian import Confluence
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("ATLASSIAN_URL")
email = os.getenv("ATLASSIAN_EMAIL")
token = os.getenv("ATLASSIAN_API_TOKEN")
space = os.getenv("CONFLUENCE_SPACE", "HAIDA")

if not url or not email or not token:
    raise SystemExit("Missing ATLASSIAN_URL/ATLASSIAN_EMAIL/ATLASSIAN_API_TOKEN environment variables.")

c = Confluence(url=f"{url}/wiki", username=email, password=token, cloud=True)
docs = sorted(Path.home().joinpath("Hiberus/CTB/docs/md").glob("*HAIDA*.md"))[:10]
for d in docs:
    t = d.stem.replace("-", " ")
    b = f"<h1>{t}</h1><pre>{d.read_text()}</pre>"
    try:
        c.create_page(space=space, title=t, body=b)
        print(f"✓ {t}")
    except:
        try:
            pg = c.get_page_by_title(space=space, title=t)
            c.update_page(page_id=pg["id"], title=t, body=b)
            print(f"↻ {t}")
        except Exception as e:
            print(f"✗ {t}: {e}")
