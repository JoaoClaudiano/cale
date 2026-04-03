<div align="center">

<img src="favicon.svg" alt="flow.planner logo" width="80" height="80">

# flow.planner

**Sistema pessoal de frequência acadêmica e agenda semanal**
Leve, offline-first e de código aberto.

[![PWA](https://img.shields.io/badge/PWA-instalável-7c3aed?style=for-the-badge&logo=pwa&logoColor=white)](https://joaoclaudiano.github.io/planner/)
[![License: MIT](https://img.shields.io/badge/Licença-MIT-2563eb?style=for-the-badge)](LICENSE)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)

[![Demo ao vivo](https://img.shields.io/badge/▶%20Demo%20ao%20vivo-7c3aed?style=for-the-badge)](https://joaoclaudiano.github.io/planner/)

</div>

---

## 📖 Sobre o projeto

O **flow.planner** é uma aplicação web para estudantes universitários que precisam controlar frequências, organizar a agenda semanal e gerenciar tarefas — tudo em um único lugar. Funciona direto no navegador, sem instalação, e pode ser adicionado à tela inicial como um aplicativo nativo (PWA).

> **Zero frameworks. Zero build. Zero complicação.**
> Apenas HTML, CSS e JavaScript puros, com carregamento instantâneo e funcionamento 100% offline.

---

## ✨ Funcionalidades

<table>
<tr>
<td width="50%">

### 📅 Agenda & Calendário
- Visualização semanal interativa
- Navegação por teclado (`←` `→`)
- Arrastar e soltar eventos (drag & drop)
- Tipos de evento: aula, lembrete, prova, entrega

</td>
<td width="50%">

### ✅ Frequência Acadêmica
- Controle de presença por disciplina
- Cálculo automático de percentual
- Alerta de limite de faltas
- Histórico completo por matéria

</td>
</tr>
<tr>
<td width="50%">

### 📝 Disciplinas & Organização
- Cadastro com horário, local, turma e semestre
- Cores personalizadas por matéria
- Listas de tarefas integradas
- Tópicos de estudo por disciplina

</td>
<td width="50%">

### ☁️ Sincronização & Backup
- Modo offline completo (localStorage / IndexedDB)
- Sincronização em nuvem opcional via Supabase
- Exportação e importação em JSON
- Acesso em múltiplos dispositivos

</td>
</tr>
<tr>
<td width="50%">

### 🌙 Experiência Visual
- Tema claro / escuro automático
- Design responsivo (mobile, tablet, desktop)
- Tipografia Space Grotesk & Space Mono
- Interface limpa e minimalista

</td>
<td width="50%">

### 📲 PWA Instalável
- Funciona como app nativo no celular
- Ícone na tela inicial (iOS, Android, desktop)
- Cache offline com Service Worker
- Atualizações automáticas em background

</td>
</tr>
</table>

---

## 🚀 Começando

### ▶ Usar online

Acesse diretamente em **[joaoclaudiano.github.io/planner](https://joaoclaudiano.github.io/planner/)** — sem cadastro obrigatório.

| Modo | Como acessar |
|------|-------------|
| 👤 **Convidado** | Clique em **Entrar** sem preencher e-mail ou senha. Dados salvos localmente no navegador. |
| 🔐 **Conta** | Clique em **criar conta**, informe seu e-mail e receba um link mágico (sem senha!). Sincronização automática ativada. |

### 📲 Instalar como app

| Plataforma | Instruções |
|-----------|-----------|
| **Chrome / Edge (desktop)** | Clique no ícone de instalar na barra de endereços |
| **iOS (Safari)** | Menu *Compartilhar* → *Adicionar à Tela Inicial* |
| **Android (Chrome)** | Menu *⋮* → *Adicionar à tela inicial* |

---

## ⚙️ Rodando localmente

O projeto é **100% estático** — não há build, bundler ou servidor de backend necessário.

```bash
# 1. Clone o repositório
git clone https://github.com/JoaoClaudiano/planner.git
cd planner

# 2. Inicie um servidor HTTP estático (escolha um)
npx serve .
# ou
python3 -m http.server 8080
# ou
npx http-server . -p 8080
```

Acesse `http://localhost:8080` no navegador.

> **Por quê usar um servidor local?** O Service Worker e as requisições ao Supabase exigem contexto HTTP — abrir o `index.html` diretamente como arquivo não funciona corretamente.

---

## 🗂 Estrutura do projeto

```
flow.planner/
│
├── index.html              # App principal (agenda + frequência + anotações)
├── login.html              # Tela de autenticação (convidado / conta / Google)
├── como-funciona.html      # Documentação completa para o usuário
├── sobre.html              # Sobre o projeto e filosofia
├── status.html             # Status dos serviços em tempo real
├── contato.html            # Formulário de contato
├── termos.html             # Termos de uso
├── privacidade.html        # Política de privacidade
│
├── sw.js                   # Service Worker (cache offline)
├── manifest.json           # Manifesto PWA
├── favicon.svg / .ico      # Ícones do site
│
└── assets/
    ├── css/
    │   └── style.css       # Estilos globais (tema, componentes, responsividade)
    ├── icons/              # Ícones PWA (72px → 512px, maskable)
    └── js/
        ├── app.js          # Entrada principal, inicialização do app
        └── modules/
            ├── config.js   # Configurações globais (Supabase URL/key, constantes)
            ├── state.js    # Estado reativo da aplicação
            ├── storage.js  # Camada de persistência (localStorage + IndexedDB)
            ├── supabase.js # Integração com Supabase (auth + sync)
            ├── calendar.js # Lógica da agenda semanal e drag & drop
            ├── attendance.js # Controle de frequência
            ├── ui.js       # Componentes de interface e renderização
            ├── account.js  # Gerenciamento de conta e perfil
            ├── tour.js     # Tour guiado para novos usuários
            ├── greeting.js # Saudações dinâmicas
            ├── location.js # Detecção de localização
            ├── splash.js   # Tela de carregamento
            └── utils.js    # Funções utilitárias
```

---

## 🔧 Configuração do Supabase

Para habilitar sincronização em nuvem em um fork próprio, substitua as constantes em `assets/js/modules/config.js`:

```js
export const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
export const SUPABASE_KEY = 'sua_chave_anon_publica';
```

As mesmas constantes também precisam ser atualizadas em `login.html`.

### ⚠️ Autenticação Google (OAuth) em produção

Se após o login com Google o usuário for redirecionado para `localhost`, configure as URLs no painel do Supabase:

**Supabase Dashboard → Authentication → URL Configuration**

| Campo | Valor |
|-------|-------|
| **Site URL** | `https://SEU_USUARIO.github.io/planner/` |
| **Redirect URLs** | `https://SEU_USUARIO.github.io/planner/**` |

> O `redirectTo` no código usa a URL base do app. Ela precisa corresponder exatamente ao **Site URL** configurado — caso contrário, o Supabase usa o valor padrão do ambiente de desenvolvimento (`localhost:3000`).

---

## 🧱 Stack tecnológica

| Tecnologia | Função |
|-----------|--------|
| ![HTML5](https://img.shields.io/badge/-HTML5-E34F26?logo=html5&logoColor=white&style=flat-square) **HTML5 / CSS3 / JS Vanilla** | Interface e lógica — sem frameworks |
| ![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white&style=flat-square) **[Supabase](https://supabase.com/)** | Backend opcional: auth + banco de dados em nuvem |
| ![SheetJS](https://img.shields.io/badge/-SheetJS-217346?logo=microsoftexcel&logoColor=white&style=flat-square) **[SheetJS](https://sheetjs.com/)** | Exportação e importação de dados em `.xlsx` |
| ![Google Fonts](https://img.shields.io/badge/-Google%20Fonts-4285F4?logo=google&logoColor=white&style=flat-square) **[Space Grotesk & Space Mono](https://fonts.google.com/)** | Tipografia via Google Fonts |
| **Service Worker** | Cache offline e comportamento de app nativo |
| **localStorage / IndexedDB** | Persistência local dos dados no dispositivo |

---

## 🔒 Privacidade e segurança

- **Modo convidado:** nenhum dado é enviado a servidores externos. Tudo permanece no seu dispositivo.
- **Modo conta:** os dados são sincronizados com o Supabase sob sua conta pessoal, protegidos por Row Level Security (RLS).
- Nenhuma telemetria ou rastreamento de comportamento é realizado.
- Consulte a [política de privacidade completa](https://joaoclaudiano.github.io/planner/privacidade.html) para mais detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga os passos abaixo:

1. **Fork** este repositório
2. Crie uma branch para sua feature: `git checkout -b feature/minha-feature`
3. Faça suas alterações e **commit**: `git commit -m 'feat: adiciona minha feature'`
4. Envie para o seu fork: `git push origin feature/minha-feature`
5. Abra um **Pull Request** descrevendo suas mudanças

### 📌 Padrões do projeto

- JavaScript **ES Modules** nativos — sem bundler, sem transpilação
- Novos módulos JS em `assets/js/modules/`
- Estilo de commits: [Conventional Commits](https://www.conventionalcommits.org/pt-br/)
- Código em **português** (comentários, variáveis, UI) para manter consistência com o projeto

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE) para mais detalhes.

MIT © 2024–2026 [JoaoClaudiano](https://github.com/JoaoClaudiano)

---

<div align="center">

**[🌐 Demo ao vivo](https://joaoclaudiano.github.io/planner/)** · **[📋 Como funciona](https://joaoclaudiano.github.io/planner/como-funciona.html)** · **[📬 Contato](https://joaoclaudiano.github.io/planner/contato.html)** · **[🔵 Status](https://joaoclaudiano.github.io/planner/status.html)**

<sub>Feito com ❤️ por <a href="https://github.com/JoaoClaudiano">JoaoClaudiano</a></sub>

</div>
