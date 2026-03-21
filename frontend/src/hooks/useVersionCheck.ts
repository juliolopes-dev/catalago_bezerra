import { useEffect, useRef } from 'react'

const INTERVALO_MS = 5 * 60 * 1000 // 5 minutos

export function useVersionCheck() {
  const versaoAtual = useRef<string | null>(null)

  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`)
        if (!res.ok) return
        const dados = await res.json()
        const versaoServidor = dados.version as string

        if (!versaoAtual.current) {
          versaoAtual.current = versaoServidor
          return
        }

        if (versaoAtual.current !== versaoServidor) {
          const recarregar = window.confirm(
            'Uma nova versão do catálogo está disponível. Deseja atualizar agora?',
          )
          if (recarregar) {
            window.location.reload()
          } else {
            // Atualiza a referência para não perguntar de novo até próxima mudança
            versaoAtual.current = versaoServidor
          }
        }
      } catch {
        // silencia erros de rede
      }
    }

    verificar()
    const intervalo = setInterval(verificar, INTERVALO_MS)
    return () => clearInterval(intervalo)
  }, [])
}
