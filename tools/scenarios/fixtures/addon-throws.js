// A broken local add-on for tools/scenarios/local-addons.js: it registers, then throws.
addonRegister({ id: 'brokenone', name: 'Broken One', desc: 'Throws while loading.', tag: 'silly' });
throw new Error('oops, a mistake on purpose');
