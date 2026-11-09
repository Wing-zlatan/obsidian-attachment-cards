import argparse
import base64
import json
import shutil
import subprocess
from pathlib import Path


def invoke(vault, *arguments):
    command = shutil.which('Obsidian') or shutil.which('obsidian')
    if not command:
        raise RuntimeError('The Obsidian CLI is not on PATH.')
    result = subprocess.run([command, f'vault={vault}', *arguments], capture_output=True, text=True, encoding='utf-8', check=True)
    output = '\n'.join(line for line in result.stdout.splitlines() if not line.startswith('Received CLI command ')).strip()
    if any(line.startswith('Error:') for line in output.splitlines()):
        raise RuntimeError(output)
    return output


def main():
    parser = argparse.ArgumentParser(description='Run a real-host check or capture a prepared comparison through the Obsidian CLI.')
    parser.add_argument('--vault', required=True)
    parser.add_argument('--script', type=Path)
    parser.add_argument('--note', default='Attachment Cards Demo 012/Examples.md')
    parser.add_argument('--phase', default='after')
    parser.add_argument('--screenshot', type=Path)
    args = parser.parse_args()
    if args.script:
        path = json.dumps(str(args.script.resolve()))
        code = f"new Function('app','plugin','notePath','phase',require('fs').readFileSync({path},'utf8'))(app,app.plugins.plugins['attachment-cards'],{json.dumps(args.note)},{json.dumps(args.phase)})"
        code += '.catch(error=>{throw new Error(error.stack)})'
        print(invoke(args.vault, 'eval', f'code={code}'))
    if args.screenshot:
        parameters = {'format': 'png', 'clip': {'x': 0, 'y': 0, 'width': 1200, 'height': 800, 'scale': 1}}
        invoke(args.vault, 'eval', "code=Object.assign(document.getElementById('attachment-cards-comparison').style,{position:'fixed',top:'0'})")
        try:
            result = invoke(args.vault, 'dev:cdp', 'method=Page.captureScreenshot', 'params=' + json.dumps(parameters))
        finally:
            invoke(args.vault, 'eval', "code=Object.assign(document.getElementById('attachment-cards-comparison').style,{position:'absolute',top:'10000px'})")
        payload = json.loads(result.removeprefix('=> '))
        args.screenshot.parent.mkdir(parents=True, exist_ok=True)
        args.screenshot.write_bytes(base64.b64decode(payload['data']))
        print(args.screenshot.resolve())


if __name__ == '__main__':
    main()
