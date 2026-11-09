import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


def main():
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description='Package the committed Obsidian plugin release.')
    parser.add_argument('--output', type=Path, default=root / 'dist')
    args = parser.parse_args()
    manifest = json.loads((root / 'manifest.json').read_text(encoding='utf-8'))
    version = manifest['version']
    plugin_id = manifest['id']
    if not re.fullmatch(r'\d+\.\d+\.\d+', version) or plugin_id != 'attachment-cards':
        raise ValueError('Invalid release version or plugin ID')
    versions = json.loads((root / 'versions.json').read_text(encoding='utf-8'))
    if versions.get(version) != manifest['minAppVersion']:
        raise ValueError('versions.json does not match manifest.json')
    subprocess.run(['node', '--check', 'main.js'], cwd=root, check=True)
    status = subprocess.run(['git', 'status', '--porcelain'], cwd=root, capture_output=True, text=True, encoding='utf-8', check=True)
    if status.stdout.strip():
        raise RuntimeError('Commit the finished changes before packaging; the repository is not clean.')

    destination = args.output.resolve() / version
    destination.mkdir(parents=True, exist_ok=True)
    assets = ('main.js', 'manifest.json', 'styles.css')
    for name in assets:
        shutil.copyfile(root / name, destination / name)
    install_zip = destination / f'{plugin_id}-{version}.zip'
    with ZipFile(install_zip, 'w', compression=ZIP_DEFLATED) as archive:
        for name in assets:
            archive.write(root / name, f'{plugin_id}/{name}')
    source_zip = destination / f'obsidian-attachment-cards-{version}-source.zip'
    subprocess.run(['git', 'archive', '--format=zip', '--prefix=obsidian-attachment-cards/', f'--output={source_zip}', 'HEAD'], cwd=root, check=True)

    # 一次核对安装包布局及内容，防止源码快照和实际安装资产不一致。
    with ZipFile(install_zip) as archive:
        expected = {f'{plugin_id}/{name}' for name in assets}
        if set(archive.namelist()) != expected:
            raise RuntimeError('Unexpected install ZIP contents')
        for name in assets:
            if archive.read(f'{plugin_id}/{name}') != (root / name).read_bytes():
                raise RuntimeError(f'Install asset mismatch: {name}')
    with ZipFile(source_zip) as archive:
        for name in assets:
            if archive.read(f'obsidian-attachment-cards/{name}') != (root / name).read_bytes():
                raise RuntimeError(f'Source archive mismatch: {name}')
    print(json.dumps({'version': version, 'output': str(destination), 'assets': list(assets), 'install_zip': install_zip.name, 'source_zip': source_zip.name}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
