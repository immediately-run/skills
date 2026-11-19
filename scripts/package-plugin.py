#!/usr/bin/env python3
"""Build a deterministic, allowlisted plugin ZIP with plugin.json at its root."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def package_files(root):
    """Use the checked skill index; reject symlinks, unsafe names, and extra files."""
    index = json.loads((root / 'skills/index.json').read_text())
    names = {'plugin.json', 'LICENSE'}
    for file in (root / 'assets').rglob('*'):
        if file.is_symlink():
            raise ValueError(f'Symlink is not a distribution asset: {file}')
        if file.is_file():
            names.add(file.relative_to(root).as_posix())
    for skill in index['skills']:
        name = skill['name']
        if '/' in name or '\\' in name or name in ('', '.', '..'):
            raise ValueError(f'Invalid skill name: {name}')
        for relative in skill['files']:
            candidate = PurePosixPath(relative)
            if candidate.is_absolute() or '..' in candidate.parts or '\\' in relative:
                raise ValueError(f'Invalid skill path: {relative}')
            names.add(f'skills/{name}/{relative}')
    for name in sorted(names):
        file = root / name
        cursor = root
        for part in PurePosixPath(name).parts:
            cursor = cursor / part
            if cursor.is_symlink():
                raise ValueError(f'Symlink is not a distribution file: {name}')
        if not file.is_file() or not file.resolve().is_relative_to(root.resolve()):
            raise ValueError(f'Invalid distribution file: {name}')
        yield name, file


def build(root, output):
    files = list(package_files(root))
    if output.resolve() in {file.resolve() for _, file in files}:
        raise ValueError('Output must not overwrite a package input')
    output.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output, 'w', compression=zipfile.ZIP_DEFLATED) as archive:
        for name, file in files:
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_DEFLATED
            archive.writestr(info, file.read_bytes())
    with zipfile.ZipFile(output) as archive:
        if archive.testzip() is not None:
            raise ValueError('Archive integrity check failed')
    return hashlib.sha256(output.read_bytes()).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    for command in [['node', 'scripts/gen-index.mjs', '--check'], ['node', 'scripts/check-plugin.mjs']]:
        subprocess.run(command, cwd=ROOT, check=True)
    manifest = json.loads((ROOT / 'plugin.json').read_text())
    output = args.output or ROOT / 'dist' / f"{manifest['name']}-{manifest['version']}.zip"
    digest = build(ROOT, output)
    print(f'Package: {output.resolve()}')
    print(f'SHA-256: {digest}')


if __name__ == '__main__':
    main()
