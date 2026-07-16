import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Button from "../common/Button";

interface Props { icon: ReactNode; title: string; text: string; button: string; action:()=>void; children?:ReactNode; loading?:boolean; }
export default function Choice({icon,title,text,button,action,children,loading=false}:Props){return <motion.div whileHover={{y:-4}} className="choice-card"><div className="choice-icon">{icon}</div><h2>{title}</h2><p>{text}</p>{children&&<div className="choice-control">{children}</div>}<Button onClick={action} disabled={loading}>{loading?"Please wait…":button}</Button></motion.div>}
