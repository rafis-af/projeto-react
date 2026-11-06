-- =====================================================================
-- GymFEI · Banco de dados (Supabase / PostgreSQL)
--
-- Como usar: no painel do Supabase, abra "SQL Editor" > "New query",
-- cole este arquivo inteiro e clique em "Run". Pode rodar de novo sem
-- problema: tudo aqui é idempotente.
--
-- Modelo:
--   perfis            1 por usuário (auth.users). tipo = 'personal' | 'aluno'.
--                     O aluno aponta para o personal em personal_id.
--   treinos           criados pelo personal para um aluno. Exercícios em JSON.
--   historico_treinos cada treino concluído pelo aluno.
--
-- Segurança: Row Level Security (RLS) em todas as tabelas. Cada pessoa só
-- enxerga o que é dela; o personal enxerga os dados dos seus alunos.
-- =====================================================================


-- ---------------------------------------------------------------- Tabelas

create table if not exists public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 80),
  email text not null,
  tipo text not null default 'aluno' check (tipo in ('personal', 'aluno')),
  personal_id uuid,
  codigo_convite text unique,
  criado_em timestamptz not null default now(),
  constraint perfis_personal_id_fkey
    foreign key (personal_id) references public.perfis (id) on delete set null
);

create index if not exists perfis_personal_id_idx on public.perfis (personal_id);

create table if not exists public.treinos (
  id uuid primary key default gen_random_uuid(),
  personal_id uuid not null,
  aluno_id uuid not null,
  nome text not null check (char_length(nome) between 1 and 80),
  grupo_muscular text not null
    check (grupo_muscular in ('peito', 'costas', 'pernas', 'bracos', 'ombros')),
  objetivo text,
  observacoes text check (char_length(observacoes) <= 500),
  -- [{ "id", "nome", "series", "repeticoes", "carga", "descanso" }]
  exercicios jsonb not null default '[]'::jsonb check (jsonb_typeof(exercicios) = 'array'),
  deletado boolean not null default false,
  deletado_em timestamptz,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  constraint treinos_personal_id_fkey
    foreign key (personal_id) references public.perfis (id) on delete cascade,
  constraint treinos_aluno_id_fkey
    foreign key (aluno_id) references public.perfis (id) on delete cascade
);

create index if not exists treinos_personal_idx on public.treinos (personal_id, deletado);
create index if not exists treinos_aluno_idx on public.treinos (aluno_id, deletado);

create table if not exists public.historico_treinos (
  id uuid primary key default gen_random_uuid(),
  aluno_id uuid not null,
  treino_id uuid,
  nome_treino text not null,
  grupo_muscular text not null,
  quantidade_exercicios int not null default 0,
  series_concluidas int not null default 0,
  total_series int not null default 0,
  duracao_segundos int not null default 0 check (duracao_segundos >= 0),
  concluido_em timestamptz not null default now(),
  constraint historico_treinos_aluno_id_fkey
    foreign key (aluno_id) references public.perfis (id) on delete cascade,
  constraint historico_treinos_treino_id_fkey
    foreign key (treino_id) references public.treinos (id) on delete set null
);

create index if not exists historico_aluno_idx on public.historico_treinos (aluno_id, concluido_em desc);


-- ---------------------------------------------------------------- Funções auxiliares

-- Atualiza "atualizado_em" a cada alteração de treino
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists treinos_atualizado_em on public.treinos;
create trigger treinos_atualizado_em
  before update on public.treinos
  for each row execute function public.tocar_atualizado_em();

-- Código de convite do personal: 6 caracteres, sem 0/O/1/I (evita confusão)
create or replace function public.gerar_codigo_convite()
returns text
language plpgsql
set search_path = public
as $$
declare
  alfabeto constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  codigo text;
begin
  loop
    codigo := '';
    for i in 1..6 loop
      codigo := codigo || substr(alfabeto, 1 + floor(random() * length(alfabeto))::int, 1);
    end loop;
    exit when not exists (select 1 from public.perfis where codigo_convite = codigo);
  end loop;
  return codigo;
end;
$$;

