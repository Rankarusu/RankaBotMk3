export class ArrayUtils {
  public static partition<T>(
    array: Array<T>,
    chunkSize: number
  ): Array<Array<T>> {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      chunks.push(chunk);
    }
    return chunks;
  }
}
