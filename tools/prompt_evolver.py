#!/usr/bin/env python3

import argparse
import datetime
import os
import re
import shutil
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional, Tuple


@dataclass
class FileMetrics:
    file_path: Path
    num_characters: int
    num_lines: int
    num_words: int
    num_sentences: int
    num_paragraphs: int
    num_headings: int
    num_code_fences: int
    trailing_whitespace_lines: int
    consecutive_blank_line_runs_over_two: int
    malformed_heading_lines: int


@dataclass
class FileResult:
    file_path: Path
    was_modified: bool
    outcome: str  # "upgrade" | "neutral" | "downgrade"
    before_metrics: FileMetrics
    after_metrics: FileMetrics
    notes: List[str]


def find_markdown_files(root_path: Path) -> List[Path]:
    candidates: List[Path] = []
    for path in root_path.rglob("*.md"):
        name = path.name
        if name.lower().startswith("copia de "):
            continue
        candidates.append(path)
    return sorted(candidates)


def read_text(file_path: Path) -> str:
    try:
        return file_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return file_path.read_text(encoding="utf-8", errors="replace")


def write_text(file_path: Path, content: str) -> None:
    file_path.write_text(content, encoding="utf-8")


def split_sentences(text: str) -> List[str]:
    cleaned = text.strip()
    if not cleaned:
        return []
    parts = re.split(r"(?<=[.!?])\s+", cleaned)
    return [p for p in parts if p]


def split_words(text: str) -> List[str]:
    return re.findall(r"[\w'-]+", text)


def count_paragraphs(text: str) -> int:
    blocks = re.split(r"\n\s*\n", text.strip())
    return len([b for b in blocks if b.strip()])


def count_headings(lines: List[str]) -> int:
    return sum(1 for line in lines if re.match(r"^#{1,6}[^#]", line.strip()))


def count_code_fences(lines: List[str]) -> int:
    return sum(1 for line in lines if line.strip().startswith("```") )


def count_trailing_whitespace_lines(lines: List[str]) -> int:
    return sum(1 for line in lines if len(line) > 0 and (line.rstrip(" \t") != line))


def count_consecutive_blank_runs_over_two(lines: List[str]) -> int:
    count_runs = 0
    current_run = 0
    for line in lines:
        if line.strip() == "":
            current_run += 1
        else:
            if current_run > 2:
                count_runs += 1
            current_run = 0
    if current_run > 2:
        count_runs += 1
    return count_runs


def count_malformed_heading_lines(lines: List[str]) -> int:
    malformed = 0
    for line in lines:
        if re.match(r"^#{1,6}\S", line):
            malformed += 1
    return malformed


def collect_metrics(file_path: Path, content: str) -> FileMetrics:
    lines = content.splitlines()
    words = split_words(content)
    sentences = split_sentences(content)
    metrics = FileMetrics(
        file_path=file_path,
        num_characters=len(content),
        num_lines=len(lines),
        num_words=len(words),
        num_sentences=len(sentences),
        num_paragraphs=count_paragraphs(content),
        num_headings=count_headings(lines),
        num_code_fences=count_code_fences(lines),
        trailing_whitespace_lines=count_trailing_whitespace_lines(lines),
        consecutive_blank_line_runs_over_two=count_consecutive_blank_runs_over_two(lines),
        malformed_heading_lines=count_malformed_heading_lines(lines),
    )
    return metrics


def normalize_code_fence_indentation(lines: List[str]) -> Tuple[List[str], int]:
    updated: List[str] = []
    changes = 0
    for line in lines:
        if line.lstrip().startswith("```") and not line.startswith("```"):
            updated.append(line.lstrip())
            changes += 1
        else:
            updated.append(line)
    return updated, changes


def ensure_space_after_heading_hash(lines: List[str]) -> Tuple[List[str], int]:
    updated: List[str] = []
    changes = 0
    for line in lines:
        match = re.match(r"^(#{1,6})(\S.*)$", line)
        if match:
            updated.append(f"{match.group(1)} {match.group(2)}")
            changes += 1
        else:
            updated.append(line)
    return updated, changes


def strip_trailing_whitespace(lines: List[str]) -> Tuple[List[str], int]:
    updated: List[str] = []
    changes = 0
    for line in lines:
        new_line = line.rstrip(" \t")
        if new_line != line:
            changes += 1
        updated.append(new_line)
    return updated, changes


def collapse_excess_blank_lines(lines: List[str]) -> Tuple[List[str], int]:
    updated: List[str] = []
    changes = 0
    blank_run = 0
    for line in lines:
        if line.strip() == "":
            blank_run += 1
            if blank_run <= 2:
                updated.append("")
            else:
                changes += 1
        else:
            blank_run = 0
            updated.append(line)
    return updated, changes


def apply_minimal_fixes(content: str) -> Tuple[str, List[str]]:
    lines = content.splitlines()
    notes: List[str] = []

    lines, n1 = strip_trailing_whitespace(lines)
    if n1:
        notes.append(f"stripped trailing whitespace on {n1} lines")

    lines, n2 = collapse_excess_blank_lines(lines)
    if n2:
        notes.append(f"collapsed {n2} excess blank lines")

    lines, n3 = ensure_space_after_heading_hash(lines)
    if n3:
        notes.append(f"normalized {n3} heading lines missing a space")

    # Do NOT change indentation of code fences to preserve original indentation style

    new_content = "\n".join(lines).rstrip("\n") + "\n"
    if notes:
        notes.append("ensured file ends with a single newline")
    return new_content, notes


