# 🏫 Sistema de Gestão Escolar — EEP Professor Luís Felipe

Sistema web completo e moderno de gestão escolar desenvolvido para a **Escola Estadual de Educação Profissional Professor Luís Felipe**.

![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## ✨ Funcionalidades Principais

- 📊 **Dashboard Interativo**: Indicadores em tempo real, taxas de presença, gráficos de frequência diária, distribuição de RACs e ocorrências por categoria e por turma.
- 👤 **Cadastro Completo de Alunos**: Ficha com foto, dados pessoais, contato de responsáveis, endereço e matrícula automática.
- 📋 **Lançamento de Frequência por Disciplina**: Interface rápida de chamada para turmas do Ensino Médio com suporte a Presença, Falta e Justificativa.
- 📝 **Registro de RAC (Acompanhamento em Sala de Aula)**: Controle de ocorrências pedagógicas e comportamentais em sala (uso de celular, dormir em sala, não realização de atividades, etc.).
- ⚠️ **Registro de Ocorrências Disciplinares**: Registro formal de condutas (falta de fardamento, atrasos, brigas, etc.) com classificação de gravidade (Leve, Moderado, Grave) e providências adotadas.
- 👥 **Gestão de Operadores e Perfis (RBAC)**: Perfis de acesso diferenciados para **Diretor**, **Coordenador**, **Secretário** e **Professor**.
- 🏫 **Turmas e Séries**: Gerenciamento das séries do Ensino Médio (1ª a 3ª Série) nos turnos Manhã, Tarde e Noite, com vínculo professor-disciplina (`SubjectTeacher`).
- 📄 **Relatórios e Impressão / PDF**: Emissão de relatórios consolidados de frequência, histórico disciplinar e fichas individuais do aluno formatadas para impressão oficial.

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js (App Router, Server Actions & React Server Components)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS v4
- **Componentes UI**: shadcn/ui & Radix UI primitives
- **ORM & Banco de Dados**: Prisma ORM com PostgreSQL (Supabase)
- **Autenticação**: NextAuth.js (Auth.js v5) com Credentials Provider & RBAC
- **Gráficos**: Recharts
- **Ícones**: Lucide React
- **Hospedagem & Deploy**: Vercel & Supabase

---

## 🚀 Como Executar Localmente

### 1. Clonar o repositório
```bash
git clone https://github.com/NatanaelRibF/eep-professorluisfelipe.git
cd eep-professorluisfelipe
```

- 🚀 **Aplicação em Produção**: [https://eeep-professorluisfelipe.vercel.app](https://eeep-professorluisfelipe.vercel.app)

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

### 4. Executar Migrations e Seed do Banco
```bash
npx prisma db push
npx prisma db seed
```

### 5. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔐 Acesso Padrão (Seed)

- **Email**: `admin@eep.com`
- **Senha**: `admin123`
- **Perfil**: Diretor (Acesso Total)

---

## 📄 Licença

Desenvolvido para a **EEP Professor Luís Felipe**. Todos os direitos reservados.
