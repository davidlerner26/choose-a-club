export function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  return new Promise((resolve) => {
    if (items.length === 0) {
      resolve();
      return;
    }

    let index = 0;
    let completed = 0;

    const runNext = () => {
      if (index >= items.length) return;
      const item = items[index++];
      worker(item)
        .catch((error) => console.error(error))
        .finally(() => {
          completed++;
          if (completed === items.length) {
            resolve();
          } else {
            runNext();
          }
        });
    };

    for (let i = 0; i < Math.min(limit, items.length); i++) {
      runNext();
    }
  });
}
