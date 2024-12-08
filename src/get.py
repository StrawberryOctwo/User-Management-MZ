import os
import re
import json
import argparse
from pathlib import Path

def find_aliases(file_content):
    pattern = re.compile(
        r'''useTranslation\s*\(\s*\)\s*;?   # useTranslation() call
            .*?=\s*const\s*\{\s*             # Destructuring const declaration
            ([^}]+)                          # Everything inside {}
            \}\s*;?''',
        re.VERBOSE | re.DOTALL
    )
    matches = pattern.findall(file_content)
    aliases = []
    for match in matches:
        destructured = match.split(',')
        for item in destructured:
            item = item.strip()
            if ':' in item:
                original, alias = [part.strip() for part in item.split(':', 1)]
                if original == 't':
                    aliases.append(alias)
            elif item == 't':
                aliases.append('t')
    return aliases

def find_translation_keys(file_content, aliases):
    keys = set()
    for alias in aliases:
        pattern = re.compile(
            rf'''(?<!\w)                   # Negative lookbehind to ensure alias is not part of a word
                {re.escape(alias)}        # The alias (e.g., t, translate)
                \s*\(\s*                  # Opening parenthesis with optional whitespace
                (['"])                    # Capture the quote used (' or ")
                (.*?)                     # Capture the key (non-greedy)
                \1\s*\)                   # Closing quote and parenthesis
            ''',
            re.VERBOSE | re.DOTALL
        )
        matches = pattern.findall(file_content)
        for match in matches:
            keys.add(match[1])
    return keys

def has_use_translation(file_content):
    pattern = re.compile(r'''import\s*\{\s*useTranslation\s*\}\s*from\s*['"]react-i18next['"]''')
    return bool(pattern.search(file_content))

def load_existing_locales(locale_path):
    if os.path.exists(locale_path):
        with open(locale_path, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                print(f"Error: {locale_path} is not a valid JSON file.")
                return {}
    return {}

def save_locales(locale_path, locales):
    os.makedirs(os.path.dirname(locale_path), exist_ok=True)
    with open(locale_path, 'w', encoding='utf-8') as f:
        json.dump(locales, f, ensure_ascii=False, indent=2)
    print(f"Updated locales saved to {locale_path}")

def main(project_dir, locale_file):
    all_keys = set()
    project_dir = Path(project_dir)

    # Traverse the project directory with improved file path handling
    for root, dirs, files in os.walk(project_dir, followlinks=True):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):  # Add more extensions if needed
                file_path = Path(root) / file
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except (UnicodeDecodeError, FileNotFoundError) as e:
                    print(f"Skipping file {file_path}: {e}")
                    continue

                if has_use_translation(content):
                    aliases = find_aliases(content)
                    if not aliases:
                        aliases = ['t']  # Default alias
                    keys = find_translation_keys(content, aliases)
                    if keys:
                        print(f"Found {len(keys)} keys in {file_path}")
                    all_keys.update(keys)

    print(f"Total unique keys found: {len(all_keys)}")

    locales = load_existing_locales(locale_file)
    new_keys = all_keys - set(locales.keys())
    if not new_keys:
        print("No new keys to add.")
        return

    print(f"Adding {len(new_keys)} new keys to {locale_file}")
    for key in sorted(new_keys):
        locales[key] = key  # Default value could be ""
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
