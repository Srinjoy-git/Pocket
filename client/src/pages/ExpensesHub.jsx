import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, HandCoins, ArrowUpRight, Check } from 'lucide-react';
import { staggerContainer, staggerItem } from '../components/ui/motion';

const features = {
  mine: ['Log daily spending', 'Filter by category & month', 'Live category totals'],
  owed: ['Track who owes you', 'Record partial repayments', 'Auto-settle when paid'],
};

export default function ExpensesHub() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="eyebrow">EXPENSES</span>
        <h1>Where would you like to go?</h1>
        <p>Two ledgers, one wallet — spending and IOUs in one place.</p>
      </header>

      <motion.div className="hub-grid" variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={staggerItem}>
          <Link to="/expenses/mine" className="hub-card">
            <div className="hub-card-top">
              <span className="hub-icon dark">
                <Wallet size={22} />
              </span>
              <ArrowUpRight size={18} />
            </div>
            <span className="hub-eyebrow">DAY-TO-DAY SPENDING</span>
            <h2>My Expenses</h2>
            <p>Track food, transport, bills and more — see where your money goes.</p>
            <ul>
              {features.mine.map((f) => (
                <li key={f}>
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
            <span className="hub-cta">Open My Expenses →</span>
          </Link>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Link to="/expenses/owed" className="hub-card">
            <div className="hub-card-top">
              <span className="hub-icon green">
                <HandCoins size={22} />
              </span>
              <ArrowUpRight size={18} />
            </div>
            <span className="hub-eyebrow">THE IOU BOOK</span>
            <h2>Money Owed To Me</h2>
            <p>Log money lent to friends — track repayments until fully settled.</p>
            <ul>
              {features.owed.map((f) => (
                <li key={f}>
                  <Check size={14} /> {f}
                </li>
              ))}
            </ul>
            <span className="hub-cta">Open Money Owed To Me →</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
