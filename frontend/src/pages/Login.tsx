import { useState, useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Instagram } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

type FormData = z.infer<typeof schema>

function useContador(alvo: number, duracao = 2000) {
  const [valor, setValor] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const inicio = performance.now()
    function step(agora: number) {
      const progresso = Math.min((agora - inicio) / duracao, 1)
      // easeOutExpo — começa rápido, desacelera no final
      const ease = progresso === 1 ? 1 : 1 - Math.pow(2, -10 * progresso)
      setValor(Math.floor(ease * alvo))
      if (progresso < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [alvo, duracao])

  return valor
}

export function Login() {
  const { login } = useAuth()
  const { token } = useAuthStore()
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [erro, setErro] = useState('')
  const contador = useContador(100000, 2500)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (token) return <Navigate to="/" replace />

  async function onSubmit(data: FormData) {
    setErro('')
    try {
      await login(data.email, data.senha)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Credenciais inválidas'
      setErro(msg)
    }
  }

  return (
    <div className="h-screen bg-[#1C1C1C] flex overflow-hidden font-sans">
      {/* ── Esquerda — Atmosfera Boutique ────────────────── */}
      <div className="hidden lg:flex w-[480px] flex-shrink-0 flex-col items-center justify-center relative overflow-hidden bg-[#141414] border-r border-white/5">
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(#F5AD00 1px, transparent 1.5px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex flex-col items-center gap-12">
          {/* Logo Master */}
          <div className="relative group" style={{ animation: 'float 6s ease-in-out infinite' }}>
            <img src="/logo-bezerra.png" alt="Bezerra Autopeças" className="w-64 object-contain" />
          </div>

          <div className="flex flex-col gap-8 text-center px-12">
             <div className="space-y-1">
                <p className="text-[52px] font-bold text-[#F5AD00] leading-none tracking-tight tabular-nums">
                  +{contador.toLocaleString('pt-BR')}
                </p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Itens em Estoque</p>
             </div>

             <div className="h-px w-10 bg-white/10 mx-auto" />

             <p className="text-[15px] font-semibold text-slate-400 leading-relaxed italic opacity-80 decoration-[#F5AD00]/30 decoration-2">
                <span className="text-[#F5AD00]">#</span>Somos parceiros do seu negócio.
             </p>
          </div>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/bezerraautopecas"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 hover:text-[#F5AD00] transition-colors cursor-pointer group"
          >
            <Instagram className="h-4 w-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">#bezerraautopecas</span>
          </a>
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-12px); }
          }
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-box-shadow: 0 0 0px 1000px #141414 inset !important;
            -webkit-text-fill-color: #F8FAFC !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}</style>
      </div>

      {/* ── Direita — Portal de Acesso ──────────────────── */}
      <div className="flex-1 flex items-center justify-center p-12 bg-[#1C1C1C] relative">
        <div className="w-full max-w-[360px] relative z-10">
          <div className="mb-10">
            <h1 className="text-[28px] font-bold text-white tracking-tight uppercase leading-none italic">Acesso ao Catálogo</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">E-mail</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="nome@bezerra.com.br"
                  className={`w-full h-13 bg-[#141414] border-2 rounded-xl px-5 text-[14px] text-white focus:outline-none focus:border-[#F5AD00] transition-all font-semibold ${errors.email ? 'border-red-500/40' : 'border-white/10'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">Senha</label>
                <div className="relative">
                  <input
                    {...register('senha')}
                    type={senhaVisivel ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full h-13 bg-[#141414] border-2 rounded-xl px-5 pr-14 text-[14px] text-white focus:outline-none focus:border-[#F5AD00] transition-all font-semibold ${errors.senha ? 'border-red-500/40' : 'border-white/10'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setSenhaVisivel((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#F5AD00] transition-colors cursor-pointer"
                  >
                    {senhaVisivel ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {erro && (
              <div className="rounded-xl bg-red-500/5 border border-red-500/20 px-4 py-3 border-l-4">
                <p className="text-[11px] font-bold text-red-500 uppercase">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-[#F5AD00] text-black text-[14px] font-bold rounded-xl mt-6 hover:bg-[#FFC000] active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#F5AD00]/20 flex items-center justify-center gap-3 uppercase tracking-wide"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>ENTRAR NO CATÁLOGO</span>}
            </button>
          </form>

          <p className="mt-16 text-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em]">
            Bezerra Autopeças © 2026
          </p>
        </div>
      </div>
    </div>
  )
}
