import { ref } from "vue";

export function refDomain<T extends { state: any; onStateChange: (handler: (nextState: any) => void) => void }>(
  domain: T
) {
  const state = ref(domain.state);

  domain.onStateChange((nextState) => {
    state.value = nextState;
  });

  return state;
}
