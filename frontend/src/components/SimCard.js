import { Sparkles, CheckCircle2, ChevronRight } from "lucide-react";

export default function SimCard({ sim }) {
  // Extract data from backend response
  const { 
    sim_number, 
    network, 
    price, 
    category, 
    suitabilityScore, 
    explainableAI,
    fengShuiPoint,
    interestPoint
  } = sim;

  // Format phone number (e.g. 098 123 4567)
  const formatPhone = (num) => {
    return num.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  };

  // Format price
  const formatPrice = (p) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
  };

  // Determine network color
  const getNetworkBg = (net) => {
    if (net.toLowerCase() === 'viettel') return 'bg-red-500';
    if (net.toLowerCase() === 'vinaphone') return 'bg-blue-500';
    if (net.toLowerCase() === 'mobifone') return 'bg-red-600';
    return 'bg-gray-500';
  };

  return (
    <div className="group bg-white dark:bg-dark-lighter rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 relative overflow-hidden flex flex-col h-full">
      
      {/* Network Badge & Match Score Badge */}
      <div className="flex justify-between items-start mb-6 z-10 w-full">
        <span className={`${getNetworkBg(network)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}>
          {network}
        </span>
        
        <div className="flex bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-primary px-3 py-1 rounded-full font-bold items-center gap-1 shadow-sm border border-amber-100 dark:border-amber-900/50">
          <Sparkles className="w-4 h-4" />
          <span>S: {suitabilityScore}</span>
        </div>
      </div>

      {/* Main SIM Number */}
      <div className="text-center my-4 z-10">
        <h3 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-[0.1em] text-gradient">
          {formatPhone(sim_number)}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">{category}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6 z-10">
        <p className="text-2xl font-bold text-red-500 dark:text-red-400">
          {formatPrice(price)}
        </p>
      </div>

      <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-4 z-10"></div>

      {/* Explainable AI block */}
      <div className="flex-grow z-10">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
           Lý do phù hợp:
        </h4>
        <ul className="space-y-2">
          {explainableAI && explainableAI.map((reason, idx) => (
            <li key={idx} className="flex items-start text-sm text-gray-600 dark:text-gray-400 gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Button */}
      <button className="w-full mt-6 bg-dark hover:bg-black dark:bg-primary dark:hover:bg-primary-hover dark:text-white text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 z-10">
        Mua Ngay <ChevronRight className="w-4 h-4"/>
      </button>

      {/* Subtle background decoration */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors pointer-events-none"></div>
    </div>
  );
}
