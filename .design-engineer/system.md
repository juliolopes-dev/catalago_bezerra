# Sistema de Design — Catálogo Bezerra Autopeças

## Direção: Warmth & Clarity com identidade Bezerra
Distribuidora de autopeças. Usado diariamente por vendedores e lojistas.
Interface que transmite confiança e velocidade — não ERP genérico.
Amarelo vibrante `#F5AD00` como único accent sobre fundos neutros quentes.

---

## Paleta

| Token          | Hex           | Uso                                           |
|----------------|---------------|-----------------------------------------------|
| Accent         | `#F5AD00`     | CTAs, preço em destaque, linha ativa, ícones  |
| Accent dark    | `#E09E00`     | Hover do botão primário                       |
| Dark bg        | `#1C1C1C`     | Sidebar, bloco de preço, header tabela        |
| App bg         | `#F0EDE8`     | Fundo geral — bege quente, não cinza frio     |
| Surface        | `#F8F7F4`     | Input bg, hover de linha                      |
| White          | `#FFFFFF`     | Cards, painéis, tabela                        |
| Border         | `#E8E4DE`     | Bordas gerais                                 |
| Border light   | `#EEE9E3`     | Bordas internas de painéis                    |
| Text primary   | `#1C1C1C`     | Títulos, preços, textos fortes                |
| Text secondary | `#555`        | Corpo de texto                                |
| Text muted     | `#999`        | Labels de campo, metadados                    |
| Text faint     | `#C8C3BC`     | Placeholders, códigos inativos                |

---

## Tipografia

- **Família:** Blinker — mesma do site oficial autopecasbezerra.com.br
- **Escala:** 9px labels / 10px micro / 11px small / 12px body-sm / 13px body / 15-16px title
- **Pesos:** 400 body · 600 semibold · 700 bold · 900 black (títulos, preços, CTAs)
- **Mono:** códigos de produto, referências de fabricante — `font-mono`

---

## Grid e Espaçamento

- Base: 4px
- Componentes internos: gap-2 (8px), gap-3 (12px)
- Seções: p-4 (16px), p-6 (24px)
- Sem padding/margin ímpar (ex: 14px, 17px)

---

## Radius

- Cards externos: `rounded-xl` (12px)
- Painéis internos: sem radius (edge-to-edge)
- Botões: `rounded-xl` (12px)
- Badges/chips: `rounded-lg` (8px)
- Inputs: `rounded-xl`
- Ícone containers: `rounded-lg` (8px)

---

## Depth Strategy: Cards flutuando sobre fundo quente

- **App bg:** `#F0EDE8` — bege quente. Os cards brancos "flutuam" naturalmente.
- **Cards/painéis:** `bg-white` + `shadow-[0_1px_6px_rgba(0,0,0,0.07)]` + `border border-[#E8E4DE]`
- **Hover de card:** `shadow-[0_4px_16px_rgba(0,0,0,0.1)]`
- **Header tabela:** `bg-[#1C1C1C]` — âncora visual escura no topo da tabela
- **Linha ativa:** `bg-[#FFF9EC]` — amarelo muito suave
- **Focus input:** `shadow-[0_0_0_3px_rgba(245,173,0,0.12)]`
- ❌ Sem shadow > 16px blur

---

## Padrões de Componentes

### PageHeader (Catálogo)
- Layout: `bg-white border-b border-[#E8E4DE] px-6 py-4`
- Ícone do app: `h-9 w-9 rounded-xl bg-[#1C1C1C]` com ícone `#F5AD00`
- Título: `text-[16px] font-black text-[#1C1C1C] tracking-tight`
- Subtítulo: `text-[11px] text-[#999]`
- Busca: alinhada à direita, `w-[400px] h-10 rounded-xl`

### Tabela de Produtos
- Container: `bg-white rounded-xl border border-[#E8E4DE] shadow-[0_1px_6px_rgba(0,0,0,0.07)]`
- Header: `bg-[#1C1C1C] rounded-t-xl` — texto `text-[10px] font-black text-white/40 uppercase tracking-[0.12em]`
- Linha normal par: `bg-white`
- Linha normal ímpar: `bg-[#FDFCFA]`
- Linha hover: `bg-[#F8F7F4]`
- Linha ativa: `bg-[#FFF9EC] border-l-2 border-[#F5AD00]`
- Código ativo: `text-[#F5AD00] font-bold`
- Preço ativo: `text-[#F5AD00] font-black`

### Painel Label (cabeçalho dos painéis)
- `bg-[#FAFAF8] border-b border-[#EEE9E3] px-4 py-3`
- Ícone: `h-6 w-6 rounded-lg bg-[#1C1C1C]` com ícone lucide `h-3.5 w-3.5 text-[#F5AD00]`
- Texto: `text-[12px] font-bold text-[#333]`

### Bloco de Preço
- Container: `bg-[#1C1C1C] rounded-xl px-5 py-5`
- Label: `text-[10px] font-bold text-white/30 uppercase tracking-[0.12em]`
- Valor: `text-[28px] font-black text-[#F5AD00] tabular-nums`

### Botão Primário (Adicionar ao Carrinho)
- `h-11 w-full rounded-xl bg-[#F5AD00] text-[#1C1C1C] font-black text-[13px]`
- Hover: `hover:bg-[#E09E00]`
- Shadow: `shadow-[0_2px_8px_rgba(245,173,0,0.3)]`

### SearchBar
- `h-10 rounded-xl border border-[#E0DBD4] bg-[#F8F7F4]`
- Focus: `border-[#F5AD00] bg-white shadow-[0_0_0_3px_rgba(245,173,0,0.1)]`

### Badges de Similar
- `h-7 px-3 rounded-lg bg-[#F5F3EF] border border-[#E8E4DE] font-mono text-[11px] text-[#555]`

---

## Cursor
`cursor-pointer` obrigatório em TODO elemento clicável.

## Animações
- Transições: `transition-all duration-150`
- Sem bounce, sem spring, sem scale > 1.02

---

## Anti-padrões
- ❌ Azul como accent
- ❌ Fundo cinza frio (`slate`, `gray`)
- ❌ Headers de painel com texto uppercase só, sem ícone
- ❌ Sombras > 16px blur
- ❌ Múltiplos accent colors
- ❌ Gradientes decorativos
- ❌ Fontes diferentes de Blinker na UI principal
