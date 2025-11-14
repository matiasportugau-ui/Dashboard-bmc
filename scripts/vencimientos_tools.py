import csv
import os
from dataclasses import dataclass, asdict
from datetime import datetime, date, timedelta
from typing import List, Optional, Iterable, Tuple

import pandas as pd
from dateutil import parser as date_parser
from ics import Calendar, Event, DisplayAlarm


CALENDAR_DIR = os.path.join(
    os.path.dirname(os.path.dirname(__file__)), "Calendario de Vencimientos EVO"
)


@dataclass
class Vencimiento:
    concepto: str
    referencia: Optional[str]
    fecha_vencimiento: date
    importe_uy: Optional[float]
    importe_usd: Optional[float]
    estado: Optional[str]
    fecha_pago: Optional[date]
    alertas: Optional[str]
    fuente_archivo: Optional[str]


UNIFIED_COLUMNS = [
    "concepto",
    "referencia",
    "fecha_vencimiento",
    "importe_uy",
    "importe_usd",
    "estado",
    "fecha_pago",
    "alertas",
    "fuente_archivo",
]


# Month names to infer month from filenames
SPANISH_MONTHS = {
    "enero": 1,
    "febrero": 2,
    "marzo": 3,
    "abril": 4,
    "mayo": 5,
    "junio": 6,
    "julio": 7,
    "agosto": 8,
    "setiembre": 9,
    "septiembre": 9,
    "octubre": 10,
    "noviembre": 11,
    "diciembre": 12,
}


def _infer_year_month_from_filename(filename: Optional[str]) -> Tuple[Optional[int], Optional[int]]:
    if not filename:
        return (None, None)
    name = str(filename).lower().replace(".csv", "").strip()
    year: Optional[int] = None
    month: Optional[int] = None
    # Try underscore year (e.g., abril_2024)
    parts = name.split("_")
    for p in reversed(parts):
        if p.isdigit() and len(p) == 4:
            year = int(p)
            break
    # Try month name
    for m_name, m_num in SPANISH_MONTHS.items():
        if m_name in name:
            month = m_num
            break
    return (year, month)


def _parse_date(value: object) -> Optional[date]:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (datetime, date)):
        return value.date() if isinstance(value, datetime) else value
    s = str(value).strip()
    if not s or s.lower() in {"nan", "none", "-"}:
        return None
    try:
        # Prefer day-first parsing since many inputs are dd/mm/yyyy
        dt = date_parser.parse(s, dayfirst=True, fuzzy=True)
        return dt.date()
    except Exception:
        return None


def _parse_date_with_context(value: object, source_filename: Optional[str]) -> Optional[date]:
    # First attempt the normal parser (dayfirst)
    dt = _parse_date(value)
    if dt is not None:
        return dt
    # Try to infer missing year/month from filename for inputs like "26/3" or "26-03"
    try:
        if value is None:
            return None
        s = str(value).strip()
        if not s:
            return None
        year_hint, month_hint = _infer_year_month_from_filename(source_filename)
        sep = "/" if "/" in s else ("-" if "-" in s else None)
        if sep:
            parts = [p for p in s.replace(" ", "").split(sep) if p]
            if len(parts) == 2 and parts[0].isdigit() and parts[1].isdigit():
                d = int(parts[0])
                m = int(parts[1]) if parts[1] else (month_hint or 1)
                y = year_hint or datetime.utcnow().year
                return date(y, m, d)
            if len(parts) == 1 and parts[0].isdigit() and month_hint:
                d = int(parts[0])
                y = year_hint or datetime.utcnow().year
                return date(y, month_hint, d)
    except Exception:
        return None
    return None


def _parse_number(value: object) -> Optional[float]:
    if value is None:
        return None
    try:
        if isinstance(value, str):
            s = value.strip()
            if not s:
                return None
            # Remove common currency markers
            s_clean = s
            for tok in ["U$S", "USD", "$", "U$", "US$", "uy$", "UY$"]:
                s_clean = s_clean.replace(tok, "")
            # Extract first numeric token
            import re
            match = re.search(r"[-+]?[0-9]{1,3}(?:[\.,][0-9]{3})*(?:[\.,][0-9]+)?|[-+]?[0-9]+(?:[\.,][0-9]+)?", s_clean)
            if not match:
                return None
            num = match.group(0)
            # Normalize: if both comma and dot, treat comma as thousands
            if "," in num and "." in num:
                num = num.replace(",", "")
            elif "," in num and "." not in num:
                num = num.replace(",", ".")
            num = num.replace(" ", "")
            return float(num)
        if pd.isna(value):
            return None
        return float(value)
    except Exception:
        return None


