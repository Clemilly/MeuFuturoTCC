const fs = require('fs')
const path = require('path')
const https = require('https')
const http = require('http')

// Função para baixar arquivo
function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http
    const file = fs.createWriteStream(destination)
    
    protocol.get(url, (response) => {
      // Redireciona se necessário
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destination).then(resolve).catch(reject)
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log(`✅ Baixado: ${url} -> ${destination}`)
        resolve()
      })
      
      file.on('error', (err) => {
        fs.unlink(destination, () => {}) // Remove arquivo parcial
        reject(err)
      })
    }).on('error', reject)
  })
}

// Função principal
async function downloadUnityFiles() {
  const publicDir = path.join(__dirname, '..', 'public')
  const vlibrasDir = path.join(publicDir, 'vlibras', 'target')
  
  // Cria diretórios se não existirem
  if (!fs.existsSync(vlibrasDir)) {
    fs.mkdirSync(vlibrasDir, { recursive: true })
  }
  
  // Arquivos Unity WebGL do VLibras
  const files = [
    {
      url: 'https://vlibras.gov.br/app/vlibras/target/vlibras.data',
      dest: path.join(vlibrasDir, 'vlibras.data')
    },
    {
      url: 'https://vlibras.gov.br/app/vlibras/target/vlibras.framework.js',
      dest: path.join(vlibrasDir, 'vlibras.framework.js')
    },
    {
      url: 'https://vlibras.gov.br/app/vlibras/target/vlibras.wasm',
      dest: path.join(vlibrasDir, 'vlibras.wasm')
    },
    {
      url: 'https://vlibras.gov.br/app/vlibras/target/UnityLoader.js',
      dest: path.join(vlibrasDir, 'UnityLoader.js')
    }
  ]
  
  console.log('🚀 Iniciando download dos arquivos Unity WebGL do VLibras...')
  console.log(`📁 Diretório de destino: ${vlibrasDir}`)
  
  for (const file of files) {
    try {
      await downloadFile(file.url, file.dest)
    } catch (error) {
      console.error(`❌ Erro ao baixar ${file.url}:`, error.message)
    }
  }
  
  console.log('✅ Download concluído!')
  console.log('📊 Arquivos Unity WebGL disponíveis localmente')
}

// Executa se chamado diretamente
if (require.main === module) {
  downloadUnityFiles().catch(console.error)
}

module.exports = { downloadUnityFiles }
