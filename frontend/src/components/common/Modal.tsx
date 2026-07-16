import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

interface Props { open: boolean; title: string; children: ReactNode; onClose: () => void; }
export default function Modal({ open, title, children, onClose }: Props) {
  return <AnimatePresence>{open && <motion.div className="modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}>
    <motion.div className="modal" initial={{opacity:0,y:18,scale:.98}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:12,scale:.98}}>
      <div className="modal-header"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
      {children}
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
