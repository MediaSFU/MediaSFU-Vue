export interface CalculateRowsAndColumnsOptions {
  n: number;
}

// Export the type definition for the function
export type CalculateRowsAndColumnsType = (options: CalculateRowsAndColumnsOptions) => [number, number];

/**
 * Calculates the number of rows and columns needed to display a given number of items in a grid.
 *
 * @function
 * @param {CalculateRowsAndColumnsOptions} options - The options for calculating rows and columns.
 * @param {number} options.n - The number of items to display.
 * @returns {[number, number]} A tuple containing the number of rows and columns.
 * 
 * @example
 * import { calculateRowsAndColumns } from 'mediasfu-reactjs';
 *
 * const options = {
 *   n: 10,
 * };
 * 
 * const [rows, cols] = calculateRowsAndColumns(options);
 * console.log(`Rows: ${rows}, Columns: ${cols}`); // Outputs: Rows: 4, Columns: 3
 */
export function calculateRowsAndColumns({ n }: CalculateRowsAndColumnsOptions): [number, number] {
  // Calculate the square root of n
  const sqrt = Math.sqrt(n);

  // Initialize columns based on the floor of the square root
  let cols = Math.floor(sqrt);

  // Calculate the number of rows needed to display n videos
  let rows = Math.ceil(n / cols);

  // Calculate the product of rows and columns
  let prod = rows * cols;

  // Adjust rows and columns until the product is greater than or equal to n
  while (prod < n) {
    if (cols < rows) {
      cols++;
    } else {
      rows++;
    }
    prod = rows * cols;
  }

  // Return an array with the calculated number of rows and columns
  return [rows, cols];
}
