import os
import re
import json
import argparse
from pathlib import Path


def find_translation_keys(file_content):
    """
    Finds all t("...") or t('...') calls in the given file content.
    Returns a set of extracted keys.
    """
    keys = set()
    # Regex to match t("key") or t('key')
    pattern = re.compile(
        r'''(?<!\w)                 # Ensure t is not preceded by any word character
            t\s*\(\s*              # Match t( with optional spaces
            (['"])                 # Capture the quote used (' or ")
            (.*?)                  # Capture the key (non-greedy)
            \1\s*\)                # Match closing quote and parenthesis
        ''',
        re.VERBOSE | re.DOTALL
    )
    matches = pattern.findall(file_content)
    for match in matches:
        keys.add(match[1])  # Add the captured key
    return keys


def load_existing_locales(locale_path):
    """
    Loads existing locales from the given path.
    Returns a dictionary.
    """
    if os.path.exists(locale_path):
        with open(locale_path, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                print(f"Error: {locale_path} is not a valid JSON file.")
                return {}
    return {}


def save_locales(locale_path, locales):
    """
    Saves the locales dictionary to the given path in JSON format.
    """
    os.makedirs(os.path.dirname(locale_path), exist_ok=True)
    with open(locale_path, 'w', encoding='utf-8') as f:
        json.dump(locales, f, ensure_ascii=False, indent=2)
    print(f"Updated locales saved to {locale_path}")


def main(project_dir, locale_file):
    all_keys = set()
    project_dir = Path(project_dir)

    # Traverse all files in the directory
    for root, dirs, files in os.walk(project_dir, followlinks=True):
        for file in files:
            file_path = Path(root) / file
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except (UnicodeDecodeError, FileNotFoundError) as e:
                print(f"Skipping file {file_path}: {e}")
                continue

            # Find keys directly in the file content
            keys = find_translation_keys(content)
            if keys:
                print(f"Found {len(keys)} keys in {file_path}")
            all_keys.update(keys)

    print(f"Total unique keys found: {len(all_keys)}")

    # Load existing locales
    locales = load_existing_locales(locale_file)

    # Determine new keys to add
    new_keys = all_keys - set(locales.keys())
    if not new_keys:
        print("No new keys to add.")
        return

    print(f"Adding {len(new_keys)} new keys to {locale_file}")

    # Add new keys with default empty string or the key itself
    for key in sorted(new_keys):
        locales[key] = key  # You can set a default value like "" if preferred

    # Save updated locales
    save_locales(locale_file, locales)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract translation keys and update en.json")
    parser.add_argument(
        "--project-dir",
        type=str,
        default=".",
        help="Path to the project directory (default: current directory)"
    )
    parser.add_argument(
        "--locale-file",
        type=str,
        default="locales/en.json",
        help="Path to the en.json locale file (default: locales/en.json)"
    )
    args = parser.parse_args()
    main(args.project_dir, args.locale_file)
