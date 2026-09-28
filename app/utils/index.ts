// Fungsi utilitas untuk operasi array dan angka acak

// Menghasilkan bilangan bulat acak dalam rentang tertentu
// Parameter min: batas bawah (inklusif)
// Parameter max: batas atas (inklusif)
// Return: bilangan bulat acak antara min dan max
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Memilih item acak dari sebuah array
// Parameter array: array sumber untuk pemilihan
// Return: item acak dari array
export function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]!
}
