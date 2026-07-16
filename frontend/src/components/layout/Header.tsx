import { RefreshCw } from "lucide-react";
import Button from "../common/Button";
interface Props{title:string;subtitle:string;syncing:boolean;onSync:()=>void;}
export default function Header({title,subtitle,syncing,onSync}:Props){return <header className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div><Button variant="secondary" onClick={onSync} className="button-with-icon"><RefreshCw size={17} className={syncing?"spin":""}/>{syncing?"Syncing…":"Sync now"}</Button></header>}
