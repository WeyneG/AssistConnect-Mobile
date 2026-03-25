# Sprint - Tela Home ✅

## Checklist de Implementação

### ✅ Estrutura
- [x] Criar página `home_page.tsx` em `src/pages/`
- [x] Implementar AppBar com nome do sistema "AssistConnect"
- [x] Criar navegação (bottom navigation com 3 itens: Home, Adicionar, Perfil)

### ✅ Conteúdo
- [x] Criar card com resumo (total de idosos, ativos e inativos)
- [x] Implementar lista de idosos com informações (nome, idade, status, última visita)
- [x] Criar botão "Ver Detalhes" para cada idoso

### ✅ Dados
- [x] Integrar com API para buscar idosos (serviço em `src/services/api.ts`)
- [x] Implementar loading de carregamento (ActivityIndicator)
- [x] Tratar erros de requisição (tela de erro com botão de retry)

## Funcionalidades Extras Implementadas

- ✨ Pull to refresh (arraste para baixo para recarregar)
- ✨ Estado vazio (quando não há idosos cadastrados)
- ✨ Busca paralela de dados (resumo + lista)
- ✨ Design responsivo e acessível
- ✨ Ícones do Ionicons

## Arquivos Criados

```
AssistConnect-Mobile/
├── src/
│   ├── pages/
│   │   └── home_page.tsx          # Tela principal Home
│   └── services/
│       ├── api.ts                 # Serviço de API
│       └── README.md              # Documentação da API
├── App.tsx                        # Atualizado para usar HomePage
└── SPRINT_HOME.md                 # Este arquivo
```

## Como Testar

1. Execute o projeto:
```bash
cd AssistConnect-Mobile
npm start
```

2. Faça login (qualquer email/senha funciona no mock)

3. Você verá:
   - AppBar com "AssistConnect" e botão de logout
   - Card de resumo com total, ativos e inativos
   - Lista de 5 idosos mockados
   - Loading ao carregar
   - Bottom navigation

4. Teste o pull to refresh arrastando a tela para baixo

## Próximos Passos

Para conectar com a API real:

1. Abra `src/services/api.ts`
2. Altere `API_BASE_URL` para sua URL real
3. Descomente as chamadas fetch e remova os dados mockados
4. Veja `src/services/README.md` para mais detalhes

## Estrutura de Dados

### Interface Idoso
```typescript
{
  id: number;
  nome: string;
  idade: number;
  foto?: string;
  status: 'ativo' | 'inativo';
  ultimaVisita?: string;
}
```

### Interface ResumoIdosos
```typescript
{
  total: number;
  ativos: number;
  inativos: number;
}
```
