# SpellChecker 🪄✨

`SpellChecker` é uma biblioteca de **correção ortográfica em tempo real** baseada na **distância de Levenshtein** e na **normalização de palavras**.  
Ideal para aplicações que exigem **sugestões inteligentes durante a digitação**, com suporte a acentos e foco total no idioma **português brasileiro (PT-BR)**.

---

## ✅ Pronta para Produção

A biblioteca está pronta para uso em produção, podendo ser utilizada em seus projetos. Caso haja algum problema ou sugestão, por favor, abrir um issue no GitHub.

Github: https://github.com/thigasfella/spellchecker

---

## 🔍 Funcionalidades

- Correção automática com base em distância de Levenshtein (0, 1 e 2).
- Suporte a acentos, pontuação e capitalização contextual.
- Sugestão automática da palavra correta em tempo real.
- Componente flutuante com sugestão clicável.
- Otimizada para inputs e textareas comuns.

---

## 🌐 Suporte de Idioma

Atualmente, a `SpellChecker` oferece **suporte exclusivo para PT-BR**.

### 🔜 Em breve:
- Possibilidade de usar um dicionário customizado:
  Basta colocar seu arquivo `dicionario.json` na pasta `/public` do projeto onde a lib estiver instalada.

---

## 📦 Instalação

```bash
npm install spellchecker-automatic
```

---

## 🚀 Como Usar

### 1. Em projetos React / Next.js (App Router)

> ⚠️ É obrigatório marcar o componente como `"use client"`.

```tsx
"use client";
import { useEffect } from "react";
import { SpellChecker } from "spellchecker-real-time";

export default function Home() {
  useEffect(() => {
    SpellChecker("component", (res: any) => {
      console.log("Correção retornada:", res);
    });
  }, []);

  return (
    <div className="h-[100vh] w-[100vw] bg-[#1A1A1A]">
      <div className="flex items-center justify-center h-full">
        <textarea
          id="component"
          className="w-[50vw] h-[300px] p-3 resize-none border border-gray-300 rounded-lg focus:outline-none shadow-sm text-white"
        ></textarea>
      </div>
    </div>
  );
}
```

## 🧠 Sobre o funcionamento

- A biblioteca detecta a palavra onde o cursor está posicionado e sugere uma correção automática, caso detecte erros com base no dicionário.
- O componente de sugestão aparece flutuando acima do texto e pode ser clicado para substituir a palavra incorreta.
- O sistema reconhece palavras com e sem acento, e aplica regras inteligentes para manter pontuação e capitalização.

---

## 🧭 Roadmap

- [x] Correção ortográfica em tempo real
- [x] Sugestão de palavras com distância 1 e 2
- [x] Compatibilidade com React / Next.js
- [ ] Suporte a múltiplos idiomas
- [ ] Dicionários personalizados via `/public/dicionario.json`
- [ ] Barra com múltiplas sugestões selecionáveis

---

## ⚠️ Requisitos

- O campo a ser verificado **deve ter um `id`** correspondente ao valor passado na função `SpellChecker`.
- Funciona apenas com campos `<input type="text">` e `<textarea>`.

---

## 📄 Licença

Este projeto está sob a licença MIT.
