import { Fragment } from 'react';
import AppIcon from './AppIcon';

// The content files retain serializable icon tokens; only presentation creates SVGs.
function renderPart(value, key) {
  if (typeof value !== 'string') return value;
  const parts = value.split(/(\[icon:[a-z]+\])/g);
  return parts.map((part,i) => {
    const match = /^\[icon:([a-z]+)\]$/.exec(part);
    return match ? <AppIcon key={`${key}-${i}`} name={match[1]}/> : part;
  });
}
export default function IconText({ children }) {
  if (Array.isArray(children)) return children.map((item,i)=><Fragment key={item?.key ?? i}>{renderPart(item,i)}</Fragment>);
  return renderPart(children,'icon');
}
