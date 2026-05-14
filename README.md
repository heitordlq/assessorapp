# Assessor App

Aplicativo mobile desenvolvido com React Native e TypeScript para gerenciamento de mensagens e relatórios.

## Tecnologias Utilizadas

- React Native
- TypeScript
- React Navigation
- React Native Paper
- Axios
- AsyncStorage

## Configuração do Ambiente

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `src/config/env.ts` com a URL da sua API

4. Execute o projeto:
```bash
# Para Android
npm run android

# Para iOS
npm run ios

# Para Web
npm run web
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes reutilizáveis
  ├── contexts/       # Contextos do React (Auth, etc)
  ├── hooks/         # Custom hooks
  ├── routes/        # Configuração de navegação
  ├── screens/       # Telas do aplicativo
  ├── services/      # Serviços (API, etc)
  ├── theme/         # Configuração de tema
  └── utils/         # Funções utilitárias
```

## Funcionalidades

- Autenticação com JWT
- Dashboard com resumo financeiro
- Listagem de mensagens
- CRUD de mensagens
- Relatórios
- Gráficos de gastos por categoria 