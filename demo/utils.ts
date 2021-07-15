export function partitionArray<T>(items: T[], id: (item: T) => string): T[][] {
    const partitions: T[][] = []
    let currentPartition: T[] = []

    items.map((item) => {
      if (currentPartition.length === 0) {
        currentPartition.push(item)
      } else if (id(item) === id(currentPartition[0])) {
        currentPartition.push(item)
      } else {
        partitions.push(currentPartition)
        currentPartition = [item]
      }
    })

    if (currentPartition.length > 0) {
      partitions.push(currentPartition)
    }

    return partitions
  }