def _read_all_csvs(directory: str) -> List[pd.DataFrame]:
    dataframes: List[pd.DataFrame] = []
    for entry in sorted(os.listdir(directory)):
        if not entry.lower().endswith(".csv"):
            continue
        path = os.path.join(directory, entry)
        try:
            df = pd.read_csv(path, dtype=str, keep_default_na=False)
            df["__fuente_archivo"] = entry
            dataframes.append(df)
        except Exception:
            # Skip unreadable files
            continue
    return dataframes


def consolidate_csvs(calendar_dir: Optional[str] = None) -> pd.DataFrame:
    directory = calendar_dir or CALENDAR_DIR
    frames = _read_all_csvs(directory)
    if not frames:
        return pd.DataFrame(columns=UNIFIED_COLUMNS)

    normalized_rows: List[dict] = []

    for df in frames:
        cols_lower = {c.lower().strip(): c for c in df.columns}
        concepto_col = cols_lower.get("concepto ") or cols_lower.get("concepto")
        referencia_col = cols_lower.get("referencia")
        fecha_col = (
            cols_lower.get("fecha de vencimiento")
            or cols_lower.get("fecha_vencimiento")
            or cols_lower.get("fecha")
        )
        importe_uy_col = (
            cols_lower.get("importe $")
            or cols_lower.get("importe_uy")
            or cols_lower.get("importe")
        )
        importe_usd_col = cols_lower.get("importe u$s") or cols_lower.get("importe usd")
        estado_col = cols_lower.get("estado")
        fecha_pago_col = cols_lower.get("fecha de pago") or cols_lower.get("fecha_pago")
        alertas_col = cols_lower.get("alertas")
        fuente_archivo_col = "__fuente_archivo"

        for _, row in df.iterrows():
            concepto = str(row.get(concepto_col, "")).strip() if concepto_col else ""
            # Skip empty filler rows
            if not concepto and not str(row.get(fecha_col, "")).strip():
                continue

            # Normalize estado values
            def _normalize_estado(val: Optional[str]) -> Optional[str]:
                if val is None:
                    return None
                s = str(val).strip().lower()
                if not s or s in {"nan", "none", "-"}:
                    return None
                replacements = {
                    "en borradores": "BORRADORES",
                    "borradores": "BORRADORES",
                    "borrador": "BORRADORES",
                    "pendiente": "PENDIENTE",
                    "pendientes": "PENDIENTE",
                    "pendiente de pago": "PENDIENTE",
                    "se debita (pendiente)": "PENDIENTE",
                    "se debita (pago)": "PAGO",
                    "pago": "PAGO",
                    "pagamos": "PAGO",
                    "pagamos $": "PAGO",
                    "pagamos minimos": "PAGO",
                    "se pagó": "PAGO",
                    "pagar en red pagos": "PENDIENTE",
                    "impreso": "PENDIENTE",
                }
                for key, target in replacements.items():
                    if key in s:
                        return target
                # default: keep original uppercased
                return s.upper()

            rec = {
                "concepto": concepto,
                "referencia": str(row.get(referencia_col, "")).strip() if referencia_col else None,
                "fecha_vencimiento": _parse_date_with_context(row.get(fecha_col), row.get(fuente_archivo_col)) if fecha_col else None,
                "importe_uy": _parse_number(row.get(importe_uy_col)) if importe_uy_col else None,
                "importe_usd": _parse_number(row.get(importe_usd_col)) if importe_usd_col else None,
                "estado": _normalize_estado(str(row.get(estado_col, "")).strip()) if estado_col else None,
                "fecha_pago": _parse_date(row.get(fecha_pago_col)) if fecha_pago_col else None,
                "alertas": str(row.get(alertas_col, "")).strip() if alertas_col else None,
                "fuente_archivo": row.get(fuente_archivo_col),
            }

            # Auto-fill concepto if missing but there is other signal
            if not rec["concepto"]:
                if rec["referencia"] or (rec["importe_uy"] is not None) or (rec["importe_usd"] is not None):
                    rec["concepto"] = "OTROS"

            if not rec["concepto"] and not rec["fecha_vencimiento"]:
                continue

            normalized_rows.append(rec)

    result = pd.DataFrame(normalized_rows, columns=UNIFIED_COLUMNS)

    # Deduplicate: same concepto + fecha + referencia keep the one with more info
    # Helper columns to prioritize rows with more information
    result["__has_importe_uy"] = result["importe_uy"].notna()
    result["__has_importe_usd"] = result["importe_usd"].notna()
    result["__has_estado"] = result["estado"].notna()
    result["__has_fecha_pago"] = result["fecha_pago"].notna()
    result["__has_alertas"] = result["alertas"].notna()

    result.sort_values(
        by=[
            "concepto",
            "fecha_vencimiento",
            "__has_importe_uy",
            "__has_importe_usd",
            "__has_estado",
            "__has_fecha_pago",
            "__has_alertas",
        ],
        ascending=[True, True, False, False, False, False, False],
        inplace=True,
        na_position="last",
    )
    result = result.drop_duplicates(
        subset=["concepto", "fecha_vencimiento", "referencia"], keep="first"
    )
    result = result.drop_duplicates(
        subset=["concepto", "fecha_vencimiento", "referencia"], keep="first"
    )

    # Drop helper columns
    result.drop(
        columns=[
            "__has_importe_uy",
            "__has_importe_usd",
            "__has_estado",
            "__has_fecha_pago",
            "__has_alertas",
        ],
        inplace=True,
        errors="ignore",
    )

    return result.reset_index(drop=True)


