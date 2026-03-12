# Serviço de API - AssistConnect

## Como conectar com a API real

O arquivo `api.ts` está configurado com dados mockados para desenvolvimento. Para conectar com sua API real:

### 1. Altere a URL base

```typescript
const API_BASE_URL = 'https://sua-api-real.com/api';
```

### 2. Substitua as funções mockadas

#### buscarIdosos()
```typescript
export const buscarIdosos = async (): Promise<Idoso[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/idosos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Adicione token de autenticação se necessário
        // 'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar idosos');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error('Falha ao carregar dados dos idosos');
  }
};
```

#### buscarResumo()
```typescript
export const buscarResumo = async (): Promise<ResumoIdosos> => {
  try {
    const response = await fetch(`${API_BASE_URL}/idosos/resumo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Erro ao buscar resumo');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error('Falha ao carregar resumo');
  }
};
```

### 3. Formato esperado da API

#### GET /idosos
```json
[
  {
    "id": 1,
    "nome": "Sr. Carlos Silva",
    "idade": 78,
    "foto": "url_opcional",
    "status": "ativo",
    "ultimaVisita": "2025-02-10"
  }
]
```

#### GET /idosos/resumo
```json
{
  "total": 5,
  "ativos": 4,
  "inativos": 1
}
```

## Funcionalidades implementadas

✅ Loading de carregamento  
✅ Tratamento de erros  
✅ Pull to refresh  
✅ Estados vazios  
✅ Retry em caso de erro
