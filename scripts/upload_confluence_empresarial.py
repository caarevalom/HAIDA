#!/usr/bin/env python3
"""
Upload HAIDA Empresarial Documentation to Confluence
"""
from pathlib import Path
from atlassian import Confluence
import os

# Credenciales desde .env
from dotenv import load_dotenv
load_dotenv()

url = os.getenv("ATLASSIAN_URL")
email = os.getenv("ATLASSIAN_EMAIL")
token = os.getenv("ATLASSIAN_API_TOKEN")
space = os.getenv("CONFLUENCE_SPACE", "HAIDA")

if not url or not email or not token:
    raise SystemExit("Missing ATLASSIAN_URL/ATLASSIAN_EMAIL/ATLASSIAN_API_TOKEN environment variables.")

print("=" * 60)
print("📚 SUBIENDO DOCUMENTACIÓN EMPRESARIAL A CONFLUENCE")
print("=" * 60)
print(f"URL: {url}")
print(f"Email: {email}")
print(f"Espacio: {space}")
print("")

# Conectar a Confluence
c = Confluence(
    url=f"{url}/wiki",
    username=email,
    password=token,
    cloud=True
)

# Leer documento
doc_path = Path("docs/HAIDA-Confluence-Empresarial.md")
if not doc_path.exists():
    print(f"❌ Error: No se encuentra {doc_path}")
    exit(1)

content = doc_path.read_text()

# Convertir Markdown a HTML básico
html_content = f"""
<p><em>Documento generado automáticamente desde HAIDA v2.0</em></p>
<hr/>
<pre>{content}</pre>
"""

title = "HAIDA v2.0 - Documentación Empresarial"

print(f"📄 Documento: {doc_path}")
print(f"📏 Tamaño: {len(content)} caracteres")
print("")

try:
    # Intentar crear página
    print("🔄 Creando página en Confluence...")
    result = c.create_page(
        space=space,
        title=title,
        body=html_content,
        parent_id=None
    )
    print(f"✅ Página creada exitosamente!")
    print(f"🔗 URL: {url}/wiki/spaces/{space}/pages/{result['id']}")
    
except Exception as e:
    if "already exists" in str(e).lower():
        print("⚠️  La página ya existe, actualizando...")
        try:
            # Obtener página existente
            page = c.get_page_by_title(space=space, title=title)
            
            # Actualizar
            c.update_page(
                page_id=page['id'],
                title=title,
                body=html_content
            )
            print(f"✅ Página actualizada exitosamente!")
            print(f"🔗 URL: {url}/wiki/spaces/{space}/pages/{page['id']}")
        except Exception as update_error:
            print(f"❌ Error al actualizar: {update_error}")
    else:
        print(f"❌ Error: {e}")

print("")
print("=" * 60)
