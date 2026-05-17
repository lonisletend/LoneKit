import { nextTick, ref } from "vue";

export function useEntryJump(ensureEntries) {
  const inputRefsBySide = ref({});

  function resolveInputElement(instance) {
    if (!instance) {
      return null;
    }
    const rootEl = instance.$el ?? instance;
    return rootEl?.querySelector?.("textarea") ?? null;
  }

  function setInputRef(side, index, instance) {
    if (!inputRefsBySide.value[side]) {
      inputRefsBySide.value[side] = [];
    }
    inputRefsBySide.value[side][index] = resolveInputElement(instance);
  }

  async function focusNextInput(side, index) {
    ensureEntries();
    await nextTick();
    inputRefsBySide.value[side]?.[index + 1]?.focus?.();
  }

  function handleJumpKeydown(event, side, index) {
    if (!(event.ctrlKey || event.metaKey) || event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    focusNextInput(side, index);
  }

  return {
    setInputRef,
    handleJumpKeydown,
  };
}