-- Cria o perfil automaticamente quando alguém se cadastra pelo app.
-- O app envia nome, tipo e (opcional) o código do personal em "options.data".
create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tipo text := coalesce(new.raw_user_meta_data ->> 'tipo', 'aluno');
  v_nome text := nullif(trim(new.raw_user_meta_data ->> 'nome'), '');
  v_codigo text := upper(trim(coalesce(new.raw_user_meta_data ->> 'codigo_personal', '')));
  v_personal uuid;
begin
  if v_tipo not in ('personal', 'aluno') then
    v_tipo := 'aluno';
  end if;

  if v_tipo = 'aluno' and v_codigo <> '' then
    select id into v_personal
      from public.perfis
     where tipo = 'personal' and codigo_convite = v_codigo;
  end if;

  insert into public.perfis (id, nome, email, tipo, personal_id, codigo_convite)
  values (
    new.id,
    left(coalesce(v_nome, split_part(new.email, '@', 1)), 80),
    new.email,
    v_tipo,
    v_personal,
    case when v_tipo = 'personal' then public.gerar_codigo_convite() end
  );
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- Usadas dentro das políticas de segurança. "security definer" evita
-- recursão infinita ao consultar a própria tabela de perfis.
create or replace function public.meu_personal_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select personal_id from public.perfis where id = auth.uid();
$$;

create or replace function public.e_meu_aluno(p_aluno uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.perfis
     where id = p_aluno and tipo = 'aluno' and personal_id = auth.uid()
  );
$$;

