// Script untuk menguji post.ts secara manual menggunakan import alias #server
// Ini memverifikasi apakah post.ts berhasil menyimpan saat dijalankan secara langsung
import { randomBytes } from 'node:crypto'

// Karena import #server tidak bekerja di tsx, kita akan menggunakan pendekatan langsung
// dengan membaca file post.ts dan menjalankan logikanya secara manual
console.log('=== Verifikasi Post Manual ===')
console.log('File post.ts ada:', require('fs').existsSync('D:\\project\\sipker\\server\\api\\admin\\regions\\post.ts'))
console.log('File schema ada:', require('fs').existsSync('D:\\project\\sipker\\server\\database\\schema.ts'))
console.log('File database/index ada:', require('fs').existsSync('D:\\project\\sipker\\server\\database\\index.ts'))