def export_excel_template(output_path: str) -> None:
    # Create an empty template with data validation and style
    df = pd.DataFrame(columns=UNIFIED_COLUMNS)

    with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
        sheet_name = "Calendario"
        df.to_excel(writer, index=False, sheet_name=sheet_name, startrow=1)
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]

        # Title
        title_format = workbook.add_format(
            {
                "bold": True,
                "font_size": 16,
                "align": "left",
                "valign": "vcenter",
            }
        )
        worksheet.write(0, 0, "Plantilla - Calendario de Vencimientos", title_format)

        # Header formatting
        header_format = workbook.add_format(
            {
                "bold": True,
                "bg_color": "#0F4C81",
                "font_color": "#FFFFFF",
                "border": 1,
                "align": "center",
                "valign": "vcenter",
            }
        )
        for col_idx, col_name in enumerate(UNIFIED_COLUMNS):
            worksheet.write(1, col_idx, col_name, header_format)

        # Column widths
        widths = [28, 24, 16, 14, 14, 16, 14, 36, 22]
        for i, w in enumerate(widths):
            worksheet.set_column(i, i, w)

        # Date formats
        date_format = workbook.add_format({"num_format": "yyyy-mm-dd"})
        money_format = workbook.add_format({"num_format": "$ #,##0.00"})

        # Apply formats to columns
        # concepto (text), referencia (text), fecha_vencimiento (date), importe_uy (money), importe_usd (money)
        worksheet.set_column(2, 2, widths[2], date_format)
        worksheet.set_column(3, 3, widths[3], money_format)
        worksheet.set_column(4, 4, widths[4], money_format)
        worksheet.set_column(6, 6, widths[6], date_format)

        # Data validation for estado
        estados = [
            "BORRADORES",
            "PENDIENTE",
            "PAGO",
            "EN BORRADORES",
        ]
        estado_range = f"C3:C1000"
        # estado is column index 5 (0-based); Excel column F
        worksheet.data_validation(
            2,
            5,
            1000,
            5,
            {
                "validate": "list",
                "source": estados,
                "error_title": "Estado inválido",
                "error_message": "Seleccione un estado de la lista",
            },
        )

        # Freeze panes below header
        worksheet.freeze_panes(2, 0)

        # Footer note
        note_format = workbook.add_format({"font_color": "#555555", "italic": True})
        worksheet.write(1002, 0, "Notas: utilice formato yyyy-mm-dd para las fechas.", note_format)


def export_excel_with_data(df: pd.DataFrame, output_path: str) -> None:
    if df is None:
        df = pd.DataFrame(columns=UNIFIED_COLUMNS)
    # Ensure correct column order
    for col in UNIFIED_COLUMNS:
        if col not in df.columns:
            df[col] = None
    df = df[UNIFIED_COLUMNS]

    with pd.ExcelWriter(output_path, engine="xlsxwriter") as writer:
        sheet_name = "Calendario"
        df.to_excel(writer, index=False, sheet_name=sheet_name, startrow=1)
        workbook = writer.book
        worksheet = writer.sheets[sheet_name]

        title_format = workbook.add_format(
            {"bold": True, "font_size": 16, "align": "left", "valign": "vcenter"}
        )
        worksheet.write(0, 0, "Calendario de Vencimientos", title_format)

        header_format = workbook.add_format(
            {
                "bold": True,
                "bg_color": "#0F4C81",
                "font_color": "#FFFFFF",
                "border": 1,
                "align": "center",
                "valign": "vcenter",
            }
        )
        for col_idx, col_name in enumerate(UNIFIED_COLUMNS):
            worksheet.write(1, col_idx, col_name, header_format)

        widths = [28, 24, 16, 14, 14, 16, 14, 36, 22]
        for i, w in enumerate(widths):
            worksheet.set_column(i, i, w)

        date_format = workbook.add_format({"num_format": "yyyy-mm-dd"})
        money_format = workbook.add_format({"num_format": "$ #,##0.00"})
        worksheet.set_column(2, 2, widths[2], date_format)
        worksheet.set_column(3, 3, widths[3], money_format)
        worksheet.set_column(4, 4, widths[4], money_format)
        worksheet.set_column(6, 6, widths[6], date_format)
        worksheet.freeze_panes(2, 0)


