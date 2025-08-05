import { ReadLastValue } from "./utils";

export function SpellChecker(
  idComponent: string,
  onResult: (res: any) => void
) {
  try {
    ReadLastValue(idComponent, onResult);
  } catch (error) {
    return {
      error: error,
      message: "Erro ao verificar palavra",
    };
  }
}
