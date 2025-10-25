import json
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import pandas as pd
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


SCOPES = ["https://www.googleapis.com/auth/calendar"]


def get_service(
    service_account_json: Optional[str] = None,
    oauth_client_id: Optional[str] = None,
    oauth_client_secret: Optional[str] = None,
    oauth_refresh_token: Optional[str] = None,
):
    if service_account_json:
        info = json.loads(service_account_json)
        creds = service_account.Credentials.from_service_account_info(info, scopes=SCOPES)
        return build("calendar", "v3", credentials=creds)

    if oauth_client_id and oauth_client_secret and oauth_refresh_token:
        creds = Credentials(
            None,
            refresh_token=oauth_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=oauth_client_id,
            client_secret=oauth_client_secret,
            scopes=SCOPES,
        )
        return build("calendar", "v3", credentials=creds)

    raise RuntimeError("No Google credentials provided")


def upsert_event(service, calendar_id: str, row: pd.Series):
    fecha = row.get("fecha_vencimiento")
    concepto = row.get("concepto") or "Vencimiento"
    if pd.isna(fecha) or fecha is None:
        return

    if isinstance(fecha, str):
        # ISO date expected from our pipeline
        dt = datetime.fromisoformat(fecha)
    elif isinstance(fecha, datetime):
        dt = fecha
    else:
        dt = datetime.combine(fecha, datetime.min.time())

    # All-day event
    start = {"date": dt.date().isoformat()}
    end = {"date": (dt.date() + timedelta(days=1)).isoformat()}

    description_parts = []
    if row.get("referencia"):
        description_parts.append(f"Referencia: {row.get('referencia')}")
    if row.get("estado"):
        description_parts.append(f"Estado: {row.get('estado')}")
    if row.get("importe_uy") or row.get("importe_usd"):
        description_parts.append(
            f"Importe: {row.get('importe_uy') or row.get('importe_usd')}"
        )
    if row.get("alertas"):
        description_parts.append(f"Alertas: {row.get('alertas')}")

    body = {
        "summary": str(concepto),
        "description": "\n".join(description_parts),
        "start": start,
        "end": end,
    }

    # Try to find existing by same summary+date (simple heuristic)
    existing = (
        service.events()
        .list(
            calendarId=calendar_id,
            timeMin=dt.replace(tzinfo=timezone.utc).isoformat(),
            timeMax=(dt + timedelta(days=1)).replace(tzinfo=timezone.utc).isoformat(),
            q=str(concepto),
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    items = existing.get("items", [])
    if items:
        # Update first match
        event_id = items[0]["id"]
        service.events().update(calendarId=calendar_id, eventId=event_id, body=body).execute()
    else:
        service.events().insert(calendarId=calendar_id, body=body).execute()


def sync_dataframe_to_calendar(df: pd.DataFrame, calendar_id: str, service):
    for _, row in df.iterrows():
        upsert_event(service, calendar_id, row)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Sync calendario vencimientos a Google Calendar")
    parser.add_argument("--xlsx", default="Calendario_Vencimientos_Completo.xlsx")
    parser.add_argument("--sheet", default="Calendario")
    parser.add_argument("--calendar-id", required=True)
    parser.add_argument("--service-account-json", default=os.getenv("GCAL_SERVICE_ACCOUNT_JSON"))
    parser.add_argument("--oauth-client-id", default=os.getenv("GCAL_OAUTH_CLIENT_ID"))
    parser.add_argument("--oauth-client-secret", default=os.getenv("GCAL_OAUTH_CLIENT_SECRET"))
    parser.add_argument("--oauth-refresh-token", default=os.getenv("GCAL_OAUTH_REFRESH_TOKEN"))

    args = parser.parse_args()

    service = get_service(
        service_account_json=args.service_account_json,
        oauth_client_id=args.oauth_client_id,
        oauth_client_secret=args.oauth_client_secret,
        oauth_refresh_token=args.oauth_refresh_token,
    )

    df = pd.read_excel(args.xlsx, sheet_name=args.sheet)
    sync_dataframe_to_calendar(df, args.calendar_id, service)
    print("Google Calendar sync completo")


if __name__ == "__main__":
    main()


