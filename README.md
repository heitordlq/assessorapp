# Assessor App

[![CI](https://github.com/heitordlq/assessorapp/actions/workflows/ci.yml/badge.svg)](https://github.com/heitordlq/assessorapp/actions/workflows/ci.yml)
![React Native](https://img.shields.io/badge/React_Native-0.73-20232A?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)

Aplicativo mobile em React Native e TypeScript para gerenciamento de mensagens e relatórios. Consome uma API configurável.

## Stack

- React Native e TypeScript
- React Navigation (navegação) e React Native Paper (componentes)
- Axios (HTTP), AsyncStorage (armazenamento local) e Zustand (estado)
- Jest e Testing Library (testes)

## Como rodar

```bash
npm ci
```

Configure a URL da API em `src/config/env.ts` e rode no emulador:

```bash
npm run android
npm run ios
```

Testes:

```bash
npm test
```

## Estrutura

```text
src/
  components/   componentes reutilizáveis
  contexts/     contextos do React (autenticação etc.)
  hooks/        hooks (cache de dados, autenticação, histórico, notificações)
  routes/       navegação
  screens/      telas
  services/     API
  theme/        tema
  utils/        utilitários
```

## Estado do projeto

Projeto pessoal de estudo, sem manutenção ativa.

- Os testes dos hooks de cache e de autenticação rodam em CI. Parte deles (22 de 30) está marcada com `it.skip` porque ficou desatualizada em relação aos hooks e precisa ser reescrita.
- Algumas telas importam pacotes que ainda não estão no `package.json` (por exemplo `react-native-chart-kit`, `react-native-biometrics`, `react-native-toast-message` e `@react-navigation/bottom-tabs`). Instale-os antes de rodar o app em um emulador.
