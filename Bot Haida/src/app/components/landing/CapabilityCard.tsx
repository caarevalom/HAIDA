import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../ui/utils';

interface CapabilityCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay?: number;
}

export const CapabilityCard = ({ title, description, icon, delay = 0 }: CapabilityCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="p-6 rounded-2xl bg-[#101722] border border-[#1a2331] hover:border-[#38f2a1]/30 hover:bg-[#101722]/80 transition-all group"
    >
      <div className="mb-4 p-3 rounded-xl bg-[#0b0f14] border border-[#1a2331] w-fit group-hover:border-[#38f2a1]/50 transition-colors">
        <div className="text-[#38f2a1] group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-[#e8eef7] mb-2 font-display">{title}</h3>
      <p className="text-[#9bb0c4] leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};
