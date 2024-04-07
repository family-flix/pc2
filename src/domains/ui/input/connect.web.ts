import { InputCore } from "./index";

export function connect(store: InputCore<any>, $input: HTMLInputElement) {
  store.focus = () => {
    $input.focus();
  };
}
