import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Car, GraduationCap, User, AlertTriangle } from 'lucide-react';

const FinanceApp = () => {
  // Estado para controlar o mês visível e qual categoria está expandida
  const [currentMonthIdx, setCurrentMonthIdx] = useState(2); // Começa em Março 2026
  const [expandedCategory, setExpandedCategory] = useState(null);

  const months = ["Janeiro 2026", "Fevereiro 2026", "Março 2026"];

  // Estrutura de dados com os valores fictícios solicitados
  const monthlyData = {
    "Janeiro 2026": [
      { id: 'CASA', label: 'CASA', icon: <Home size={20}/>, spent: 2100, budget: 2200, sub: [
        { label: 'Luz', spent: 180, budget: 200 }, { label: 'Água', spent: 90, budget: 100 }
      ]},
      { id: 'CARRO', label: 'CARRO', icon: <Car size={20}/>, spent: 1550, budget: 1400, sub: [
        { label: 'Combustível', spent: 600, budget: 450 } // Exemplo de estouro em Janeiro
      ]},
      { id: 'COLÉGIO', label: 'COLÉGIO', icon: <GraduationCap size={20}/>, spent: 1200, budget: 1300, sub: [] },
      { id: 'PESSOAL', label: 'PESSOAL', icon: <User size={20}/>, spent: 800, budget: 1000, sub: [] }
    ],
    "Fevereiro 2026": [
      { id: 'CASA', label: 'CASA', icon: <Home size={20}/>, spent: 2250, budget: 2200, sub: [] },
      { id: 'CARRO', label: 'CARRO', icon: <Car size={20}/>, spent: 1300, budget: 1400, sub: [] },
      { id: 'COLÉGIO', label: 'COLÉGIO', icon: <GraduationCap size={20}/>, spent: 1250, budget: 1300, sub: [] },
      { id: 'PESSOAL', label: 'PESSOAL', icon: <User size={20}/>, spent: 980, budget: 1000, sub: [] }
    ],
    "Março 2026": [
      { 
        id: 'CASA', label: 'CASA', icon: <Home size={20}/>, spent: 1980.50, budget: 2200, 
        sub: [
          { label: 'Seguro', spent: 200, budget: 200 },
          { label: 'Luz', spent: 715.14, budget: 800 }, // Exemplo do seu prompt
          { label: 'Água', spent: 95, budget: 100 },
          { label: 'Internet', spent: 150, budget: 150 },
          { label: 'Manutenção', spent: 450, budget: 400 }, // Estourado (Vermelho)
          { label: 'Reforma', spent: 0, budget: 500 },
          { label: 'Iptu', spent: 300, budget: 300 },
          { label: 'Celular', spent: 70, budget: 80 }
        ]
      },
      { 
        id: 'CARRO', label: 'CARRO', icon: <Car size={20}/>, spent: 1650, budget: 1500, 
        sub: [
          { label: 'Seguro', spent: 250, budget: 250 },
          { label: 'Financiamento', spent: 800, budget: 800 },
          { label: 'Combustível', spent: 480, budget: 400 }, // Estourado
          { label: 'Revisão', spent: 0, budget: 0 },
          { label: 'Manutenção', spent: 120, budget: 50 },
          { label: 'Ipva', spent: 0, budget: 0 },
          { label: 'Fundo Carro Novo', spent: 0, budget: 0 }
        ]
      },
      { 
        id: 'COLÉGIO', label: 'COLÉGIO', icon: <GraduationCap size={20}/>, spent: 1200, budget: 1300, 
        sub: [
          { label: 'Mensalidade', spent: 1100, budget: 1100 },
          { label: 'Material escolar', spent: 50, budget: 100 },
          { label: 'Uniformes', spent: 0, budget: 50 },
          { label: 'Cantina', spent: 50, budget: 50 },
          { label: 'Fundo', spent: 0, budget: 0 }
        ]
      },
      { 
        id: 'PESSOAL', label: 'PESSOAL', icon: <User size={20}/>, spent: 890, budget: 1000, 
        sub: [
          { label: 'Alimentação', spent: 600, budget: 600 },
          { label: 'Vestuário', spent: 100, budget: 100 },
          { label: 'Lazer', spent: 90, budget: 100 },
          { label: 'Presentes', spent: 0, budget: 50 },
          { label: 'Passeios', spent: 50, budget: 100 },
          { label: 'Viagens', spent: 0, budget: 0 },
          { label: 'Férias', spent: 0, budget: 0 },
          { label: 'Azul', spent: 50, budget: 50 }
        ]
      }
    ]
  };

  // Lógica de cores baseada no percentual atingido
  const getBarColor = (perc) => {
    if (perc >= 100) return 'bg-red-500'; // Estourou
    if (perc >= 90) return 'bg-yellow-400'; // Alerta (90-100%)
    return 'bg-green-500'; // Normal (até 90%)
  };

  const ProgressBar = ({ spent, budget, label, isSub = false }) => {
    const perc = budget > 0 ? (spent / budget) * 100 : 0;
    // Permite que a barra preencha até 110% visualmente
    const visualWidth = Math.min(perc, 110); 

    return (
      <div className={`mb-5 ${isSub ? 'ml-6 border-l-2 border-gray-100 pl-4 py-1' : ''}`}>
        <div className="flex justify-between items-end mb-1.5 px-1">
          <span className={`text-sm font-bold ${isSub ? 'text-gray-500 uppercase tracking-tight' : 'text-gray-800'}`}>
            {label}
          </span>
          <span className="text-xs font-semibold text-gray-700">
            R$ {spent.toLocaleString('pt-BR', {minimumFractionDigits: 2})} / R$ {budget.toLocaleString('pt-BR')} 
            <span className={`ml-2 ${perc >= 100 ? 'text-red-600 font-black' : 'text-gray-400 font-normal'}`}>
              ({perc.toFixed(1)}%)
            </span>
          </span>
        </div>
        
        {/* Container da Barra (Fundo Cinza Claro) */}
        <div className="w-full bg-gray-200 h-5 rounded-full relative overflow-hidden shadow-inner border border-gray-100">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-in-out ${getBarColor(perc)}`}
            style={{ width: `${visualWidth}%` }}
          />
          {/* Indicador visual de 100% para quando ultrapassar */}
          {perc > 100 && (
             <div className="absolute right-0 top-0 h-full w-[2px] bg-white/30 z-10"></div>
          )}
        </div>
      </div>
    );
  };

  const currentCategories = monthlyData[months[currentMonthIdx]] || [];

  return (
    <div className="min-h-screen bg-white flex justify-center p-4 antialiased">
      <div className="w-full max-w-md bg-white">
        
        {/* Navegação Superior */}
        <div className="flex items-center justify-between py-8 sticky top-0 bg-white/95 backdrop-blur-sm z-20">
          <button 
            onClick={() => {setCurrentMonthIdx(prev => Math.max(0, prev - 1)); setExpandedCategory(null);}}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronLeft size={28} className="text-gray-400" />
          </button>
          <h1 className="text-xl font-black text-gray-900 tracking-tighter uppercase">
            {months[currentMonthIdx]}
          </h1>
          <button 
            onClick={() => {setCurrentMonthIdx(prev => Math.min(months.length - 1, prev + 1)); setExpandedCategory(null);}}
            className="p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90"
          >
            <ChevronRight size={28} className="text-gray-400" />
          </button>
        </div>

        {/* Listagem de Categorias */}
        <div className="space-y-4">
          {currentCategories.map((cat) => (
            <div key={cat.id} className="transition-all">
              <div 
                className={`flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-colors active:bg-gray-50 ${expandedCategory === cat.id ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
              >
                <div className={`p-2.5 rounded-xl shadow-sm ${expandedCategory === cat.id ? 'bg-white text-blue-600' : 'bg-white text-gray-400'}`}>
                  {cat.icon}
                </div>
                <div className="flex-1">
                   <ProgressBar spent={cat.spent} budget={cat.budget} label={cat.label} />
                </div>
              </div>

              {/* Subcategorias (Exibição Condicional) */}
              {expandedCategory === cat.id && cat.sub && cat.sub.length > 0 && (
                <div className="mt-2 space-y-1 animate-in slide-in-from-top-4 fade-in duration-300">
                  {cat.sub.map((s, idx) => (
                    <ProgressBar key={idx} spent={s.spent} budget={s.budget} label={s.label} isSub={true} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rodapé Decorativo */}
        <div className="mt-12 mb-8 text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest italic">Controle Financeiro Pessoal</p>
        </div>

      </div>
    </div>
  );
};

export default FinanceApp;