# Run this script from the repo root after exporting your SMTP_* env variables (e.g., via dotenv or Supabase CLI).
set -euo pipefail

cd "$(dirname "$0")/.."
python3 - <<'PY'
from api.email import EmailService

service = EmailService()
if not service.is_configured():
    raise SystemExit("SMTP no configurado: revisa las variables SMTP_*")

result = service.send_email(
    to_email="noreply@stayarta.com",
    subject="Prueba SMTP HAIDA",
    body_html="<p>Funciona</p>",
    body_text="Funciona"
)

print("SMTP OK" if result else "SMTP FALLÓ")
PY
