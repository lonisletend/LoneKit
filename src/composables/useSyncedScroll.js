import { ref } from "vue";

export function useSyncedScroll() {
  const leftScrollRef = ref(null);
  const rightScrollRef = ref(null);
  const suppressLeftScroll = ref(false);
  const suppressRightScroll = ref(false);

  function handleScroll(side, event) {
    if (side === "left" && suppressLeftScroll.value) {
      return;
    }

    if (side === "right" && suppressRightScroll.value) {
      return;
    }

    const target = side === "left" ? rightScrollRef.value : leftScrollRef.value;
    if (!target) {
      return;
    }

    if (side === "left") {
      suppressRightScroll.value = true;
    } else {
      suppressLeftScroll.value = true;
    }

    target.scrollTop = event.target.scrollTop;

    requestAnimationFrame(() => {
      if (side === "left") {
        suppressRightScroll.value = false;
      } else {
        suppressLeftScroll.value = false;
      }
    });
  }

  return {
    leftScrollRef,
    rightScrollRef,
    handleScroll,
  };
}
