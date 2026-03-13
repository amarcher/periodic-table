import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Element } from '../types/element';
import { categoryColors, categoryLabels } from '../utils/colors';
import './ElementDetail.css';

interface ElementDetailProps {
  element: Element | null;
  onClose: () => void;
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

function PropertyItem({ label, value }: { label: string; value: string | null }) {
  if (!value || value === 'N/A') return null;
  return (
    <motion.div className="detail__prop" variants={fadeUp}>
      <span className="detail__prop-label">{label}</span>
      <span className="detail__prop-value">{value}</span>
    </motion.div>
  );
}

export function ElementDetail({ element, onClose }: ElementDetailProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {element && (
        <motion.div
          className="detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="detail-card"
            layoutId={`element-${element.atomicNumber}`}
            onClick={(e) => e.stopPropagation()}
            style={{ '--cat-color': categoryColors[element.category] } as React.CSSProperties}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Orbital rings decoration */}
            <div className="detail__orbitals" aria-hidden="true">
              <div className="detail__orbit detail__orbit--1" />
              <div className="detail__orbit detail__orbit--2" />
              <div className="detail__orbit detail__orbit--3" />
            </div>

            <motion.div
              className="detail__content"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {/* Header */}
              <motion.div className="detail__header" variants={fadeUp}>
                <motion.span className="detail__number" variants={scaleIn}>
                  {element.atomicNumber}
                </motion.span>
                <span className="detail__symbol">{element.symbol}</span>
                <span className="detail__name">{element.name}</span>
                <span className="detail__category">
                  {categoryLabels[element.category]}
                </span>
              </motion.div>

              {/* Summary */}
              <motion.p className="detail__summary" variants={fadeUp}>
                {element.summary}
              </motion.p>

              {/* Properties grid */}
              <motion.div className="detail__props" variants={stagger}>
                <PropertyItem label="Atomic Mass" value={`${element.atomicMass} u`} />
                <PropertyItem label="Electron Config" value={element.electronConfiguration} />
                <PropertyItem
                  label="Melting Point"
                  value={element.meltingPoint != null ? `${element.meltingPoint} K` : null}
                />
                <PropertyItem
                  label="Boiling Point"
                  value={element.boilingPoint != null ? `${element.boilingPoint} K` : null}
                />
                <PropertyItem
                  label="Density"
                  value={element.density != null ? `${element.density} g/cm³` : null}
                />
                <PropertyItem
                  label="Electronegativity"
                  value={element.electronegativity != null ? `${element.electronegativity}` : null}
                />
                <PropertyItem label="Appearance" value={element.appearance} />
                <PropertyItem
                  label="Discovered By"
                  value={`${element.discoveredBy} (${element.yearDiscovered})`}
                />
              </motion.div>

              {/* Fun facts */}
              <motion.div className="detail__facts" variants={stagger}>
                <motion.h3 className="detail__facts-title" variants={fadeUp}>
                  Fun Facts
                </motion.h3>
                {element.funFacts.map((fact, i) => (
                  <motion.div key={i} className="detail__fact" variants={fadeUp}>
                    <span className="detail__fact-icon">✦</span>
                    <span>{fact}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <button className="detail__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
