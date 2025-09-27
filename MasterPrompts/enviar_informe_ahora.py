#!/usr/bin/env python3
# Envío inmediato del informe HTML (exacto) a las direcciones indicadas.
# Configura SMTP_* por variables de entorno o edita abajo.
import os, ssl, smtplib, datetime
from email.message import EmailMessage
from pathlib import Path

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.tu_proveedor.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))  # 465 si usas SSL
SMTP_USER = os.getenv("SMTP_USER", "tu_usuario")
SMTP_PASS = os.getenv("SMTP_PASS", "tu_password")
FROM_NAME = "Informe Diario"
FROM_EMAIL = os.getenv("FROM_EMAIL", "no-reply@tu_dominio.com")

TO = ["correoparamartin@gmail.com", "matias.portugau@gmail.com"]

today = "2025-09-26"
html_path = Path(f"/mnt/data/informe_diario_{today}.html")
html = html_path.read_text(encoding="utf-8")

msg = EmailMessage()
msg["Subject"] = f"Tu Informe Diario - {today}"
msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
msg["To"] = ", ".join(TO)
msg.set_content("Este mensaje contiene una versión HTML. Si ves este texto, abre el correo en un cliente compatible.")
msg.add_alternative(html, subtype="html")

context = ssl.create_default_context()
with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
    server.starttls(context=context)
    server.login(SMTP_USER, SMTP_PASS)
    server.send_message(msg)

print("✅ Informe enviado a:", ", ".join(TO))

# Para automatizar diariamente a las 9:00 (UTC-3) en macOS/Linux (crontab):
# 0 9 * * * /usr/bin/python3 /ruta/absoluta/enviar_informe_ahora.py

/* EXPORT_SEAL v1
project: sistema de limpieza MAC
prompt_id: enviar_informe_ahora_py
version: 1.0.0
file: enviar_informe_ahora.py
lang: py
created_at: 2025-09-26T12:34:56Z
author: GPT-5 Thinking
origin: user-requested daily email sender
body_sha256: TBD
notes: SMTP one-off sender for exact HTML report
*/
