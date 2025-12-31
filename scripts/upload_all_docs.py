#!/usr/bin/env python3
"""
Script para subir toda la documentación HAIDA a Confluence
Sube múltiples documentos a espacios organizados
"""

from pathlib import Path
import os
from atlassian import Confluence
from dotenv import load_dotenv

# Configuración Confluence
load_dotenv()

base_url = os.getenv("ATLASSIAN_URL")
CONFLUENCE_EMAIL = os.getenv("ATLASSIAN_EMAIL")
CONFLUENCE_TOKEN = os.getenv("ATLASSIAN_API_TOKEN")
CONFLUENCE_SPACE = os.getenv("CONFLUENCE_SPACE", "HAIDA")

if not base_url or not CONFLUENCE_EMAIL or not CONFLUENCE_TOKEN:
    raise SystemExit("Missing ATLASSIAN_URL/ATLASSIAN_EMAIL/ATLASSIAN_API_TOKEN environment variables.")

CONFLUENCE_URL = f"{base_url}/wiki"

# Inicializar cliente Confluence
confluence = Confluence(
    url=CONFLUENCE_URL,
    username=CONFLUENCE_EMAIL,
    password=CONFLUENCE_TOKEN,
    cloud=True
)

def convert_markdown_to_confluence(markdown_content):
    """
    Convierte Markdown básico a formato Confluence Storage
    """
    # Reemplazos básicos
    content = markdown_content

    # Encabezados
    content = content.replace("# ", "<h1>").replace("\n\n", "</h1>\n\n")
    content = content.replace("## ", "<h2>").replace("\n", "</h2>\n")
    content = content.replace("### ", "<h3>").replace("\n", "</h3>\n")
    content = content.replace("#### ", "<h4>").replace("\n", "</h4>\n")

    # Listas
    lines = content.split("\n")
    html_lines = []
    in_list = False

    for line in lines:
        if line.strip().startswith("- ") or line.strip().startswith("* "):
            if not in_list:
                html_lines.append("<ul>")
                in_list = True
            html_lines.append(f"<li>{line.strip()[2:]}</li>")
        elif line.strip().startswith("1. ") or line.strip().startswith("2. "):
            if not in_list:
                html_lines.append("<ol>")
                in_list = True
            html_lines.append(f"<li>{line.strip()[3:]}</li>")
        else:
            if in_list:
                html_lines.append("</ul>" if "- " in str(html_lines[-3:]) else "</ol>")
                in_list = False
            html_lines.append(line)

    content = "\n".join(html_lines)

    # Negrita y cursiva
    content = content.replace("**", "<strong>").replace("**", "</strong>")
    content = content.replace("*", "<em>").replace("*", "</em>")

    # Code blocks
    content = content.replace("```", "<pre><code>").replace("```", "</code></pre>")
    content = content.replace("`", "<code>").replace("`", "</code>")

    # Emojis y símbolos se mantienen

    return content

def upload_document(file_path, title, parent_id=None):
    """
    Sube un documento Markdown a Confluence
    """
    print(f"\n📄 Subiendo: {title}")

    # Leer contenido
    with open(file_path, 'r', encoding='utf-8') as f:
        markdown_content = f.read()

    # Convertir a formato Confluence
    confluence_content = convert_markdown_to_confluence(markdown_content)

    # Buscar si la página ya existe
    try:
        existing_page = confluence.get_page_by_title(
            space=CONFLUENCE_SPACE,
            title=title
        )

        if existing_page:
            # Actualizar página existente
            page_id = existing_page['id']
            print(f"   ⚠️  Página existente encontrada (ID: {page_id}), actualizando...")

            confluence.update_page(
                page_id=page_id,
                title=title,
                body=confluence_content,
                parent_id=parent_id,
                type='page',
                representation='storage'
            )

            print(f"   ✅ Página actualizada: {CONFLUENCE_URL}/spaces/{CONFLUENCE_SPACE}/pages/{page_id}")
            return page_id
    except:
        pass

    # Crear nueva página
    try:
        new_page = confluence.create_page(
            space=CONFLUENCE_SPACE,
            title=title,
            body=confluence_content,
            parent_id=parent_id,
            type='page',
            representation='storage'
        )

        page_id = new_page['id']
        print(f"   ✅ Página creada: {CONFLUENCE_URL}/spaces/{CONFLUENCE_SPACE}/pages/{page_id}")
        return page_id

    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return None

def main():
    print("🚀 HAIDA - Subida masiva de documentación a Confluence")
    print(f"📍 Espacio: {CONFLUENCE_SPACE}")
    print(f"🌐 URL: {CONFLUENCE_URL}")
    print("="*60)

    # Ruta base del proyecto
    base_path = Path(__file__).resolve().parents[1]

    # Documentos a subir (ordenados jerárquicamente)
    documents = [
        {
            "file": base_path / "docs/HAIDA-Confluence-Empresarial.md",
            "title": "HAIDA v2.0 - Documentación Empresarial Completa",
            "parent": None  # Página raíz
        },
        {
            "file": base_path / "docs/business/01-REQUERIMIENTOS-JIRA.md",
            "title": "HAIDA - Requerimientos y Estructura para Jira",
            "parent": None  # Se actualizará con el ID de la página raíz
        },
        {
            "file": base_path / "docs/business/02-PITCH-DECK-INVERSIONISTAS.md",
            "title": "HAIDA - Pitch Deck Inversionistas (Seed €500K)",
            "parent": None
        },
        {
            "file": base_path / "docs/social/CONTENIDO-REDES-SOCIALES.md",
            "title": "HAIDA - Estrategia de Contenido Redes Sociales",
            "parent": None
        }
    ]

    # Subir documentos
    uploaded_ids = []

    for i, doc in enumerate(documents):
        if doc["file"].exists():
            # Si es el primer documento después de la raíz, usar el ID de la raíz como parent
            parent_id = uploaded_ids[0] if i > 0 and uploaded_ids else None

            page_id = upload_document(
                file_path=doc["file"],
                title=doc["title"],
                parent_id=parent_id
            )

            uploaded_ids.append(page_id)
        else:
            print(f"\n⚠️  Archivo no encontrado: {doc['file']}")

    # Resumen final
    print("\n" + "="*60)
    print("📊 RESUMEN:")
    print(f"   Páginas subidas: {len([x for x in uploaded_ids if x])}")
    print(f"   Errores: {len([x for x in uploaded_ids if not x])}")
    print("\n✅ Proceso completado!")
    print(f"\n🌐 Ver en Confluence: {CONFLUENCE_URL}/spaces/{CONFLUENCE_SPACE}/overview")

if __name__ == "__main__":
    main()
