<div align="center">

<br/>

```
 █████╗ ███████╗███████╗██╗███████╗████████╗
██╔══██╗██╔════╝██╔════╝██║██╔════╝╚══██╔══╝
███████║███████╗███████╗██║███████╗   ██║   
██╔══██║╚════██║╚════██║██║╚════██║   ██║   
██║  ██║███████║███████║██║███████║   ██║   
╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝   ╚═╝   
    ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗
   ██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝
   ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   
   ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   
   ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   
    ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   
```

### Gestão digital de lares de idosos — no bolso dos cuidadores.

<br/>

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<br/>

> Projeto desenvolvido para a componente curricular **N393-84 — Projeto Aplicado Multiplataforma**  
> Universidade de Fortaleza · Centro de Ciências Tecnológicas · 2026

</div>

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Requisitos](#-requisitos)
- [Como Executar](#-como-executar)
- [Acesso ao App](#-acesso-ao-app)
- [Stack Tecnológica](#-stack-tecnológica)
- [Equipe](#-equipe)

---

## 💡 Sobre o Projeto

Muitas instituições de cuidado a idosos ainda operam com **cadernos físicos**, planilhas desconexas e sistemas web que não acompanham o ritmo dinâmico do trabalho presencial. O resultado: atrasos no registro de medicações, inconsistências nos dados dos residentes e falhas de comunicação entre turnos.

O **Assist Connect Mobile** resolve isso. É um aplicativo multiplataforma (Android e iOS) desenvolvido em React Native + Expo que **digitaliza e centraliza toda a gestão de cuidados** — medicamentos, alimentação, atividades diárias e perfis clínicos — diretamente na palma da mão dos cuidadores.

---

## ✅ Funcionalidades

| # | Módulo | Descrição |
|---|--------|-----------|
| RF01 | **Autenticação** | Login via e-mail/senha com JWT, sessão persistente mesmo offline |
| RF02 | **Dashboard** | Saudação personalizada, cards de resumo do dia, alertas e navegação rápida |
| RF03 | **Listagem de Residentes** | Cards com foto, nome, quarto e idade; busca por nome; filtro por ala/quarto; paginação infinita |
| RF04 | **Perfil do Residente** | Dados médicos, alergias, restrições alimentares e contatos de emergência em seções colapsáveis |
| RF05 | **Agenda de Atividades** | Atividades agrupadas por período (manhã, tarde, noite) com seletor de data e calendário semanal |
| RF06 | **Marcar Conclusão** | Botão com modal de confirmação, atualização imediata na UI e opção de desfazer |
| RF07 | **Controle de Alimentação** | Cardápio do dia por refeição, tags de restrições alimentares e checklist de confirmação |
| RF08 | **Controle de Medicamentos** | Agenda diária por horário, marcação de administração e status visual (pendente / administrado / atrasado) |

---

## 🏗 Arquitetura

O app segue uma **Feature-Based Architecture** em camadas, inspirada nas boas práticas de projetos React Native de produção.

```
┌─────────────────────────────────────────────────────┐
│                   USUÁRIOS (Cuidadores)              │
└──────────────────────────┬──────────────────────────┘
                           │ interagem com
┌──────────────────────────▼──────────────────────────┐
│              ASSIST CONNECT MOBILE                   │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   Screens    │  │    Hooks     │  │ Context   │  │
│  │(Apresentação)│─▶│ Customizados │  │ API (JWT) │  │
│  └──────────────┘  └──────┬───────┘  └───────────┘  │
│                           │                          │
│              ┌────────────▼────────────┐             │
│              │     Services (Dados)    │             │
│              │   Axios + AsyncStorage  │             │
│              │   cache-then-network    │             │
│              └──────────┬─────────────┘             │
│                         │ HTTPS / JWT               │
│         ┌───────────────▼───────────────┐           │
│         │  Armazenamento Local          │           │
│         │  AsyncStorage (Token + Cache) │           │
│         └───────────────────────────────┘           │
└──────────────────────────┬──────────────────────────┘
                           │ Requisições HTTPS
┌──────────────────────────▼──────────────────────────┐
│               SERVIDOR RESTful (Backend Web)         │
│   Auth API · Dados de Idosos · Agendamentos · Logs  │
└──────────────────────────┬──────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────┐
│           BANCO DE DADOS — Care Home (SQL)           │
│   Registros de Idosos · Equipe · Agendamentos · Logs │
└─────────────────────────────────────────────────────┘
```

### Estratégia de Dados — Cache-Then-Network

```
Tela solicita dados
       │
       ▼
Cache no AsyncStorage? ──SIM──▶ Exibe imediatamente
       │                               │
      NÃO                     Chama API em paralelo
       │                               │
       └───────────────────────────────┘
                        │
                 Resposta da API
                        │
             Salva no AsyncStorage
                        │
              Atualiza a interface
```

---

## 📐 Requisitos

### Requisitos Não Funcionais

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF01 | Desempenho | Cold start ≤ 3 segundos |
| RNF02 | Desempenho | Rolagem fluida a 60fps mesmo carregando imagens |
| RNF03 | Desempenho | Cache local com AsyncStorage para minimizar consumo de dados |
| RNF04 | Usabilidade | Material Design 3 (Android) e Human Interface Guidelines (iOS) |
| RNF05 | Compatibilidade | Android 9.0+ (API 28) e iOS 13.0+ |
| RNF06 | Segurança | Token JWT armazenado com encriptação via AsyncStorage |
| RNF07 | Segurança | Toda comunicação via HTTPS |

---

## 🚀 Como Executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18.x ou superior
- [Expo CLI](https://docs.expo.dev/get-started/installation/) instalado globalmente
- [Android Studio](https://developer.android.com/studio) (emulador) **ou** [Expo Go](https://expo.dev/client) no smartphone
- Backend da API em execução na mesma rede (IP configurado no `.env`)

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/assist-connect-mobile.git

# 2. Suba o backend
cd backend
npm install
npm run start

# 3. Suba o frontend web (se aplicável)
cd frontend
npm install
npm run start

# 4. Configure e inicie o mobile
cd mobile
npm install        # ou yarn install

# 5. Inicie o servidor Expo
npx expo start
```

> Escaneie o QR Code exibido no terminal com o **Expo Go** instalado no seu dispositivo para abrir o app.

> ⚠️ **Atenção:** o backend deve estar em execução antes de iniciar o mobile, pois o app depende diretamente da API web.

---

## 📲 Acesso ao App

| Campo | Valor |
|-------|-------|
| **Plataforma de Teste** | Expo Go (Google Play / App Store) |
| **Usuário** | `cuidador@assistconnect.com` |
| **Senha** | `admin123` |

> 📖 Documentação oficial da API (OpenAPI): `https://myprofile.github.io/rochaforte-api-docs/`

---

## 🛠 Stack Tecnológica

| Camada | Tecnologia | Finalidade |
|--------|-----------|------------|
| **Framework** | React Native + Expo CLI | Desenvolvimento multiplataforma (Android/iOS) |
| **Linguagem** | JavaScript / TypeScript | Tipagem e produtividade |
| **Estado Global** | Context API | Gerenciamento de sessão e autenticação |
| **Navegação** | React Navigation (Stack) | Roteamento entre telas públicas e privadas |
| **HTTP Client** | Axios | Chamadas à API REST com interceptors JWT |
| **Cache Local** | AsyncStorage | Persistência de token e dados offline |
| **IDE** | Visual Studio Code | Desenvolvimento com extensões React |
| **Versionamento** | Git + GitHub | Branches por sprint, merge na main |
| **Gerência de Projeto** | GitHub Projects (Kanban) | Distribuição de tarefas por sprint |
| **Testes de API** | Postman / Insomnia | Validação dos endpoints do backend |

---

## 👥 Equipe

<div align="center">

| Nome |
|------|
| **Weyne Gabriel Rodrigues Arruda** |
| **João Paulo Martins Penha** |
| **João Pedro Lopes Marques de Almeida** |
| **Ricardo Batista Lino Junior** |
| **Davi Sales Alburquerque Vila Nova** |

**Supervisor:** Prof. Bruno Lopes, Me  
**Instituição:** Universidade de Fortaleza — UNIFOR  
**Curso:** Tecnólogo em Análise e Desenvolvimento de Sistemas  
**Componente:** N393-84 — Projeto Aplicado Multiplataforma

</div>

---

<div align="center">

**Assist Connect Mobile** · UNIFOR 2026

*"A tecnologia mobile aplicada a ambientes de saúde deve ter como pilar fundamental  
não apenas uma boa arquitetura de código, mas a extrema usabilidade."*

</div>
