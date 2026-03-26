// Previne erros do Expo SDK 55 no ambiente Jest
// O runtime.native.ts instala globals via lazy getters que tentam fazer
// require() fora do escopo quando acessados durante os testes

// Garante que structuredClone existe (Node 17+ já tem, mas o Expo tenta sobrescrever)
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Previne o getter lazy do Expo de tentar carregar @ungap/structured-clone
Object.defineProperty(global, 'structuredClone', {
    value: global.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj))),
    configurable: true,
    writable: true,
});

// Previne o getter lazy do __ExpoImportMetaRegistry
Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: { url: 'http://localhost:8081/index.bundle' },
    configurable: true,
    writable: true,
});
