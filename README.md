# AssistConnect-Mobile

João Pedro Lopes - 2426048 (12/03/2026)

1- Levantamento dos endpoints existentes no sistema web

Autenticação
Endpoint		Método
/auth/register		POST	 
/auth/login		POST
/auth/forgot-password	POST	   
/auth/reset-password	POST

Usuários
Endpoint	Método
/usuarios/me	GET	   
/usuarios	GET	 
/usuarios/{id}	PUT	 
/usuarios/{id}	DELETE

Idosos
Endpoint		Método
/idosos	POST		Cadastrar
/idosos	GET		Listar
/idosos/{id}		PUT	 
/idosos/{id}		DELETE	 
/idosos/count		GET	  
/idosos/aniversariantes	GET

Atividades
Controller: AtividadeController

Endpoints:

Endpoint		Método
/api/atividades		GET
/api/atividades?idosoId	GET
/api/atividades		POST
/api/atividades/{id}	PUT
/api/atividades/{id}	DELETE


Cardápios
Controller: CardapioController

Endpoints:

Endpoint		Método
/api/cardapios		GET
/api/cardapios/hoje	GET
/api/cardapios		POST
/api/cardapios/{id}	PUT
/api/cardapios/{id}	DELETE

2- Documentar rotas que serão utilizadas no mobile

POST /auth/login
GET /usuarios/me

GET /idosos
GET /idosos/{id}
POST /idosos
PUT /idosos/{id}
DELETE /idosos/{id}

GET /api/atividades
POST /api/atividades

GET /api/cardapios/hoje

*avaliar necessiades

3-Validar formato das respostas da API (JSON)

POST /auth/login

Resposta:

{
"token": "JWT_TOKEN",
"name": "João Pedro",
"email": "joao@email.com"
}

Resposta da API — Usuário autenticado

Endpoint:

GET /usuarios/me

Resposta esperada:

{
"id": 1,
"name": "João Pedro",
"email": "joao@email.com",
"role": "ADMIN"
}

Resposta da API — Listagem de idosos

Endpoint:

GET /idosos

{
"content": [
{
"id": 1,
"nome": "Maria Silva",
"dataNascimento": "1945-08-12",
"sexo": "FEMININO",
"estadoSaude": "ESTAVEL",
"observacoes": "Diabetes",
"responsavelId": 5,
"responsavelNome": "João Pedro",
"criadoEm": "2026-03-11T14:20:00"
}
],
"totalElements": 1,
"totalPages": 1,
"size": 10,
"number": 0
}

Resposta da API — Detalhe de idoso

Endpoint:

GET /idosos/{id}

Formato:

{
"id": 1,
"nome": "Maria Silva",
"dataNascimento": "1945-08-12",
"sexo": "FEMININO",
"estadoSaude": "ESTAVEL",
"observacoes": "Diabetes",
"responsavelId": 5,
"responsavelNome": "João Pedro",
"criadoEm": "2026-03-11T14:20:00"
}


Atividade

exemplo:

{
"id": 1,
"nome": "Yoga",
"data": "2026-03-11",
"horario_inicio": "08:00",
"horario_fim": "09:00",
"responsavelId": 2,
"responsavelNome": "Carlos",
"observacoes": "Atividade leve"
}

Cardápio

exemplo:

{
"id": 1,
"data": "2026-03-11",
"descricao": "Arroz, feijão e frango"
}
