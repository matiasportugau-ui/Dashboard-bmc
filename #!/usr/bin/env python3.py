#!/usr/bin/env python3
import os
import json

INPUT_DIR = "input_files"
OUTPUT_FILE = os.path.join(INPUT_DIR, "inventory.json")

def scan_directory(path):
    """
    Scan a directory recursively and create an inventory of all files.

    Args:
        path (str): The root directory path to scan.

    Returns:
        list[dict]: A list of dictionaries, each containing file information with keys:
            - 'file' (str): Relative path of the file from the root directory
            - 'size_bytes' (int): File size in bytes
            - 'extension' (str): File extension in lowercase (including the dot)

    Raises:
        OSError: If the directory path is invalid or inaccessible.
        PermissionError: If there are insufficient permissions to access files/directories.

    Example:
        >>> inventory = scan_directory('/path/to/directory')
        >>> print(inventory[0])
        {'file': 'subdirectory/example.txt', 'size_bytes': 1024, 'extension': '.txt'}
    """
    inventory = []
    for root, dirs, files in os.walk(path):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), path)
            inventory.append({
                "file": rel,
                "size_bytes": os.path.getsize(os.path.join(root, f)),
                "extension": os.path.splitext(f)[1].lower()
            })
    return inventory

def main():
    inv = scan_directory(INPUT_DIR)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(inv, f, indent=2)
    print(f"Inventory written to {OUTPUT_FILE}, total files: {len(inv)}")

if __name__ == "__main__":
    main()