def _validate(df: pd.DataFrame) -> pd.DataFrame:
    problems: List[dict] = []
    allowed_estados = {"BORRADORES", "PENDIENTE", "PAGO"}
    for idx, row in df.iterrows():
        issues: List[str] = []
        if not row.get("concepto"):
            issues.append("concepto_vacio")
        if pd.isna(row.get("fecha_vencimiento")) or row.get("fecha_vencimiento") is None:
            issues.append("sin_fecha_vencimiento")
        if pd.isna(row.get("importe_uy")) and pd.isna(row.get("importe_usd")):
            issues.append("sin_importe")
        estado_val = row.get("estado")
        if estado_val and estado_val not in allowed_estados:
            issues.append("estado_no_normalizado")
        if issues:
            problems.append({
                "row_index": idx,
                "concepto": row.get("concepto"),
                "referencia": row.get("referencia"),
                "fecha_vencimiento": row.get("fecha_vencimiento"),
                "estado": estado_val,
                "problemas": ",".join(issues),
                "fuente_archivo": row.get("fuente_archivo"),
            })
    return pd.DataFrame(problems)


def export_ics(df: pd.DataFrame, output_path: str, reminders_days: Optional[List[int]] = None) -> None:
    if reminders_days is None:
        reminders_days = [3, 1]
    cal = Calendar()
    for _, row in df.iterrows():
        fecha = row.get("fecha_vencimiento")
        concepto = row.get("concepto") or "Vencimiento"
        if pd.isna(fecha) or fecha is None:
            continue
        if isinstance(fecha, str):
            fecha_dt = _parse_date(fecha)
        elif isinstance(fecha, (datetime, date)):
            fecha_dt = fecha if isinstance(fecha, date) else fecha.date()
        else:
            fecha_dt = None
        if not fecha_dt:
            continue
        event = Event()
        event.name = str(concepto)
        event.begin = datetime.combine(fecha_dt, datetime.min.time())
        event.make_all_day()
        ref = row.get("referencia")
        estado = row.get("estado")
        importe = row.get("importe_uy") or row.get("importe_usd")
        alertas = row.get("alertas")
        detalles = []
        if ref:
            detalles.append(f"Referencia: {ref}")
        if estado:
            detalles.append(f"Estado: {estado}")
        if importe:
            detalles.append(f"Importe: {importe}")
        if alertas:
            detalles.append(f"Alertas: {alertas}")
        event.description = "\n".join(detalles)

        # Add alarms (display notifications) in days before
        for days_before in reminders_days:
            try:
                delta = timedelta(days=-int(days_before))
                alarm = DisplayAlarm(trigger=delta, display_text=str(concepto))
                event.alarms.append(alarm)
            except Exception:
                pass
        cal.events.add(event)

    with open(output_path, "w", encoding="utf-8") as f:
        f.writelines(cal)


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Herramientas de calendario de vencimientos")
    parser.add_argument("--dir", default=CALENDAR_DIR, help="Directorio con CSVs de vencimientos")
    parser.add_argument("--out-excel", default="Plantilla_Calendario_Vencimientos.xlsx")
    parser.add_argument("--out-excel-data", default="Calendario_Vencimientos_Completo.xlsx")
    parser.add_argument("--out-ics", default="Calendario_Vencimientos.ics")
    parser.add_argument("--out-report", default="Vencimientos_Validacion.csv")
    parser.add_argument(
        "--reminders", nargs="*", type=int, default=[3, 1], help="Días antes del vencimiento para alertas"
    )
    parser.add_argument("--template-only", action="store_true")

    args = parser.parse_args()

    if args.template_only:
        export_excel_template(args.out_excel)
        print(f"Plantilla creada en {args.out_excel}")
        return

    df = consolidate_csvs(args.dir)
    report_df = _validate(df)
    export_excel_with_data(df, args.out_excel_data)
    export_excel_template(args.out_excel)
    export_ics(df, args.out_ics, reminders_days=args.reminders)
    if not report_df.empty:
        report_df.to_csv(args.out_report, index=False)
        print(
            f"Generados: {args.out_excel_data}, {args.out_excel}, {args.out_ics}, {args.out_report} (filas={len(df)}, issues={len(report_df)})"
        )
    else:
        # Create empty report with header for consistency
        report_df.to_csv(args.out_report, index=False)
        print(
            f"Generados: {args.out_excel_data}, {args.out_excel}, {args.out_ics}, {args.out_report} (filas={len(df)}, issues=0)"
        )


if __name__ == "__main__":
    main()