-- Treinos de um vínculo desfeito vão para a lixeira do personal
create or replace function public.arquivar_treinos_do_vinculo(p_aluno uuid, p_personal uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.treinos
     set deletado = true, deletado_em = now()
   where aluno_id = p_aluno and personal_id = p_personal and not deletado;
$$;


-- ---------------------------------------------------------------- Funções chamadas pelo app (RPC)

-- Confere o código no cadastro, antes de a conta existir (devolve o nome do personal)
create or replace function public.verificar_codigo_convite(p_codigo text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select nome from public.perfis
   where tipo = 'personal' and codigo_convite = upper(trim(p_codigo));
$$;

-- Aluno se vincula (ou troca) de personal usando o código
create or replace function public.vincular_personal(p_codigo text)
returns public.perfis
language plpgsql
security definer
set search_path = public
as $$
declare
  v_personal uuid;
  v_eu public.perfis;
begin
  select * into v_eu from public.perfis where id = auth.uid();
  if v_eu.id is null then
    raise exception 'Faça login novamente.';
  end if;
  if v_eu.tipo <> 'aluno' then
    raise exception 'Apenas alunos podem se vincular a um personal.';
  end if;

  select id into v_personal
    from public.perfis
   where tipo = 'personal' and codigo_convite = upper(trim(p_codigo));
  if v_personal is null then
    raise exception 'Código não encontrado. Confira com seu personal.';
  end if;

  if v_eu.personal_id is not null and v_eu.personal_id <> v_personal then
    perform public.arquivar_treinos_do_vinculo(v_eu.id, v_eu.personal_id);
  end if;

  update public.perfis set personal_id = v_personal where id = v_eu.id returning * into v_eu;
  return v_eu;
end;
$$;

-- Aluno sai da lista do personal
create or replace function public.desvincular_personal()
returns public.perfis
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eu public.perfis;
begin
  select * into v_eu from public.perfis where id = auth.uid() and tipo = 'aluno';
  if v_eu.id is null then
    raise exception 'Apenas alunos podem se desvincular.';
  end if;
  if v_eu.personal_id is not null then
    perform public.arquivar_treinos_do_vinculo(v_eu.id, v_eu.personal_id);
  end if;
  update public.perfis set personal_id = null where id = v_eu.id returning * into v_eu;
  return v_eu;
end;
$$;

-- Personal remove um aluno da própria lista
create or replace function public.remover_aluno(p_aluno uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.e_meu_aluno(p_aluno) then
    raise exception 'Este aluno não está na sua lista.';
  end if;
  perform public.arquivar_treinos_do_vinculo(p_aluno, auth.uid());
  update public.perfis set personal_id = null where id = p_aluno;
end;
$$;


-- ---------------------------------------------------------------- Segurança (RLS)

alter table public.perfis enable row level security;
alter table public.treinos enable row level security;
alter table public.historico_treinos enable row level security;

-- perfis: vejo o meu, o dos meus alunos e o do meu personal
drop policy if exists "perfis_select" on public.perfis;
create policy "perfis_select" on public.perfis
  for select to authenticated
  using (id = auth.uid() or personal_id = auth.uid() or id = public.meu_personal_id());

drop policy if exists "perfis_update" on public.perfis;
create policy "perfis_update" on public.perfis
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- treinos: o personal vê todos os seus; o aluno vê os ativos dele
drop policy if exists "treinos_select" on public.treinos;
create policy "treinos_select" on public.treinos
  for select to authenticated
  using (personal_id = auth.uid() or (aluno_id = auth.uid() and not deletado));

drop policy if exists "treinos_insert" on public.treinos;
create policy "treinos_insert" on public.treinos
  for insert to authenticated
  with check (personal_id = auth.uid() and public.e_meu_aluno(aluno_id));

-- Restaurar da lixeira só se o aluno ainda for dele
drop policy if exists "treinos_update" on public.treinos;
create policy "treinos_update" on public.treinos
  for update to authenticated
  using (personal_id = auth.uid())
  with check (personal_id = auth.uid() and (deletado or public.e_meu_aluno(aluno_id)));

drop policy if exists "treinos_delete" on public.treinos;
create policy "treinos_delete" on public.treinos
  for delete to authenticated
  using (personal_id = auth.uid());

-- histórico: o aluno vê e registra o dele; o personal vê o dos seus alunos
drop policy if exists "historico_select" on public.historico_treinos;
create policy "historico_select" on public.historico_treinos
  for select to authenticated
  using (aluno_id = auth.uid() or public.e_meu_aluno(aluno_id));

drop policy if exists "historico_insert" on public.historico_treinos;
create policy "historico_insert" on public.historico_treinos
  for insert to authenticated
  with check (
    aluno_id = auth.uid()
    and (treino_id is null or exists (
      select 1 from public.treinos t where t.id = treino_id and t.aluno_id = auth.uid()
    ))
  );


-- ---------------------------------------------------------------- Permissões

grant usage on schema public to anon, authenticated;

-- perfis: o app só lê e altera o próprio nome. Tipo, código e vínculo
-- mudam apenas pelas funções acima (o usuário não vira "personal" sozinho).
revoke all on public.perfis from anon, authenticated;
grant select on public.perfis to authenticated;
grant update (nome) on public.perfis to authenticated;

revoke all on public.treinos from anon;
grant select, insert, update, delete on public.treinos to authenticated;

revoke all on public.historico_treinos from anon;
grant select, insert on public.historico_treinos to authenticated;

-- Funções internas: ninguém chama direto pela API
revoke execute on function public.gerar_codigo_convite() from public, anon, authenticated;
revoke execute on function public.criar_perfil() from public, anon, authenticated;
revoke execute on function public.arquivar_treinos_do_vinculo(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.tocar_atualizado_em() from public, anon, authenticated;

-- Usadas pelas políticas (precisam estar liberadas para quem está logado)
revoke execute on function public.meu_personal_id() from public, anon;
revoke execute on function public.e_meu_aluno(uuid) from public, anon;
grant execute on function public.meu_personal_id() to authenticated;
grant execute on function public.e_meu_aluno(uuid) to authenticated;

-- Chamadas pelo app
grant execute on function public.verificar_codigo_convite(text) to anon, authenticated;
revoke execute on function public.vincular_personal(text) from public, anon;
revoke execute on function public.desvincular_personal() from public, anon;
revoke execute on function public.remover_aluno(uuid) from public, anon;
grant execute on function public.vincular_personal(text) to authenticated;
grant execute on function public.desvincular_personal() to authenticated;
grant execute on function public.remover_aluno(uuid) to authenticated;
