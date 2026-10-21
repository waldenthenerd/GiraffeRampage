// Read-only inventory in actual index.html order. Uses the parser bundled with the pinned QA dependency.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), require=createRequire(import.meta.url);
const {babelParse,traverse}=require(path.join(root,'tools/node_modules/playwright/lib/transform/babelBundle.js'));
const files=[...fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/<script src="(js\/[^"\r\n]+)"/g)].map(m=>m[1]);
const defs=new Map(), captures=[], assignments=[];
for(const file of files){
  const ast=babelParse(fs.readFileSync(path.join(root,file),'utf8'),file,false);
  for(const n of ast.program.body)if(n.type==='FunctionDeclaration'){
    if(!defs.has(n.id.name))defs.set(n.id.name,[]);defs.get(n.id.name).push({file,line:n.loc.start.line});
  }
  traverse(ast,{
    VariableDeclarator(p){if(p.node.init?.type!=='Identifier')return;const name=p.node.init.name,b=p.scope.getBinding(name);if(!b||b.scope.path.isProgram())captures.push({name,alias:p.node.id.name,file,line:p.node.loc.start.line});},
    AssignmentExpression(p){if(p.node.left.type!=='Identifier'||!['FunctionExpression','ArrowFunctionExpression'].includes(p.node.right.type))return;const name=p.node.left.name,b=p.scope.getBinding(name);if(!b||b.scope.path.isProgram())assignments.push({name,file,line:p.node.loc.start.line});}
  });
}
const order=e=>files.indexOf(e.file)*1000000+e.line;
const result=[...defs].filter(([,ds])=>ds.length>1).map(([name,ds])=>({name,definitions:ds,captures:captures.filter(e=>e.name===name&&order(e)>order(ds[0])&&order(e)<order(ds[ds.length-1])),assignments:assignments.filter(e=>e.name===name&&order(e)>order(ds[0])&&order(e)<order(ds[ds.length-1]))}));
console.log(JSON.stringify(result,null,2));
