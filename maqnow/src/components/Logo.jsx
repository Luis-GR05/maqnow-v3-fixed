import React, { useId } from 'react';

// Logotipo MAQNOW. El símbolo es una M sobre una W: la misma pieza girada 180°.
// El nombre está dibujado con el mismo sistema (trazo único, cortes planos).
const HALF = '5.5,60 5.5,0 32,26.26 58.5,0 58.5,60';
const M = '5.5,80 5.5,0 30,40 54.5,0 54.5,80';

export function LogoMark({ className = '', title }) {
  const id = useId();
  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 64 72" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <clipPath id={id}><rect width="64" height="34" /></clipPath>
      <g fill="none" strokeWidth="11" strokeMiterlimit="20">
        <polyline clipPath={`url(#${id})`} points={HALF} stroke="currentColor" />
        <g transform="translate(64 72) rotate(180)"><polyline className="now" clipPath={`url(#${id})`} points={HALF} /></g>
      </g>
    </svg>
  );
}

export function LogoWord({ className = '', title }) {
  const id = useId();
  return (
    <svg className={`logo-word ${className}`} viewBox="0 0 379 60" role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true} focusable="false">
      <clipPath id={id}><rect width="379" height="60" /></clipPath>
      <g clipPath={`url(#${id})`} fill="none" strokeWidth="11" strokeMiterlimit="20">
        <g stroke="currentColor">
          <polyline points={M} />
          <g transform="translate(69 0)"><polyline points="-2,70 28,-6 58,70" /><line x1="12" y1="42" x2="44" y2="42" /></g>
          <g transform="translate(134 0)"><rect x="5.5" y="5.5" width="41" height="49" rx="17" /><line x1="30" y1="36" x2="52" y2="66" /></g>
        </g>
        <g className="now">
          <polyline transform="translate(195 0)" points="5.5,80 5.5,0 48.5,60 48.5,-20" />
          <rect x="263.5" y="5.5" width="41" height="49" rx="17" />
          <g transform="translate(379 60) rotate(180)"><polyline points={M} /></g>
        </g>
      </g>
    </svg>
  );
}

export function Logo() {
  return (<><LogoMark /><LogoWord /></>);
}
