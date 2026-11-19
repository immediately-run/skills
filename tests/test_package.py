import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('package_plugin', Path(__file__).resolve().parents[1] / 'scripts/package-plugin.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class PackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for name, content in {
            'plugin.json': '{}', 'LICENSE': 'MIT', 'assets/icon.svg': '<svg/>',
            'skills/example/SKILL.md': 'instructions',
            'skills/index.json': json.dumps({'skills': [{'name': 'example', 'files': ['SKILL.md']}]}),
            '.env': 'MUST NOT SHIP', '.git/config': 'PRIVATE', 'dist/old.zip': 'OLD',
        }.items():
            file = self.root / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(content)

    def test_archive_is_reproducible_and_excludes_workspace_files(self):
        first, second = self.root / 'dist/a.zip', self.root / 'dist/b.zip'
        self.assertEqual(module.build(self.root, first), module.build(self.root, second))
        with zipfile.ZipFile(first) as archive:
            self.assertEqual(archive.namelist(), ['LICENSE', 'assets/icon.svg', 'plugin.json', 'skills/example/SKILL.md'])
            self.assertEqual(archive.read('skills/example/SKILL.md'), b'instructions')

    def test_rejects_traversal_in_index(self):
        (self.root / 'skills/index.json').write_text(json.dumps({'skills': [{'name':'example','files':['../../.env']}]}))
        with self.assertRaises(ValueError):
            list(module.package_files(self.root))

    def test_rejects_symlinked_assets(self):
        (self.root / 'assets/leak').symlink_to(self.root / '.env')
        with self.assertRaises(ValueError):
            list(module.package_files(self.root))

    def test_cannot_overwrite_input_with_archive(self):
        with self.assertRaises(ValueError):
            module.build(self.root, self.root / 'plugin.json')


if __name__ == '__main__':
    unittest.main()
