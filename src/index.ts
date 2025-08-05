import { CheckNearbyWords } from "./utils";
import dicionario from "./dicionario.json";
export { SpellChecker } from "./spellChecker";

export function IndexSpellChecker(word: string, type: string) {
  const finalDic = dicionario as string[]
  try {
    if (type === "spellChecker") {
      return CheckNearbyWords(word, finalDic);
    }

    return "Tipo não suportado";
  } catch (error) {
    return error;
  }
}
