import levenshtein from "fast-levenshtein";
import getCaretCoordinates from "textarea-caret";
import { IndexSpellChecker } from ".";

// Função para validar se há acentos na palavra
function hasAnAccent(word: string) {
  return /[\u00C0-\u017F]/.test(word);
}

// Função para tirar acentos da palavra para comparar nos filtros
function normalizeWord(word: string) {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export interface SpellCheckResult {
  zeroDistance: string[] | null;
  suggestionsDistance: string[] | null;
}

export function CheckNearbyWords(
  word: string,
  dic: string[]
): SpellCheckResult {
  // 1. Tenta encontrar palavra exatamente igual (distância 0)

  let zeroDistance: string[] = [];

  if (hasAnAccent(word)) {
    zeroDistance = dic.filter(
      (wordDic) => levenshtein.get(word.toLocaleLowerCase(), wordDic) === 0
    );
  }

  if (zeroDistance && zeroDistance.length === 0) {
    zeroDistance = dic.filter(
      (wordDic) =>
        levenshtein.get(normalizeWord(word), normalizeWord(wordDic)) === 0
    );
  }

  if (zeroDistance && zeroDistance.length === 0) {
    zeroDistance = [];
  }

  // 2. Se não encontrar exata, busca sugestões com distância 1
  let suggestionsDistance: string[] | null = [];

  if (zeroDistance && zeroDistance.length > 0) {
    suggestionsDistance = null;
  } else if (hasAnAccent(word)) {
    suggestionsDistance = dic.filter(
      (wordDic: string) => levenshtein.get(word.toLowerCase(), wordDic) === 1
    );
  }

  if (Array.isArray(suggestionsDistance) && suggestionsDistance.length === 0) {
    suggestionsDistance = dic.filter(
      (wordDic: string) =>
        levenshtein.get(normalizeWord(word), normalizeWord(wordDic)) === 1
    );
  }

  if (suggestionsDistance && suggestionsDistance.length > 0) {
    // 3. Filtra as sugestões com distância 1, mantendo apenas as que tem um caractere a mais
    suggestionsDistance = suggestionsDistance.filter(
      (wordSuggestions: string) => {
        return (
          wordSuggestions.length - word.length === -1 ||
          wordSuggestions.length - word.length === 1 ||
          wordSuggestions.length - word.length === 0
        );
      }
    );
  } else {
    suggestionsDistance = [];
  }

  // 4. Filtra sugestões com distancia de 2 caso não encontre palavras com distância de 1
  if (
    suggestionsDistance &&
    suggestionsDistance.length === 0 &&
    zeroDistance &&
    zeroDistance.length === 0
  ) {
    let suggestionsDistanceOfTwo: string[] = [];

    if (hasAnAccent(word)) {
      suggestionsDistanceOfTwo = dic.filter(
        (wordDic: string) =>
          levenshtein.get(word.toLocaleLowerCase(), wordDic) === 2
      );
    }
    if (suggestionsDistanceOfTwo && suggestionsDistanceOfTwo.length === 0) {
      suggestionsDistanceOfTwo = dic.filter(
        (wordDic: string) =>
          levenshtein.get(normalizeWord(word), normalizeWord(wordDic)) === 2
      );
    }

    const suggestionsDistanceOfTwoFiltered = suggestionsDistanceOfTwo.filter(
      (wordSuggestions: string) => {
        return (
          wordSuggestions.length - word.length === -2 ||
          wordSuggestions.length - word.length === 2 ||
          wordSuggestions.length - word.length === 0
        );
      }
    );

    suggestionsDistance = suggestionsDistanceOfTwoFiltered;
  }

  return {
    zeroDistance,
    suggestionsDistance,
  };
}

export function markSuggestion(
  suggestionsSelected: string,
  oldWord: string,
  component: HTMLInputElement,
  idOnclick?: string
) {
  if (suggestionsSelected) {
    let value = component.value;

    value = value
      .split(/\s+/)
      .map((item: string, index: number, array) => {
        const itemNormalized = item
          .replace(/[.,!?;:]+$/, "")
          .toLocaleLowerCase();
        const oldWordNormalized = oldWord
          .replace(/[.,!?;:]+$/, "")
          .toLocaleLowerCase();

        if (itemNormalized === oldWordNormalized) {
          const match = item.match(/([.,!?;:]+)$/);
          const punctuation = match ? match[1] : "";

          let replacement = suggestionsSelected.toLocaleLowerCase();

          // só adiciona a pontuação se realmente existia no item original
          if (punctuation) {
            replacement += punctuation;
          }

          // capitalização
          const previousWord = array[index - 1] || "";
          const mustBeCapitalizedAfter = [".", "!", "?", "..."];
          const isStart = index === 0;
          const mustCapitalize =
            isStart ||
            mustBeCapitalizedAfter.some((p) => previousWord.endsWith(p));

          if (mustCapitalize) {
            replacement =
              replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }

          return replacement;
        }

        return item;
      })
      .join(" ");

    component.value = value;
  }

  if (idOnclick) {
    const suggestionDiv = document.querySelectorAll(`#${idOnclick}`)[0];
    if (suggestionDiv) {
      suggestionDiv.remove();
    }
  }
}

export function ReadLastValue(
  idComponent: string,
  onResult: (res: any) => void
) {
  const component = document.querySelector(
    `#${idComponent}`
  ) as HTMLInputElement;
  if (!component) {
    return {
      error: "Componente não encontrado",
    };
  }

  function getSuggestions(
    result: SpellCheckResult,
    component: HTMLInputElement | HTMLTextAreaElement,
    wordOriginal: string
  ) {
    const words = component.value
      .split(/\s+/) // quebra por espaço, \n, \t etc
      .map((w) => w.trim())
      .filter((w) => w.length > 0);
    function stripHtmlTags(text: string) {
      return text.replace(/<[^>]*>/g, "");
    }
    const wordIndex = words.findIndex((w: string) => {
      const normalizedW = normalizeWord(stripHtmlTags(w));
      const normalizedOriginal = normalizeWord(wordOriginal);
      return normalizedW === normalizedOriginal;
    });
    let replacement = "";

    if (result.zeroDistance && result.zeroDistance.length === 1) {
      replacement = result.zeroDistance[0];
    } else if (
      result.suggestionsDistance &&
      result.suggestionsDistance.length === 1
    ) {
      replacement = result.suggestionsDistance[0];
    }

    if (replacement && wordIndex !== -1) {
      // Verifica se a palavra anterior é um ponto, exclamação ou interrogação
      const mustBeCapitalizedAfter = [".", "!", "?"];

      const previousWord = words[wordIndex - 1] || "";

      const mustCapitalize =
        wordIndex === 0 ||
        mustBeCapitalizedAfter.some((p) => previousWord.endsWith(p));

      if (mustCapitalize) {
        replacement =
          replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
    }

    return replacement;
  }

  // coordenadas do cursor no input ou textarea
  function getCaretCoordinatesClient(
    component: HTMLInputElement | HTMLTextAreaElement,
    position: number
  ) {
    const coords = getCaretCoordinates(component, position);

    return {
      top: coords.top + window.scrollY,
      left: coords.left + window.scrollX,
      height: coords.height,
    };
  }

  function isPunctuationOrNumberOrSpace(item: string): boolean {
    return /^[0-9.,\s]$/.test(item);
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  // retorna a palavra onde o cursor está
  function getWordByIndex(text: string, cursorIndex: number) {
    if (cursorIndex < 0 || cursorIndex > text.length) return null;

    const regexWord = /[\p{L}\p{N}-]/u;

    let initial = cursorIndex;
    // percorre na palavra pra trás de onde está a letra no indice que se encontra o cursor para pegar o começo da palavra
    while (initial > 0 && regexWord.test(text[initial - 1])) initial--;

    let final = cursorIndex;
    // percorre na palavra pra frente de onde está a letra no indice que se encontra o cursor para pegar o começo da palavra
    while (final < text.length && regexWord.test(text[final])) final++;

    // retorna a palavra encontrada
    return text.slice(initial, final);
  }
  document.addEventListener("selectionchange", (event: Event) => {
    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      // captura onde o cursor está ativo (qual componente está selecionado)
      const active = document.activeElement;

      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        const divExists = document.querySelectorAll("#suggestion-div")[0];
        if (divExists) {
          divExists.remove();
        }

        const position = active.selectionStart ?? 0;

        // valor atual do componente
        const text = component.value.trim();
        if (position) {
          // chama a função passando o texto e a posição do cursor para capturar a palavra
          const word = getWordByIndex(text, position);
          if (word && !isPunctuationOrNumberOrSpace(word)) {
            // chama a função de correção ortográfica
            const result = IndexSpellChecker(
              word,
              "spellChecker"
            ) as SpellCheckResult;

            // captura as coordenadas exata do cursor no input ou textarea
            const cursorPosition = getCaretCoordinatesClient(active, position);

            // captura a palavra sugerida para alteração
            const replacement = getSuggestions(
              result,
              component,
              word
            ) as string;

            if (replacement && replacement !== word) {
              const componentPosition = component.getBoundingClientRect();
              let div = document.createElement("div");
              div.id = "suggestion-div";
              div.textContent = replacement;
              div.style.position = "absolute";
              div.style.padding = "0.5rem";
              div.style.borderRadius = "1rem";
              div.style.left =
              cursorPosition.left + componentPosition.left + 5 + "px";
              div.style.top =
              cursorPosition.top + componentPosition.top + 10 + "px";
              div.style.backgroundColor = "#1a1a1aa2";
              div.style.border = `1px solid #fff`;
              div.style.fontSize = "11px";
              div.style.cursor = "pointer";
              div.style.color = "#FFFFFF";
              div.style.zIndex = "1";

              div.onclick = () => {
                markSuggestion(replacement, word, component, div.id);
              };
              document.body.appendChild(div);
            }
          }
        }
      }
    }, 1000);
  });

  const handler = (event: KeyboardEvent) => {
    if ([" "].includes(event.key)) {
      const value = component.value.trim();

      const active = document.activeElement;
      let word: string | null = null;
      let position: number = 0;
      if (
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement
      ) {
        position = active.selectionStart ?? 0;
        word = getWordByIndex(value, position - 1);
      }

      interface SpellCheckResult {
        zeroDistance: string[] | [];
        suggestionsDistance: string[] | [];
      }

      if (word && !isPunctuationOrNumberOrSpace(word)) {
        const result = IndexSpellChecker(
          word,
          "spellChecker"
        ) as SpellCheckResult;

        const replacement = getSuggestions(result, component, word) as string;
        markSuggestion(replacement, word, component);
        if (
          document.activeElement instanceof HTMLInputElement ||
          (document.activeElement instanceof HTMLTextAreaElement && replacement)
        ) {
          const el = document.activeElement;
          const newPos = position + (replacement.length - word.length + 1);
          el.setSelectionRange(newPos, newPos);
        } else if (
          document.activeElement instanceof HTMLInputElement ||
          (document.activeElement instanceof HTMLTextAreaElement &&
            !replacement)
        ) {
          const el = document.activeElement;
          const newPos = position;
          el.setSelectionRange(newPos, newPos);
        }
        onResult(result);
      }
    }
  };

  component.removeEventListener("keydown", handler);
  component.addEventListener("keydown", handler);
}
