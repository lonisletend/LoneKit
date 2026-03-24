import { ref } from "vue";

export function useAutoAppendEntries(createEmptyEntry, hasContent) {
  const entries = ref([createEmptyEntry()]);

  function ensureEntries() {
    if (entries.value.length === 0) {
      entries.value.push(createEmptyEntry());
    }

    while (
      entries.value.length > 1 &&
      !hasContent(entries.value[entries.value.length - 1]) &&
      !hasContent(entries.value[entries.value.length - 2])
    ) {
      entries.value.pop();
    }

    if (hasContent(entries.value[entries.value.length - 1])) {
      entries.value.push(createEmptyEntry());
    }
  }

  function removeEntry(index) {
    if (entries.value.length === 1) {
      entries.value = [createEmptyEntry()];
      return;
    }
    entries.value.splice(index, 1);
    ensureEntries();
  }

  function resetEntries(nextEntries = []) {
    if (nextEntries.length === 0) {
      entries.value = [createEmptyEntry()];
      return;
    }
    entries.value = nextEntries;
    ensureEntries();
  }

  return {
    entries,
    ensureEntries,
    removeEntry,
    resetEntries,
  };
}
