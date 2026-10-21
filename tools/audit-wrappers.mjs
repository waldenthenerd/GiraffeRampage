// Read-only diagnostic. Uses the parser bundled with the pinned tools/ Playwright dependency; no game dependencies.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { babelParse, traverse } = require(new URL('./node_modules/playwright/lib/transform/babelBundle.js', import.meta.url).pathname);
export const root = new URL('../', import.meta.url);
export const files = [...fs.readFileSync(new URL('index.html', root), 'utf8').matchAll(/<script src="(js\/[^"]+)"/g)].map(m => m[1]);
export const sources = new Map(files.map(file => [file, fs.readFileSync(new URL(file, root), 'utf8')]));
export const trees = new Map(files.map(file => [file, babelParse(sources.get(file), file, false)]));
export { traverse };
export function definitions(){
  const map = new Map();
  for(const [file, ast] of trees) for(const node of ast.program.body) if(node.type === 'FunctionDeclaration' && node.id){
    const name = node.id.name; if(!map.has(name)) map.set(name, []);
    map.get(name).push({file, node, line:node.loc.start.line});
  }
  return map;
}
const defs=definitions(), rows=[], captures=[];
function captured(init,name){
  if(init?.isIdentifier({name}))return true;
  if(init?.isConditionalExpression())return [init.get('consequent'),init.get('alternate')].some(p=>p.isIdentifier({name}));
  return false;
}
function phase(p){for(let a=p.parentPath;a;a=a.parentPath)if(a.isFunction()&&!(a.parentPath.isCallExpression()&&a.parentPath.get('callee')===a))return 'runtime';return 'load';}
for (const [file,ast] of trees) traverse(ast, {
  VariableDeclarator(p){const init=p.get('init');if(init?.isIdentifier()&&defs.has(init.node.name)){
    const binding=init.scope.getBinding(init.node.name);
    if(!binding||binding.scope.path.isProgram()) captures.push({name:init.node.name,alias:p.node.id.name,file,line:p.node.loc.start.line,start:p.node.start});
  }},
  AssignmentExpression(p){
    if(p.node.operator!=='='||!p.get('left').isIdentifier()||!(p.get('right').isFunctionExpression()||p.get('right').isArrowFunctionExpression()))return;
    const name=p.node.left.name,binding=p.scope.getBinding(name);
    if(!defs.has(name)||(binding&&!binding.scope.path.isProgram()))return;
    const earlier=defs.get(name).filter(d=>files.indexOf(d.file)<files.indexOf(file)||(d.file===file&&d.node.start<p.node.start));if(!earlier.length)return;
    const used=[];p.get('right').traverse({ReferencedIdentifier(ref){
      const b=ref.scope.getBinding(ref.node.name);if(!b||!b.path.isVariableDeclarator())return;
      const init=b.path.get('init');if(!captured(init,name))return;
      const owner=init.scope.getBinding(name);if(owner&&!owner.scope.path.isProgram())return;
      const par=ref.parentPath,call=par.isCallExpression()&&par.get('callee')===ref || par.isMemberExpression()&&par.get('object')===ref&&par.parentPath.isCallExpression()&&['call','apply'].includes(par.node.property.name);
      used.push({alias:ref.node.name,call:!!call,line:b.path.node.loc.start.line});
    }});
    rows.push({name,file,line:p.node.loc.start.line,start:p.node.start,phase:phase(p),defined:earlier.map(d=>d.file+':'+d.line),previous:used.some(u=>u.call)?'yes':used.length?'unclear':'no',aliases:[...new Set(used.map(u=>u.alias))]});
  }
});
const duplicates=[...defs].filter(([,d])=>d.length>1).map(([name,ds])=>{
  const first=ds[0],last=ds[ds.length-1];
  const between=e=>(files.indexOf(e.file)>files.indexOf(first.file)||e.file===first.file&&e.start>first.node.start)&&(files.indexOf(e.file)<files.indexOf(last.file)||e.file===last.file&&e.start<last.node.start);
  return {name,definitions:ds.map(({file,line})=>({file,line})),captures:captures.filter(e=>e.name===name&&between(e)),assignments:rows.filter(e=>e.name===name&&between(e))};
});

const result={names:new Set(rows.map(r=>r.name)).size,assignments:rows.length,rows,captures,duplicates};
if(process.argv.includes('--json')) console.log(JSON.stringify(result,null,2));
else {
 console.log('# Global function assignment inventory\n');
 console.log(result.names+' names, '+result.assignments+' assignment sites. In index.html order; load/runtime phases are distinguished.\n');
 console.log('| Name | Earlier declaration(s) | Assignment site and previous-version call |\n|---|---|---|');
 const grouped=new Map();for(const r of rows){if(!grouped.has(r.name))grouped.set(r.name,[]);grouped.get(r.name).push(r);}
 for(const [name,rs]of grouped)console.log('| '+name+' | '+[...new Set(rs.flatMap(r=>r.defined))].join('<br>')+' | '+rs.map(r=>r.file+':'+r.line+' — '+r.previous+' ('+r.phase+(r.aliases.length?'; '+r.aliases.join(', '):'')+')').join('<br>')+' |');
}
