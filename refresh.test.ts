import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

test('Angular page boundaries export standalone decorated components', () => {
  for (const path of ['angular/app.component.ts', 'angular/pages.component.ts']) {
    const source = readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
    const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const components = file.statements.filter(ts.isClassDeclaration).filter(node =>
      ts.getDecorators(node)?.some(decorator => ts.isCallExpression(decorator.expression) && decorator.expression.expression.getText(file) === 'Component'));
    assert.equal(components.length, 1, `${path} should define one component`);
    assert.ok(ts.getModifiers(components[0])?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword));
    assert.match(components[0].getText(file), /standalone:\s*true/);
    assert.doesNotMatch(source, /from\s+['"](?:react|next(?:\/[^'"]*)?)['"]/);
  }
});
