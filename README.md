# Estudos sem distrações

Oslo é projetado para máxima eficiência. Pratique com questões, revise seus erros e organize seu conhecimento.

-----

## Estrutura

  * **Framework:** Next.js 15 (com App Router, Server Components e Server Actions)

  * **Backend e Banco de Dados:** Supabase (PostgreSQL, Auth, Storage)
  
  * **Linguagem:** TypeScript
  
  * **Estilização e UI:** Tailwind CSS, Radix UI, shadcn/ui, lucide-react
  
  * **Hospedagem:** Vercel

-----

## Panorama

  * **`/`**: Landing Page
  
  * **`/login`**: Permite que usuários existentes acessem a plataforma. O cadastro de novos usuários também é feito aqui

  * **`/dashboard`**: (Protegida) Painel principal do estudante, exibindo métricas de desempenho e matérias disponíveis para prática
  
  * **`/practice/[subjectId]`**: (Protegida) Inicia um quiz com questões da matéria selecionada
  
  * **`/review`**: (Protegida) Página para revisar questões respondidas incorretamente, com filtros por matéria e tipo de erro
  
  * **`/notebook`**: (Protegida) Caderno digital que agrega grifos feitos durante a resolução de questões e anotações pessoais
  
  * **`/questions/new`**: (Admin) Painel para administradores criarem e cadastrarem novas questões no BD

-----

## Rodando

1.  **Clone o repositório e instale as dependências:**

```bash
git clone https://github.com/efdourado/fs-oslo.git && cd fs-oslo && npm install
```

2. **Configure as variáveis de ambiente** adicionando as seguintes chaves do Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=URL_DO_SEU_PROJETO_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_SUPABASE
```

3. **Execute em desenvolvimento** (disponível em `http://localhost:3000`):

```bash
npm run dev
```

4. **Para compilar e iniciar em modo de produção:**

```bash
npm run build
npm start
```