def score_improvement(before: FileMetrics, after: FileMetrics) -> int:
    score = 0
    if after.trailing_whitespace_lines < before.trailing_whitespace_lines:
        score += 1
    if after.consecutive_blank_line_runs_over_two < before.consecutive_blank_line_runs_over_two:
        score += 1
    if after.malformed_heading_lines < before.malformed_heading_lines:
        score += 1
    return score


def backup_file(src: Path, backup_root: Path) -> Path:
    backup_root.mkdir(parents=True, exist_ok=True)
    dst = backup_root / src.name
    shutil.copy2(src, dst)
    return dst


def write_report(report_path: Path, results: List[FileResult]) -> None:
    lines: List[str] = []
    now_str = datetime.datetime.now().isoformat(timespec="seconds")
    lines.append(f"Prompt Evolution Report - {now_str}")
    lines.append("")
    for res in results:
        lines.append(f"File: {res.file_path}")
        lines.append(f"Outcome: {res.outcome}")
        lines.append(f"Modified: {res.was_modified}")
        if res.notes:
            lines.append("Notes:")
            for note in res.notes:
                lines.append(f"  - {note}")
        lines.append("Before metrics:")
        lines.append(
            f"  chars={res.before_metrics.num_characters} lines={res.before_metrics.num_lines} "
            f"words={res.before_metrics.num_words} sentences={res.before_metrics.num_sentences} "
            f"paras={res.before_metrics.num_paragraphs} headings={res.before_metrics.num_headings} "
            f"code_fences={res.before_metrics.num_code_fences} trailing_ws_lines={res.before_metrics.trailing_whitespace_lines} "
            f"excess_blank_runs={res.before_metrics.consecutive_blank_line_runs_over_two} malformed_headings={res.before_metrics.malformed_heading_lines}"
        )
        lines.append("After metrics:")
        lines.append(
            f"  chars={res.after_metrics.num_characters} lines={res.after_metrics.num_lines} "
            f"words={res.after_metrics.num_words} sentences={res.after_metrics.num_sentences} "
            f"paras={res.after_metrics.num_paragraphs} headings={res.after_metrics.num_headings} "
            f"code_fences={res.after_metrics.num_code_fences} trailing_ws_lines={res.after_metrics.trailing_whitespace_lines} "
            f"excess_blank_runs={res.after_metrics.consecutive_blank_line_runs_over_two} malformed_headings={res.after_metrics.malformed_heading_lines}"
        )
        lines.append("")
    report_path.write_text("\n".join(lines), encoding="utf-8")


def process_file(
    file_path: Path,
    apply_min_fixes: bool,
    backup_root: Optional[Path],
) -> FileResult:
    original = read_text(file_path)
    before = collect_metrics(file_path, original)
    notes: List[str] = []

    if not apply_min_fixes:
        after_content = original
        notes.append("no modifications requested (analysis only)")
    else:
        after_content, fix_notes = apply_minimal_fixes(original)
        notes.extend(fix_notes)

    after = collect_metrics(file_path, after_content)
    score = score_improvement(before, after)
    outcome = "neutral"
    was_modified = False

    if apply_min_fixes and after_content != original:
        was_modified = True
        if score >= 1:
            outcome = "upgrade"
        elif score == 0:
            outcome = "neutral"
        else:
            outcome = "downgrade"

        if outcome == "downgrade":
            if backup_root is not None:
                backup_file(file_path, backup_root)
            write_text(file_path, original)
            notes.append("detected downgrade; restored original content")
        else:
            if backup_root is not None:
                backup_file(file_path, backup_root)
            write_text(file_path, after_content)
            notes.append("applied minimal formatting fixes")

    return FileResult(
        file_path=file_path,
        was_modified=was_modified and outcome != "downgrade",
        outcome=outcome,
        before_metrics=before,
        after_metrics=after,
        notes=notes,
    )


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prompt evolution and evaluation tool")
    parser.add_argument("--path", default=str(Path.cwd()), help="Root path to scan for .md files")
    parser.add_argument("--report", default="analysis_report.md", help="Path to write the report")
    parser.add_argument("--apply-minimal-fixes", action="store_true", help="Apply safe, incremental formatting fixes")
    parser.add_argument(
        "--backup-dir",
        default=None,
        help="Directory to store backups of modified files (default: .backups/<timestamp>)",
    )
    return parser.parse_args(argv)


def main() -> int:
    args = parse_args()
    root = Path(args.path).resolve()
    if not root.exists():
        print(f"error: path does not exist: {root}", file=sys.stderr)
        return 2

    timestamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_dir = Path(args.backup_dir) if args.backup_dir else (root / ".backups" / timestamp)
    report_path = Path(args.report)

    markdown_files = find_markdown_files(root)
    if not markdown_files:
        print("no markdown files found; nothing to do")
        return 0

    results: List[FileResult] = []
    for md_file in markdown_files:
        # Only operate within the chosen root to avoid modifying external paths
        try:
            result = process_file(
                file_path=md_file,
                apply_min_fixes=args.apply_minimal_fixes,
                backup_root=backup_dir,
            )
            results.append(result)
        except Exception as exc:  # noqa: BLE001
            # Record failure without aborting the batch
            before = collect_metrics(md_file, read_text(md_file))
            results.append(
                FileResult(
                    file_path=md_file,
                    was_modified=False,
                    outcome="neutral",
                    before_metrics=before,
                    after_metrics=before,
                    notes=[f"error: {type(exc).__name__}: {exc}"],
                )
            )

    write_report(report_path, results)
    print(f"Processed {len(results)} markdown files. Report written to {report_path}")
    print(f"Backups (if any) stored in: {backup_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

